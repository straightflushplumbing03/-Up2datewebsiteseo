# Project Memory — Straight Flush Plumbing Intelligence HQ

Injected-at-startup index. Keep it small (~6 KB): fold only durable, high-value
facts here and push detail into the dated log files, read on demand.
Detail archive: `2026-10-15-detail.md`, `2026-10-16.md`, `2026-10-12.md`,
`2026-10-13.md`, `2026-11-06.md`, `2026-11-13.md`.

## GEO Intelligence Lab (`geo-lab/`, PR #140)
- **A separate Next.js 16 app** (App Router, TS, Tailwind v4, `node:sqlite`) — NOT part of
  the static site, does not deploy with it. Run from `geo-lab/`: `npm run seed`, `npm test`
  (34 tests, real DB + real crawl, no mocks), `npx tsc --noEmit`, `npm run build`. Serves 12000.
- **Cannot run on Cloudflare Pages / Vercel / Render free** (no persistent filesystem — Render
  free docs: "local SQLite databases … are lost"; its free Postgres "expire[s] 30 days after
  creation"). **Free options that DO fit:** Oracle Cloud Always Free (real VM + block volume,
  but idle instances are reclaimed if 95th-pct CPU *and* network stay <20% over 7 days) or GCP
  `e2-micro` + 30 GB disk (us-west1/us-central1/us-east1). **Simplest: no server at all** —
  standard GitHub runners are free for public repos; run `npm run job` (headless, same
  orchestrator as the HTTP route) on cron. Fly.io is NOT free (~$5/mo; "$1 of free credit …
  lasts for 7 days").
- **The lab crawls the checkout it lives in.** `REPO_ROOT = process.cwd()/..`, so deploying
  `geo-lab/` alone makes the crawler walk its own parent dir and report a confident, wrong
  answer (observed 51 pages / 0% consistency vs the real 153 / 100%). Deploy the **whole repo**;
  `GEO_LAB_SITE_DIR` overrides, and `crawlRepo()` now throws rather than guess. **Verify a
  deploy by running it from an isolated copy** — this class of bug exits 0 and looks healthy.
  Also: `npm ci --omit=dev` breaks both the build and the daily job (tailwind/postcss/tsx are
  devDeps).
- **The no-server option runs the lab's brain but CANNOT serve `/api/v1`** (a cron job that
  exits has no URL) — so once HQ is in scope a persistent host is required, not optional.
  Verified headless 2026-11-13: `npm run job` → 155 pages, 294 competitors, 33 opportunities.
  **Deploy target = Oracle Always Free VM + Cloudflare Tunnel** for free HTTPS with no inbound
  ports (the domain is Cloudflare-managed: NS `braden`/`dara.ns.cloudflare.com`). Runbook:
  `growth-engine/proposals/2026-11-13-geo-lab-deploy-and-merge-order.md`; the previously
  **missing** "Public HTTPS access (Cloudflare Tunnel)" section now exists in `geo-lab/DEPLOYMENT.md`
  (bootstrap.sh and the Oracle README both referenced it before it was written).
- **Merge order (2026-11-13): #163 → #153 (Lab), then #28 (HQ).** #163's base is #153's
  *branch*, so merging it into `main` directly would land the hardening without the API.
- **Never commit the SQLite file.** Also: running `npm run job`/`npm test` creates
  `geo-lab/node_modules/` + `.next/` full of `.html`; the repo validators then scan them and
  report **false failures**. They are gitignored, so CI never sees them — `rm -rf` before
  running the validators locally. Detail: `2026-11-13.md`.
- **The lab DB is a credential store, not data — never commit it.** It holds the owner's scrypt
  password hash + live session tokens, and this repo is **public**. `.gitignore` must cover
  `data/geo-lab.db` *and* the `-wal`/`-shm`/`-journal` sidecars (a plain `data/*.db` rule misses
  them). Three tests enforce this; each was negative-tested.
- Autonomy is an **external scheduler** — `.github/workflows/geo-lab-daily.yml` cron 06:00 PT
  POSTs `/api/run` with `GEO_LAB_RUN_TOKEN`; no session needed. `geo-lab.yml` gates PRs.
- Publishing goes through `engine/publishing.ts` only: snapshot → validate → **branch + PR**,
  never `main`, never merged. Locked facts (identity/NAP/pricing/warranty/licensing) are
  rejected mechanically; a test asserts a phone change fails.
- Honesty invariants mirrored from the growth engine: unreachable = `inconclusive` (never 0);
  `ai_platform`/`conventional_proxy`/`manual` never mixed; mention≠recommend≠cite.
- **Defects found by the tests** (2026-11-06): opportunity count double-counted dedupes;
  entity consistency summed ALL history instead of the latest check; removed sections were
  left orphaned. **Lesson: an aggregate over an append-only history table is usually the wrong
  measurement — ask "latest snapshot or all-time?" first.**
- Login lockout: 8 fails/15 min per email, counters in `schema_meta`. Clear with
  `DELETE FROM schema_meta WHERE key LIKE 'login_fail:%'`.
- **Lab `/api/v1` API** (2026-11-06, PR **#153**): scoped keys (SHA-256 hash stored, never the
  secret; timing-safe compare; DB-backed rate limit), envelope `{data, meta:{source:"geo-lab",
  version:"v1", ...}}`, `limit` clamped to 500. `POST /jobs` is **approval-gated**: read-only kinds
  queue, `publish`/`deploy`/`rollback`/`spend` become `pending_approval` and never execute. Spec:
  `geo-lab/docs/GEO_LAB_API_SPEC.md` — **this path exists only on PR #153's branch**, not on `main`.
- **AI Headquarters consumes it** (PR **#28**; Supabase+Next.js — different stack, so HTTP is the
  only coupling). `lib/integrations/geolab/{client,connector,status}.ts`, migration `032` (8
  `geo_lab_*` tables, org-scoped RLS), routes `app/api/ai-authority/geolab/*`, UI
  `GeoLabConnection.tsx`. Connector upserts on the source key; a partial failure records `partial`,
  never `succeeded`.
- **HQ `main` CI is RED pre-existing** (`cdac88fb`, 2026-10-31; prior `646e3a77` green): job
  `migrations`/`verify-migrations.sh` fails, `verify` passes. Cause: migration **028** grants to role
  `authenticated`, absent off-Supabase, so its own `has_table_privilege('authenticated',…)` raises.
  Identical without our migration. **Do not fix 028.** Detail: `2026-11-06.md`.
- **RLS only enforces for a non-superuser**: `SET ROLE postgres` sees every row; test as a
  `NOSUPERUSER` role and `RESET ROLE` between `auth.uid()` swaps.
- Env traps: `UID` is **readonly in bash** (`for UID in …` silently no-ops); `psql` is not
  preinstalled (install `postgresql-client`, else every migration "fails"); `default_create_pr`
  **422s when the branch was never pushed**.

## Repository identity
- **Production repo:** `straightflushplumbing03/-Up2datewebsiteseo` (public, `main`).
  Static HTML/CSS/JS, **no build step**; the committed `.html` files ARE the site.
  `.agents/skills/.../SKILL.md` wrongly calls it TypeScript — ignore that skill.
- Deploy: GitHub Pages (legacy build from `main` `/`) via `CNAME`
  `straightflushplumbingoc.com`, **fronted by Cloudflare** (which applies `_headers`;
  Pages ignores it). No `wrangler`/Workers config — do not call it Workers-deployed.
- Other same-owner repos (`Uptodatestraightflushwebsite`, `WebsiteMasterFile`, ...) are
  **not** production.
- Workspace clone: `/workspace/project/-Up2datewebsiteseo`. The sandbox may start with an
  empty git repo — restore with `git remote add origin ... && git fetch origin main &&
  git checkout -B main origin/main` (move `.openhands/` aside first if it collides).

## Live automations (inventory archived in `2026-10-16.md`)
- Exactly **ONE enabled content automation**: `SFPL AI Headquarters Daily`, id
  `1485d659-8663-4776-a507-db0fefed8483`, cron `0 6 * * 1,3,5` (Mon/Wed/Fri 06:00 PT).
  Plus Retry Watchdog `b946624c-...` (dispatch-only) and System Supervisor `c1b547c8-...`
  (Tue/Sat 07:00 PT). Check before enabling anything.
- **Editing the blueprint does NOT change the running job** — OpenHands stores a copy at
  creation. Deploy with `python3 ai-headquarters-blueprint/build_payload.py --deploy`; the cron
  constants live in `build_payload.py`, NOT the markdown. Guarded by
  `growth-engine/tests/test_automation_deploy_contract.py`.
- `growth-engine/automations/*.prompt.md` document **retired** automations; editing them does nothing.
- Change the schedule with `PATCH /api/automation/v1/{id}` and **only** `trigger`; a UI form
  edit does NOT change the live job.

## OpenHands automation API gotchas
- Host `https://app.all-hands.dev`, `Authorization: Bearer $OPENHANDS_API_KEY`.
- List: `GET /api/automation/v1` -> key **`automations`** (not `items`). Runs:
  `GET /api/automation/v1/{id}/runs` -> key `runs`.
- `timeout` is **hard-capped at 1800 s** (3600 -> HTTP 422). Control run length via the prompt.
- **Enforced ceiling is start + ~1920 s (~32 min)**, not 1800. Budget ~30 usable minutes.
- `PATCH` **does** accept `prompt` (endpoint table is misleading) — update presets in place.
- Repo attachments live in **`preset_metadata.repos`**; the list endpoint omits `repos`
  entirely, so read the single-job GET to verify attachments.
- `next_run_at` is NOT returned; prove scheduling with `enabled` + `trigger` + `last_triggered_at`.
- **Secrets inject only into a command whose TEXT names the key.** A bare
  `python3 scripts/daily_measure.py` sees no `Tavily_api_key` and records a false BLOCKED.
  Name it: `export Tavily_api_key="${Tavily_api_key}" && python3 ...`. Same for
  `GEMINI_API_KEY` / `Perplexity_api_key`. Names are case-sensitive as the user typed them.
- MCP `github_update_pull_request` can 403 on this repo; `curl -X PATCH` with
  `$GITHUB_TOKEN` works.
- **The automation runs as the OWNER's GitHub account `straightflushplumbing03`** — the repo's
  only collaborator. So a review request to that account is rejected
  (`422 Review cannot be requested from pull request author`), and branch protection cannot
  enforce "a different account approved" until a second collaborator is added. The merge gate is
  currently the agent's instruction + the owner's manual merge. See the README checklist.

## Run-budget rule (ISSUE-006 / ISSUE-009)
- **The expensive part is deciding how to measure, not measuring.** Two runs died at ~1950 s
  producing nothing. Fix: `scripts/daily_measure.py` — a deterministic pre-stage (~5 s + sweep)
  writing `growth-engine/data/daily_context.json`, made step 1 of the prompt. After it: 947 s / 720 s.
- Keep an explicit phase budget, a 22-min checkpoint that stops analysis and writes the report, and
  the order **report > commit > measurement > new work**.
- `"Timed out: Sandbox not available"` is a **budget overrun**, not a provisioning failure.
  Discriminate by **elapsed time, not the error string**: `FAILED` + `>= ~1500 s` -> fix the prompt,
  do NOT retry. Far below ceiling + no conversation -> retry once.
  Helper: `python3 growth-engine/tests/classify_automation_run.py <runs.json>`.

## AI visibility measurement
- **Primary AI surface: Gemini Search API** — `growth-engine/gemini_search_client.py`, CLI
  `scripts/gemini_visibility.py`, key `GEMINI_API_KEY`. `google_search` grounding gives a real
  web-grounded answer + citations. Records `test_type: ai_platform`, `platform: gemini_search`.
- **Gemini grounding is NOT on the free tier for the 3.x family.** `gemini-2.5-flash` is retired for
  new keys (404), so a post-2.5 key can only reach 3.x and **every grounded call 429s** while the
  model quota is barely used. Discriminator: 429 on grounded calls + 200 on `models.list`/ungrounded
  generate + low model quota = **grounding entitlement, not exhaustion**. The daily reset won't help.
  Fix = billing (Tier 1 = 5,000 free grounded req/mo) or a grounding-eligible key.
- **Labelled Gemma fallback (ISSUE-032, PR #67):** when every Gemini model refuses grounding,
  a Google-Search-grounded `gemma-*` model answers on the same key/same Search index — free.
  Rows carry `engine` + `fallback_from`; `note` says it is NOT the Gemini/AI-Overviews surface.
  A pinned model disables it; `--no-fallback` disables it. Never make the substitution silent.
- **Other free AI routes are dead ends from this egress IP:** Google AI Overviews → CAPTCHA;
  Bing Copilot → "unavailable" headless; DDG AI Chat → JS challenge; OpenRouter free models
  → no web search; Groq/Cerebras/Mistral/etc → no grounding on free tiers.
- **Conventional-search proxy: Tavily** — `growth-engine/tavily_search.py`, stdlib only.
  `POST https://api.tavily.com/search`, `Authorization: Bearer tvly-...`. Recorded
  `test_type: conventional_proxy` — **never** as an AI-platform result.
- **Perplexity is optional/paid** (metered, no free tier) — `ai_agent_client.py` +
  `scripts/perplexity_agent.py`. Do not enable by default.
- **Honesty invariants (do not break):** a failed call is `inconclusive`, never `absent`/zero;
  a ranked list never returns `recommended`; keys are never printed or committed.

## Confirmed business facts
- Name exactly **"Straight Flush Plumbing & Leak Detection"**. `SF_NAMES` matches
  `straight flush plumbing` / `straightflushplumbing`; bare "straight flush" is deliberately
  NOT matched (poker hand; "Straight Flush Rooter of Ohio").
- NAP: `(949) 374-6524` / `+19493746524`; `78 Cameray Heights, Laguna Niguel, CA 92677`.
- Owner/lead tech: Lance Badgwell. Slogan: "Always A Safe Bet."

## Entity consolidation (owned duplicates)
- Owner-confirmed owned hosts (registry `DUPLICATE_HOSTS` in
  `scripts/entity_consistency_check.py`): `straight-flush-plumbing-7fb7cf71.base44.app`,
  `straightflushplumb8.wixsite.com`, `flush-pro-flow.base44.app`.
- `straight-flush-plumbing-7fb7cf71.base44.app` is a **live indexable duplicate** (48 URLs,
  self-canonical, no links to the real site); its JSON-LD `@id` points at
  `https://flush-pro-flow.base44.app/#business` (404) — a dangling reference.
  Full detail: `growth-engine/ENTITY_CONSOLIDATION_PLAN.md`.
- Regression: `python3 scripts/entity_consistency_check.py --run` -> exit 1 while any duplicate
  is indexable.
- **NEVER add `sameAs` from the real site to a duplicate** — it asserts "this is also me" and
  strengthens the stale association. Consolidation = removal, not linkage.
- Editing external properties is **Level 3 / owner-only**. Agents report, never touch.

## Indexing / noindex (verified 2026-10-25, detail in `2026-10-25.md`)
- The **58 root-level `.html` files are intentional `noindex, nofollow` stubs** (PR #10); each
  canonicalizes to its real page under `services/|cities/|academy/|guides/|insurance/`, which are
  indexable + self-canonical + in sitemap. **An owner reporting "page X is noindex" is almost
  always seeing the stub** — check the subdir twin first. 148 files = 89 indexable (= sitemap set
  exactly) + 59 noindex. Only indexable orphan was `guides/index.html` (fixed, PR #83).
- **`refresh_sitemap.py` rewrites every `<lastmod>`** from each file's last commit date; on a
  shallow clone it churns ~108 lines with no page change. Revert it unless the URL set changed.
- Legacy root URLs return `200 + noindex`, not a redirect; the SEO-correct fix is a **301 at the
  Cloudflare edge** (GitHub Pages can't emit file redirects). Owner-side.

## Conventions that matter
- **GitHub token in this environment is scoped to git push + PR create only.**
  `PATCH /pulls/{n}` (edit body/title) and `POST /issues/{n}/comments` return
  `403 Resource not accessible by personal access token`; the secondary
  `GITHUB_PERSONAL_ACCESS_TOKEN` returns `401 Bad credentials`. So an agent can
  push a branch and open a PR but **cannot edit the PR description or comment**.
  Put everything needed in the initial PR body; if a change needs an explanation
  the owner must be told in chat. **Draft gotcha:** a PR opened via the tool can
  land as a **draft** (unmergeable). Flip it with GraphQL
  `markPullRequestReadyForReview(pullRequestId: <node_id>)`; the REST
  `PATCH {"draft": false}` returns 200 but silently does nothing.
- **Google tag:** the ID lives once in `scripts/csp_policy.py` (`MEASUREMENT_ID`);
  the meta CSP allows the inline `gtag()` bootstrap by a **SHA-256 hash of the snippet**,
  so changing the ID needs the hash regenerated (`add_security_meta.py`) or the tag loads
  and records nothing (ISSUE-028/030). ONE tag per page — a new ID is a **replace**.
  Verify with Chromium `--log-net-log` + grep `gtag/js?id=<ID>`. Current: `G-DFS6B1LV4P`.
- Never commit to `main`; branch + PR only. **Never merge any PR — open it, request review, hand
  the merge to the owner.** No low-risk exception; review is required before merge.
- Branches: research `intelligence-hq/daily-<date>`; site changes `intelligence-hq/site-<date>-<slug>`.
- Knowledge persistence: append to `data/*.jsonl`, add dated reports, never delete history.
  `MEMORY.md` is edited in place (not appended).
- **Concurrent sessions mutate this repo** (owner merges within minutes): `git fetch` and check
  for newer `main`/open PRs before repo work; rebase before push; one PR per day.
- **The owner also RENAMES repos mid-session — and the REST API does not follow the redirect
  (git does).** 2026-11-13: `-Up2updatewebsiteseo` → **`-Up2datewebsiteseo`** (id `1326249049`
  unchanged) while a session ran. `git push` worked; every `GET/POST /repos/<old-name>…` and
  `gh pr create` returned **404 / GraphQL "Could not resolve"**, while the repo still appeared in
  `GET /user/repos`. **When the API 404s on a repo git can clearly reach, suspect a rename, not
  the token.** Resolve by id (`GET /repositories/<id>` → `.full_name`), then
  `git remote set-url origin https://github.com/<owner>/<new>.git` (and the `--push` URL) or the
  next push fails too. Detail: `2026-11-13.md`.
- **CI:** `.github/workflows/verify.yml` runs `unittest discover`, `validate_knowledge_base.py`,
  `seo_audit.py` and the sitemap URL-set invariant on every PR/push (stdlib-only, `fetch-depth: 0`).
  `geo-lab.yml` additionally gates `geo-lab/**`. Check the PR's run — it is the only "green" not
  authored by the change author. `crawler_access_check.sh` is still manual-only.
- **Never run `scripts/gen_*.py` site-wide** — they revert per-page JSON-LD and unique city meta
  (4->1 JSON-LD blocks, 585 lines deleted). Edit `.html` directly. `write_page()` now guards it.
- Root-level `.html` files are `noindex` stubs; indexable pages live in subdirectories.
- **The git token ROTATES during a session.** A push hangs on a password prompt because
  `.git/config` holds the *previous* `ghu_…` token while `$GITHUB_TOKEN` has moved on. Happened
  twice in one day. Fix: `git remote set-url origin "https://${GITHUB_TOKEN}@github.com/OWNER/REPO.git"`.
  If a push ever hangs, that is the cause — do not wait for the timeout.
- **geo-lab is essentially complete** (audited against spec §22, 2026-11-07). Notifications (§16)
  was the last gap and is now built. **`/api/reports` + `/api/entity` return 405 by design** —
  POST-only actions, not missing GETs. Do not "fix" them.
- Search-provider reality on this egress IP: Brave -> 429, DDG HTML -> 202; Tavily is the
  reliable path (DDG Lite is the only parseable scraper fallback).
- No GSC/GA4/GBP credentials here — record as a blocker, never as zero.
- Secrets: never in a repo file, report, or commit. If a user pastes a key in chat, tell them to
  rotate it.
- Merge/conflict-marker hazards (a check that passes when it should fail; `^` regex without
  `re.M`; append-only union is wrong for `MEMORY.md`) — detail in `2026-10-15-detail.md`.

## System supervisor (HQ-S) — measurement defects (ISSUE-031, fixed 2026-10-19)
- `scripts/system_supervisor.py` had two false FAILs, one blind PASS, one missing check. Fixed:
  `self_merges` reads the single-PR endpoint (the list endpoint omits `merged_by`) and reports
  **UNMEASURED/BLOCKED** with one collaborator; `change_volume` counts unique paths, not numstat
  rows (`len(set(paths))`), new pages via `--diff-filter=A`, `MAX_CHANGED_FILES` 120->200;
  `unexpected_branches` treats a merged-PR head as explained (`?state=all`); `ai_visibility_blind`
  added (FAIL when 0 `test_type: ai_platform` rows or newest >14 d).
- **Verify a check against real data, not the code's intent.** The 2026-10-17 report "passed"
  self_merges while every merge was a self-merge. A check that cannot fail is worse than none.
- Remaining owner-level FAILs (not code): daily job disabled (2026-10-16T06:25Z); GEMINI_API_KEY
  429 so the AI surface is UNMEASURED. Detail archived in `2026-10-16.md`.
