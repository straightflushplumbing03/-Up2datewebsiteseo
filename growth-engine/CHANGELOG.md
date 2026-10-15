# Growth Engine Changelog

Reverse-chronological. Documents creation and updates to the growth-engine
knowledge base so changes are auditable and reversible.

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

## 2026-10-15 — Technical SEO / AEO audit + fixes (OpenHands master task)

**Added:**
- `growth-engine/reports/baseline/2026-10-15-technical-seo-baseline.md` — pre-change
  baseline (live status codes, headers, robots/sitemap, schema, metadata inventory).
- `scripts/patch_city_meta.py`, `scripts/patch_city_internal_links.py`,
  `scripts/patch_case_study_integrity.py` (idempotent, evidence-gated fixers).
- `scripts/cloudflare_add_security_headers.py` (read-only by default; `--apply`
  gated on owner approval + Cloudflare token).

**Changed (all Level 2, verified):**
- `cities/*.html` — unique per-city title (≤60c) + description (120–160c) derived
  from each page's own content; 7 dead-anchor city chips now link the sibling city
  pages. New ISSUE-008, ISSUE-010.
- `index.html` — removed self-reported `aggregateRating` + `review` from the
  `Plumber` JSON-LD (resolves ISSUE-002).
- `sitemap.xml` — `lastmod` from real git commit dates; `case-studies/` section root
  now listed in canonical form. New ISSUE-009.
- `llms.txt` — ratings line now attributed to the business and flagged for
  confirmation on the live profiles.
- `growth-engine/tests/validate_knowledge_base.py` — added unique title/description,
  dead-fragment, and sitemap-sync invariants (the docstring previously promised a
  broken-link check that was not implemented).
- `growth-engine/KNOWN_ISSUES.md` — ISSUE-002 RESOLVED; added ISSUE-007 (security
  headers, blocked on CF token), ISSUE-008/009/010 (resolved), ISSUE-011
  (automation API returns 0 for this credential — investigate).

**Verification:** `seo_audit.py` (0 broken links, 0 invalid JSON-LD, 0 duplicate
indexable titles), `validate_knowledge_base.py` (133 files OK), crawler check PASS,
sitemap valid XML, 338 JSON-LD blocks parse. Core Web Vitals **unverified** —
PageSpeed Insights API returned HTTP 429 (quota, no key).

**Not changed:** `AGENTS.md`, approved-claims/business facts, the existing
automations, and no production deploy (no merge).

## 2026-10-15 (later) — SEO depth pass (title length + social cards)

**Added:** `scripts/patch_titles.py` (idempotent title shortener; asserts <=60c and
mutual uniqueness before writing).

**Changed (Level 2, verified):**
- **29 indexable pages** had titles of 61-89c → rewritten to <=60c keeping the
  primary keyword and intent; social `og:title`/`twitter:title` mirrors updated
  when they carried the same string. Now 0 indexable titles exceed 60c.
- `service-areas.html`, `academy/annual-plumbing-checkup-checklist.html` — added
  the standard Open Graph + Twitter card block (they were the only 2 indexable
  pages with no social metadata); uses the existing shared `og:image`
  (`assets/img/lance-hero.jpeg`), no new asset.
- `growth-engine/tests/validate_knowledge_base.py` — title <=60c and description
  <=165c guards added (a shorter title silently making two pages collide now
  fails the build).

**Verification:** `validate_knowledge_base.py` OK (133 files); `seo_audit.py`
0 duplicate indexable titles, 0 duplicate descriptions among indexables, 0 broken
links, 0 invalid JSON-LD; 0 indexable titles >60c.

**Reviewed, no change needed:** robots.txt (all crawlers incl. AI allow-listed,
sitemap declared), `404.html` (`noindex` + self-canonical — correct), heading
hierarchy (h2→h4 "skips" are 33 shared footer columns, site-wide by design; no
content-heading skips), click-to-call (all indexable pages have `tel:` links),
empty `alt` attributes (none). Case-study duplicate bodies are the intentional
noindex root stubs (ISSUE-004).

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
