# Proposal — 2026-11-13 — GEO Lab: merge order and deploy runbook (owner action required)

**Level:** 3 (merge + hosting + credentials — owner action required)
**Status:** proposed
**Owner action requested:** merge the three open GEO Lab PRs in order, deploy the
lab to a host with a persistent disk, and set four secrets. Nothing here is
autonomous — merges and hosting are owner-level.

## Why this exists

The GEO Intelligence Lab (`geo-lab/`) is built, tested and green, but it has
**never run in production**. Its scheduler has fired zero times:

```
$ gh api repos/.../actions/workflows/geo-lab-daily.yml/runs
  NO RUNS EVER — the daily job has never executed
```

The daily autonomous loop the business currently relies on is the **growth-engine
Claude task** (`claude daily: 2026-11-13 — 10 AI queries, 0 recommended`), which is
a different system. The Lab is the interactive console plus the `/api/v1` that AI
Headquarters reads. Until it is hosted, the HQ screen correctly reports
`Not configured` rather than showing an empty dashboard.

## Part 1 — Merge order (three PRs, order matters)

| Step | PR | Repo | Base | Why this order |
|---|---|---|---|---|
| 1 | **#163** | `-Up2updatewebsiteseo` | `intelligence-hq/geo-lab-api` | Security hardening of the `/api/v1` API. **It targets #153's branch, not `main`.** Merge it first so the API goes live already hardened. |
| 2 | **#153** | `-Up2updatewebsiteseo` | `main` | The scoped read-only `/api/v1` itself (15 files). Merging it also carries in #163. |
| 3 | **#28** | `AI-Headquarters` | `main` | The HQ-side connector that calls that API. Only useful once #153 is on `main`. |

Verified against the live PRs on 2026-11-13:
`#163 base=intelligence-hq/geo-lab-api`, `#153 base=main`, `#28 base=main`.

**Do not merge #163 into `main` directly** — its base is #153's branch, so a direct
merge would land the hardening without the API it hardens.

### What #163 changes (from its own description)

1. Unauthenticated requests could grow `api_requests` without limit; now capped at
   30/min across all callers, with path/note/IP length caps and 90-day pruning.
2. Two missing indexes so the rate-limit and `/health` counts stop full-scanning.
3. `POST /jobs` bounds: `params` capped at 8 KB, at most 50 queued/pending jobs,
   and the caller-supplied `requestedBy` is now labelled with the key's name so a
   key cannot record a job as requested by "owner".

## Part 2 — Hosting: what fits and what does not

The Lab needs **a persistent filesystem** (SQLite + `data/snapshots/`). That single
constraint is what rules out the serverless platforms, not CPU or memory.

| Option | Cost | Fits? | Note |
|---|---|---|---|
| **Oracle Cloud Always Free** | $0 | **Yes — recommended** | Real VM + block volume. Caveat: idle Always Free instances can be reclaimed if 95th-pct CPU **and** network stay <20% over 7 days. |
| **GCP e2-micro** | $0 | Yes | Free in `us-west1`/`us-central1`/`us-east1`; 30 GB persistent disk. |
| **GitHub Actions, no server** | $0 | Yes for the *job*, **no for the API** | See the limitation below. |
| **Fly.io** | ~$5/mo | Yes | Persistent volume + small machine. |
| **Render free** | $0 | **No** | Ephemeral filesystem — local SQLite is lost on every redeploy/restart. |
| **Vercel / Cloudflare Pages** | $0 | **No** | No persistent filesystem. |

### The no-server option cannot serve the integration

DEPLOYMENT.md recommends the no-server GitHub Actions path first. It is genuinely
free and does give daily autonomy — `npm run job` runs the same orchestrator the
dashboard buttons call, with no web process. I ran it headless to confirm:

```
GEO Lab — headless run (report=daily, visibility=false, liveEntity=true)
  [ok] SEO Technical Agent: 155 pages crawled, 0 issues
  [ok] Content Intelligence Agent: 48 weak sections identified
  [ok] Entity Intelligence Agent: consistency 100%
  [ok] Competitor Intelligence Agent: 294 competitors tracked
  [ok] Analytics Agent: 33 new opportunities
```

**But it cannot host `/api/v1`.** The whole point of the AI Headquarters work is that
HQ reads `GET /api/v1/...` over HTTP. A cron job that runs and exits has no URL to
call. So: **the no-server path runs the lab's brain; only a real host exposes the
API.** If the integration matters, a persistent host is required.

### HTTPS is the hard part, and Cloudflare Tunnel solves it free

The API key must travel over HTTPS — the lab's own client refuses plain HTTP. The
Oracle bootstrap deliberately leaves port 12000 bound to localhost and tells you
*not* to open it. The bridge is Cloudflare Tunnel, which the domain already supports
(it is Cloudflare-managed — the repo ships `purge-cloudflare-cache.yml`).

Grounded in Cloudflare's own docs:

> "Cloudflare Tunnel provides you with a secure way to connect your resources to
> Cloudflare without a publicly routable IP address. With Tunnel, you do not send
> traffic to an external IP — instead, a lightweight daemon in your infrastructure
> (`cloudflared`) creates outbound-only connections to Cloudflare's global network."

Source: <https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/>

Cloudflare One "offers both Free and Paid plans"
(<https://developers.cloudflare.com/cloudflare-one/>), and Tunnel is available on the
free plan. This gives a real HTTPS hostname with **no inbound ports open on the VM**,
which is the safe configuration the bootstrap asks for.

**Recommended target:** Oracle Always Free VM → `cloudflared` tunnel →
`geo-lab.straightflushplumbingoc.com` (HTTPS) → localhost:12000. Put Cloudflare
Access in front so only the owner and HQ can reach it.

## Part 3 — Deploy runbook (owner)

The assets already exist and are complete: `geo-lab/deploy/oracle/README.md`
(console walkthrough) and `geo-lab/deploy/oracle/bootstrap.sh` (idempotent install,
252 lines, installs Node 22, creates the `geolab` service user, migrates, builds,
and installs **two** systemd units — the web service and a `geo-lab-daily.timer`
at 06:00 America/Los_Angeles with `Persistent=true`).

```bash
# 1. On the Oracle VM (Ubuntu 22.04/24.04), as ubuntu:
curl -fsSLO https://raw.githubusercontent.com/straightflushplumbing03/-Up2updatewebsiteseo/main/geo-lab/deploy/oracle/bootstrap.sh
sudo bash bootstrap.sh

# 2. Add keys to /etc/geo-lab/geo-lab.env (mode 600, root-owned), then:
sudo systemctl restart geo-lab

# 3. Verify the daily timer is armed
systemctl list-timers geo-lab-daily.timer
```

**The lab needs the whole repository, not just `geo-lab/`.** It analyses the website
by walking the checkout, and the website lives at the repo root. A standalone
`geo-lab/` copy makes the crawler walk its own parent directory and report a
confident, wrong answer. The bootstrap clones the whole repo for this reason, and
`crawlRepo()` now refuses to run rather than guess.

### Secrets to set (four)

| Where | Name | Purpose |
|---|---|---|
| VM `/etc/geo-lab/geo-lab.env` | `GEO_LAB_RUN_TOKEN` | Auto-generated by the bootstrap; authenticates the daily run. |
| GitHub repo secrets | `GEO_LAB_URL` | The deployed HTTPS URL, e.g. `https://geo-lab.straightflushplumbingoc.com`. |
| GitHub repo secrets | `GEO_LAB_RUN_TOKEN` | Same value as the VM's. Lets `geo-lab-daily.yml` trigger runs. |
| HQ Vercel env | `GEO_LAB_URL` + `GEO_LAB_API_KEY` | How AI Headquarters reaches the lab. Mint the key with `npm run apikey -- create --name "AI Headquarters"`. |

`geo-lab-daily.yml` currently exits 0 with a note when `GEO_LAB_URL` is unset, so it
has been silently skipping — that is the visible symptom to watch for.

### First-run hygiene

1. Sign in, **change the owner password**.
2. Delete `geo-lab/data/owner-credentials.txt`.
3. Confirm `data/geo-lab.db` and its `-wal`/`-shm` sidecars are gitignored (tests
   already enforce this — the DB holds the password hash and session tokens and
   **this repository is public**).

## What is NOT in this proposal

- **No autonomous publishing of this.** Merges and hosting are owner decisions.
- **The pre-existing HQ CI failure is not fixed here.** `AI-Headquarters` `main`
  already fails the `migrations` job at `cdac88fb` (2026-10-31); the prior commit
  `646e3a77` passed. The cause is migration **028**'s own post-condition: it grants
  to role `authenticated`, which does not exist off-Supabase, so
  `has_table_privilege('authenticated', ...)` raises. It is identical with and
  without the GEO Lab migration, and it is **correct on Supabase** — do not change
  it. Flagging it so the red check is not misread as this work breaking `main`.

## Cost

$0 for the recommended path: Oracle Always Free VM + Cloudflare Tunnel + GitHub
Actions on a public repo. Fly.io (~$5/mo) is the fallback if the Oracle idle-reclaim
rule becomes annoying. No paid service is required for any of this.
