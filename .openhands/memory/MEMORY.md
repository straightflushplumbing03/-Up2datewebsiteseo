# Project Memory — Straight Flush Plumbing Intelligence HQ

## Repository identity (verified 2026-10-12)
- **Production repo:** `straightflushplumbing03/-Up2datewebsiteseo` (public, default branch `main`).
  - NOT a TypeScript project despite `.agents/skills/-Up2datewebsiteseo/SKILL.md` claiming so — that skill was auto-generated and is wrong. The site is **static HTML/CSS/JS, no build step**.
  - Deploy: **GitHub Pages** legacy build from `main` `/`, custom domain via `CNAME` = `straightflushplumbingoc.com`, fronted by Cloudflare. Repo also has `has_pages: true`.
  - The workspace clone lives at `/workspace/project/-Up2datewebsiteseo` (same name as repo).
- Other same-owner repos (`Uptodatestraightflushwebsite`, `WebsiteMasterFile`, `Up2dateseowebsite`, etc.) are **not** production; do not deploy there.

## Intelligence system
- Pre-existing `growth-engine/` knowledge base (created 2026-10-09). Read order is in `growth-engine/README.md`.
- Intelligence HQ live automations (verified 2026-10-15). The ids below are current; the earlier generation (`5dc89b41`, `0582d219`, `4c5213f7`) now returns **404** - do not trust ids from older notes.
  - **`SFPL AI Headquarters Daily`** - id `1485d659-8663-4776-a507-db0fefed8483`, `0 6 * * *`, America/Los_Angeles, timeout 1800. The one content job. Prompt source: `ai-headquarters-blueprint/01-MASTER-AGENT-PROMPT.md`.
  - **`SFPL AI Headquarters Daily Retry Watchdog`** - id `b946624c-79c2-40a6-be1b-258388a15fb4`, `30 6,9,12,15,18 * * *`, America/Los_Angeles, timeout 600. Re-dispatches the daily job once on a sandbox-unavailable failure; does no SEO work itself.
  - Disabled / rollback points: `e6684830-a9a5-43d8-9d5a-34fed5257bbf` (superseded daily), `df4bcd68-75f3-46f4-ab6f-a4027e5bf8a9` (empty prompt, never succeeded).
  - Invariant: exactly **one** enabled content automation. Two jobs on `0 6 * * *` race on the same branch names.
  - Canonical prompts: `growth-engine/automations/intelligence-hq-{daily,weekly}.prompt.md` and `ai-headquarters-blueprint/01-MASTER-AGENT-PROMPT.md` (keep in sync with live definitions).

## OpenHands automation API gotchas (learned)
- Host: `https://app.all-hands.dev`, auth `Authorization: Bearer $OPENHANDS_API_KEY`.
- `GET /api/automation/v1?limit=N` returns `{"automations":[...], "total":N}`.
- `GET /api/automation/v1/{id}/runs` returns `{"runs":[...]}`.
- Create via `POST /api/automation/v1/preset/prompt` with `{name, prompt, trigger:{type:cron,schedule,timezone}, repos:[...], timeout}` → HTTP 201.
- PATCH `{enabled:false}` disables (returns `state: INACTIVE`).
- Timezone is honored and echoed back in `trigger.timezone`.
- **`timeout` is hard-capped at 1800 s** (30 min) — 3600 → HTTP 422. Do not try to raise it; control run length via the prompt instead.
- **The ENFORCED ceiling is start + ~1920 s (32 min), not the configured 1800 s.** Measured as `timeout_at - started_at` on three runs: 1923 s, 1954 s, 1922 s. A run configured at `timeout: 1800` gets ~32 minutes of wall clock. Budget against ~30 minutes of usable time.
- **`PATCH /api/automation/v1/{id}` DOES accept `prompt`** (verified 2026-10-15: `{name,prompt,trigger,timeout}` → HTTP 200, new prompt length returned, `preset_metadata.preset_type` still `"prompt"`). The endpoint table lists only `name, trigger, enabled, timeout`, which is misleading. Update a live preset in place; no need to create a replacement job.
- `GET /api/automation/v1/{id}/runs` returns `{"runs":[...]}`; the automation *list* uses key `automations` (not `items`).
- **`next_run_at` is NOT returned** by this API version. Prove scheduling with `enabled` + `trigger` + `last_triggered_at`.
- The repo connection lives in `preset_metadata.repos` (a list of `{url:...}`).
- **Secrets are injected only into a command whose TEXT names the key.** A bare `python3 scripts/daily_measure.py` sees no `Tavily_api_key` even when one is registered, and reports a false BLOCKED. Name the secret in the command — e.g. `export Tavily_api_key="${Tavily_api_key}" && python3 ...` — to trigger injection. Same trap for `Perplexity_api_key`. This is a platform property, not a client bug.
- Secrets are **case-sensitive to how the user typed them**: `Tavily_api_key`, `Perplexity_api_key`, not the uppercase convention.

## Run-budget rule for these automations (ISSUE-006)
An agent-driven research run will happily consume the whole budget exploring and
never persist. **The expensive part is not measuring, it is deciding how to
measure.** Two runs were killed at ~1950 s; the second produced nothing because
every minute went to discovery:

```
run 2 phases: "Installing dependencies" -> "List data dir and tail jsonl
histories" -> "List PRs via GitHub API" -> "Inspect record schema and wrapper
style"   [killed at 1953 s, no commit, no PR]
```

The fix that worked: `scripts/daily_measure.py`, a deterministic pre-stage that
runs every check (knowledge base, crawler access, entity consistency, sitemap
idempotency, seo_audit) plus the Tavily sweep and writes
`growth-engine/data/daily_context.json`. **Measured 5.3 s** for the non-network
part. The prompt now makes it the first action and tells the agent to read the
context instead of re-deriving facts.

Results after the change: runs completed in **947 s (53%)** and **720 s (40%)**
of the 1800 s cap, both pushing work and opening/updating PRs — versus two
consecutive timeouts before.

Keep the rule: an explicit phase budget, a 22-minute checkpoint that stops
analysis and writes the report, and "report > commit > measurement > new work".

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
