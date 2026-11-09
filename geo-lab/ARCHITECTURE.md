# Architecture

## Stack and why

| Choice | Reason |
|---|---|
| **Next.js 16 (App Router) + TypeScript** | Server Components read SQLite and the filesystem directly, so there is no separate API tier to keep in sync. Route handlers provide the write surface. One process to deploy. |
| **node:sqlite (built into Node 22+)** | The lab must run at near-zero cost and must not need a managed database. `node:sqlite` is stdlib — no native build step, no `better-sqlite3` compile in CI. The store is a single file that is trivial to back up. |
| **Tailwind CSS v4** | No runtime CSS, small bundle, and design tokens live in one place (`globals.css`). |
| **Plain `tsx` scripts** | `npm run seed` / `job` run the same modules the app runs — no duplicated logic. |
| **No ORM** | The schema is explicit SQL in `src/lib/db.ts`. Every query is visible and reviewable, which matters for a system that must be auditable. |
| **No chart library** | Trend charts are inline SVG generated from stored rows. Avoids a heavy dependency for a handful of series. |

## Layout

```
geo-lab/
  src/lib/
    company.ts          Locked business facts + claim policy (source of truth)
    db.ts               Schema (idempotent) + query/insert/upsert + audit + activity
    paths.ts            Resolves repo root, site dir, growth-engine data dir
    auth.ts             scrypt passwords, opaque sessions, RBAC
    integrations.ts     Integration registry + real status probing
    reporting.ts        Daily/weekly/monthly report generation + cost model
    schedule.ts         Declarative autonomous schedule
    queries.ts          Read models for pages/entities/notes
    notes.ts            Research-note helpers
    engine/
      html.ts           HTML parser: headings, links, JSON-LD, sections
      geo.ts            Five-layer scoring (the core)
      site.ts           Crawler + technical audit + sitemap invariant
      persist.ts        Write crawl results into the store
      entity.ts         Entity fact checks, owned-host checks, history
      competitor.ts     Competitor map from observed results
      visibility.ts     Query picking, sweep runner, metrics
      providers.ts      AI/search provider adapters + status classifier
      optimize.ts       Opportunity derivation + prioritisation
      experiment.ts     Experiment lifecycle + measurement
      publishing.ts     Autonomous change generation, validation, PR, rollback
      research.ts       Canonical research notes
    agents/
      team.ts           The ten specialist agents (id, duty, boundaries)
      orchestrator.ts   Runs the daily operation, records every step
  src/app/
    (app)/              Authenticated pages (14)
    api/                Route handlers (10)
    login/              Public sign-in
  scripts/seed.ts       Idempotent bootstrap
  tests/run.ts          Real integration tests
```

## Data flow

```
                 ┌──────────────────────┐
   sitemap.xml ──┤  engine/site.ts      │──► pages, page_snapshots
   *.html      ──┤  (crawler + audit)   │──► technical_health_history
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │  engine/geo.ts       │──► sections, geo_scores
                 │  (5-layer scoring)   │
                 └──────────┬───────────┘
                            │
   providers ────┐          │
   (tavily, …)   │          │
                 ▼          ▼
        ┌────────────────────────────┐
        │  agents/orchestrator.ts    │──► agent_runs, activity, audit_log
        │  6 ordered steps, guarded  │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │  engine/optimize.ts        │──► opportunities
        │  engine/publishing.ts      │──► publications (+ snapshots)
        │  reporting.ts              │──► reports
        └────────────────────────────┘
```

## Key design decisions

### The site is read, never written in place
The crawler reads the repository's `.html` files. The only writer is
`engine/publishing.ts`, which (a) snapshots the previous version, (b) runs
validation, (c) writes to a branch, and (d) opens a PR. The agent never pushes
to `main` and never merges. This keeps a human in the loop for every production
change while still letting the system *do* the work.

### Locked facts are a first-class type
`company.ts` exports `LOCKED_FACTS` and `detectLockedFactChange()`. Publishing
validation calls it on every candidate change. Identity, NAP, pricing,
warranties, licensing and certifications can therefore never be altered by an
automated run — a test asserts this.

### Unreachable is not zero
Every measurement path distinguishes:
- `inconclusive` — the platform could not be reached (UNMEASURED)
- `absent` — the platform answered and did not mention the business

They are stored in the same column but never summed together, and the metrics
function asserts a single test type per view. Conflating them would overstate
AI visibility, which is the single most damaging error this system could make.

### One test type per view
`visibility_results.test_type` is one of `ai_platform`, `conventional_proxy`,
`manual`. The UI and reports always state which one produced a number. Tavily is
a conventional-search proxy and is labelled as such everywhere.

### Overlap guard
`isRunInProgress()` checks for an unfinished `agent_runs` row. A second trigger
(a cron firing while a manual run is going) returns 409 rather than running two
crawls and two sweeps concurrently.

### Idempotent writes
`insert()` is a plain insert; `upsert()` takes explicit conflict columns. Tables
that represent "current state" (`pages`, `sections`, `geo_scores`, `entity_facts`)
are keyed so re-running a crawl updates rather than duplicates. Tables that
represent history (`activity`, `audit_log`, `visibility_results`,
`competitor_observations`, `reports`) append. `createOpportunity` returns null
for a duplicate dedupe key so "new opportunities" is never inflated.

## Deployment shape

- The **website** stays on Cloudflare Pages (static).
- The **lab** needs a Node runtime and a persistent disk for the SQLite file, so
  it runs on a Node host (Vercel, Fly, Railway, a small VPS). Cloudflare Pages
  cannot run this: it is static + edge functions with no persistent filesystem
  and no long-lived process.
- The **scheduler** is external (GitHub Actions cron + the existing OpenHands
  daily automation) and calls `POST /api/run` with a bearer token. The lab never
  depends on an open browser or terminal.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the exact steps.
