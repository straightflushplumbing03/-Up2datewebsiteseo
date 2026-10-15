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

## ISSUE-007 — No security response headers (GitHub Pages ignores `_headers`)  [MEDIUM · BLOCKED ON CLOUDFLARE TOKEN]

- **Evidence (live, 2026-10-15):** `curl -sI https://straightflushplumbingoc.com/`
  returns no `Strict-Transport-Security`, `Content-Security-Policy`,
  `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, or `Cross-Origin-*` headers. The repo ships a `_headers`
  file, but GitHub Pages does not honor it.
- **Impact:** HSTS is an HTTPS-hardening/ranking-adjacent signal; the CSP,
  clickjacking and MIME-sniffing protections are absent site-wide.
- **Prepared fix:** `scripts/cloudflare_add_security_headers.py` (read-only by
  default; `--apply` writes a Cloudflare Transform Rule → Modify Response Header
  with the exact `_headers` values). Not applied — requires owner approval and a
  `CLOUDFLARE_API_TOKEN` with `Zone:Transform Rules:Edit`.
- **Approval:** Level 3 (hosting/security). Awaiting owner action.

---

## ISSUE-008 — Seven city-chip links pointed at non-existent anchors  [LOW · RESOLVED 2026-10-15]

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

## ISSUE-009 — Sitemap: stale/uniform `lastmod` + `case-studies/` section root missing  [LOW · RESOLVED 2026-10-15]

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

## ISSUE-010 — Templated, near-duplicate meta titles/descriptions across 21 city pages  [LOW · RESOLVED 2026-10-15]

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

## ISSUE-011 — Automation API returns zero automations for this session's credential  [MEDIUM · OPEN / INVESTIGATE]

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

## ISSUE-012 — Over-length `<title>` tags on 29 indexable pages  [LOW · RESOLVED 2026-10-15]

- **Evidence:** 29 indexable pages had titles of 61–89 characters (mostly a
  redundant "| Leak Detection Academy" / "| Orange County" tail); one was 89c.
- **Impact:** Google truncates title links beyond ~60c in the SERP; truncation can
  hurt CTR and invites Google to rewrite the link.
- **Fix applied 2026-10-15:** shortened to <=60c keeping the primary keyword and
  intent (`scripts/patch_titles.py`, idempotent). Two case-study titles that would
  otherwise have collided were differentiated. 0 indexable titles now exceed 60c;
  unique-title/length guards added to `validate_knowledge_base.py`.

---

## ISSUE-013 — Two indexable pages had no social (Open Graph/Twitter) metadata  [LOW · RESOLVED 2026-10-15]

- **Evidence:** `service-areas.html` and
  `academy/annual-plumbing-checkup-checklist.html` were the only indexable pages
  missing `og:*`/`twitter:*` tags.
- **Fix applied 2026-10-15:** added the site's standard social block, reusing the
  existing shared `og:image` (`assets/img/lance-hero.jpeg`) — no new asset.
