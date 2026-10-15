# AI Headquarters Blueprint — Straight Flush Plumbing & Leak Detection

Copy-paste deployment for the autonomous SEO, local-search, competitor-intelligence, and
AI-recommendation system.

| File | What it is |
|---|---|
| `01-MASTER-AGENT-PROMPT.md` | The operating prompt. Paste this into the automation. |
| `02-IMPLEMENTATION-SKETCH.md` | The build plan, grounded in what already exists. |
| `03-MCP-AND-INTEGRATIONS.md` | The MCP servers and secrets that make it useful. |
| `README.md` | This file — deployment commands and live ids. |

---

## Live automation ids

Record the id here after creation so future runs can self-inspect.

| Automation | id | Cron (America/Los_Angeles) | State |
|---|---|---|---|
| SFPL AI Headquarters Daily | `e6684830-a9a5-43d8-9d5a-34fed5257bbf` | `0 6 * * *` | created 2026-10-15, enabled |
| SFPL AI Headquarters Weekly | _(fill in)_ | `0 6 * * 1` | _(fill in)_ |
| "New Automation" (legacy, kept running side by side) | `df4bcd68-75f3-46f4-ab6f-a4027e5bf8a9` | `0 6 * * 1-5` | enabled, **never succeeded** — see below |

### Deployed 2026-10-15

`SFPL AI Headquarters Daily` created via `POST /api/automation/v1/preset/prompt`
(HTTP 201). Payload built by `build_payload.py` from
`01-MASTER-AGENT-PROMPT.md` — 26,540 prompt chars, `timeout: 1800`, and both
repositories attached (`AI-Headquarters` + `-Up2datewebsiteseo`, ref `main`).

Verification run dispatched: `010cf8d9-3ea5-4a95-914a-6baeecc49785`.

**Rollback / pause:** `PATCH /api/automation/v1/<id>` with `{"enabled": false}`.

### The legacy 6 AM automation is broken — verified 2026-10-15

`GET /api/automation/v1` returned one enabled job named **"New Automation"**:

| Field | Value |
|---|---|
| id | `df4bcd68-75f3-46f4-ab6f-a4027e5bf8a9` |
| cron | `0 6 * * 1-5` in `America/Los_Angeles` (**weekdays only** — the spec asks for all 7 days) |
| enabled | `true` |
| timeout | `600` s (10 min — too short for this workload) |
| `prompt` | **empty string** — it is a custom-tarball automation, not a prompt preset |
| `tarball_path` | `oh-internal://uploads/890a9e31-…` |
| `entrypoint` | `python3 main.py` |
| created / last triggered | `2026-10-15T05:35:09Z` / `2026-10-15T05:35:57Z` |

Both runs it has ever made **FAILED**:

```
status: FAILED
current_phase: "Starting automation"
conversation_id: None          <-- no conversation was ever started
cost: None
error_detail: exit_code=1
  File "main.py", line 21, in fire_callback
    urllib.request.urlopen(request, timeout=10)
urllib.error.HTTPError: HTTP Error 401: Unauthorized
```

**Diagnosis:** the wrapper died in its completion-callback helper with a `401`
before any agent conversation ran. The run stalled ~13 minutes in
`Starting automation` and was then marked FAILED. So the automation has been
**enabled and failing silently** — it has never once done the SEO work. An
enabled schedule is not a working system.

**Recommended replacement:** delete this automation and deploy the prompt-preset
automation below. A prompt preset carries its instructions in the `prompt` field,
so it cannot silently lose them the way an empty-prompt tarball job does.

> Note: an earlier generation of automations existed
> (`SFPL Intelligence HQ Daily 6 AM` = `5dc89b41-…`, `SFPL Intelligence HQ Weekly Review` =
> `0582d219-…`, `Growth Engine A` = `4c5213f7-…`). Those ids returned **404** when checked on
> 2026-10-15, so they no longer exist in this org. The authoritative live list is whatever
> `GET /api/automation/v1` returns. Always re-check rather than trusting this table.

---

## Preflight — the code must be on `main` first

The automation clones the repositories at run time. Anything not committed and
pushed to `main` does not exist for the automation.

**Verified gap on 2026-10-15:** `origin/main` of `-Up2datewebsiteseo` does **not**
contain `scripts/tavily_search.py`, `scripts/entity_consistency_check.py`,
`scripts/perplexity_agent.py`, `growth-engine/ai_agent_client.py`,
`growth-engine/tavily_search.py`, or `.mcp.json`. They are untracked working-tree
files. Deploying the automation before committing them would give every run a
clone that lacks its own tooling.

Order of operations is therefore: **commit → push → verify on `main` → then deploy.**

Also required for the run to do anything useful:

| Item | Needed for | Status 2026-10-15 |
|---|---|---|
| `GITHUB_TOKEN` | clone + push + PR | set |
| `TAVILY_API_KEY` | conventional-search sweeps | **not set in this environment** — must be added to the automation's secrets |
| `PERPLEXITY_API_KEY` | genuine AI-surface testing | not set — that surface stays `unmeasured` until it is |

`OPENHANDS_API_KEY` is present and the automation API answered `HTTP 200`.

---

## Deploy in three steps

### Step 1 — create the daily automation

Copy the whole prompt from `01-MASTER-AGENT-PROMPT.md` (everything between the two `---`
markers) into `$PROMPT`, then:

```bash
export OPENHANDS_HOST="https://app.all-hands.dev"
PROMPT="$(sed -n '/^## THE PROMPT/,/^## END OF PROMPT/p' 01-MASTER-AGENT-PROMPT.md \
  | sed '1d;$d' | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')"

curl -s -X POST "${OPENHANDS_HOST}/api/automation/v1/preset/prompt" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(cat <<EOF
{
  "name": "SFPL AI Headquarters Daily",
  "prompt": ${PROMPT},
  "trigger": {"type": "cron", "schedule": "0 6 * * *", "timezone": "America/Los_Angeles"},
  "timeout": 1800,
  "repos": [
    {"url": "https://github.com/straightflushplumbing03/AI-Headquarters", "ref": "main"},
    {"url": "https://github.com/straightflushplumbing03/-Up2datewebsiteseo", "ref": "main"}
  ]
}
EOF
)" | python3 -m json.tool
```

`timeout` is capped at 1800 seconds on this platform (a `PATCH {"timeout": 3600}` was previously
observed to return HTTP 422). `0 6 * * *` in `America/Los_Angeles` handles daylight saving
automatically, because the timezone is an IANA name rather than a fixed UTC offset.

**On the `repos` field:** the exact JSON schema for `repos` is documented in the OpenHands
automation skill, not on the public docs pages (the public Automations overview page describes
prompt- and plugin-based automations but not this request body). The shape used above was
validated against the live endpoint, which returned `422` only for missing top-level fields
(`name`, `prompt`, `trigger`) and accepted the nested objects. If a future API version rejects
`repos`, drop the field and let the prompt clone the repositories itself — the master prompt
already does exactly that in its Step 0.

### Step 2 — create the weekly review

Same command with these two fields changed:

```json
"name": "SFPL AI Headquarters Weekly",
"trigger": {"type": "cron", "schedule": "0 6 * * 1", "timezone": "America/Los_Angeles"}
```

### Step 3 — verify, then dispatch once

```bash
# List what actually exists
curl -s -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  "${OPENHANDS_HOST}/api/automation/v1?limit=20" | python3 -m json.tool

# Inspect one automation (replace the id)
curl -s -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  "${OPENHANDS_HOST}/api/automation/v1/<ID>" | python3 -m json.tool

# Trigger a run now, do not wait for 06:00
curl -s -X POST -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  "${OPENHANDS_HOST}/api/automation/v1/<ID>/dispatch"

# Watch the runs
curl -s -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  "${OPENHANDS_HOST}/api/automation/v1/<ID>/runs?limit=5" | python3 -m json.tool
```

Run statuses: `PENDING`, `RUNNING`, `COMPLETED`, `FAILED` (inspect `error_detail`).

**A configuration file is not proof that automation runs.** Only `COMPLETED` on a real run is.

---

## Pause and resume (emergency stop)

```bash
# Pause without deleting — keeps the definition and history
curl -s -X PATCH "${OPENHANDS_HOST}/api/automation/v1/<ID>" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" -d '{"enabled": false}'

# Resume
curl -s -X PATCH "${OPENHANDS_HOST}/api/automation/v1/<ID>" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" -d '{"enabled": true}'
```

The application-level kill switch already exists in the platform and is independent of this:
`POST /api/founder/emergency-stop` in `AI-Headquarters`.

---

## Known blocker at deploy time

On 2026-10-15 two automations in this org were already failing on every run with:

```
HTTP Error 401: Unauthorized   (in fire_callback)
stdout: Automation prompt:
```

The script ran but the prompt was empty and the completion callback was rejected. Both were
`github-delivery-watchdog` / `github-pr-reviewer` template automations, not the AI Headquarters
prompt. Worth knowing before you assume a new automation is healthy — always dispatch once and
read `/runs`.

---

## Order of operations (do not skip)

1. Register `PERPLEXITY_API_KEY` — one key flips AI visibility from `unverified` to measured.
2. Enable the GitHub, Supabase, and Tavily MCP servers.
3. Deploy the daily automation and dispatch it once by hand.
4. Read the first report. Expect many `BLOCKED` / `UNMEASURED` lines. That is correct and honest.
5. Then work Phase 4 in `02-IMPLEMENTATION-SKETCH.md` (Search Console, Bing, GA4) to convert
   `UNMEASURED` into real numbers.
