# Strategy Log — Straight Flush Plumbing & Leak Detection

Reverse-chronological. One entry per run. Fields: date, change, reason, target,
competitor insight, expected outcome, result, keep/modify/revert.

---

## 2026-10-09

**Status:** Internal-linking de-orphaning + title-length hygiene deployed.
Cloudflare crawler blocker **still active** (see carried-forward blocker).

### 🚨 BLOCKER (carried forward) — Cloudflare challenge still returns 403

- Re-tested `https://straightflushplumbingoc.com/` today: **403 `cf-mitigated: challenge`**
  for Googlebot, GPTBot, and plain curl. `/robots.txt` also 403.
- Nothing has changed since 2026-10-07. All on-page work remains inert to
  crawlers until the Cloudflare dashboard fix (Security Level Medium, Bot Fight
  Mode OFF, allow-verified-crawlers WAF skip rule) is applied. **Requires human action.**

### Intelligence

- No `briefs/latest.md` (Scout output) present; no live SERP/competitor scraping
  available from this sandbox (Google/Bing/Mojeek/DDG blocked or unresolved).
  Competitor claims are therefore **not** asserted this run — repo-only audit.

### Changes deployed (SAFE)

| # | Change | Target | Reason | Expected outcome |
|---|--------|--------|--------|------------------|
| 1 | Homepage link → `/case-studies/` | `index.html` | Case-study hub had **zero** homepage inbound links; real documented jobs are the strongest E-E-A-T asset | Crawl discovery + stronger proof-of-work signal |
| 2 | "Related reading" block linking each case study → its matching service page + hub | `case-studies/laguna-niguel-{slab-leak-detection-1, slab-leak-detection-6, leak-detection-5, pex-repiping-4}.html` | Case studies had no path back to the money pages they prove | Commercial relevance + link equity toward services |
| 3 | Slab-leak-detection → case studies link | `services/slab-leak-detection.html` | Flagship page had no proof-of-work link; ties diagnosis claim to real local jobs | Conversion aid + topical reinforcement |
| 4 | Title shortened into SERP-friendly range | 13 indexable pages (about, plumbing-health-score, south-oc-slab-leak-specialist, 10 academy articles) | Titles ran 65–96 chars; several led with repetitive "Leak Detection Academy" boilerplate | Better CTR + less truncation; titles now 45–55 chars |

**Verification performed:** all 74 indexable pages — exactly one `<title>`, one
meta description, one canonical, one `<h1>`; zero duplicate titles/descriptions;
0 broken internal links; 0 section/div tag imbalances; all JSON-LD parses;
sitemap covers all 74 indexable pages; canonical↔sitemap parity.

### Not actioned this run

- **City title lengths (16 pages, 65–81 chars).** The title exactly mirrors the
  `<h1>` and the pattern is uniform; trimming risks H1/title divergence for a
  marginal gain, so left as-is pending a pattern-level decision (REVIEW).
- **28 titles remain >70 chars** overall; the worst non-city offender is
  `case-studies/laguna-niguel-slab-leak-detection-6.html` (89 chars) — left for
  the next pass so this PR stays within one objective group.

### Growth opportunity / weekly moat

The slab-leak diagnostic decision tool (symptom → likely cause → detection method
→ repair-vs-reroute-vs-repipe), extending `plumbing-health-score.html`, remains
the highest-value durable asset. All case studies now route into it naturally.

### Strategic insight

On-page work is already strong; **crawler access is the entire bottleneck** — the
site is invisible to Google, Bing, and every AI answer engine until Cloudflare
stops challenging verified bots, so edge configuration outranks any content work.

### Weekly priority

Get verified crawlers unblocked at Cloudflare and confirm a 200 to a Googlebot UA.

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
