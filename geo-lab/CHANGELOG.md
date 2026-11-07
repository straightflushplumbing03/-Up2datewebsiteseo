# CHANGELOG

## 2026-11-06 — Oracle deployment path

### Fixed
- **The crawler silently analysed the wrong directory on a standalone deploy.**
  `REPO_ROOT` is `process.cwd()/..`, so a lab deployed outside the website's
  repository walked *its own parent directory* and scored whatever it found.
  Observed from an isolated copy: **51 pages, entity consistency 0%, 0
  competitors, 283 issues** — versus 153 / 100% / 289 / 0 in the real
  repository. It now reads `GEO_LAB_SITE_DIR` (default: `REPO_ROOT`, which is
  correct inside this repository) and `crawlRepo()` throws a message naming that
  variable rather than reporting nonsense.
- **`sitemapUrls()` and three other site lookups used `REPO_ROOT`** where they
  meant the site directory, so a relocated checkout would have found no
  sitemap, mis-resolved extensionless URLs, and reported false broken links.

### Added
- **`deploy/oracle/bootstrap.sh`** — idempotent install for an Oracle Cloud
  Always Free VM: timezone, Node 22, full-repository clone, build, and two
  systemd units (`geo-lab.service` for the dashboard, `geo-lab-daily.timer` for
  the 06:00 local run with `Persistent=true`). Takes no secrets as arguments.
- **`deploy/oracle/README.md`** — the console walkthrough: instance creation,
  Arm vs AMD shape, the idle-reclaim rule, SSH tunnel access, first sign-in,
  backups.
- **Test** (38 total): `crawlRepo()` must refuse a site directory with no
  `index.html`. Negative-tested by deleting the guard and observing the failure.

## 2026-11-06 — headless operation, free-hosting guidance, distribution guards

### Fixed
- **Three `package.json` scripts pointed at files that did not exist.**
  `npm run job`, `npm run migrate` and `npm run refresh` referenced
  `scripts/job.ts`, `scripts/migrate.ts` and `scripts/refresh.ts`; only
  `seed.ts` was present, so all three crashed with `ERR_MODULE_NOT_FOUND`.
  Added `scripts/run.ts` (the headless daily run — same orchestrator as the
  HTTP route, no server needed), `scripts/migrate.ts` and `scripts/refresh.ts`.
- **`.gitignore` did not exclude the database sidecars.** The rule was
  `data/*.db`, which misses the `-wal`/`-shm`/`-journal` files SQLite writes in
  WAL mode. Those can contain committed pages, including the owner's scrypt
  password hash and session tokens. Now excluded explicitly.

### Added
- **Distribution-safety tests** (3), each verified to fail when the bug it
  guards is reintroduced: every declared npm script resolves to a real file;
  the database and all sidecars are gitignored; the live database is not tracked
  by git.
- **Headless operation** documented in `README.md` — `npm run job`,
  `npm run refresh`, `npm run migrate`.
- **Free-hosting analysis** in `DEPLOYMENT.md`, quoting each provider's own
  docs: Oracle Always Free and GCP e2-micro fit (real VM + persistent disk);
  GitHub Actions is the simplest zero-cost route because the daily job needs no
  server; Fly.io is ~$5/mo, not free; Render's free web service and its free
  Postgres do not fit; Vercel/Cloudflare Workers have no persistent filesystem.

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
