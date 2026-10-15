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
report beats a rich lost one.

## "Sandbox not available" is usually a budget overrun, not a provisioning failure (ISSUE-009, root cause corrected 2026-10-15)
- The enforced ceiling is **start + ~1920 s** (~32 min), NOT the 1800 s in the
  config. Measured as `timeout_at - started_at` (1926/1947/1923/1922 s).
- When a run exceeds its wall clock the platform kills it, tears down the sandbox,
  and its **post-run verification** then records `environment_unavailable` /
  `error_detail: "Timed out: Sandbox not available"`, `conversation_id: null`.
  That error string is a **symptom of the timeout**, not proof the sandbox was
  never provisioned. A retry cannot fix a budget overrun.
- **Discriminator = elapsed time, not the error string.** `FAILED` + `elapsed ≥
  ~1500 s` → budget overrun → fix the prompt; do NOT retry. `FAILED` + `elapsed`
  far below the ceiling + no conversation → provisioning blip → retry once.
- Real fix (on `main`, commit `897e7be`): `scripts/daily_measure.py` deterministic
  pre-stage (~5 s, writes `growth-engine/data/daily_context.json`) + master prompt
  budgeted to the real ceiling. Verified: two dispatched runs COMPLETED at 947 s
  and 721 s.
- Helper: `python3 growth-engine/tests/classify_automation_run.py <runs.json>`
  (classes: ok / budget_overrun / sandbox / config_error / other).
- Retry watchdog `b946624c-79c2-40a6-be1b-258388a15fb4` (`30 6,9,12,15,18 * * *` PT)
  is a narrow safety net: it re-dispatches only on a *fast* failure that never
  reached the ceiling. Live prompt PATCHed 2026-10-15 to match the repo file.

## GitHub API note
`github_update_pull_request` (MCP) can return **403 "Resource not accessible by
personal access token"** on this repo, while `curl -X PATCH ... -H "Authorization:
Bearer $GITHUB_TOKEN"` works (200). Use curl for PR title/body edits.

## Environment quirks
- **Brave Search** (`search.brave.com/search?q=`) works with a normal browser UA for conventional-proxy research, but rate-limits with **HTTP 429** after ~7-8 rapid queries. Pace queries. Bing/DDG HTML are unreliable here.
- Google Search Central docs (`developers.google.com/search/...`) fetch fine (200) — usable as primary sources.
- No GSC/GA4/GBP credentials in this environment. Record as a blocker, never as zero.
- Current date in this environment is 2026-10; use `date -u` to confirm before dating reports.

## Perplexity Agent API integration (2026-10-15)
- `growth-engine/ai_agent_client.py` = the client. `scripts/perplexity_agent.py` = the CLI
  (`--smoke` / `--run` / `--append` / `--dry-run`). `growth-engine/tests/test_perplexity_agent.py`
  = 50 stdlib unittest tests, no network + no key needed.
- Endpoint: `POST https://api.perplexity.ai/v1/agent` via the **official SDK**
  (`pip install perplexityai`, `from perplexity import Perplexity`, `client.responses.create(...)`).
  Do NOT use the OpenAI SDK for the Agent API (that is for the Router API).
- `responses.create` is keyword-only: `input` (required), `model` XOR `preset`, `tools`,
  `instructions`, `response_format`, `max_output_tokens`, `max_steps`, `previous_response_id`.
- Read the answer with `response.output_text`. Sources live in `search_results` output items
  (`item.results[].url/title/snippet/date`); URL citations live in text-content `annotations`.
- Error bodies come back as `{"error": {"type": ..., "code": ..., "message": ...}}` — e.g. a
  missing/invalid key gives `type: "invalid_api_key", code: 401`. Provider error strings are
  normalised into the repo taxonomy via `_PROVIDER_ERROR_MAP`.
- `requirements.txt` now exists (`perplexityai>=0.43.8`); this was the repo's first dependency file.
- Key is read from `PERPLEXITY_API_KEY` only. Never pass it on a CLI arg (shell history / ps).

## Tavily Search integration (2026-10-15)
- `growth-engine/tavily_search.py` = client (**stdlib `urllib` only — Tavily needs no package**).
  `scripts/tavily_search.py` = CLI. `growth-engine/tests/test_tavily_search.py` = 41 tests.
- Endpoint: `POST https://api.tavily.com/search`, auth header `Authorization: Bearer tvly-...`.
  Body: `query`, `max_results`, `search_depth`, `topic`, `include_domains`, `exclude_domains`,
  `country`, `include_answer`, `include_raw_content`. Response: `results[]` with
  `url/title/content/score`, plus `answer`, `response_time`, `request_id`.
- It **replaces Brave/DDG scraping** as the conventional-search proxy (Brave 429s our egress IP
  after ~7-8 queries; DDG HTML 202s intermittently). Recorded `test_type: conventional_proxy` —
  NEVER as an AI-platform result. `include_answer` defaults OFF on purpose.
- `classify_visibility` returns only `cited`/`absent`/`inconclusive` — never `recommended`,
  because a ranked list does not recommend.
- Remote MCP: `https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}` (server
  `tavily-mcp` v4.0.4, responds to JSON-RPC `initialize`). Repo-level `.mcp.json` added.
- Tavily errors: 401/403 auth, 429 rate limit (carries `Retry-After`), 400/404/422 bad request,
  5xx server. Body may be HTML from a gateway — handle non-JSON.
- **Baseline 2026-10-15:** 10/10 target queries → `absent`; brand-name control query → `cited`
  at rank 1 (proves the matcher works). See KNOWN_ISSUES ISSUE-014/015.

## Confirmed business facts
- Legal/display name is exactly **"Straight Flush Plumbing & Leak Detection"** (owner-confirmed).
  `SF_NAMES` matches `straight flush plumbing` / `straightflushplumbing`. The bare phrase
  "straight flush" is deliberately NOT matched (poker hand; "Straight Flush Rooter of Ohio").
- NAP: `(949) 374-6524` / `+19493746524`; `78 Cameray Heights, Laguna Niguel, CA 92677`.
- **Stale/competing properties** (found via Tavily brand query, not previously in the repo):
  `straightflushplumb8.wixsite.com` (Wix) and `straight-flush-plumbing-7fb7cf71.base44.app`.
  **Owner-confirmed as owned** 2026-10-15 — see the entity consolidation section below.

## Entity consolidation — owned duplicate properties (2026-10-15)
- **Owner-confirmed owned hosts** (registry lives in `scripts/entity_consistency_check.py`
  as `DUPLICATE_HOSTS`): `straight-flush-plumbing-7fb7cf71.base44.app`,
  `straightflushplumb8.wixsite.com`, `flush-pro-flow.base44.app`.
- `straight-flush-plumbing-7fb7cf71.base44.app` is a **live indexable duplicate** —
  48 URLs in its sitemap, `index, follow`, self-canonical, `Allow: /`, zero links
  to the real site. Its JSON-LD declares the business `@id` as
  `https://flush-pro-flow.base44.app/#business` (that host 404s) — a dangling
  entity reference. Full detail: `growth-engine/ENTITY_CONSOLIDATION_PLAN.md`.
- `straightflushplumb8.wixsite.com` is already 404 + noindex on all paths tried.
- Regression check: `python3 scripts/entity_consistency_check.py --run` → **exit 1
  while any duplicate is indexable**, exit 0 when clean. History:
  `growth-engine/data/entity_consistency_history.jsonl`.
- **NEVER add `sameAs` links from the real site to the duplicates.** `sameAs`
  asserts "this is also me" and would *strengthen* the stale association.
  Consolidation here = removal, not linkage.
- Unverified claims on the duplicate, must not be republished without evidence:
  "24/7 emergency service", "premier", "same-day slab leak detection".
- Changing those external properties is **Level 3 / owner-only**. Agents report,
  never touch.

## Secrets handling
- Never write a key into a repo file, report, or commit. `.mcp.json` uses `${TAVILY_API_KEY}`
  interpolation, never a literal. Keys live only in the user's own environment / OpenHands secrets.
- If a user pastes a key into chat, tell them to **rotate it** — the transcript is logged.

## Conventions that matter
- Never commit to `main`; branch + PR only. Never merge own PR.
- Research/report branches: `intelligence-hq/daily-<date>`; site-change branches: `intelligence-hq/site-<date>-<slug>`.
- Knowledge persistence: append to `data/*.jsonl`, add dated report files, never delete history.
- Tests: `python3 growth-engine/tests/validate_knowledge_base.py` (must pass), `bash growth-engine/tests/crawler_access_check.sh`, `python3 scripts/seo_audit.py`.
- ISSUE-001 (Cloudflare under-attack mode blocking crawlers) was resolved 2026-10-11; `crawler_access_check.sh` is the regression test.
- The workspace sandbox starts with an EMPTY git repo for this project. Restore it with
  `git remote add origin ... && git fetch origin main && git checkout -B main origin/main`.
  If `.openhands/` (your memory dir) collides with the repo's committed `.openhands/`, move it
  aside first (`mv .openhands /tmp/notes`) or the checkout aborts.
