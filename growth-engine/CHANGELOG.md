# Growth Engine Changelog

Reverse-chronological. Documents creation and updates to the growth-engine
knowledge base so changes are auditable and reversible.

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
