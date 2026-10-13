# Project Memory — Straight Flush Plumbing Intelligence HQ

## Repository identity (verified 2026-10-12)
- **Production repo:** `straightflushplumbing03/-Up2datewebsiteseo` (public, default branch `main`).
  - NOT a TypeScript project despite `.agents/skills/-Up2datewebsiteseo/SKILL.md` claiming so — that skill was auto-generated and is wrong. The site is **static HTML/CSS/JS, no build step**.
  - Deploy: **GitHub Pages** legacy build from `main` `/`, custom domain via `CNAME` = `straightflushplumbingoc.com`, fronted by Cloudflare. Repo also has `has_pages: true`.
  - The workspace clone lives at `/workspace/project/-Up2datewebsiteseo` (same name as repo).
- Other same-owner repos (`Uptodatestraightflushwebsite`, `WebsiteMasterFile`, `Up2dateseowebsite`, etc.) are **not** production; do not deploy there.

## Intelligence system
- Pre-existing `growth-engine/` knowledge base (created 2026-10-09). Read order is in `growth-engine/README.md`.
- Intelligence HQ = two OpenHands Cloud automations (prompt preset, `repos` = the repo):
  - `SFPL Intelligence HQ Daily 6 AM` — id `5dc89b41-6880-40e6-950c-14a635f7bd62`, `0 6 * * *`, America/Los_Angeles.
  - `SFPL Intelligence HQ Weekly Review` — id `0582d219-de15-42c2-83b5-4bc92995edce`, `0 6 * * 1`, America/Los_Angeles.
  - Canonical prompts: `growth-engine/automations/intelligence-hq-{daily,weekly}.prompt.md` (keep in sync with live definitions).
- Superseded Automation A (`4c5213f7-080c-4edd-97a2-30962419bd14`, same 06:00 slot) was **disabled** 2026-10-12.

## OpenHands automation API gotchas (learned)
- Host: `https://app.all-hands.dev`, auth `Authorization: Bearer $OPENHANDS_API_KEY`.
- `GET /api/automation/v1?limit=N` returns `{"automations":[...], "total":N}`.
- `GET /api/automation/v1/{id}/runs` returns `{"runs":[...]}`.
- Create via `POST /api/automation/v1/preset/prompt` with `{name, prompt, trigger:{type:cron,schedule,timezone}, repos:[...], timeout}` → HTTP 201.
- PATCH `{enabled:false}` disables (returns `state: INACTIVE`).
- Timezone is honored and echoed back in `trigger.timezone`.
- **`timeout` is hard-capped at 1800 s** (30 min) — 3600 → HTTP 422. Do not try to raise it; control run length via the prompt instead.
- **`next_run_at` is NOT returned** by this API version. Prove scheduling with `enabled` + `trigger` + `last_triggered_at`.
- The repo connection lives in `preset_metadata.repos` (a list of `{url:...}`).

## Run-budget rule for these automations (ISSUE-006)
An agent-driven research run will happily consume the whole 1800 s exploring
search engines and never persist. Prompts MUST carry an explicit time budget
(~40% research / 60% write+commit), a single allowed search provider, and a
"stop researching and commit when near budget" instruction. A committed short
report beats a rich lost one. **Verified 2026-10-13:** the scheduled daily run
finished in ~10 min and persisted (opened PR #33).

## Search-provider reality on this egress IP (ISSUE-007)
Brave → HTTP **429**; DuckDuckGo HTML → **202**; **DuckDuckGo Lite is the only
reliably parseable endpoint** (`https://lite.duckduckgo.com/lite/?q=...`). Prompt
provider order: Brave → DDG Lite → Bing, fall through once, record `platform` per
row. Don't retry a blocked provider.

## Scheduled-run verification (how to prove the loop is autonomous)
`next_run_at` is not exposed. Prove scheduling by an actual on-time **cron** run:
`GET /api/automation/v1/{id}/runs` and look for `trigger_source: cron` with a
`started_at` matching the cron in the automation's timezone. Verified 2026-10-12:
daily `1afcbefd` 13:00:54Z = 06:00:54 PDT; weekly `ff3478a3` 13:00:43Z = 06:00 PDT.

## Concurrent sessions mutate this repo (ISSUE-008)
Multiple OpenHands sessions (daily automation + manual) push branches and open PRs
here, and **the owner merges them within minutes**. Always `git fetch` and check
for a newer `main` and open PRs BEFORE doing repo work; expect your branch to be
superseded. Rebase-before-push; union-merge append-only `.jsonl`; one PR per day.

## Deployment (corrected 2026-10-13)
Origin = **GitHub Pages** (legacy build from `main` `/`), **fronted by Cloudflare**
(DNS+proxy+Transform Rules applying `_headers`; Pages ignores `_headers`). A
Cloudflare **Workers Builds** check runs on PRs, but there is NO `wrangler`/Workers
config in the repo — do not describe the site as Workers-deployed.

## GitHub API note
`github_update_pull_request` (MCP) can return **403 "Resource not accessible by
personal access token"** on this repo, while `curl -X PATCH ... -H "Authorization:
Bearer $GITHUB_TOKEN"` works (200). Use curl for PR title/body edits.

## Environment quirks
- **Brave Search** (`search.brave.com/search?q=`) works with a normal browser UA for conventional-proxy research, but rate-limits with **HTTP 429** after ~7-8 rapid queries. Pace queries. Bing/DDG HTML are unreliable here.
- Google Search Central docs (`developers.google.com/search/...`) fetch fine (200) — usable as primary sources.
- No GSC/GA4/GBP credentials in this environment. Record as a blocker, never as zero.
- Current date in this environment is 2026-10; use `date -u` to confirm before dating reports.

## Conventions that matter
- Never commit to `main`; branch + PR only. Never merge own PR.
- Research/report branches: `intelligence-hq/daily-<date>`; site-change branches: `intelligence-hq/site-<date>-<slug>`.
- Knowledge persistence: append to `data/*.jsonl`, add dated report files, never delete history.
- Tests: `python3 growth-engine/tests/validate_knowledge_base.py` (must pass), `bash growth-engine/tests/crawler_access_check.sh`.
- ISSUE-001 (Cloudflare under-attack mode blocking crawlers) was resolved 2026-10-11; `crawler_access_check.sh` is the regression test.
