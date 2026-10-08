# Strategy Log — Straight Flush Plumbing & Leak Detection

Reverse-chronological. One entry per run. Fields: date, change, reason, target,
competitor insight, expected outcome, result, keep/modify/revert.

---

## 2026-10-08

**Status:** Cloudflare 403 blocker STILL PRESENT (verified live, unchanged).
One SAFE on-page AEO fix deployed to the primary non-branded money page.

### 🚨 BLOCKER — unchanged since 2026-10-07

Re-verified today: `https://straightflushplumbingoc.com/` → 403 and
`/robots.txt` → 403. `CLOUDFLARE-SETUP.md` §2a–2b is still the fix and still
requires the Cloudflare dashboard (not the repo). No organic, Maps or AI-search
traffic is possible until this is cleared.

### Changes deployed (SAFE)

| # | Change | Target | Reason | Expected outcome |
|---|--------|--------|--------|------------------|
| 1 | Added visible **diagnostic FAQ** (4 Q&A) + matching **FAQPage** JSON-LD | `services/leak-detection.html` | Best commercial-intent service page had no FAQ and no FAQPage schema; competitor Evans/Laguna Niguel pages present FAQ-style answers for "difference between methods / cost / under slab" queries | Eligibility for FAQ rich results + AI answer extraction on non-branded "leak detection Orange County" intent |
| 2 | Replaced 2 weak internal links pointing to `../contact.html` with **descriptive links** to the real insurance and repair-vs-reroute guides | `services/leak-detection.html` "Go deeper" cards | Cards titled "Does Insurance Cover This?" / "Repair vs Reroute vs Repipe" linked to contact instead of the actual guide pages | Better internal-link equity + intent match (Service → Guide) |
| 3 | Added a 4th related card → `guides/leak-detection-cost.html` | `services/leak-detection.html` | Cost is a top commercial-investigation query | Cost-intent path into a guide that links back to the service |
| 4 | Bumped `<lastmod>` to 2026-10-08 | `sitemap.xml` | Reflect the change | Accurate recrawl signal |

**Verification:** all 3 JSON-LD blocks parse; FAQ schema text matches visible
accordion text; 0 broken internal links on the page; exactly 1 H1 / 6 H2;
`sitemap.xml` well-formed; `scripts/seo_audit.py` re-run: 0 missing meta,
0 pages with ≠1 H1, 0 missing canonical, 0 broken links, 0 orphans.

### Competitor watch (Bing SERP, "slab leak detection laguna niguel", 2026-10-08)

Domains holding top organic positions: `evansleakdetection.com`,
`lagunaniguelcaplumbingpros.com`, `leakstar.com`, `leak-detection-pro.com`,
`proplumberlagunaniguel.com`, `draingene.com`, `plumbernearme.ai`,
`americanleakcompany.com`, `leakdetectioncoronaca.com`. Evans remains the
strongest (dedicated `/laguna-niguel-slab-leak-detection/` page, richest
schema). Several are thin, geo-swapped pages — a genuine local-value page is
the way to beat them, not more doorway pages.

### Growth opportunity / weekly moat

Unchanged and still the best durable asset: the **interactive slab-leak
diagnostic decision tool** (symptom → likely cause → detection method →
repair/reroute/repipe), extending `plumbing-health-score.html`. Build it only
after the 403 is cleared, since nothing is crawlable until then.

### Strategic insight

The site's on-page SEO/AEO is at a high standard; today's work removes the last
obvious AEO gap on the main leak-detection money page. The company's real
bottleneck remains a **deployment/edge misconfiguration**, not content —
fixing Cloudflare crawler access is worth more than any month of new pages.

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
