# Daily Report — 2026-10-16 (second run)

Timezone: America/Los_Angeles · Run: Intelligence HQ daily loop · Duration: ~7 min to checkpoint (in budget)

> **Why this file exists.** A run at **02:30Z today** already wrote
> `growth-engine/reports/daily/2026-10-16.md` (retired-Gemini-slug fix + sitemap
> ordering; branch `intelligence-hq/daily-2026-10-16`). This is a deliberate same-day
> supplementary run, matching the precedent of `2026-10-15-second-run.md` and PRs
> #23/#26. The primary report stands; this file records only what this run measured
> and changed, and does not overwrite it.

## Run record

| Field | Value |
|---|---|
| Run date | 2026-10-16 (America/Los_Angeles) |
| Start (UTC) | 2026-10-16T06:25:29Z |
| Completion status | `COMPLETED` |
| Elapsed at report time | ~7 min (~400 s) |
| Approached the ~1920 s ceiling? | No — well inside budget |
| Previous run succeeded? | Yes — 02:30Z run `COMPLETED`, report `2026-10-16.md` committed |
| Killed-run check | No branch `intelligence-hq/daily-2026-10-16` left unmerged; nothing to resume |
| Deterministic pre-stage | `python3 scripts/daily_measure.py` — 5/7 passed (entity FAIL, AI sweep BLOCKED) |

## Daily executive summary

- Site health **VERIFIED**: 75 sitemap URLs in sync (missing 0 / extra 0), crawler access
  200 for PerplexityBot / Applebot / robots.txt / sitemap.xml / llms.txt, knowledge base OK
  (134 HTML files), `seo_audit` exit 0, generator idempotent (`lastmod_refreshed: 0`).
- Tavily conventional proxy ran — 10/10 rows, all `absent`.
- Gemini Search **BLOCKED** — HTTP 429 grounding quota for every grounded query, confirmed
  live. Recorded as BLOCKED, never zero.
- Changes since the primary 02:30Z run: **one code defect fixed** — a fully-failed Gemini
  sweep exited `0` and read as a clean pass (below). Two owned duplicate hosts remain live
  (unchanged; owner action).

## What changed since the last run

**One defect fixed — the AI sweep could pass by failing.** `gemini_visibility.py --run`
returned exit code `0` even when *every* grounded query was refused by the platform. The
02:30Z run fixed the *retired model slug* 404, but the same class of failure survived at the
exit-code layer: with today's HTTP 429 quota block, the sweep writes N `inconclusive` rows and
still exited `0`, so `daily_measure.check_ai_visibility` counted a blocked Gemini surface as
`ok=True`. A day on which the AI platform was never successfully queried would have been
recorded as a clean pass — the measurement apparatus looking healthy while measuring nothing.

Reproduced before the fix: `python3 scripts/gemini_visibility.py --run --limit 1` → `EXIT=0`
with `[ inconclusive] plumber in Laguna Niguel`. After the fix, the same command → `EXIT=3`,
printing *"Every grounded query was refused by the platform (rate_limited) — recorded BLOCKED,
never zero."* The `inconclusive` rows are still appended (a failed test is not zero); only the
exit code changed.

Everything else is flat: entity check unchanged (2 live duplicates), sitemap unchanged, no
page/copy/schema change. A metric that did not move is one line, per the template.

## Health

| Check | Result | Evidence |
|---|---|---|
| Knowledge base | VERIFIED | `validate_knowledge_base.py` — "Checked 134 HTML files. OK" |
| Crawler access | VERIFIED | `crawler_access_check.sh` — all agents + robots/sitemap/llms 200 |
| SEO audit | VERIFIED | `seo_audit.py` exit 0; 0 pages without `tel:` link, 0 unset Formspree IDs |
| Sitemap | VERIFIED | 75 URLs, missing 0, extra 0; `sitemap_dirty: false`, `lastmod_refreshed: 0` |
| Entity consistency | FAILED | exit 1 — 2 live duplicate hosts (unchanged; see Alerts) |
| Full unittest suite | VERIFIED | `python3 -m unittest discover -s growth-engine/tests -p "test_*.py"` — 319 tests, OK (3.5 s) |

## Visibility

| Platform | Tested | Recommendation rate | Mention rate | Citation rate | Sample | Confidence |
|---|---|---|---|---|---|---|
| Tavily (conventional proxy) | Yes — 10 queries | UNMEASURED | 0/10 present | n/a | 10 appended | Medium (proxy, not an AI surface) |
| Gemini Search | **BLOCKED** | BLOCKED | BLOCKED | BLOCKED | rows `inconclusive` | — (HTTP 429 grounding quota) |
| Perplexity, ChatGPT, Grok | UNMEASURED | — | — | — | no key | — |
| Google Search / Maps / AI Overviews | **unsupported** | — | — | — | no authorized API | — |

Straight Flush was absent from all 10 Tavily core queries today (unchanged from the primary
run; the core set includes `water heater repair in Aliso Viejo`,
`copper pipe leak repair near Dana Point`, `PEX repiping company in Laguna Hills`,
`which local plumber handles recurring sewer backups in Laguna Niguel?`).

Competitors repeated in today's Tavily results: `rotorooter.com`, `barkerandsonsplumbing.com`,
`aslplumbing.com`, `scottenglishplumbing.net`, `drainandsewerpro.com`, plus aggregators
`yelp.com`, `facebook.com`, `instagram.com`. No new entrant vs. the primary run; report
changes only per §5.

## Technical findings

| Severity | Location | Evidence | Impact | Fix | Status |
|---|---|---|---|---|---|
| High | `growth-engine/gemini_search_client.py` (`--run` exit path) | Quota-blocked sweep of 1 query: `EXIT=0` pre-fix; `[ inconclusive]` row written; `daily_measure` reported `ai_visibility_sweep ok=True` | A blocked AI platform was recorded as a clean pass — the exact false-negative the methodology forbids. AI visibility silently unmeasured. | Exit `3` when the platform refused every query, `2` for other total failure, `0` only if ≥1 row measured; `daily_measure` maps `3` → BLOCKED | **COMPLETED** (fix + 10 regression tests; live exit 3 verified) |
| High | `straight-flush-plumbing-7fb7cf71.base44.app`, `straightflushplumb8.wixsite.com` | Both HTTP 200, `index, follow` | Splits the canonical entity; an AI engine may cite a stale host | Owner action only (removal) — reported, not executed | **NEEDS APPROVAL** |

## Website changes

| Files/pages | Reason | Tests | PR/deploy ref | Verification | Rollback |
|---|---|---|---|---|---|
| `growth-engine/gemini_search_client.py`, `scripts/daily_measure.py` | A fully-failed AI sweep exited 0 and read as a clean pass | 10 new regression tests (`test_gemini_search_client.py::CliRunExitTests`, `test_daily_measure.py::TestAiVisibilityExitMeaning`); full suite 319 pass | Branch `intelligence-hq/daily-2026-10-16b` | Live: quota-blocked `--run --limit 1` → `EXIT=3` + BLOCKED message; per-partial-success → 0 | `git revert` (two files) |

Note: the two `growth-engine/data/*.jsonl` files carry today's appended measurement rows
(16 visibility + 2 entity across both runs). They are run output, not a code change.

## Priority queue

| # | Action | Impact | Evidence | Effort | Risk |
|---|---|---|---|---|---|
| 1 | **Owner unpublishes `straightflushplumb8.wixsite.com` and the base44 host** | High | Live 200, `index,follow`, confirmed 06:25Z today | Owner action | None (removal) |
| 2 | Restore an AI-surface grounding path — Gemini free grounding quota is exhausted (HTTP 429 across models) | High | 1/1 grounded query 429 this run; 5/5 primary run | Low (quota/key) | None |
| 3 | Apply the same exit-code contract to `scripts/tavily_search.py` (it also returns 0 when every query fails) | Medium | Same code shape as the fixed Gemini CLI | Low | Low |

## Integration & data limitations

- Google Search Console, Google Analytics 4, Google Business Profile, and call tracking are
  **not connected** (`growth-engine/INTEGRATION_STATUS.md`). Blocker, not a zero.
- Gemini Search is **BLOCKED** by HTTP 429 (grounding quota), not by code. The retired-model
  slug defect is fixed; the exit-code defect is fixed. Recorded `inconclusive`, never `0`.
- Tavily is a **conventional search proxy** (`test_type: conventional_proxy`), **not** an AI
  surface.
- Google Search / Maps / AI Overviews is `unsupported` — no authorized API; no scraping.

## Alerts

- **Entity split confirmed (HIGH).** Two owned hosts serve indexable content under the
  business name. Owner action required; the engine will not modify a property outside this
  repository, and must never add `sameAs` to a duplicate host.
- **AI-surface quota (HIGH).** Gemini grounding returned HTTP 429 this run. Grounded
  visibility stays `inconclusive` until quota is restored or a second AI key is provided.
- **No notification channel is configured**, so this report and its pull request are the channel.
- No secrets are reproduced in this report. No spend was incurred — every source used is free
  or already available.
