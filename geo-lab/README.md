# Straight Flush GEO Intelligence Lab

An autonomous Generative Engine Optimization (GEO) and AI-search intelligence
system for **Straight Flush Plumbing & Leak Detection** (Laguna Niguel, CA).

It is not a dashboard. It crawls the live website, scores every content section
across five GEO layers, runs real AI/search visibility tests, tracks competitors,
enforces an entity knowledge base, records experiments, generates evidence-based
opportunities, publishes routine improvements through pull requests, and reports
what it measured — including what it could not measure.

> **Sibling, not replacement.** This app lives in `geo-lab/` and is completely
> separate from the public plumbing website at the repository root. It reads the
> site's committed `.html` files but never writes to them directly: all changes
> go through the publishing engine, which opens a pull request.

## Quick start

```bash
cd geo-lab
npm install
npm run seed      # schema, owner account, query library, integrations, first crawl
npm run dev       # http://localhost:12000
```

The owner account and its generated password are written to
`geo-lab/data/owner-credentials.txt` (gitignored). **Sign in, change the password
in Settings, then delete that file.**

Run the gates:

```bash
npm test          # 32 tests, real SQLite + real site crawl, no mocks
npm run build     # production build
npx tsc --noEmit  # typecheck
```

## What actually works today

Everything below was executed in this environment and is backed by stored rows.

| Capability | Status | Evidence |
|---|---|---|
| Crawl the real site | **Working** | 153 pages, 94 indexable, 1270 sections scored, 1900 stored |
| Five-layer section scoring | **Working** | `geo_scores` + `sections` tables |
| Technical audit | **Working** | 0 issues, 0 broken internal links, sitemap invariant holds |
| Entity consistency | **Working** | 100% of 27 fields (NAP + areaServed vs knowledge base) |
| AI/search visibility tests | **Working (1 of 9 platforms)** | Tavily conventional-search proxy; 8 platforms documented as unreachable |
| Competitor intelligence | **Working** | 296 competitor domains tracked from 5894 observations |
| Experiments | **Working** | 6 canonical experiments with baselines |
| Optimization engine | **Working** | 31 evidence-based opportunities, deduplicated |
| Autonomous publishing | **Working** | Policy-enforced validation + PR, never pushes to `main` |
| Reports | **Working** | Daily / weekly / monthly, persisted |
| Background scheduling | **Working** | External scheduler calls `POST /api/run` (see AUTONOMOUS_OPERATIONS.md) |
| GSC / GA4 / GBP / Bing | **Not connected** | No credentials here — reported as UNVERIFIED, never as zero |

## The five GEO layers

1. **Retrieval Probability** — is this section a candidate for retrieval?
2. **Extractability** — can a machine parse and summarise it cleanly?
3. **Entity Reinforcement** — does it strengthen the business entity?
4. **Structural Authority** — is there real supporting evidence?
5. **System Memory Readiness** — will platforms represent the business accurately?

Every section gets five scores (0–100) and an overall score. See
[GEO_METHODOLOGY.md](./GEO_METHODOLOGY.md).

## Navigation

Command Center · AI Visibility · GEO Console · Website Intelligence · Competitor
Intelligence · Entity Intelligence · GEO Experiment Lab · Optimization Engine ·
Autonomous Agents · Research Library · Publishing History · Reports ·
Integrations · Settings.

## Documentation

| Document | Contents |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, modules, data flow, why each choice |
| [DATABASE.md](./DATABASE.md) | Every table and column |
| [GEO_METHODOLOGY.md](./GEO_METHODOLOGY.md) | Scoring, factors, weights, calibration, limits |
| [API_INTEGRATIONS.md](./API_INTEGRATIONS.md) | Each provider, status, and how to connect it |
| [AUTONOMOUS_OPERATIONS.md](./AUTONOMOUS_OPERATIONS.md) | Schedule, orchestrator, publishing policy, rollback |
| [SECURITY.md](./SECURITY.md) | Auth, secrets, RBAC, audit |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Hosting, env vars, first deploy |
| [CHANGELOG.md](./CHANGELOG.md) | History of changes |
| [AGENTS.md](./AGENTS.md) | Instructions for any agent working in this repo |

## Honest limits

- Only **one** visibility provider is reachable from this environment (Tavily).
  The other eight platforms are recorded as `not_testable` with the exact reason.
  An unreachable platform is **not** evidence of invisibility.
- The five GEO scores are **internal diagnostic heuristics**. They are not
  platform scores and not measured probabilities of citation.
- No GSC/GA4/GBP/Bing credentials exist here, so search-performance and
  local-pack visibility are **UNMEASURED**.
- A single website change is never claimed to have caused a visibility change.
  See the experiment methodology.
