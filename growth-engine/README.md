# Growth Engine — Straight Flush Plumbing & Leak Detection

Permanent, version-controlled knowledge base and operating system for the
autonomous AI-visibility / SEO / AEO / competitor-intelligence / website-quality
effort. This directory adapts the master spec's suggested structure to the
existing repository (an established static HTML site) rather than duplicating it.

## Read order for any automation run

1. `BUSINESS_PROFILE.md` — verified company facts (never contradict these)
2. `APPROVED_CLAIMS.md` + `BRAND_VOICE.md` — what may be said and how
3. `SERVICE_CATALOG.md` + `SERVICE_AREAS.md` — what is actually offered/covered
4. `KNOWN_ISSUES.md` — open problems (read ISSUE-001 first)
5. `AI_VISIBILITY_METHODOLOGY.md` + `KEYWORD_UNIVERSE.md` — how to test
6. `INTEGRATION_STATUS.md` — what is connected and what is not
7. `EXPERIMENT_LOG.md` + `data/*.jsonl` — history and prior experiments
8. `reports/` — prior outputs

## Files

| File | Purpose |
|---|---|
| `BUSINESS_PROFILE.md` | Verified identity, NAP, hours, credentials, repute |
| `SERVICE_CATALOG.md` | Verified services + pages; unverified claims flagged |
| `SERVICE_AREAS.md` | 21 published cities; stub caveats |
| `APPROVED_CLAIMS.md` | Allowed / restricted / forbidden claims |
| `BRAND_VOICE.md` | Tone and phrasing rules |
| `COMPETITOR_DIRECTORY.md` | Rolling, evidence-based competitor map |
| `KEYWORD_UNIVERSE.md` | Query library + priority sweep list |
| `AI_VISIBILITY_METHODOLOGY.md` | Reproducible measurement rules + platform access |
| `INTEGRATION_STATUS.md` | Connected / missing integrations |
| `KNOWN_ISSUES.md` | Issue register (severity, evidence, fix, approval) |
| `EXPERIMENT_LOG.md` | Experiment records and outcomes |
| `CHANGELOG.md` | Changes to this knowledge base |
| `data/*.jsonl` | Raw observations (append-only) |
| `reports/` | baseline / daily / weekly / monthly reports |
| `proposals/` | Items needing owner approval |
| `tests/` | Validation helpers |

## Non-negotiables (mirror of the master spec)

- Evidence before changes; separate facts from hypotheses; label confidence.
- Never label a conventional search result as an AI-platform result.
- Missing data ≠ zero visibility. State limitations honestly.
- Never fabricate reviews, licenses, prices, statistics, or case studies.
- Never advertise guaranteed rankings, recommendations, or lead volume.
- Production changes go through branches/PRs; identity/pricing/contact/claims
  changes require explicit owner approval (Level 3).

## Automation schedule (target — see `proposals/2026-10-09-priority-actions.md`)

A Morning Intel 06:00 PT · B Technical Health 06:20 PT ·
C Controlled Improvement 07:00 PT weekdays · D Weekly Review 07:30 PT Mon ·
E Monthly Audit 08:00 PT 1st. All America/Los_Angeles.
