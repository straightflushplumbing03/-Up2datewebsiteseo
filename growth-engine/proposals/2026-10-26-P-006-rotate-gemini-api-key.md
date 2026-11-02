# P-006 — Rotate the dead Gemini API key (AI-surface measurement is blocked)

**Raised:** 2026-10-26 · **Owner action required** · **Priority:** high
**Risk gate:** L1 (credential rotation; no site change) · **Reversible:** n/a

## What is wrong

The `GEMINI_API_KEY` secret registered in this environment is **not valid**. Every
Search-grounded Gemini call in today's pre-stage failed with HTTP 401:

```
"message": "API key not valid. Please pass a valid API key.",
"status": "UNAUTHENTICATED",
"reason": "ACCESS_TOKEN_TYPE_UNSUPPORTED"
```

5 of 5 grounded queries returned `inconclusive` and were recorded that way — never
as zero visibility. Re-verified by hand this run, naming the secret explicitly so
the failure cannot be blamed on injection:

```bash
export GEMINI_API_KEY="${GEMINI_API_KEY}"
curl -s -o /dev/null -w '%{http_code}\n' \
  "https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}"
# -> 401
```

`ACCESS_TOKEN_TYPE_UNSUPPORTED` (rather than `API_KEY_INVALID` or an empty value)
indicates the value present is the **wrong kind of credential** for this API — e.g.
an OAuth access token or a token from another Google surface pasted where an API key
belongs. The length is 53 characters, consistent with a pasted token rather than the
usual `AIza…` API-key format.

## Why it matters

Gemini (Search-grounded) is one of only **two** AI surfaces this engine can actually
measure. With it dead, the daily report can honestly say "one provider measured,
one blocked" — but it cannot say anything about whether AI answer engines know
Straight Flush. That is the core question the engine exists to answer, and a
*blocked* instrument produces a run that looks like a quiet day rather than a blind
one. The prior risk here is ISSUE-033-adjacent: a truncated day recorded as BLOCKED
is worth more than a run that never commits — but a *repeatedly* blocked instrument
quietly erodes the value of every `absent` reading.

## Requested action

1. Create a Gemini API key in Google AI Studio (`AIza…` format) with the Generative
   Language API enabled.
2. Store it under the secret name **`GEMINI_API_KEY`** (the name the engine and
   `scripts/daily_measure.py` already reference).
3. No code change is needed — the fallback to Gemma and the `inconclusive` recording
   already behave correctly. Once the key is valid, the same run will produce real
   AI-surface rows.

## Verification after rotation

```bash
export GEMINI_API_KEY="${GEMINI_API_KEY}"
curl -s -o /dev/null -w '%{http_code}\n' \
  "https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}"   # expect 200
python3 scripts/daily_measure.py
python3 -c "import json;d=json.load(open('growth-engine/data/daily_context.json'));\
print([ (c['name'],c['ok']) for c in d['checks']])"   # ai_visibility_sweep should flip to ok
```

## Related

- `growth-engine/INTEGRATION_STATUS.md` — integration state to update on resolution.
- Today's report: `growth-engine/reports/daily/2026-10-26-hq.md`.
- Companion observation: `daily_context.json` also lacks the `network_budget_s` key
  the run brief says to expect; a small follow-up (tracked as
  idea-2026-10-26-04) would make the budget ceiling auditable from the artifact.
