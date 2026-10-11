# Strategy Log — Straight Flush Plumbing & Leak Detection

Reverse-chronological. One entry per run. Fields: date, change, reason, target,
competitor insight, expected outcome, result, keep/modify/revert.

---

## 2026-10-09

**Status:** Master growth-engine baseline established. Read-only research +
additive documentation. **No website page/schema/copy changed.**

### Created — permanent knowledge base (`growth-engine/`)

Verified business profile, service catalog, service areas, approved-claims and
brand-voice rules, keyword universe, AI-visibility methodology, integration
status, issue register, experiment log, changelog, JSONL observation data, and
a baseline report. See `growth-engine/README.md` for the read order.

### 🚨 BLOCKER re-confirmed — Cloudflare still returns 403 to every crawler

Re-verified 2026-10-09: `HTTP/2 403` with `cf-mitigated: challenge` on `/`,
`/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/index.html`,
`/services/leak-detection.html`, `/cities/laguna-niguel.html` — for Googlebot,
Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Applebot and plain
curl. Identical to the 2026-10-07 finding; still **unresolved**. Tracked as
`growth-engine/KNOWN_ISSUES.md` ISSUE-001. Owner action in the Cloudflare
dashboard is required (Level 3); it cannot be fixed from the repo. This remains
the single highest-impact item — all on-page work is inert until lifted.

### Baseline visibility (conventional-search proxy only)

Tested 5 queries via Brave Search (the only working conventional proxy in this
environment; **not** an AI-platform result). Straight Flush was **absent from
all 5** (plumber/slab-leak/emergency/best in Laguna Niguel; leak detection OC).
Repeat competitors: scottenglishplumbing.net (5/5), efficientplumbing.com,
barkerandsonsplumbing.com, rotorooter.com. Full data in
`growth-engine/data/ai_visibility_history.jsonl`.

### AI answer engines — unverified, honestly

No AI answer engine (ChatGPT/Claude/Gemini/Copilot/Grok/Perplexity/Google AIO)
could be executed in this environment (no credentials; sites 403/JS-only to
scripted clients). Recorded as **unverified**, never as zero visibility. See
`growth-engine/AI_VISIBILITY_METHODOLOGY.md` and `INTEGRATION_STATUS.md`.

### Evidence-backed gap

Tier-A competitors pair a **city page with a specific service page** (e.g.
Scott English `/service-area/plumber-in-laguna-niguel`; Efficient
`/laguna-niguel-plumbers/` + water-leak page). SF has strong city and service
pages but few city×service combinations. Candidate work once crawlers can reach
us (real content only; no thin doorway pages).

### Verification

`growth-engine/tests/validate_knowledge_base.py` → OK (133 HTML files, one
title/description/canonical/h1 each; JSONL + baseline JSON parse). Crawler
health reproducible via `growth-engine/tests/crawler_access_check.sh`.

**Branch:** `growth-engine/baseline-2026-10-09` (PR opened for owner review).
**Proposals:** `growth-engine/proposals/2026-10-09-priority-actions.md` (P-001
Cloudflare = urgent).
## 2026-10-08

**Status:** Cloudflare indexing blocker still active (re-verified). Deployed safe
AEO/schema fixes + fixed 2 broken internal links on the flagship leak-detection
page.

### 🚨 BLOCKER — UNCHANGED, still the #1 issue

- `https://straightflushplumbingoc.com/*` still returns `HTTP/2 403` with
  `cf-mitigated: challenge` to every crawler and plain curl. GitHub Pages origin
  itself is healthy (`185.199.108-111.153` → HTTP 200, 66119 bytes on `/`).
- **No repo-side fix exists.** Must be done in the Cloudflare dashboard:
  Security Level = Medium, Bot Fight Mode OFF (or the `allow-verified-crawlers`
  WAF skip rule, expression `cf.client.bot`). See `CLOUDFLARE-SETUP.md` §2a–2b.
- All on-page work remains inert until this is fixed. Escalated again.
## 2026-10-08

**Status:** Breadcrumb/schema truncation bug fixed across all generated pages and
root-cause patched in the generators. Slab-leak service page strengthened with a
diagnostic FAQ cluster.

### Changes deployed (SAFE)

| # | Change | Target | Reason | Expected outcome |
|---|--------|--------|--------|------------------|
| 1 | Added visible **FAQ section** + matching `FAQPage` JSON-LD (5 Q&A, text verbatim) | `services/leak-detection.html` | This was the **only** service page with no FAQ block and no FAQPage schema | FAQ/AI-answer eligibility on the top leak query; closes gap vs. city pages which already had it |
| 2 | Added missing `Service` JSON-LD | `services/slab-leak-detection.html` | Page had FAQPage + Breadcrumb but no Service schema (flagship service, inconsistency vs. pex/water-heater) | Service-level entity clarity for SERP + AI |
| 3 | Fixed 2 wrong related-reading links | `services/leak-detection.html` | "Does Insurance Cover This?" and "Repair vs. Reroute vs. Repipe" cards pointed at generic `../contact.html`; the real guides were orphaned from the service page | Sends service traffic to the correct guide (deeper engagement), builds Service→Guide internal linking |
| 4 | Added 3rd related card → `../guides/leak-detection-cost.html` | `services/leak-detection.html` | Cost is a top commercial-investigation intent for detection | Captures cost-intent users |
| 5 | Corrected `BreadcrumbList` URL | `services/slab-leak-detection.html` | Position-2 pointed at `/leak-detection.html` (a `noindex` stub) instead of the canonical `/services/leak-detection.html` | Breadcrumb points at the real indexable page |

### Competitor intelligence (2026-10-08, Brave results)

Money queries surfaced: `evansleakdetection.com`, `leakstar.com`,
`efficientplumbing.com`, `allclearplumbingpros.com`, `scottenglishplumbing.net`,
`streamlineplumbing.org`, plus `rooterhero.com`, `calischoice.com`,
`ezplumbingusa.com`, `pacificcoastcopperrepipe.com`,
`americanleakdetection.com`, `precisionplumbingoc.com`.

- **evansleakdetection.com** `/laguna-niguel-slab-leak-detection/` — ~3,255
  words, but **no FAQPage, no Service, no LocalBusiness, no HowTo schema** and
  only 5 generic H2s. Strong on raw length, weak on structure → Straight Flush's
  structured, schema-rich pages are the better AEO play. **No copying needed.**
- `rooterhero.com`, `calischoice.com` etc. are large multi-city franchises with
  templated city pages — exactly the doorway-page pattern SF must avoid.
- Takeaway: competitors compete on **page length and city coverage**; SF's moat
  is **diagnostic depth + clean structured data**, which we reinforced today.

### Verification performed

- All JSON-LD on both changed pages parses; `services/leak-detection.html` now
  carries `Service` + `FAQPage` + `BreadcrumbList`; slab page adds `Service`.
- Each changed page: exactly one `<title>`, one meta description, one canonical,
  one `<h1>`. FAQ visible Q&A matches schema `name` verbatim.
- Full-site relative-link sweep: **0 broken internal `.html` links**.
- `scripts/seo_audit.py`: 0 broken links, 0 indexable orphans, 0 canonical
  anomalies, 0 duplicate titles on indexable pages, 0 missing alt.

### Not changed (correct as-is)

- The `about/straight-flush-plumbing-orange-county.html` page is `noindex,follow`
  and intentionally excluded from the sitemap — leaving alone.
- 59 root-level `noindex` stubs with canonicals → intentional; not duplicate
  content.

### Growth opportunity / moat

Highest-value durable asset once crawling is restored: the **slab-leak diagnostic
decision tool** (symptom → likely cause → detection method → repair/reroute/
repipe), extending `plumbing-health-score.html`. Competitors cannot fake it.

### Strategic insight

The site's structured-data and internal-linking posture now exceeds every
competitor inspected; the company's actual bottleneck remains the Cloudflare
edge block, which makes all of it invisible.

**Strategy confidence:** HIGH on findings, but growth outcome is **blocked** on
the Cloudflare fix (owner action required).
| 1 | Breadcrumb label truncation removed | `scripts/gen_academy_articles.py` (`h1[:28]+"..."`), `scripts/gen_academy_batch2a.py`, `scripts/gen_academy_batch2b.py` (`trail_label = h1`) | Generated breadcrumbs and BreadcrumbList JSON-LD `name` values were being cut mid-string (e.g. “Why do two plumbers give dif...”) | Clean, full breadcrumb labels in visible UI **and** structured data; no mid-word truncation in SERPs |
| 2 | Regenerated 38 HTML pages + hand-fixed 2 academy pages | `academy/*.html` and other generated pages | Carry the corrected breadcrumb + JSON-LD strings | Parity between visible breadcrumb and `BreadcrumbList` |
| 3 | Added 3 diagnostic FAQs (visible + `FAQPage` JSON-LD) | `services/slab-leak-detection.html` | Competitor `barkerandsonsplumbing.com/slab-leak-repair/` (~3,000 words, `BlogPosting`+`BreadcrumbList` schema) surfaces questions our page did not answer; AI answer engines key on exact-match Q&A | Capture “slab leak vs underground leak”, “detect under tile/hardwood”, “does insurance cover slab leaks”; eligible for FAQ rich results + AI extraction |
| 4 | Added two contextual internal links in the new insurance FAQ | `services/slab-leak-detection.html` → `insurance/documentation-checklist.html`, `insurance/does-insurance-cover-slab-leaks.html` | Service → Insurance internal-link relationship | Stronger topical clustering + crawl paths |

**Generator root cause:** the `build.py` `breadcrumbs(prefix, trail)` helper
truncated labels; the academy generators also fed a truncated `trail_label`.
Both paths are now patched so the fix cannot regress on the next build.

**Verification performed:** zero invalid JSON-LD across all HTML; zero breadcrumb
truncation `...` artifacts; 0 broken internal links on all 74 indexable pages
(59 root-level stubs remain intentional `noindex`); all 6 FAQ Q&A pairs on the
slab-leak page parse and match visible copy.

### Competitor watch

- `barkerandsonsplumbing.com` — `/slab-leak-repair/` is ~3,000 words with
  `BlogPosting` + `BreadcrumbList` schema and a video, but **no `FAQPage`
  markup**, and its H2 structure is dominated by boilerplate (“Enjoy our video”,
  “Please complete and submit”). Our page already wins on FAQ schema; we now
  also close part of the content-depth gap.
- `saddlebackplumbing.com` — currently has **no reachable slab-leak or
  leak-detection page**; `/slab-leak-detection/`, `/leak-detection/`,
  `/plumbing-repair/` all 404. Weak live footprint for the leak intent.
- Note: sandbox search engines were geo-misleading (returned out-of-market
  results), so SERP claims are deliberately limited; only directly-fetched
  competitor site facts are recorded.

### 🚨 BLOCKER (unchanged)

Cloudflare managed challenge still returns `HTTP/2 403 cf-mitigated: challenge`
to all crawlers. All on-page work above is **inert until Cloudflare Security →
Settings exposes the site to Googlebot/Bingbot/AI crawlers** (see 2026-10-07
entry and `CLOUDFLARE-SETUP.md` §2a–2b). This remains the single highest-value
action and cannot be fixed from the repo.

### Strategic insight

Our on-page markup and FAQ coverage now match or exceed the strongest visible
local competitor; the business is still capped by the edge block, so the
Cloudflare fix remains worth more than any further page work.

---

## 2026-10-07

**Status:** Site-wide indexing blocker confirmed (see Blockers). Safe schema +
sitemap fixes deployed.

### 🚨 BLOCKER — Cloudflare managed challenge returns 403 to all crawlers

- Every request to `https://straightflushplumbingoc.com/*` returns
  `HTTP/2 403` with `cf-mitigated: challenge` — homepage, `/robots.txt`,
  `/sitemap.xml`, `/llms.txt`, `/index.html`.
- Confirmed with Googlebot, Bingbot, GPTBot, Safari and plain curl UAs: all 403.
- This is a **Cloudflare "Under Attack Mode" / Bot Fight Mode managed
  challenge**. Because crawlers do not execute the JS challenge, Google, Bing,
  and every AI answer engine cannot read the site at all.
- Origin GitHub Pages (`straightflushplumbing03.github.io/-Up2datewebsiteseo/`)
  redirects 301 to the custom domain, so the custom domain is the only host.
- **Action required in Cloudflare dashboard (cannot be fixed from the repo):**
  1. Security → Settings → **Security Level: Medium** (not "I'm Under Attack").
  2. Security → Settings → **Bot Fight Mode: OFF** (or add the WAF skip rule).
  3. Security → WAF → Custom rules → add `allow-verified-crawlers`
     (expression `(cf.client.bot)`, action Skip → All remaining custom rules).
  `CLOUDFLARE-SETUP.md` §2a–2b documents these exact steps; they were evidently
  never applied (or were reverted).
- Impact of inaction: **zero organic, Maps, or AI-search traffic.** All on-page
  work below is inert until this is fixed.

### Changes deployed (SAFE)

| # | Change | Target | Reason | Expected outcome |
|---|--------|--------|--------|------------------|
| 1 | Added `BreadcrumbList` JSON-LD | `case-studies/index.html`, `insurance/dos-and-donts-talking-to-insurance.html`, `service-areas.html`, `south-oc-slab-leak-specialist.html` | Pages show visible breadcrumbs but had no BreadcrumbList | Breadcrumb rich result / SERP path |
| 2 | Added `FAQPage` JSON-LD (text matches visible FAQ verbatim) | `case-studies/laguna-niguel-slab-leak-detection-1.html`, `…-pex-repiping-4.html`, `…-leak-detection-5.html`, `…-slab-leak-detection-6.html` | Visible FAQ accordions had no FAQPage schema | Eligibility for FAQ rich results + AI answer extraction |
| 3 | Fixed stray double period | `case-studies/laguna-niguel-pex-repiping-4.html` | Visible FAQ text had `pressure tested..` | Clean copy + schema/text parity |
| 4 | Sitemap hub URLs de-indexed-file fix | `sitemap.xml` | `/academy/index.html`, `/case-studies/index.html`, `/insurance/index.html`, `/services/index.html` pointed at `index.html` paths instead of clean directory URLs | Matches canonicals, avoids redundant URL signals |
| 5 | Surfaced 3 orphan city pages (Laguna Woods, Dove Canyon, Foothill Ranch) | `index.html` city pills, `service-areas.html` grid + footer | These 3 pages had **zero** internal inbound links (true orphans) | Crawl discovery + internal link equity |

**Verification performed:** all 74 indexable pages have exactly one `<title>`,
one `<meta name="description">`, one canonical, one `<h1>`; zero duplicate
titles/descriptions; 0 broken internal links; all JSON-LD parses; sitemap XML
well-formed; 0 remaining indexable orphans.

### Duplicate-content finding (no action — correct as-is)

Root-level `laguna-niguel.html`, `aliso-viejo.html`, `what-is-a-slab-leak.html`,
`leak-detection.html`, `pex-repiping.html`, `slab-leak-detection.html`,
`drain-services.html`, `water-heater-services.html`, `plumbing-repair.html` etc.
are **intentional `noindex, nofollow` stubs** with canonicals pointing to the
real `/cities/…`, `/services/…`, `/academy/…` pages. Not duplicate content;
leave alone.

### Growth opportunity / weekly moat

When the Cloudflare block is lifted, the highest-value durable asset is a
**slab-leak diagnostic decision tool** (interactive: symptom → likely cause →
detection method → repair-vs-reroute-vs-repipe), extending the existing
`plumbing-health-score.html`. It is hard for competitors to copy and is exactly
the "first-hand diagnostic experience" moat.

### Strategic insight

The site's on-page SEO/AEO work is already at a high standard; the company's
real bottleneck is a **deployment/edge misconfiguration**, not content. Fixing
Cloudflare crawler access is worth more than any month of new pages.

**PR:** #14 — https://github.com/straightflushplumbing03/-Up2datewebsiteseo/pull/14
**Note:** PR #11 (`chore/repo-hygiene-and-domain-fix`) is stale since 2026-09-28, mergeable=false, and contains ~10k lines of unrelated churn (committed `.git-2/`). Recommend closing it; re-land any wanted pieces in small PRs.
