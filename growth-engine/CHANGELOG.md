# Growth Engine Changelog

Reverse-chronological. Documents creation and updates to the growth-engine
knowledge base so changes are auditable and reversible.

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
