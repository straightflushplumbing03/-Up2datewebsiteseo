# Strategy Log — Straight Flush Plumbing & Leak Detection

Reverse-chronological. One entry per run. Fields: date, change, reason, target,
competitor insight, expected outcome, result, keep/modify/revert.

---

## 2026-10-08

**Status:** Breadcrumb/schema truncation bug fixed across all generated pages and
root-cause patched in the generators. Slab-leak service page strengthened with a
diagnostic FAQ cluster.

### Changes deployed (SAFE)

| # | Change | Target | Reason | Expected outcome |
|---|--------|--------|--------|------------------|
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
