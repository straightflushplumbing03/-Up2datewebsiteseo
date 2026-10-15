# Growth Engine Changelog

Reverse-chronological. Documents creation and updates to the growth-engine
knowledge base so changes are auditable and reversible.

## 2026-10-15 — ISSUE-009 root cause corrected: runs die at the ceiling, not for lack of a sandbox

**Correction.** The earlier diagnosis on this branch read the platform error
`environment_unavailable` / "Timed out: Sandbox not available" as a transient
sandbox-provisioning failure and proposed a retry. That was wrong. Four failed runs
(all at the enforced ceiling, `started_at → timeout_at` ≈ 1920 s) show the error is a
**symptom of running out of clock**: the platform kills the run, tears down the
sandbox, and its post-run verification then reports no sandbox. The discriminator is
**elapsed time**, not the error string.

- Real fix (already on `main`, commit `897e7be`): `scripts/daily_measure.py`
  deterministic pre-stage (~5 s) + a prompt budgeted around the real ~1920 s ceiling.
  A dispatched run completed in **947 s**.
- `tests/classify_automation_run.py` now keys on elapsed time vs. the ceiling:
  `budget_overrun` (do NOT retry) vs. `sandbox` (retry once). Fixtures include the
  real `67e154d9` (no sandbox_id, 1926 s) as the case a naive rule gets wrong.
- The retry watchdog is now a narrow safety net: it re-dispatches only on a *fast*
  failure that never reached the ceiling.

**Updated:** `KNOWN_ISSUES.md` (ISSUE-009 root cause corrected), `automations/README.md`
(reliability section), `reports/daily/2026-10-13-incident-sandbox-failure.md`.

## 2026-10-15 — Entity consolidation: owned duplicates found and scoped

**Owner confirmation:** the Wix account and the base44 URL(s) are **owned** by
Straight Flush Plumbing & Leak Detection. ISSUE-014 moved from "blocked on
ownership" to "actionable".

**Added:**
- `growth-engine/ENTITY_CONSOLIDATION_PLAN.md` — verified findings, the four-host
  entity map, and the ordered remediation plan.
- `scripts/entity_consistency_check.py` — regression check for owned duplicates.
  Classifies each known host `canonical` / `live_duplicate` / `gone` / `noindex` /
  `unknown`; exits 1 while a live duplicate serves indexable content.
- `growth-engine/tests/test_entity_consistency_check.py` — 25 tests, no network.
- `growth-engine/data/entity_consistency_history.jsonl` — run history.

**Key findings (all verified live 2026-10-15):**
- `straight-flush-plumbing-7fb7cf71.base44.app` is a **live, indexable duplicate**:
  HTTP 200, `<meta robots>` `index, follow`, self-referencing canonical, `Allow: /`,
  and **48 URLs in its own sitemap** — mirroring the real site's services, adding
  18 city pages and **5 blog posts on the same keywords**. Zero links to the real
  site. Leftover template pages `/million-dollar-bet` and `/analytics` are still
  live and sitemapped.
- Its JSON-LD declares a **third domain** as the business identity —
  `@id: https://flush-pro-flow.base44.app/#business` — which currently returns
  **404**. A dangling entity reference.
- The Wix property `straightflushplumb8.wixsite.com` is already **404 + noindex**
  on every path tried. Cleanup only.
- Unverified claims on the duplicate that must not be republished: "24/7",
  "premier", "same-day".

**Wired into automation:** `morning-ai-search-visibility.prompt.md` step 1b runs
the entity check and reports; it explicitly may **not** change an external
property (Level 3, owner-only).

**Updated:** `KNOWN_ISSUES.md` (ISSUE-014 rewritten with the verified table),
`INTEGRATION_STATUS.md`.

**Not changed:** no website page, schema, title, description, or copy. No external
property touched. Steps 1–3 of the plan need owner go-ahead.

## 2026-10-15 — Tavily Search integration + first real visibility baseline

**Added:**
- `growth-engine/tavily_search.py` — Tavily Search client
  (`POST https://api.tavily.com/search`) over **stdlib `urllib` only** (no new
  dependency). Bearer auth, `Retry-After`-aware retries, and the repo's shared
  error taxonomy.
- `scripts/tavily_search.py` — CLI: `--smoke`, `--run`, `--append`, `--dry-run`.
- `growth-engine/tests/test_tavily_search.py` — 41 stdlib `unittest` tests; no
  network and no key required.
- `growth-engine/data/ai_visibility_history.jsonl` — **+10 rows** (186 → 196):
  the first reproducible conventional-search baseline.

**Why:** Brave rate-limited our egress IP with HTTP 429 after ~7-8 queries and
DuckDuckGo HTML intermittently returned 202 — both repeatedly cost the daily run
its research step. Tavily returns structured JSON from a documented API.

**Honesty properties enforced in code and tests:**
- Recorded as `test_type: conventional_proxy`, never as an AI-platform result.
- `include_answer` defaults to **off**: Tavily's synthesised answer is Tavily's
  own summarisation, not a consumer assistant's recommendation.
- `classify_visibility` can return only `cited` / `absent` / `inconclusive` —
  never `recommended`. A ranked list does not recommend.
- A failed call is `inconclusive`, never `absent`.

**Findings (recorded as ISSUE-014, ISSUE-015 — both OPEN, no change applied):**
- 10/10 customer-intent queries returned **zero** `straightflushplumbingoc.com`
  results (10/10 HTTP 200, no errors).
- A brand-name control query **did** return the real domain at rank 1, validating
  the matcher and proving the absence is genuine.
- That control query also surfaced **stale/competing** Straight Flush properties:
  `straightflushplumb8.wixsite.com` (Wix) and
  `straight-flush-plumbing-7fb7cf71.base44.app` (base44.app). Not previously
  recorded anywhere in the repo. Owner decision required (Level 3).

**Updated:** `AI_VISIBILITY_METHODOLOGY.md` (Tavily is now the primary
conventional proxy; Brave marked superseded), `INTEGRATION_STATUS.md`,
`KNOWN_ISSUES.md`, `PYTHON_DEPENDENCIES.md`.

**Not changed:** no website page, schema, title, description, or copy.

## 2026-10-15 — Perplexity Agent API integration (web-grounded AI visibility)

**Added:**
- `growth-engine/ai_agent_client.py` — Perplexity **Agent API** client
  (`POST https://api.perplexity.ai/v1/agent`) via the official SDK
  (`from perplexity import Perplexity`). Normalises the response to
  `output_text` + `search_results` sources + `output_text` annotations, maps
  SDK errors onto the repo's existing taxonomy (`authentication_failed`,
  `rate_limited`, `bad_request`, `server_error`, `connection_error`, `timeout`,
  `unknown_error`), honours `Retry-After`, and classifies visibility using the
  methodology's categories.
- `scripts/perplexity_agent.py` — CLI: `--smoke` (one query, key-safe shape
  summary), `--run` (curated 10-query suite from `KEYWORD_UNIVERSE.md`),
  `--append` (write evidence rows), `--dry-run` (no network).
- `growth-engine/tests/test_perplexity_agent.py` — 45 stdlib `unittest` tests;
  no network and no API key required.
- `requirements.txt` — the repo's first dependency file (`perplexityai>=0.43.8`).
- `growth-engine/PYTHON_DEPENDENCIES.md` — dependency + environment-variable notes.

**Updated:**
- `AI_VISIBILITY_METHODOLOGY.md` — Perplexity row now records the Agent API as
  the access method (code ready, key pending) instead of "JS app, not testable".
- `INTEGRATION_STATUS.md` — Perplexity moved from "not testable" to
  "code ready, key not set".

**Honesty properties enforced in code and tests:**
- A failed call is recorded `inconclusive`, never `absent` and never 0%.
- `incorrect` is never auto-assigned (it requires human judgement).
- The bare phrase "straight flush" is not treated as a brand match, so a
  namesake business is neither credited nor penalised.
- The API key is never printed, logged, or stored in any record.

**Not changed:** no website page, schema, title, description, or copy. No
`ai_visibility_history.jsonl` rows were written (the key is not yet configured).

## 2026-10-15 — Owner-requested local SEO audit + tooling fixes

**Added:**
- `reports/audit/2026-10-15-local-seo-audit.md` — full technical + local-SEO
  audit (10 required sections; confirmed issues vs. unverified concerns).

**Updated:**
- `scripts/refresh_sitemap.py` — fixed directory-hub URL handling (keeps `academy/`,
  `services/`, `case-studies/`, `insurance/` instead of `…/index.html`), made
  `<lastmod>` derive from the file's last git commit date, added `rel_of()`.
- `sitemap.xml` — refreshed `<lastmod>` to real last-change dates (git); no URLs
  added or removed.
- `growth-engine/tests/validate_knowledge_base.py` — added a
  sitemap-consistency check.
- `KNOWN_ISSUES.md` (ISSUE-010..013), `INTEGRATION_STATUS.md`,
  `data/technical_health_history.jsonl`.

**Not changed:** no website page, schema, title, description, or copy.

## 2026-10-12 — Intelligence HQ setup (infrastructure + first run)

**Added:**
- `INDUSTRY_WATCH.md` — dated industry / official-guidance / diagnostic-technology watch.
- `INNOVATION_IDEAS.md` — idea register (≥5 new/day, evidence-scored, rejected ideas kept).
- `reports/weekly/TEMPLATE.md` — weekly strategic review template (Mondays).
- `reports/weekly/` and `reports/monthly/` directories.
- `automations/intelligence-hq-daily.prompt.md` and
  `automations/intelligence-hq-weekly.prompt.md` — canonical prompts for the
  **SFPL Intelligence HQ** automations.
- `reports/daily/2026-10-12.md` — first daily report from the Intelligence HQ run.

**Updated:** `README.md` (read order + file table), `automations/README.md`
(HQ-D/HQ-W registered), `KNOWN_ISSUES.md` (ISSUE-005 consolidation, ISSUE-006
run-budget), `INTEGRATION_STATUS.md` (this run's verification), `data/*.jsonl`
(append-only).

**Automations:** created `SFPL Intelligence HQ Daily 6 AM` (`0 6 * * *`,
America/Los_Angeles, id `5dc89b41-6880-40e6-950c-14a635f7bd62`) and
`SFPL Intelligence HQ Weekly Review` (`0 6 * * 1`, America/Los_Angeles, id
`0582d219-de15-42c2-83b5-4bc92995edce`) via the OpenHands Cloud automation API.
Automation A (superseded by HQ-D) disabled to prevent overlapping 06:00 runs.

**Run-budget fix (ISSUE-006):** the first manual dispatch
(`897c5d5a-6143-4133-a0e4-8501d62f0206`) **FAILED** with
`Timed out: command timed out or was killed` at the 1800 s (30 min) platform
ceiling — the agent spent the whole budget on open-ended research (testing Yahoo,
Bing RSS, Marginalia, headless Chromium, Google SERP pacing, blog crawls) and
never reached the write/commit step. Fix: the daily prompt now has a **mandatory
time budget** (40% research / 60% write+commit), restricts search to Brave (+ at
most one alternate), forbids headless browsers and multi-engine probing, and
instructs the agent to stop researching and commit when near budget. Note the
platform caps `timeout` at **1800 s** — a longer timeout is not available.
## 2026-10-12 — Daily run (HQ-D: 36-query sweep + industry/innovation files)

**Added:** `reports/daily/2026-10-12.md`, `INDUSTRY_WATCH.md` (dated, cited
industry + Google Search Central entries), `INNOVATION_IDEAS.md` (6 new
prioritized ideas).

**Updated:** `COMPETITOR_DIRECTORY.md` (36-query sweep: Tier A/B frequency,
14 new repeat competitors, aggregator dominance; counts recomputed from raw
results), `INTEGRATION_STATUS.md` (2026-10-12 verification). Appended observations
to `data/ai_visibility_history.jsonl` (36 rows), `data/competitor_observations.jsonl`
(35 rows), `data/technical_health_history.jsonl` (3 rows). Prepend to
`briefs/strategy-log.md`.

**Key findings:** ISSUE-001 remains **resolved** — all crawler UAs return 200.
Straight Flush absent from all 36 conventional-proxy (DuckDuckGo Lite) queries
(0/36). Provider rotated Brave → DuckDuckGo Lite (Brave now HTTP 429). AI answer
engines still unverified (no credentials). Repipe queries are specialist-dominated;
aggregators (yelp 32/36) dominate local discovery.

**Not changed:** no website pages, schema, or copy modified — read-only research +
additive documentation.

## 2026-10-11 — Daily run (visibility sweep + competitor refresh)

**Added:** `reports/daily/2026-10-11.md`.

**Updated:** `COMPETITOR_DIRECTORY.md` (28-query sweep: Tier A/B frequency,
6 new repeat competitors, aggregator dominance). Appended observations to
`data/ai_visibility_history.jsonl` (28 rows), `data/competitor_observations.jsonl`
(34 rows), `data/technical_health_history.jsonl` (crawler check = PASS). Prepend
to `briefs/strategy-log.md`.

**Key findings:** ISSUE-001 (Cloudflare crawler block) **confirmed resolved** —
all crawler UAs return 200. Straight Flush absent from all 28 conventional-proxy
queries (0/28). AI answer engines still unverified (no credentials).

**Not changed:** no website pages, schema, or copy modified — read-only research +
additive documentation.

## 2026-10-09 — Initial growth-engine baseline (OpenHands master automation)

**Added** (all under `growth-engine/`):
- `BUSINESS_PROFILE.md`, `SERVICE_CATALOG.md`, `SERVICE_AREAS.md`,
  `APPROVED_CLAIMS.md`, `BRAND_VOICE.md`, `COMPETITOR_DIRECTORY.md`,
  `KEYWORD_UNIVERSE.md`, `AI_VISIBILITY_METHODOLOGY.md`, `INTEGRATION_STATUS.md`,
  `KNOWN_ISSUES.md`, `EXPERIMENT_LOG.md`, `CHANGELOG.md`.
- `data/`: `ai_visibility_history.jsonl`, `competitor_observations.jsonl`,
  `technical_health_history.jsonl`, `content_experiments.jsonl`, `BASELINE_METRICS.json`.
- `reports/baseline/2026-10-09-baseline.md`, `reports/daily/` (template).
- `proposals/` (owner-approval items).

**Key findings:** Cloudflare 403 to all crawlers persists (ISSUE-001); Straight
Flush absent from all 5 tested conventional queries; Sterling competitor set
identified (Scott English, Efficient, Barker and Sons, Roto-Rooter, etc.).

**Not changed:** no website pages, schema, or copy were modified in this run.
This run is **read-only + additive documentation** only.
