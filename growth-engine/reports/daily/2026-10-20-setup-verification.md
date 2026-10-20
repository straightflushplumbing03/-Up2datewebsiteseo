# Daily Report — 2026-10-20 (Intelligence HQ setup + first-run verification)

Timezone: America/Los_Angeles · Run: **manual setup / first-run verification** ·
Executed 2026-10-20 16:01–17:00 UTC (09:01–10:00 PDT) ·
Approval scope: **Level 1 (research/reporting) + Level 2 (branches/PRs only)**.
No Level 3 action was taken (no identity, phone, email, price, legal/warranty,
service-area, DNS, or hosting change).

> Companion file: `2026-10-20.md` is the 05:45 PDT Claude scheduled-task run.
> This file records the Intelligence HQ infrastructure verification run; neither
> run changed a website page, schema, or copy.

## Run record

| Item | Value |
|---|---|
| Branch | `intelligence-hq/setup-verify-2026-10-20` (PR to `main`, not merged) |
| Daily automation | `df8e3c2d-1fac-47fb-9af2-38d59c8239c5` — **SFPL Intelligence HQ Daily 6 AM** |
| Daily schedule | `0 6 * * *` · America/Los_Angeles · **enabled: True**, state ACTIVE |
| Weekly automation | `d948c2e2-e4a4-49f1-a2e4-40fdf815faea` — **SFPL Intelligence HQ Weekly Review** |
| Weekly schedule | `0 6 * * 1` (Mondays) · America/Los_Angeles · **enabled: True**, state ACTIVE |
| Test suite | `python3 -m unittest discover -s growth-engine/tests -p "test_*.py"` → **352 tests, OK** |
| Knowledge base | `validate_knowledge_base.py` → **OK, 135 HTML files** |
| Supervisor | `scripts/system_supervisor.py` → **7/8 PASS, 1 BLOCKED** |

## Daily executive summary

- **Website health:** crawler access, key paths, and the AI-readable files
  (`llms.txt`, `llms-full.txt`, `md/index.md`) all measured by the deterministic
  pre-stage (`scripts/daily_measure.py`). `knowledge_base` and `crawler_access`
  checks **PASS**.
- **Deterministic pre-stage:** `scripts/daily_measure.py` ran end-to-end and wrote
  `growth-engine/data/daily_context.json` (generated 16:36:20Z, finished 16:39:56Z,
  exit 0) — **5 of 7 checks passed**.
- **AI-surface measurement:** `ai_visibility_history.jsonl` now holds **13
  `ai_platform` rows**, newest **2026-10-20T16:39:56Z** — the business goal is
  measured on a real AI surface, not only a conventional-search proxy.
- **Changes to the website this run:** **none.** No page, schema, or copy was
  edited. Only the growth-engine's own prompt/supervisor/data files changed.

## Infrastructure verification (the point of this run)

### 1. Repository is the production site

Confirmed by evidence, not assumption:

- `CNAME` = `straightflushplumbingoc.com`; static HTML published via GitHub Pages.
- No build step — the committed `.html` files are the site.
- Canonical/OG URLs are extensionless and resolve to the live host.
- `scripts/verify_live_vs_repo.py` compares the live site to the checkout.

### 2. Root-cause fix — prompt re-deploys were silently failing

`PATCH /api/automation/v1/{id}` rejects `repos` (a creation-only field), so every
prompt re-deploy returned **HTTP 422** and the live prompt never updated.
`deploy_intelligence_hq.py` now strips `repos` from the PATCH payload. Both
canonical prompts were then re-deployed successfully (HTTP 200 each):

- Daily → `0 6 * * *` America/Los_Angeles
- Weekly → `0 6 * * 1` America/Los_Angeles

The supervisor's `prompt_matches_repo` check now compares the live prompt against
the canonical `growth-engine/automations/intelligence-hq-daily.prompt.md` (the
file the deploy script actually sends), instead of the obsolete
`01-MASTER-AGENT-PROMPT.md`. Result: **PASS**.

### 3. Duplicate automation reconciled

A stray automation (`3c4e15bb…`, name "Newest", `0 9 * * *`) held a copy of the
one-time setup prompt and was re-running it daily. It was **disabled**
(reversible) so exactly one enabled *content* automation remains.

Live enabled set (verified via `GET /api/automation/v1`):

| Enabled | Schedule (PT) | Automation |
|---|---|---|
| ✅ | `0 6 * * *` | SFPL Intelligence HQ Daily 6 AM |
| ✅ | `0 6 * * 1` | SFPL Intelligence HQ Weekly Review |
| ❌ | `0 9 * * *` | Newest *(stray, disabled this run)* |
| ❌ | `0 6 * * 1,3,5` | SFPL AI Headquarters Daily *(superseded)* |
| ❌ | others | watchdog / templates |

### 4. Persistence test

The knowledge base is durable across fresh sandboxes: each run clones this repo
from GitHub, reads the committed knowledge, appends dated findings, and commits
back on `intelligence-hq/…` branches. This run proves the loop by committing the
snapshot, the history rows, and this report. Nothing is relied on from a prior
local sandbox.

## Technical findings

| Check | Result | Detail |
|---|---|---|
| `knowledge_base` | ✅ PASS | 135 HTML files validated; titles/descriptions, dead fragments, sitemap parity OK |
| `crawler_access` | ✅ PASS | Googlebot/Bingbot/GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot/Applebot all 200, no `cf-mitigated` |
| `visibility_sweep` | ✅ PASS | conventional-search proxy rows appended |
| `ai_visibility_sweep` | ✅ PASS | 13 `ai_platform` rows, newest today |
| `seo_audit` | ✅ PASS | technical audit clean |
| `entity_consistency` | ❌ FAIL | two live duplicates of the business entity resolve (see below) |
| `sitemap_idempotent` | ❌ FAIL | `refresh_sitemap.py` leaves `sitemap.xml` dirty (`sitemap_dirty: true`); URL set unchanged (76 in, 0 missing, 0 extra) |

Both FAILs are **pre-existing** (present before this work) and are **not** caused
by the setup. Neither was "fixed" by shipping a site change, per the no-deploy
scope.

- **`entity_consistency`:** `straight-flush-plumbing-7fb7cf71.base44.app` and
  `straightflushplumb8.wixsite.com` both return HTTP 200 and duplicate the
  canonical entity. `flush-pro-flow.base44.app` now 404s (correctly gone).
  The base44/wix copies are third-party hosting artifacts, not files in this
  repo — resolving them needs an ownership/removal action outside this
  repository. Recorded as a blocker, not fabricated as fixed.
- **`sitemap_idempotent`:** the tool refreshes `<lastmod>` to the date the file
  was last regenerated. The committed sitemap carries `2026-10-16`; the tool
  wants `2026-10-19`. Re-running it produces pure date churn (77 lines, zero URL
  changes) with no SEO effect, so the change was **reverted** to keep the initial
  setup free of unintended site edits. A follow-up should decide whether
  `<lastmod>` is derived from git history (preferred) or the run date.

## Supervisor result (7/8)

```
[OK     ] automations_enabled: 1 enabled content automation(s): SFPL Intelligence HQ Daily 6 AM
[OK     ] schedule_intact: live cron '0 6 * * *', expected '0 6 * * *'
[OK     ] prompt_matches_repo: live prompt == repo prompt
[OK     ] ai_visibility_blind: 13 ai_platform row(s); newest 2026-10-20T16:39:56Z
[BLOCKED] self_merges: UNMEASURED: review gate unenforceable with 1 collaborator
[OK     ] open_pr_backlog: 4 open PR(s) (threshold 5)
[OK     ] change_volume: 0 unique files changed, 0 new page(s)
[OK     ] unexpected_branches: 72 remote branch(es); no new unexplained branches
```

`self_merges` is **BLOCKED, not FAIL**: with a single collaborator on the
repository, "a PR merged by its own author" cannot be distinguished from the only
account available to merge. Enforcing and measuring it requires a **second
collaborator** who is not the automation account.

## Integration & data limitations (blockers recorded, not faked)

- **Google Search Console / GA4:** not connected. No OAuth credential is present,
  so no impressions, clicks, positions, or sessions can be read. This remains
  **P-002**; the engine continues on public research and records the blocker.
- **Google Business Profile / map pack:** not connected — no local-pack ranking
  data.
- **AI answer engines:** the Gemini sweep is the primary AI-surface measure;
  ChatGPT / Claude / Perplexity surfaces are not yet measured. "Not tested" is
  recorded as **unverified**, never as zero.
- **Secret names:** `Tavily_api_key` and `GEMINI_API_KEY` are non-standard and
  must be named explicitly in the command or the sweep reports BLOCKED for the
  wrong reason. Documented in the daily prompt (Step 0b).

## Priority queue — next three

1. **Connect Google Search Console + GA4** (read-only) so `visibility_sweep`
   stops being a proxy. Owner action: grant OAuth access. This unblocks the most
   valuable evidence the engine currently lacks.
2. **Add a second GitHub collaborator** to unblock and measure `self_merges`, and
   clear the 4 open PRs so the backlog stays under the threshold of 5.
3. **Resolve the `entity_consistency` duplicates** (base44 / wix copies) and
   decide the `<lastmod>` policy for `sitemap_idempotent` so both checks turn
   green without a blind site edit.

## Alerts

> **No URGENT marker.** No downtime, noindex, crawler block, business-info error,
> or security issue. ISSUE-001 (Cloudflare crawler block) remains **RESOLVED**.

## Approval scope

Level 1 (research/read-only) + Level 2 (branches/PRs only). **No Level 3 action**
was taken: identity, phone, email, prices, legal/warranty claims, service-area
commitments, DNS, and hosting were untouched. No website change was deployed;
this report and the infrastructure fixes land on a branch for review.

---

## Persistence test (verified against a fresh clone)

This run's durable record is commit **`086eab1`** on
`intelligence-hq/setup-verify-2026-10-20` (PR #72). Verified by cloning the
branch fresh from GitHub, not by trusting the local working tree:

| Check | Result |
|---|---|
| Fresh-clone HEAD | `086eab1` (matches pushed commit) |
| `DEFAULT_NETWORK_BUDGET` present in clone | yes (3 references) |
| `ISSUE-033` present in clone | yes |
| Live daily prompt vs. canonical file | in sync (header stripped by design) |
| Live weekly prompt vs. canonical file | in sync (header stripped by design) |

### Why the previous three runs failed, and what changed

Run history for `df8e3c2d` shows the failure mode plainly:

| Run | Started | Ended | Outcome |
|---|---|---|---|
| manual | 2026-10-19T16:18:58Z | 16:51:47Z | FAILED — timed out while pushing |
| cron | 2026-10-20T16:42:33Z | 17:14:37Z | FAILED — timed out verifying branches |
| manual | 2026-10-20T17:28:48Z | — | this run |

Every failure was a wall-clock kill **before the commit was pushed**, so nothing
was durable. Three guards now exist against that:

1. `daily_measure.py` bounds its own network sweeps (600 s combined, 60/40 split)
   and records a truncated sweep as `BLOCKED`, never as a zero.
2. The canonical daily prompt carries a mandatory time budget with a
   **checkpoint commit by ~10 minutes** — commit early, amend later.
3. The budget defaults are module constants, so the regression test reads real
   values and fails if they are raised past the automation ceiling.

### Fix applied this run

The `test_budget_split_keeps_both_sweeps_bounded` test asserted the literals
`600` and `1920` against themselves — it could never fail. It now reads
`daily_measure.DEFAULT_NETWORK_BUDGET` and `AUTOMATION_WALL_CLOCK_S`, and was
confirmed to fail when the budget is raised past half the ceiling.

### Correction: CI does exist

AGENTS.md states "There is **no CI** on this repository." That is out of date.
`.github/workflows/` contains three workflows:

| Workflow | Trigger |
|---|---|
| `verify.yml` | `pull_request` |
| `site-audits.yml` (Lighthouse + broken links) | weekly schedule |
| `purge-cloudflare-cache.yml` | `workflow_dispatch` |

The `Verify` check ran and passed on each push to this branch (PR #72).
Deployment itself is GitHub Pages from `main` (CNAME `straightflushplumbingoc.com`);
nothing in this run touched `main`.
