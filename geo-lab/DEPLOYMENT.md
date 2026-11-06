# Deployment

## What the lab needs

| Requirement | Why |
|---|---|
| A **Node.js 22+ runtime** | `node:sqlite` is used, and the app runs server-side rendering plus route handlers. |
| A **persistent filesystem** | SQLite lives in `data/geo-lab.db`, plus `data/snapshots/` for content versions. |
| **HTTPS** | Session cookies are `secure` in production. |
| **A scheduler** | To call `POST /api/run` daily. Provided by GitHub Actions. |

**Cloudflare Pages cannot host this.** It serves static assets and edge
functions; it has no persistent filesystem and no long-lived Node process, so
SQLite and background work do not fit. The public plumbing website stays on
Cloudflare Pages; the lab is a separate deployment.

## Where to deploy

All of these give a persistent disk on a low-cost plan:

| Host | Notes |
|---|---|
| **Fly.io** | Persistent volume + a small machine. Good default. |
| **Railway** | Volume support, simple env management. |
| **Render** | Persistent disk on paid tiers only. |
| **A small VPS** | Cheapest at scale; you manage updates. |
| **Vercel** | **Only** if you move state off the filesystem (e.g. to Postgres) — its filesystem is ephemeral. |

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEO_LAB_RUN_TOKEN` | **Yes** | Bearer token the scheduler uses for `POST /api/run`. Generate with `openssl rand -hex 32`. |
| `GEO_LAB_OWNER_PASSWORD` | Recommended | Sets the owner password at seed time instead of generating one. |
| `GEO_LAB_DB` | Optional | Absolute path to the SQLite file. Default `data/geo-lab.db`. |
| `Tavily_api_key` / `TAVILY_API_KEY` | Yes (visibility) | Tavily Search — the working visibility provider. |
| `GEMINI_API_KEY` | Optional | Second visibility engine; must be an `AIza…` AI Studio key. |
| `PERPLEXITY_API_KEY` | Optional | Third visibility engine. |
| `GITHUB_TOKEN` | Yes (publishing) | Branch + PR publishing. Needs `repo` scope on the target repository. |
| `GSC_OAUTH_CLIENT_ID` / `_SECRET` / `GSC_REFRESH_TOKEN` | Optional | Search Console data. |
| `GA4_PROPERTY_ID` / `GA4_SERVICE_ACCOUNT_JSON` | Optional | Analytics data. |
| `GBP_OAUTH_CLIENT_ID` | Optional | Business Profile data. |
| `BING_WEBMASTER_API_KEY` | Optional | Bing indexing/query data. |

Never commit any of these. Set them in the host's secret store.

## First deploy

```bash
cd geo-lab
npm ci
npm run seed     # creates the schema, owner account, query library, integrations
npm run build
npm start        # serves on $PORT (default 12000)
```

Then:

1. Sign in and **change the owner password**.
2. Delete `data/owner-credentials.txt`.
3. Open **Integrations → Re-check integrations** and confirm the expected
   providers show `connected`.
4. Run **Command Center → Run daily operations** once, by hand, and confirm it
   completes.
5. Configure the scheduler (below).

## Scheduler

Add two repository secrets to the GitHub repo:

- `GEO_LAB_URL` — e.g. `https://geo-lab.example.com`
- `GEO_LAB_RUN_TOKEN` — the same value as the lab's environment variable

`.github/workflows/geo-lab-daily.yml` then fires at 06:00 America/Los_Angeles
daily. The cron entry (`0 6 * * *`) carries `timezone: "America/Los_Angeles"`,
so it stays 06:00 local across the PST/PDT changeover. If the secrets are missing
the workflow exits with a notice, so it is safe to merge before deployment.

You can also drive the lab from the existing OpenHands daily automation:

```
curl -X POST "$GEO_LAB_URL/api/run?trigger=openhands-daily&report=daily" \
  -H "Authorization: Bearer $GEO_LAB_RUN_TOKEN"
```

## CI

`.github/workflows/geo-lab.yml` runs on every PR touching `geo-lab/**`:

- `npx tsc --noEmit`
- `npm test` (32 tests — real SQLite, real site crawl)
- `npm run build`

This is the evidence that a change is green; it does not rely on the change
author's word.

## Backups

The whole state is one file. Schedule:

```bash
sqlite3 data/geo-lab.db ".backup '/backups/geo-lab-$(date +%F).db'"
```

Keep at least 30 days. To restore, stop the app, replace the file, restart.

## Rolling back a bad deploy

1. Redeploy the previous build (host-specific).
2. The database is unaffected by a code rollback.
3. To undo a **content** change, use **Publishing History → Roll back** on the
   publication, which restores the snapshotted version and opens a PR.

## Known outstanding setup requirements

These are not done here because the credentials or accounts are owner-side:

- Deploy the lab to a Node host with a persistent disk.
- Set `GEO_LAB_RUN_TOKEN` and the GitHub repo secrets.
- Connect Google Search Console, GA4, Google Business Profile and Bing Webmaster.
- Provide an `AIza…` Gemini key (or Perplexity) to add a second visibility engine.
- Put the lab behind Cloudflare Access or an IP allowlist.
