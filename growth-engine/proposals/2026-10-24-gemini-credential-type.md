# Proposal — 2026-10-24 — Gemini credential type rejects every call (AI surface UNMEASURED)

**Level:** 3 (credential / secret change — owner action required)
**Status:** proposed
**Owner action requested:** replace the registered `GEMINI_API_KEY` secret with a
Google AI Studio **API key** (classic `AIza…` form), or confirm the intended
credential type.

## What is happening

The daily pre-stage (`scripts/daily_measure.py`) measures the AI-answer surface with
a Search-grounded Gemini call. Every call in the 2026-10-24 run was rejected:

- **HTTP 401 UNAUTHENTICATED**
- `reason: ACCESS_TOKEN_TYPE_UNSUPPORTED`
- the credential presented is **53 characters** with prefix `AQ.Ab8…`
- rejected on **all three** access patterns: `?key=<credential>`, the
  `x-goog-api-key` header, and `models.list`

## Why this is a credential problem, not a quota problem

`models.list` requires no grounding entitlement. A 401 on `models.list` means the
credential itself is not accepted, so this is a different failure from
`ISSUE-032`'s documented `429 RESOURCE_EXHAUSTED` (free-tier grounding not available
for Gemini 3.x). The existing Gemma fallback cannot engage either — it is designed to
catch *quota/server* refusals, and it correctly does not swallow an auth error.

**Hypothesis (medium confidence, not verified):** the registered secret holds an
OAuth/access-token-type value rather than a Google AI Studio API key. We have only
observed the API rejecting the value; we have not inspected the secret's provenance,
and we must not.

## Why it matters

The business goal is *AI recommendation*. With no `ai_platform` rows, the AI surface
stays **UNMEASURED** and `system_supervisor.py` reports `ai_visibility_blind`. Today's
`ai_visibility_sweep` check is FAIL with all 5 queries `inconclusive`.

## What the automation did instead

- Recorded the blocker verbatim in the daily report and in
  `growth-engine/data/daily_context.json`.
- Updated `KNOWN_ISSUES.md` ISSUE-032 with the new failure mode (401 vs 429).
- Did **not** print, rotate, or commit any credential. Reference is by name only.

## Options for the owner

1. **Re-issue the secret** as a Google AI Studio API key and re-register it under the
   name `GEMINI_API_KEY`. (Lowest effort, restores the measurement.)
2. Confirm the intended credential type and, if it is deliberately OAuth-based, have
   the measurement client authenticate accordingly (requires a code change, L2).
3. Accept the AI surface as UNMEASURED for now and rely on the Tavily conventional
   proxy alone (degraded: a conventional proxy is **not** an AI-platform result).

## Not in scope

No credential is printed, rotated, or committed by this automation. No website page,
claim, price, identity, or service-area value is touched by this proposal.
