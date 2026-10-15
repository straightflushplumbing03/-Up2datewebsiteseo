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

## ISSUE-002 — Self-reported `aggregateRating` in LocalBusiness JSON-LD  [MEDIUM · OPEN]

- **Evidence:** `index.html` JSON-LD contains `aggregateRating` (4.8/74) and
  `review` on a `Plumber` type.
- **Impact:** Google's structured-data policy: review/rating markup must be
  genuinely independent and about the entity; self-serving ratings on a business
  may be ignored or flagged. Low risk but a hygiene item.
- **Fix (proposed, evidence-gated):** confirm the rating matches the live Yelp/
  Google profiles; consider moving ratings to a verified third-party reference or
  removing if not corroborated. See `proposals/`.
- **Approval:** Level 2 (metadata/content using verified facts) once corroborated.

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
