# Growth Engine Automations

Canonical prompts and schedule definitions for the OpenHands automations that
operate this growth engine. Keep each `.prompt.md` here in sync with the live
automation definition (record the live automation id below once created).

All schedules use **America/Los_Angeles** so they follow daylight saving.

| ID | Automation | Schedule (PT) | Scope | Live automation id |
|----|-----------|---------------|-------|--------------------|
| A | Morning AI Search Visibility & Competitor Intelligence | `0 6 * * *` | L1 + L2 (PRs) | `4c5213f7-080c-4edd-97a2-30962419bd14` (created 2026-10-09) |
| B | Daily Technical Health Check | `20 6 * * *` | L1 + L2 | _(planned)_ |
| C | Controlled Website Improvement | `0 7 * * 1-5` | L2 (branch/PR only) | _(planned)_ |
| D | Weekly Strategy Review | `30 7 * * 1` | L1 + L2 | _(planned)_ |
| E | Monthly Growth Audit | `0 8 1 * *` | L1 + L2 | _(planned)_ |

## Decision on B–E (deliberate, documented)

The environment **already runs three daily agents** (Scout competitor intel,
Strategist SEO plan, Sentinel retry). Creating B–E immediately would add
overlapping runs that can conflict and burn tokens for little gain. Per the
master spec ("create the highest-priority automations first", "prevent
overlapping runs from making conflicting changes"), only **Automation A** was
created autonomously. B–E are documented and proposed for owner approval in
`proposals/2026-10-09-priority-actions.md` (P-004), to be scheduled **after**
the existing agents are consolidated.

- **B (Technical Health)** is a deterministic check — implement it as a *custom
  no-LLM script* (`growth-engine/tests/crawler_access_check.sh` + a small
  runner) rather than an LLM agent, so it costs no tokens.
- **D/E** fold naturally into A + the existing Strategist weekly/monthly cadence.

## Pre-existing automations (to be reconciled — see KNOWN_ISSUES ISSUE-005)

- `Scout: Daily Competitor Intel` — `30 5 * * *` — overlaps A/D
- `Strategist: Daily SEO Action Plan` — `30 6 * * *` — overlaps A/C
- `Sentinel: Scout Auto-Retry` — `30 7,11 * * *` — retry wrapper
- `Implementer: Approved Page Changes [MANUAL ONLY]` — disabled — keep for L2/L3

## Safety

- A and B are **read-mostly** and may open PRs; they never merge and never
  touch website pages.
- C applies **pre-approved** Level 2 changes on a branch/PR.
- Anything Level 3 (identity, prices, phone, claims, DNS/hosting, deletions,
  business profiles, spend) is proposed to the owner, never executed.
