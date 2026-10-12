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
- `GET /api/automation/v1?limit=N` returns `{"automations":[...], "total":N}` — the list key is `automations`, **not** `items`/`automations` fallback.
- `GET /api/automation/v1/{id}/runs` returns `{"runs":[...]}`.
- Create via `POST /api/automation/v1/preset/prompt` with `{name, prompt, trigger:{type:cron,schedule,timezone}, repos:[...], timeout}` → HTTP 201.
- PATCH `{enabled:false}` disables (returns `state: INACTIVE`, `disabled_reason: manual`).
- Timezone is honored and echoed back in `trigger.timezone`.

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
