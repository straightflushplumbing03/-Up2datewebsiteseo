# Project Memory — Straight Flush Plumbing Intelligence HQ

Injected-at-startup index. Keep it small (~6 KB): fold only durable, high-value
facts here and push detail into the dated log files, read on demand.
Detail archive: `2026-10-15-detail.md`, `2026-10-16.md`, `2026-10-12.md`, `2026-10-13.md`.

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

## Live automations (verified 2026-10-16)
- **`SFPL AI Headquarters Daily`** — id `1485d659-8663-4776-a507-db0fefed8483`,
  cron **`0 6 * * 1,3,5`** (Mon/Wed/Fri 06:00 PT), timeout 1800. The one content job.
  Prompt source: `ai-headquarters-blueprint/01-MASTER-AGENT-PROMPT.md`.
- **Retry Watchdog** — id `b946624c-79c2-40a6-be1b-258388a15fb4`,
  `30 6,9,12,15,18 * * *`, timeout 600. Dispatch-only; never does SEO work.
- **System Supervisor (HQ-S)** — id `c1b547c8-da3b-4fa1-ba8a-e99a55e0f59e`,
  `0 7 * * 2,6` (Tue/Sat 07:00 PT), timeout 900. Oversight: runs
  `scripts/system_supervisor.py` (deterministic drift detector, no LLM until the report) and
  opens a report PR. Never merges/edits. Prompt `automations/ai-headquarters-supervisor.prompt.md`.
- Disabled rollback points: `e6684830-...`, `df4bcd68-...`. Retired (404): `5dc89b41`,
  `0582d219`, `4c5213f7`.
- **Invariant: exactly ONE enabled content automation.** Check before enabling anything.
- **Editing the blueprint does NOT change the running job.** OpenHands stores a copy of the
  prompt at creation. Deploy with `python3 ai-headquarters-blueprint/build_payload.py
  --deploy` (PATCHes id `1485d659-...`), then verify via the GET. The cron constants live in
  `build_payload.py`, NOT the markdown — a second copy is how the schedule once silently
  reverted to daily. Guarded by `growth-engine/tests/test_automation_deploy_contract.py`.
- `growth-engine/automations/*.prompt.md` document **retired** automations (`5dc89b41` -> 404);
  editing them changes nothing at run time.
- Changing the schedule = `PATCH /api/automation/v1/{id}` with **only** `trigger`; verified
  2026-10-16 that prompt/repos/timeout survive untouched. A UI form edit does NOT change
  the live job — use the API.

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
- **The expensive part is deciding how to measure, not measuring.** Two runs died at
  ~1950 s producing nothing. Fix: `scripts/daily_measure.py`, a deterministic pre-stage
  (~5 s + sweep) writing `growth-engine/data/daily_context.json`; the prompt makes it step 1.
  After it: runs COMPLETED at 947 s / 720 s.
- Keep: explicit phase budget, a 22-min checkpoint that stops analysis and writes the report,
  and **report > commit > measurement > new work**.
- `"Timed out: Sandbox not available"` is a **symptom of a budget overrun**, not a
  provisioning failure. **Discriminate by elapsed time, not the error string:** `FAILED` +
  `elapsed >= ~1500 s` -> fix the prompt, do NOT retry. Far below ceiling + no conversation ->
  retry once. Helper: `python3 growth-engine/tests/classify_automation_run.py <runs.json>`.

## AI visibility measurement
- **THE BUSINESS GOAL IS UNMEASURED (ISSUE-027, HIGH, OPEN).** `ai_visibility_history.jsonl`
  has 337 rows and **zero `test_type: ai_platform`** — all are conventional-search proxies.
  `GEMINI_API_KEY` is *registered but empty* (len 0), so the free AI surface has **never run**.
  Fix is owner-only: provision a free key at aistudio.google.com/apikey as `GEMINI_API_KEY`.
  Guarded by `scripts/system_supervisor.py::check_ai_visibility_blind` (fails while 0/stale).
- **Primary AI surface (free): Gemini Search API** — `growth-engine/gemini_search_client.py`,
  CLI `scripts/gemini_visibility.py`, key `GEMINI_API_KEY`. `google_search` grounding gives a
  real web-grounded answer **+ citations**; free tier (~500 grounded req/day on Flash).
  Records `test_type: ai_platform`, `platform: gemini_search`.
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

## Conventions that matter
- Never commit to `main`; branch + PR only. **Never merge any PR — open it, request review, hand
  the merge to the owner.** No low-risk exception; review is required before merge.
- Branches: research `intelligence-hq/daily-<date>`; site changes `intelligence-hq/site-<date>-<slug>`.
- Knowledge persistence: append to `data/*.jsonl`, add dated reports, never delete history.
  `MEMORY.md` is edited in place (not appended).
- **Concurrent sessions mutate this repo** (owner merges within minutes): `git fetch` and check
  for newer `main`/open PRs before repo work; rebase before push; one PR per day.
- No CI: run `validate_knowledge_base.py`, `unittest discover`, `crawler_access_check.sh`,
  `seo_audit.py` by hand.
- **Never run `scripts/gen_*.py` site-wide** — they revert per-page JSON-LD and unique city meta
  (4->1 JSON-LD blocks, 585 lines deleted). Edit `.html` directly. `write_page()` now guards it.
- Root-level `.html` files are `noindex` stubs; indexable pages live in subdirectories.
- Search-provider reality on this egress IP: Brave -> 429, DDG HTML -> 202; Tavily is the
  reliable path (DDG Lite is the only parseable scraper fallback).
- No GSC/GA4/GBP credentials here — record as a blocker, never as zero.
- Secrets: never in a repo file, report, or commit. If a user pastes a key in chat, tell them to
  rotate it.
- Merge/conflict-marker hazards (a check that passes when it should fail; `^` regex without
  `re.M`; append-only union is wrong for `MEMORY.md`) — detail in `2026-10-15-detail.md`.
