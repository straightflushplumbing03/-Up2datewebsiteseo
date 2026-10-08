# Strategy Log — Straight Flush Plumbing & Leak Detection

Reverse-chronological. One entry per run. Fields: date, change, reason, target,
competitor insight, expected outcome, result, keep/modify/revert.

---

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
