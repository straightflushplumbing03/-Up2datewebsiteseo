# Known Issues — Straight Flush Growth Engine

Severity: **critical** (blocks the business), **high**, **medium**, **low**.
Each issue: evidence, impact, fix, status, approval level.

---

## ISSUE-001 — Cloudflare managed challenge blocks ALL crawlers  [CRITICAL · OPEN]

- **Evidence:** 2026-10-09, every path (`/`, `/robots.txt`, `/sitemap.xml`,
  `/llms.txt`, `/index.html`, `/services/leak-detection.html`,
  `/cities/laguna-niguel.html`) returns `HTTP/2 403` with header
  `cf-mitigated: challenge`, for Googlebot, Bingbot, GPTBot, OAI-SearchBot,
  ClaudeBot, PerplexityBot, Applebot and plain curl.
- **Impact:** Google, Bing, and every AI answer engine cannot read the site.
  Zero organic, Maps-adjacent, or AI-search visibility is achievable while this
  persists. All on-page SEO/AEO work is inert.
- **Fix (owner, Cloudflare dashboard — not a repo change):**
  1. Security → Settings → **Security Level: Medium** (not "I'm Under Attack").
  2. **Bot Fight Mode: OFF** (or add the WAF skip rule).
  3. WAF → Custom rules → `allow-verified-crawlers` with expression
     `(cf.client.bot)`, action **Skip → All remaining custom rules**.
  4. Also: Email Address Obfuscation **OFF**, Rocket Loader **OFF** (see
     `CLOUDFLARE-SETUP.md` §2c–2d).
- **Verify after fix:** `curl -sI https://straightflushplumbingoc.com/ | grep -i cf-mitigated` → no output; homepage → 200.
- **Approval:** Level 3 (hosting/security config). **Cannot** be fixed from the repo.
- **Status:** OPEN. Logged 2026-10-07; re-verified 2026-10-09. Owner action required.

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
