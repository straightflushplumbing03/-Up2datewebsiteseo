# Known Issues — Straight Flush Growth Engine

Severity: **critical** (blocks the business), **high**, **medium**, **low**.
Each issue: evidence, impact, fix, status, approval level.

---

## ISSUE-001 — Cloudflare managed challenge blocks ALL crawlers  [CRITICAL · RESOLVED 2026-10-11]

- **Evidence (before):** 2026-10-07 → 2026-10-11, every path (`/`,
  `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/index.html`,
  `/services/leak-detection.html`, `/cities/laguna-niguel.html`) returned
  `HTTP/2 403` with header `cf-mitigated: challenge`, for Googlebot, Bingbot,
  GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Applebot and plain curl.
- **Root cause (confirmed via Cloudflare API):** zone
  `straightflushplumbingoc.com` (id `0e9dba51558951ac91fadb2c0e28abde`) had
  **Under Attack mode ON** — `security_level = "under_attack"` since
  `2026-09-20T20:04:22Z`. Bot Fight Mode was **off**.
- **Fix applied 2026-10-11T07:27:51Z:**
  `PATCH /zones/{id}/settings/security_level` → `{"value": "medium"}`.
  Narrowest possible change; nothing else modified. Reversible with one call.
- **Verification 2026-10-11T07:28:05Z:** all 8 UAs and every path above return
  **200 with no `cf-mitigated` header**.
- **Follow-up (medium):** the AI-readable files (`/llms-full.txt`, `/md/**`)
  still return **404** until PR #24 is merged — that is a deploy step, not a
  Cloudflare issue.
- **Approval:** Level 3 (hosting/security config). Applied by agent with the
  owner-supplied Cloudflare API token and explicit request.
- **Status:** **RESOLVED.** See `growth-engine/CLOUDFLARE_CRAWLER_READINESS.md`.
  Regression check: `bash growth-engine/tests/crawler_access_check.sh`.

---

## ISSUE-002 — Self-reported `aggregateRating` in LocalBusiness JSON-LD  [MEDIUM · RESOLVED 2026-10-15]

- **Evidence:** `index.html` JSON-LD contained `aggregateRating` (4.8/74) and
  three `review` objects on a `Plumber` type.
- **Impact:** Google's structured-data policy: review/rating markup must be
  genuinely independent and about the entity; self-serving ratings on a business
  may be ignored or flagged. Low risk but a hygiene item.
- **Fix applied 2026-10-15:** the `aggregateRating` and `review` nodes were
  **removed** from `index.html`'s `Plumber` JSON-LD (Level 2, metadata hygiene).
  The on-page footer star badges ("4.8/5 on Yelp", "5.0/5 on Google") were left
  as human-visible trust content, which is outside structured-data policy.
  `llms.txt` now attributes the ratings to the business and flags them as
  needing confirmation on the live profiles.
- **Re-introduction gate:** re-add rating markup only if the owner confirms the
  values against the live Google/Yelp profiles (Google prefers review markup that
  references a genuine third-party platform). See `proposals/`.
- **Approval:** Level 2 (metadata/content using verified facts). Applied.

---

## ISSUE-003 — Duplicate open PRs (draft content not merged)  [LOW · OPEN]

- **Evidence:** PRs #15, #16, #17, #18 all open; #16 and #17 touch overlapping
  leak-detection FAQ/schema changes.
- **Impact:** review noise; potential conflicting edits if merged blindly.
- **Fix:** owner/Implementer reviews and merges the best version of each, closes
  duplicates. Not blocking.
- **Approval:** Level 2.

---

## ISSUE-004 — Stale PR #11 and committed `.git-2/`  [LOW · OPEN]

- **Evidence:** PR #11 stale since 2026-09-28, `mergeable=false`, ~10k lines of
  unrelated churn including a committed `.git-2/` object store.
- **Impact:** repo hygiene / confusion.
- **Fix:** close PR #11; re-land wanted pieces in small PRs. Not blocking.
- **Approval:** Level 2.

---

## ISSUE-005 — Duplicate automation coverage  [LOW · CONSOLIDATED 2026-10-12]

- **Evidence:** "Strategist: Daily SEO Action Plan" (06:30 PT), "Scout: Daily
  Competitor Intel" (05:30 PT) and "Sentinel" retry overlap in scope; Automation A
  ("Morning AI Search Visibility", 06:00 PT) overlapped the new Intelligence HQ
  daily job at the same slot.
- **Impact:** redundancy/token cost; possible conflicting changes.
- **Fix (in progress):** the owner's Intelligence HQ replaces Automation A.
  `SFPL Intelligence HQ Daily 6 AM` (`0 6 * * *`) + `SFPL Intelligence HQ Weekly
  Review` (`0 6 * * 1`) were created 2026-10-12; **Automation A was disabled** to
  avoid two overlapping 06:00 PT runs.
- **Consolidation completed 2026-10-12 (Phase 2):** the three legacy agents were
  **disabled** — `Scout: Daily Competitor Intel` (`30 5 * * *`),
  `Strategist: Daily SEO Action Plan` (`30 6 * * *`), and
  `Sentinel: Scout Auto-Retry` (`30 7,11 * * *`). HQ-D (daily) + HQ-W (weekly) are
  now the only active intelligence loops. Only one automation occupies the 06:00 PT
  slot.
- **Approval:** Level 2 (automation config).

---

## ISSUE-006 — Automation run budget: open-ended research times out before commit  [MEDIUM · MITIGATED 2026-10-12]

- **Evidence:** the first manual dispatch of `SFPL Intelligence HQ Daily 6 AM`
  (run `897c5d5a-6143-4133-a0e4-8501d62f0206`, 2026-10-12 05:33–06:06 UTC) returned
  `status: FAILED`, `error_detail: "Timed out: command timed out or was killed"`.
  The run spent its whole budget exploring many search engines (Yahoo, Bing RSS,
  Marginalia, headless Chromium, Google SERP pacing, blog crawls) and never reached
  the write/commit step, so **no report was persisted** — exactly the failure mode
  the spec warns about.
- **Impact:** a run that researches forever produces nothing durable; the daily loop
  can silently produce no output.
- **Constraint discovered:** the automation API caps `timeout` at **1800 s**
  (30 min); a longer timeout is rejected with HTTP 422
  (`timeout must not exceed 1800 seconds`).
- **Fix applied 2026-10-12:** the daily prompt now carries a **mandatory time
  budget** (≈40% research / 60% write+commit), limits search to **Brave** (+ at most
  one alternate), forbids headless browsers and multi-engine probing, and instructs
  the agent to **stop researching and commit** when near budget. The weekly prompt
  got the same budget note.
- **Follow-up:** confirm the hardened prompt completes within budget (second
  dispatch). If it still overruns, reduce the query sample further (10–15) and move
  industry research to a separate weekly job.
- **Approval:** Level 2 (automation prompt config).

---

## ISSUE-007 — Search providers block the sweep egress IP  [MEDIUM · MITIGATED 2026-10-13]

- **Evidence:** Brave Search returns **HTTP 429** to this egress IP; DuckDuckGo HTML
  returns **202**; multiple daily runs recorded the sweep returning no comparable
  results because the primary provider was blocked. Only **DuckDuckGo Lite**
  (`https://lite.duckduckgo.com/lite/`) has returned parseable results (36/36 on
  2026-10-12).
- **Impact:** a run can burn budget retrying a blocked provider and return thin
  evidence; the "visibility" time series is then inconsistent across providers.
- **Fix applied 2026-10-13:** the daily prompt now defines an explicit provider
  order (**Brave → DuckDuckGo Lite → Bing**), falls through **once** on 429/202, and
  records the provider used (`platform`) per row so cross-run comparisons stay honest.
- **Residual:** this is an external rate-limit, not fixable from the repo. A paid
  SERP API or a Perplexity key (P-002) would give a stable, attributable signal.
- **Approval:** Level 1/2 (prompt config).

---

## ISSUE-008 — Other automation sessions mutate the same repo/branch concurrently  [LOW · OPEN]

- **Evidence:** during the 2026-10-12 setup, a concurrent automated run pushed the
  same daily branch and opened PR #30; a separate "Phase 2" session opened PR #31;
  the owner merged #30/#29/#31 within minutes of each other. My setup branch was
  superseded while still open.
- **Impact:** duplicate/overlapping PRs and branch conflicts; wasted effort; risk of
  confusing the audit trail.
- **Mitigation (in use):** conflict-safe rebase-before-push; union-merge append-only
  data; one PR per day's work; the daily prompt opens PRs to `main` and never
  self-merges. **Before doing repo work, always `git fetch` and check for a newer
  `main` and for open PRs on the target branch.**
- **Approval:** informational.
## ISSUE-009 — Daily runs die at the wall-clock ceiling; the platform mislabels it "Sandbox not available"  [HIGH · MITIGATED 2026-10-15]

- **Evidence (2026-10-13):** the scheduled HQ-D run
  `67e154d9-e381-4be1-aa62-3f87c98ce1f6` (cron, `started_at 2026-10-13T13:00:01Z` =
  06:00:01 PT) ended `status: FAILED`,
  `error_detail: "Timed out: Sandbox not available"`,
  `status_detail.kind: "environment_unavailable"`, `phase: "verification"`,
  `conversation_id: null`, `current_phase: "Installing dependencies"`,
  `timeout_at 13:32:07Z`. Elapsed `started_at → timeout_at` = **1926 s**.
- **Re-confirmed (2026-10-15):** the replacement production automation
  `SFPL AI Headquarters Daily` (`1485d659-8663-4776-a507-db0fefed8483`) failed its
  first dispatch `1cda9bca-9cd7-4d43-8eac-dce36998bc7c` with the **identical**
  signature: `environment_unavailable`, `conversation_id: null`,
  `started_at 2026-10-15T17:31:21Z`, `completed_at 2026-10-15T18:03:55Z` =
  **1954 s**. The old automation `e6684830` failed twice the same day (`010cf8d9`
  1941 s, `4f9c7df0` 2004 s) with `kind: "timeout"`.
- **Root cause (corrected 2026-10-15):** the run **runs out of its wall-clock
  budget**. The enforced ceiling is **start + ~1920 s** (~32 min), not the 1800 s in
  the config — measured as `timeout_at - started_at` across four runs (1926, 1947,
  1923, 1922 s). When the platform kills the run it tears down the sandbox, and its
  post-run **verification** step then finds no sandbox and records
  `environment_unavailable` / "Timed out: Sandbox not available". **That string is a
  symptom of the timeout, not proof the sandbox was never provisioned.** The failing
  runs each carried a `sandbox_id` (except `67e154d9`, which still ran 1926 s), and
  the one run that fit its budget (`0883b889`, 947 s) completed normally.
- **Why the first diagnosis was wrong:** the original reading treated the
  `environment_unavailable` string as a provisioning failure and proposed a retry.
  A retry cannot fix a budget overrun — it burns another ~30 min and can race the
  first run's branch. Elapsed time, not the error string, is the discriminator.
- **Impact:** a run that does not fit its ceiling produces nothing durable and is
  easy to misread as infra flakiness. This is the same family as **ISSUE-006**
  (agent overruns its budget); ISSUE-009 is the platform-level restatement.
- **Fix applied 2026-10-15 (commit `897e7be`):** a deterministic pre-stage
  `scripts/daily_measure.py` (~5 s) runs every check and writes
  `growth-engine/data/daily_context.json`, and the master prompt was restructured
  around the real ~1920 s ceiling. Proven: a dispatched run completed in **947 s**.
- **Mitigation kept (retry watchdog):** `SFPL AI Headquarters Daily Retry Watchdog`
  (prompt `automations/ai-headquarters-daily-watchdog.prompt.md`). It re-dispatches
  **once** only on a *fast* failure that never reached the ceiling — a genuine
  provisioning blip. It explicitly does **not** re-dispatch a run that consumed its
  clock.
- **Diagnostic rule — tell the classes apart (the key is `elapsed`, not the error):**
  - `FAILED` with `elapsed ≥ ~1500 s` (≈ the ceiling) → **budget overrun** → fix the
    prompt budget; **do NOT retry**, even if the error says "Sandbox not available".
  - `FAILED` with `elapsed` far below the ceiling, no conversation, sandbox marker →
    **provisioning failure** → retry once.
  - `execution_error` with `KeyError: 'AUTOMATION_AGENT_PROFILE_ID'` → the
    automation has no `agent_profile_id` → **fix the automation config**; retrying
    cannot help.
  Helper: `python3 growth-engine/tests/classify_automation_run.py <runs.json>`.
- **Approval:** Level 2 (create a watchdog automation + prompt config).

---

## ISSUE-010 — Sitemap refresh tool would break directory-hub URLs  [LOW · FIXED 2026-10-15]

- **Evidence:** running `scripts/refresh_sitemap.py` on a copy printed
  `to add: ['academy/index.html', 'case-studies/index.html', 'insurance/index.html',
  'services/index.html']` and `to remove: ['academy/', 'case-studies/',
  'insurance/', 'services/']`. Those hub pages canonical to the directory URL
  (`…/academy/`), so the sitemap would have listed non-canonical URLs.
- **Impact:** a future automated sitemap refresh would degrade canonical alignment.
- **Fix applied 2026-10-15:** `url_of()` now maps `X/index.html` → `X/`; parsing
  and verification use a matching `rel_of()`. Re-run confirms `to add: 0`,
  `to remove: 0`.
- **Approval:** Level 2 (tooling). Branch `intelligence-hq/site-audit-2026-10-15`.

---

## ISSUE-011 — Sitemap `<lastmod>` stale (all 2026-09-24)  [LOW · FIXED 2026-10-15]

- **Evidence:** every `<lastmod>` in `sitemap.xml` read `2026-09-24` while files
  changed through `2026-10-11` (git last-commit dates).
- **Impact:** weaker crawl-scheduling signal; inaccurate freshness.
- **Fix applied 2026-10-15:** `refresh_sitemap.py` now derives `<lastmod>` from the
  file's last git commit date (falls back to mtime). `sitemap.xml` refreshed; no
  URLs added/removed. XML still valid; all 74 URLs 200 live.
- **Regression found the same day:** the git-commit-date signal is meaningless in
  a shallow clone, which is how the automation sandbox checks out the repo. See
  ISSUE-016 — the fix above silently rewrote all 74 URLs to the run date.
- **Approval:** Level 2 (tooling).

---

## ISSUE-012 — `_headers` is inert on GitHub Pages; no HTTP security headers  [LOW · OPEN]

- **Evidence:** `curl -sI https://straightflushplumbingoc.com/` returns no
  `Content-Security-Policy`, `Strict-Transport-Security`, or `X-Frame-Options`.
  The repo's `_headers` file (Netlify/Cloudflare-Pages format) is not honored by
  GitHub Pages legacy hosting.
- **Impact:** security headers absent at the HTTP layer; mitigated by an in-page
  `<meta http-equiv="Content-Security-Policy">` on all 133 pages. Not a ranking
  blocker.
- **Fix (proposed):** add as Cloudflare response-header rules — Level 3 (hosting).
- **Approval:** Level 3.

---

## ISSUE-013 — Link to a `noindex` page + placeholder input phone  [INFO · OPEN]

- **Evidence:** `about.html` links to
  `about/straight-flush-plumbing-orange-county.html` (`noindex,follow`);
  `index.html:549` and `contact.html:120` use
  `title="Phone number, e.g. (949) 555-0123"`.
- **Impact:** cosmetic/cleanliness only. Displayed/tel: NAP is consistent
  (`(949) 374-6524` / `+19493746524`; `78 Cameray Heights`, `Laguna Niguel, CA 92677`).
- **Fix (proposed):** repoint the link; change the example placeholder.
- **Approval:** Level 1 (link) / Level 2 (markup).

---

## ISSUE-014 — Competing/stale "Straight Flush" properties split the entity  [HIGH · OWNERSHIP CONFIRMED]

- **Owner confirmation (2026-10-15):** the owner **does own** the Wix account and
  the base44 URL(s). This is not a third-party problem — it is controllable.
- **Full evidence + remediation plan:** `growth-engine/ENTITY_CONSOLIDATION_PLAN.md`.
- **Automated regression check:** `python3 scripts/entity_consistency_check.py --run`
  (exit 1 while a live duplicate exists).

### Verified state of each host (2026-10-15)

| Host | HTTP | robots | Verdict |
|---|---|---|---|
| `straightflushplumbingoc.com` | 200 | indexable, self-canonical | **canonical** (keep) |
| `straight-flush-plumbing-7fb7cf71.base44.app` | 200 | `index, follow` | **live duplicate — 48 URLs** |
| `straightflushplumb8.wixsite.com` | root 404; `/straightflushplumb-1` **200** | root noindex; page has **no robots meta**, self-canonical | **live duplicate — corrected 2026-10-15, see ISSUE-018** |
| `flush-pro-flow.base44.app` | 404 | — | gone, but still declared as the business `@id` |

> **Correction (2026-10-15, second run):** the Wix row previously read "gone (cleanup
> only)". That was wrong. `https://straightflushplumb8.wixsite.com/` returns 404, but
> the published page `https://straightflushplumb8.wixsite.com/straightflushplumb-1`
> returns **200**, carries no `robots` meta, is self-canonical, shows `tel:9493746524`,
> and ranked **#1** for the brand query `Straight Flush Plumbing & Leak Detection`.
> Two live indexable duplicates exist, not one.

### The live duplicate in detail

`straight-flush-plumbing-7fb7cf71.base44.app` is a **live, indexable** app-builder
site with **48 URLs in its own sitemap**, `Allow: /`, a self-referencing
canonical, and `<title>Straight Flush Plumbing</title>`. It carries the correct
phone `(949) 374-6524` and targets the same cities.

- Service pages mirroring the real site: `/leak-detection`, `/slab-leak-repair`,
  `/drain-cleaning`, `/water-heater`, `/gas-line`, `/sewer-line`, `/pipe-repair`,
  `/repiping-orange-county`, `/water-main-repair`, `/emergency-plumbing`
- 18 city pages: `/plumber-laguna-niguel`, `/plumber-mission-viejo`,
  `/plumber-irvine`, … through `/plumber-laguna-woods`
- **5 blog posts on the same keywords**, e.g.
  `/blog/how-to-detect-slab-leak-orange-county`,
  `/blog/why-water-bill-high-laguna-niguel`
- **Leftover template pages still live and sitemapped:** `/million-dollar-bet`,
  `/analytics`
- **Zero links** to the real site.

### Entity fragmentation (four hosts, one business)

Its JSON-LD declares a **different domain** as the business identity:

```
"@id":  "https://flush-pro-flow.base44.app/#business"
"url":  "https://flush-pro-flow.base44.app"
"name": "Straight Flush Plumbing & Leak Detection"
"telephone": "+19493746524"
```

`flush-pro-flow.base44.app` returns **404** on `/`, so the entity is declared
under a domain that no longer serves a page — a dangling reference.

The real site carries 3 JSON-LD blocks and **zero** references to either
duplicate, so the duplicates are not disavowed from the real side either.

### Unverified claims on the duplicate (must not be republished without evidence)

- "24/7 emergency service"
- "Orange County's **premier** leak detection and emergency plumbing specialists"
- "**same-day** slab leak detection"

### Recommended fix (owner action, Level 3 — not auto-applied)

1. Delete/unpublish the base44 app (highest value). `410 Gone` is the correct
   signal; redirect only if you control the domain.
2. Delete the Wix site from the account (all pages already 404).
3. Request removal in Google Search Console and Bing Webmaster Tools.
4. Re-run `scripts/entity_consistency_check.py --run` → must exit 0.
5. Re-run the brand-name Tavily control query → only the real domain should appear.

### Explicitly NOT recommended

- **Do not** add `sameAs` links from the real site to the duplicates. `sameAs`
  asserts "this is also me" and would *strengthen* the stale association.
- **Do not** copy the base44 blog posts verbatim to the real site — that recreates
  the duplicate-content problem on your own domain.

- **Status:** **OPEN** — ownership confirmed, findings verified, no external change
  applied. Awaiting owner go-ahead for steps 1–3.

---

## ISSUE-015 — Site absent from conventional search for all 10 target queries  [HIGH · OPEN]

- **Evidence:** 2026-10-15 Tavily sweep of the curated 10-query suite from
  `KEYWORD_UNIVERSE.md` → `straight_flush: absent` for all 10 (see ISSUE-014 for
  the control that validates the matcher). Competitors consistently present:
  `efficientplumbing.com`, `rotorooter.com`, `barkerandsonsplumbing.com`,
  `scottenglishplumbing.net`, `mckplumb.com`, `yelp.com`, `bbb.org`.
- **Impact:** the core business problem the growth engine exists to fix, now
  measured reproducibly. Baseline established 2026-10-15.
- **Fix:** content / service-area work in the Priority 4-5 band of the master
  prompt. Do **not** treat as a single-cause problem.
- **Baseline record:** `growth-engine/data/ai_visibility_history.jsonl`
  (rows with `platform: tavily_search`, `test_type: conventional_proxy`).
- **Approval:** Level 2 for site content changes.
- **Status:** **OPEN** — baseline recorded, work not started.

---

## ISSUE-016 — `refresh_sitemap.py` `<lastmod>` is not idempotent in a shallow clone  [MEDIUM · FIXED 2026-10-15]

- **Evidence:** the automation sandbox checks the repo out with `git clone --depth 1`.
  In a depth-1 clone `git log --name-only HEAD` yields exactly **one** commit — the
  grafted fetch commit — so every path maps to the same date:

  ```
  $ git rev-parse --is-shallow-repository      # true
  $ git log --format=%cI --name-only HEAD | head -2
  2026-10-15T11:51:22Z
  ```
  Measured on PR #38's head (`493a9bf`): `<lastmod>2026-10-15</lastmod>` on **54** of
  74 URLs. `main` carries **none** dated `2026-10-15`; its distribution is
  `2026-09-25 ×38`, `2026-10-05 ×1`, `2026-10-07 ×3`, `2026-10-11 ×32`.
- **Impact:** a daily job stamps *every* URL with the run date. That is the exact
  defect ISSUE-011 was meant to fix, so the freshness signal in `sitemap.xml`
  becomes noise and the diff is non-reproducible day to day. It also makes the
  daily report's "sitemap changed" claim meaningless.
- **Fix applied 2026-10-15** (`scripts/refresh_sitemap.py`):
  1. Detect a shallow repo (`git rev-parse --is-shallow-repository`).
  2. Resolve each URL's date from its **own** last commit; when the repo is
     shallow that is untrustworthy, so use mtime **only** for files the working
     tree actually modified (`git status --porcelain`) and otherwise preserve the
     existing `<lastmod>` verbatim.
  3. Print a `lastmod refreshed: N` count so a regression is visible in the run log.
- **Verification:** in a real depth-1 clone the tool leaves `lastmod` untouched
  (refresh count 0, no diff on rerun) and still bumps a page whose content changed
  (`2026-09-25 → 2026-10-15`). Regression test
  `growth-engine/tests/test_refresh_sitemap.py` builds a shallow clone in a temp
  dir and asserts all three behaviours. Full suite: 125 tests pass.
- **Open item:** PR #38 ships a *different* lastmod implementation with the same
  shallow-clone defect, and its own `sitemap.xml` already shows 54/74 URLs stamped
  `2026-10-15`. The two changes conflict. Recommend landing the guarded version and
  regenerating `sitemap.xml` from it; do not merge both.
- **Approval:** Level 2 (tooling).

---

## ISSUE-017 — Client API keys are read from the wrong env var name  [HIGH · FIXED 2026-10-15]

- **Evidence:** `growth-engine/tavily_search.py` and `growth-engine/ai_agent_client.py`
  read only the vendor-documented all-caps names (`TAVILY_API_KEY`,
  `PERPLEXITY_API_KEY`). The platform injects its secrets **case-sensitively** as
  `Tavily_api_key` and `Perplexity_api_key`, so a scheduled run saw "no key" and
  skipped the entire AI-visibility sweep while reporting success.
- **Impact:** silent loss of the daily visibility sweep — the primary evidence
  stream for ISSUE-015. A missing key was indistinguishable from "no data".
- **Fix applied 2026-10-15:** both clients resolve a list of accepted env names
  (`API_KEY_ENV_VARS`), with the canonical all-caps name still winning when both
  are set. The `Perplexity_api_key` / `Tavily_api_key` casing is accepted.
- **Verification:** platform-cased cases added to `tests/test_perplexity_agent.py`
  and `tests/test_tavily_search.py`; the 2026-10-15 run recorded a real Tavily row
  (`platform: tavily_search`, `test_type: conventional_proxy`).
- **Approval:** Level 2 (tooling).

---

## ISSUE-018 — Entity check missed a live duplicate because it probed only the host root  [HIGH · FIXED 2026-10-15]

- **Evidence:** `scripts/entity_consistency_check.py` checked `https://<host>/` and
  nothing else. `straightflushplumb8.wixsite.com` answers **404** at its root but
  serves `https://straightflushplumb8.wixsite.com/straightflushplumb-1` with
  **HTTP 200**, no `robots` meta, a self-referencing canonical, `<title>Home |
  Straight Flush Plumbing & Leak Detection</title>`, and `tel:9493746524`.
  The check classified the host `gone`, so `summarize()` reported `ok` for that
  host and the duplicate went unreported in **8** consecutive records on 2026-10-15
  (`10:31:18Z`, `11:52:02Z`, `11:58:06Z`, `12:04:47Z`, `12:04:52Z`, `19:22:45Z`,
  `19:22:50Z`, `19:26:07Z` — all `verdict: gone`, `http_status: 404`).
- **Impact:** the primary automated control for ISSUE-014 was giving a false
  negative on one of the two owned duplicate hosts. A Wix site-builder host
  routinely 404s its root while still serving published pages, so the defect is
  structural, not a one-off.
- **External corroboration:** in the 2026-10-15 Tavily sweep the Wix page ranked
  **#1** for the brand query `Straight Flush Plumbing & Leak Detection`, ahead of
  `straightflushplumbingoc.com/terms-of-service.html` (#5). A live duplicate is
  actively outranking the canonical site for the business name.
- **Fix applied 2026-10-15:** added `DUPLICATE_HOST_PATHS` (known published page
  paths per duplicate host) and changed `check_host()` to probe the root plus those
  paths, keeping the **most severe** verdict via `_VERDICT_RANK` and returning that
  URL's evidence. A 404 root can no longer mask an indexable page.
- **Verification:** `python3 scripts/entity_consistency_check.py --run --append`
  now reports `live_duplicates: ['straight-flush-plumbing-7fb7cf71.base44.app',
  'straightflushplumb8.wixsite.com']` at `2026-10-15T19:30:24Z`, with the Wix entry
  carrying `url: .../straightflushplumb-1`, `http_status: 200`. Five regression
  tests added in `growth-engine/tests/test_entity_consistency_check.py`
  (`TestDuplicateHostPaths`); full suite 130 tests pass.
- **Owner action (Level 3, not automated):** unpublish the Wix page
  `straightflushplumb8.wixsite.com/straightflushplumb-1` (or the whole Wix site).
  Per `ENTITY_CONSOLIDATION_PLAN.md`, consolidation here means **removal** — never
  add a `sameAs` link to this host, and never copy its content onto the real site.
- **Approval:** Level 2 (tooling) for the check fix; Level 3 (owner) for the removal.

---

## ISSUE-019 — Secret injection depends on the command text, so a bare pre-stage command records a false BLOCKED  [HIGH · FIXED 2026-10-15]

- **Evidence:** the platform injects a registered secret only into a shell command
  whose *text* names the key. The documented pre-stage is a bare
  `python3 scripts/daily_measure.py`, which names no secret, so the child process
  started with `Tavily_api_key` unset and `check_visibility()` returned
  `blocked: true, detail: "no Tavily key in this environment"` — while the key was
  registered and working. The 2026-10-15 second run lost its entire sweep to this
  and had to re-run the sweep manually with the secret named.
- **Distinct from ISSUE-017:** ISSUE-017 fixed the *client* to accept the
  platform-cased env name. That fix is necessary but not sufficient — the value is
  only present at all if the invoking command names the key. Correct client code
  still sees an empty environment.
- **Impact:** silent loss of the daily visibility sweep, reported as a credential
  blocker that does not exist. Same failure mode as ISSUE-017 by a different cause.
- **Fix applied 2026-10-15:** the pre-stage command in
  `ai-headquarters-blueprint/01-MASTER-AGENT-PROMPT.md` now names the secret
  (`export Tavily_api_key="${Tavily_api_key}"`) with an explanation, and
  `check_visibility()` carries the remedy in its `blocked` note so the next run
  self-corrects rather than repeating the false blocker.
- **Verification:** regression test
  `test_blocked_note_names_the_injection_workaround` asserts the note names the key
  and the command; full suite 141 tests pass. A pre-stage run with the secret named
  recorded `visibility_sweep | ok=True` and 62 real rows.
- **Approval:** Level 2 (tooling).

---

## ISSUE-020 — Sitemap cross-check compared filesystem paths against URL paths, inventing 5 missing pages  [MEDIUM · FIXED 2026-10-15]

- **Evidence:** `seo_audit.py` §4 built one set from filesystem relative paths
  (`services/index.html`) and the other from sitemap URL paths (`/services/`), so the
  two never matched for any directory hub. It reported **5 indexable pages missing
  from `sitemap.xml`** and **59 absent pages**, and separately flagged the same
  directory hubs as non-self-canonical. The live cross-check in URL space reports
  `sitemap URLs: 74, in sitemap but NO file: 0, indexable file NOT in sitemap: 0,
  sitemap URLs whose canonical points elsewhere: 0`.
- **Distinct from a real gap:** the 59 "absent" pages are `noindex` legacy mirrors,
  which are *correctly* absent from the sitemap. Treating them as indexable inverted
  the meaning of the control — a clean sitemap looked like a broken one.
- **Impact:** the 2026-10-15 second run's priority #4 asked the owner to "decide the 5
  indexable pages missing from `sitemap.xml`". No such pages exist, so an owner action
  item was raised against a defect in our own tool. The same defect would have buried
  a genuine missing page in false positives.
- **Fix applied 2026-10-15:** `url_path(rel)` and `rel_path(url)` map between
  filesystem and canonical URL space (`index.html` ⇄ directory URL); `PageParse` now
  sets `is_stub` when `meta_robots` contains `noindex`; `sitemap_coverage(pages,
  sm_urls)` normalizes both sides to URL space and excludes stubs. `main()` §4 calls
  the helper.
- **Verification:** `growth-engine/tests/test_seo_audit_sitemap.py` — 14 tests
  including `test_every_indexable_page_is_in_the_sitemap`,
  `test_every_sitemap_url_has_a_file`, `test_every_sitemap_url_is_self_canonical`,
  `test_directory_index_maps_to_directory_url`, asserted against the shipped site.
  Full suite 155 tests pass; `seo_audit.py` exits 0.
- **Approval:** Level 2 (tooling).

## ISSUE-021 — Seven city-chip links pointed at non-existent anchors  [LOW · RESOLVED 2026-10-15]

- **Evidence:** seven `"Also serving communities near {City}"` chips in
  `cities/*.html` linked to `../service-areas.html#<slug>`, but `service-areas.html`
  contains no matching `id` anchors, so every link landed at the top of the hub page
  (dead fragment) and bypassed the city page that does exist.
- **Impact:** weak internal-link graph on the city cluster (a local-search relevance
  signal) plus dead-fragment links.
- **Fix applied 2026-10-15:** chips now link the sibling city pages directly
  (`scripts/patch_city_internal_links.py`, idempotent). `validate_knowledge_base.py`
  gained a dead-fragment guard so this cannot regress.

---

## ISSUE-022 — Sitemap: stale/uniform `lastmod` + `case-studies/` section root missing  [LOW · RESOLVED 2026-10-15]

- **Evidence:** all 74 `lastmod` values were `2026-09-24`; the `case-studies/`
  section root had 0 sitemap entries while `academy/`, `services/`, `insurance/`
  section roots were listed.
- **Fix applied 2026-10-15:** `scripts/refresh_sitemap.py` now (a) sets `lastmod`
  from each file's real last git commit date (verifiable) instead of the checkout
  mtime, and (b) emits section roots in their canonical trailing-slash URL form
  (`/case-studies/`), so every listed URL matches its page canonical. `lastmod` now
  shows four real dates (2026-09-25/10-05/10-07/10-11). Sitemap remains 74 URLs,
  fully in sync with the indexable set.

---

## ISSUE-023 — Templated, near-duplicate meta titles/descriptions across 21 city pages  [LOW · RESOLVED 2026-10-15]

- **Evidence:** the 21 `cities/*.html` pages used formulaic titles/descriptions
  ("Plumber in {City}, CA | …"), a cannibalization/quality risk for the local
  cluster.
- **Fix applied 2026-10-15:** each city page now has a unique title (≤60c) and a
  unique description (120–160c) derived from that page's own verified content
  (e.g. housing-era/pipe-material differences), not city-name substitution
  (`scripts/patch_city_meta.py`, idempotent). Duplicate-description clusters fell
  from 52 → 31 (the remainder are the intentional noindex root stubs).
  `validate_knowledge_base.py` now fails on any duplicate title/description among
  indexable pages.
- **Caveat:** the city pages are the noindex-canonicalized targets of the root
  stubs (ISSUE-004); differentiation improves quality but does not by itself make
  them rank — that still needs content depth and authority work.

---

## ISSUE-024 — Automation API returns zero automations for this session's credential  [MEDIUM · OPEN / INVESTIGATE]

- **Evidence (2026-10-15):** `GET https://app.all-hands.dev/api/automation/v1`
  with the session's `OPENHANDS_API_KEY` returns `{"automations":[],"total":0}`
  (HTTP 200), while `growth-engine/KNOWN_ISSUES.md` (ISSUE-005) documents two
  active loops (`SFPL Intelligence HQ Daily 6 AM`, `HQ-W`) plus a Sentinel job.
- **Additional evidence (2026-10-15, follow-up):**
  - The key **is valid** and belongs to the **correct owner account**:
    `GET /api/v1/settings` returns `email: straightflushplumbing03@gmail.com`.
    (Unauthenticated → 401; a bad key → `Invalid or expired API key`.)
  - The list is **genuinely empty for that account**, not a permissions/scope
    artifact: `GET /api/automation/v1/5dc89b41-…` (the HQ-D id recorded in
    `automations/README.md`) returns **404 `{"detail":"Automation not found"}`**,
    and `?limit=100`, `enabled=false`, `include_disabled=true`, `all=true` all
    return `total:0`.
  - No local automation service is running (`ss`/`netstat` show no listeners on
    8000/8001/3000).
  - Prior KB state: the same key saw the loops **ACTIVE** on 2026-10-12
    (`INTEGRATION_STATUS.md`), so they existed and have since disappeared from
    the account's list.
- **Impact / not verified:** the automations are no longer present under this
  account as of 2026-10-15. Whether they were **deleted**, **disabled and purged**,
  or are owned by a **different account**, cannot be determined from here. The
  dates/ids in the KB are prior evidence, not proof of current state.
- **Owner action:** check OpenHands Cloud → Automations under
  `straightflushplumbing03@gmail.com`; if the two loops are gone, recreate them
  from the canonical prompts in `growth-engine/automations/` (HQ-D `0 6 * * *` PT,
  HQ-W `0 6 * * 1` PT) and record the new ids in `automations/README.md`.
- **Approval:** informational (recreating automations is a Level 3 action).

---

## ISSUE-025 — Over-length `<title>` tags on 29 indexable pages  [LOW · RESOLVED 2026-10-15]

- **Evidence:** 29 indexable pages had titles of 61–89 characters (mostly a
  redundant "| Leak Detection Academy" / "| Orange County" tail); one was 89c.
- **Impact:** Google truncates title links beyond ~60c in the SERP; truncation can
  hurt CTR and invites Google to rewrite the link.
- **Fix applied 2026-10-15:** shortened to <=60c keeping the primary keyword and
  intent (`scripts/patch_titles.py`, idempotent). Two case-study titles that would
  otherwise have collided were differentiated. 0 indexable titles now exceed 60c;
  unique-title/length guards added to `validate_knowledge_base.py`.

---

## ISSUE-026 — Two indexable pages had no social (Open Graph/Twitter) metadata  [LOW · RESOLVED 2026-10-15]

- **Evidence:** `service-areas.html` and
  `academy/annual-plumbing-checkup-checklist.html` were the only indexable pages
  missing `og:*`/`twitter:*` tags.
- **Fix applied 2026-10-15:** added the site's standard social block, reusing the
  existing shared `og:image` (`assets/img/lance-hero.jpeg`) — no new asset.

---

## ISSUE-027 — The live automation prompt has drifted from its repo source of truth, and a builder could revert the schedule  [HIGH · OPEN]

- **Evidence (2026-10-16):**
  - The live job `1485d659-8663-4776-a507-db0fefed8483` prompt and
    `ai-headquarters-blueprint/01-MASTER-AGENT-PROMPT.md` (its documented source)
    **differ**. The live prompt contains a section `### Merging your own pull
    request` granting self-merge authority; that text exists **nowhere** in the
    repository (`git log -S` finds no commit adding it). The repo prompt instead
    states "**Never merge your own pull request.**"
  - PRs #50, #51, #52 and #53 were all authored by `straightflushplumbing03` **and
    merged by `straightflushplumbing03`** on 2026-10-16. The repo policy forbids
    self-merge, so either the live prompt overrides the repo, or a human merged.
    This must be resolved by the owner, not assumed.
  - The live prompt was rewritten repeatedly during the session
    (`updated_at` advanced 02:33 to 02:37 while a run was `RUNNING`), so a
    concurrent session edits its own live prompt.
  - `build_payload.py` **hardcoded** `0 6 * * *`. Re-running it to recreate the
    job would have silently reverted the schedule to every day.
- **Impact:** The prompt that actually runs is not the prompt in the repo, so
  review of `01-MASTER-AGENT-PROMPT.md` is not review of the live behaviour. The
  hardcoded builder is a second path back to the old daily schedule. Governance
  (self-merge) is ambiguous.
- **Fix applied 2026-10-16 (partial):** `build_payload.py` now derives the cron
  from the prompt source instead of restating it, with a regression test
  (`growth-engine/tests/test_build_payload.py`). This removes the schedule-revert
  path.
- **Still open / owner decision:** (1) Decide the self-merge policy and make the
  live prompt and the repo agree. (2) Reconcile the live prompt with
  `01-MASTER-AGENT-PROMPT.md` — or declare the repo file the source and re-push
  it. Agents must not overwrite a live prompt another session is editing.
- **Approval level:** Level 3 (owner) for the policy decision; the builder fix is
  Level 2.
