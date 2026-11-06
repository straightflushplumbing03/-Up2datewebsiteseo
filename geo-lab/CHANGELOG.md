# CHANGELOG

## 2026-11-06 — Phase 11 (quality assurance) and documentation

### Fixed
- **Optimization engine double-counted existing opportunities.**
  `createOpportunity()` returned the id of an existing row for a duplicate
  dedupe key, so `deriveOpportunities()` counted already-known work as newly
  created. The daily report and activity log therefore overstated how much new
  work the run produced. It now returns `null` for a duplicate and only a
  genuine insert yields an id.
- **`research.ts` insert typing.** `seedResearchNotes()` passed a typed
  `ResearchNote` straight to `insert()`, which expects `Record<string, unknown>`
  — a typecheck error. Spread into a plain object.
- **Login brute-force protection was missing.** Added a per-email lockout
  (8 failures in 15 minutes) that persists in `schema_meta`, is cleared by a
  successful login, is audited, and returns HTTP 429 with `Retry-After`.
- **Research Library showed a meaningless "Platforms observed" figure.** It
  counted distinct query families under a platform label. Replaced with
  "Highest-priority queries".

### Added
- `tests/run.ts` — 32 integration tests against real modules and a real
  (temporary) SQLite database, no mocks. Covers the schema, the FK guard,
  authentication and lockout, the company knowledge base and claim policy, the
  query library, HTML parsing, all five GEO layers, the crawler and sitemap
  invariant, entity consistency, visibility classification and metrics, the
  publishing validation gates, experiments, reporting, the cost model, the
  optimization engine and the integration registry.
- `.github/workflows/geo-lab.yml` — typecheck, test and build on every PR
  touching `geo-lab/**`.
- `.github/workflows/geo-lab-daily.yml` — the persistent scheduler: `0 6 * * *`
  pinned to the `America/Los_Angeles` IANA timezone, daily, with a safe no-op
  when the lab is not deployed yet.
- Documentation: `README.md`, `ARCHITECTURE.md`, `DATABASE.md`,
  `GEO_METHODOLOGY.md`, `API_INTEGRATIONS.md`, `AUTONOMOUS_OPERATIONS.md`,
  `SECURITY.md`, `DEPLOYMENT.md`, `AGENTS.md`, `CHANGELOG.md`.
- `.env.example` documenting every environment variable.
- `stripNonContent()` extracted from `parseDocument()` so script/style stripping
  is independently testable.

### Changed
- `.gitignore` now also excludes `data/owner-credentials.txt`,
  `data/snapshots/` and `data/manual/`.

## Earlier (Phases 1–10, pre-changelog)

Recorded here for completeness; these predate this file.

- **Phases 1–2** — discovery of the repository, website, hosting and available
  credentials; architecture, schema, agent and integration design.
- **Phase 3** — application shell, navigation, authentication, database, core
  dashboard, settings, logging.
- **Phase 4** — the five-layer GEO engine and section-level scoring.
- **Phase 5** — the standardized query library (305 queries), the testing
  framework, result storage and visibility metrics.
- **Phase 6** — the crawler, technical audit, section parser, schema analyzer and
  content diagnostics.
- **Phase 7** — competitor and entity intelligence, geographic coverage.
- **Phase 8** — the experiment lab with baselines and measurement.
- **Phase 9** — the ten-agent team, orchestrator, scheduling and persistent
  memory.
- **Phase 10** — autonomous publishing: GitHub integration, change generation,
  validation, deployment records and rollback.
