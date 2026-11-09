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

### Free options, ranked

The hard constraint is **a persistent filesystem** (SQLite + `data/snapshots/`).
That is what rules out the serverless platforms, not CPU or memory. Verified
against each provider's own docs on 2026-11-06:

| Option | Cost | Fits? | Evidence |
|---|---|---|---|
| **Oracle Cloud Always Free** | $0 | **Yes — best free fit** | *"All Oracle Cloud Infrastructure accounts (whether free or paid) have a set of resources that are free of charge in the home region of the tenancy, for the life of the account."* Includes "Arm-based Ampere A1 Compute" and "Block Volume" ([Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)). A real VM with a real disk. **Caveat:** *"Idle Always Free compute instances may be reclaimed by Oracle… during a 7-day period… CPU utilization for the 95th percentile is less than 20% [and] Network utilization is less than 20%."* A lab that mostly sleeps is exactly what that rule targets, so take a backup (see Backups) and expect a rare rebuild. |
| **Google Cloud e2-micro** | $0 | Yes | *"1 non-preemptible e2-micro VM instance per month"* plus *"30 GB-months standard persistent disk"*, in `us-west1`, `us-central1` or `us-east1` ([Free cloud features](https://cloud.google.com/free/docs/free-cloud-features)). A VM with a boot disk; same idle caveat does **not** apply, but you administer it. |
| **GitHub Actions (no server)** | $0 | **Yes — simplest** | *"The following usage remains free independently… Standard GitHub-hosted runners in public repositories."* ([Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)). Run the headless job (`npm run job`) on a cron, commit the results as data (JSON), and skip hosting entirely. **Do not commit the SQLite file** — it holds the owner password hash and session tokens. See "The no-server option". |
| **Fly.io** | ~$5/mo | Yes, not free | *"One shared-cpu-1x 512MB Machine, running continuously $3.69 [and] 10GB volume $1.50"* ([pricing](https://fly.io/docs/about/pricing/)). The free trial is *"$1 of free credit… lasts for 7 days"* ([free trial](https://fly.io/docs/about/free-trial/)) — a trial, not a free tier. |
| **Render free web service** | $0 | **No** | *"Free web services have an ephemeral filesystem. This means that any changes to your web service's filesystem (uploaded images, local SQLite databases, etc.) are lost every time the service redeploys, restarts, or spins down… Paid services can preserve local filesystem changes by attaching a persistent disk, but Free web services cannot."* Its free Postgres is also unusable: *"Free Render Postgres databases expire 30 days after creation."* ([Deploy for Free](https://render.com/docs/free)) |
| **Vercel / Cloudflare Workers** | $0 | **No** | No persistent filesystem. Cloudflare's D1 is the nearest fit but its free tier is *"Maximum database size 500 MB (Free)"* and it would mean rewriting the data layer ([D1 limits](https://developers.cloudflare.com/d1/platform/limits/)). |

**Recommendation:** start with the **no-server GitHub Actions option** — it is
free, has no uptime problem, and needs no new account. Move to **Oracle Always
Free** when you want the interactive dashboard reachable on demand and the
agents running on their own schedule. Do not put it on Cloudflare Pages.

### The no-server option

The daily work does not need a web server. `npm run job` runs the same
orchestrator the dashboard buttons call, entirely headless:

```bash
npm run job                    # daily operations, no live network calls
npm run job -- --visibility    # also run the live visibility sweep
npm run job -- --report weekly
```

Point `GEO_LAB_DB` at a path inside the workspace and commit the **derived data**
(a JSON export), never the database file. This keeps the repository public-safe
while still giving the lab persistent history. `npm test` now enforces the part
that matters: it fails if the database or any of its sidecars becomes tracked.

### Oracle: step-by-step

`deploy/oracle/README.md` walks through the console (creating the VM, choosing
the Arm shape, saving the SSH key) and `deploy/oracle/bootstrap.sh` does the
install. Two things that are easy to get wrong:

- **The lab needs the whole repository, not just `geo-lab/`.** It analyses the
  website by walking the checkout, and the website lives at the repository root.
  A standalone `geo-lab/` copy makes the crawler walk its own parent directory.
  `crawlRepo()` now refuses to run in that case rather than score the wrong
  files, and `GEO_LAB_SITE_DIR` overrides the location explicitly.
- **Never open the app port to the internet.** Reach it over an SSH tunnel or
  put Cloudflare Tunnel in front of it (outbound-only, no inbound ports).

### Hosts that give a persistent disk

| Host | Notes |
|---|---|
| **Oracle Cloud Always Free** | Free forever; Arm Ampere A1 VM + block volume. Watch the idle-reclaim rule. |
| **Google Cloud e2-micro** | Free in 3 US regions; 30 GB persistent disk. |
| **Fly.io** | Persistent volume + a small machine, ~$5/mo. Good default paid option. |
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
| `GEO_LAB_NOTIFY_CHANNEL` | Optional | Force a notification channel (`console`, `resend`, `sendgrid`). Default: first configured provider, else `console`. |
| `GEO_LAB_NOTIFY_TO` | Optional | Notification recipient. Falls back to `GEO_LAB_OWNER_EMAIL`. |
| `GEO_LAB_MAIL_FROM` | Optional | From address for email providers. |
| `RESEND_API_KEY` / `SENDGRID_API_KEY` | Optional | Enables email delivery of run notifications (spec §16). |

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
