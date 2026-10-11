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

## ISSUE-005 — Duplicate automation coverage  [LOW · OPEN]

- **Evidence:** "Strategist: Daily SEO Action Plan" (06:30 PT) and "Scout: Daily
  Competitor Intel" (05:30 PT) plus "Sentinel" retry overlap in scope; the
  Master spec describes separate morning/technical/improvement/weekly/monthly jobs.
- **Impact:** redundancy/token cost; possible conflicting changes.
- **Fix:** consolidate into the Master spec's A–E schedule (see `proposals/`).
- **Approval:** Level 2 (automation config).
