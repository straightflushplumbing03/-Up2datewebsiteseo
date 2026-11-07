# AGENTS.md — GEO Intelligence Lab

Instructions for any agent (human or AI) working inside `geo-lab/`. The
repository-root `AGENTS.md` governs the public website; this file governs the
lab. Read both when a change spans them.

## What this is

An autonomous GEO / AI-search intelligence system for Straight Flush Plumbing &
Leak Detection. It crawls the site, scores sections, runs visibility tests,
tracks competitors, enforces an entity knowledge base, runs experiments,
generates evidence-based opportunities, publishes routine improvements by pull
request, and reports honestly.

## Non-negotiable rules

1. **Never fabricate data.** No invented metrics, listings, reviews, credentials,
   citations or competitor results. If something was not measured, it is
   `inconclusive` / UNMEASURED, never zero.
2. **Never conflate measurement types.** `ai_platform`, `conventional_proxy` and
   `manual` are never mixed in one figure. Mention ≠ recommendation ≠ citation.
3. **Never change locked business facts** without explicit owner authorisation:
   identity, NAP, pricing, discounts, warranties, guarantees, licensing,
   certifications, testimonials, reviews, project results, services not offered,
   legal policies. `detectLockedFactChange()` enforces this mechanically.
4. **Never push to `main` and never merge a PR.** Publishing opens a PR.
5. **Never write to the website's `.html` files directly.** All changes go
   through `engine/publishing.ts`, which snapshots, validates and opens a PR.
6. **Never run the root `scripts/gen_*.py` generators** — see the root
   `AGENTS.md`. They silently revert production SEO.
7. **No secrets in code, reports, commits or logs.** Read credentials from the
   environment only. If a credential leaks into chat, tell the user to rotate it.
8. **Do not build fake UI.** Every button must do real work; every metric must
   read from a stored row and show its source and date.

## Where things live

| Path | Contents |
|---|---|
| `src/lib/company.ts` | Locked business facts + claim policy — the source of truth |
| `src/lib/db.ts` | Schema (idempotent) + query helpers + audit/activity |
| `src/lib/engine/geo.ts` | The five-layer scoring engine |
| `src/lib/engine/site.ts` | Crawler + technical audit |
| `src/lib/engine/publishing.ts` | Change generation, validation, PR, rollback |
| `src/lib/agents/orchestrator.ts` | The daily operation |
| `tests/run.ts` | The test suite |
| `data/` | SQLite + snapshots (gitignored) |

## Before you change anything

```bash
cd geo-lab
npm test          # 32 tests, real DB + real crawl
npx tsc --noEmit
npm run build
```

All three must pass. The tests are the contract: they encode the regressions that
have already happened (the FK guard, phone normalisation, script-stripping,
opportunity de-duplication) and the policies that must never break (locked facts,
injected scripts).

If you change the schema in `db.ts`, add a test that exercises the new column.
If you add a scoring factor, document it in `GEO_METHODOLOGY.md`. If you add an
integration, document it in `API_INTEGRATIONS.md` with its real status.

## When a check fails

Fix the code, not the test — unless the test's expectation is genuinely wrong,
in which case say why in the commit message. A test that cannot fail is worse
than no test.

## Reporting style

State what was measured, what was not, and why. Distinguish observed facts from
hypotheses. Never claim a website change caused a visibility change without
controls.

## Project memory

Durable knowledge for this repository lives in `.openhands/memory/` at the
repository root. Record root causes, environment quirks and decisions there —
not trivially re-discoverable facts.
