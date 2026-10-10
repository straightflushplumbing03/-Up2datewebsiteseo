# Strategy Log — Straight Flush Plumbing & Leak Detection

Reverse-chronological. One entry per run. Fields: date, change, reason, target,
competitor insight, expected outcome, result, keep/modify/revert.

---

## 2026-10-10

**Status:** AEO FAQ + inbound internal link deployed (branch
`sfge/aeo-leak-detection-faq-2026-10-10`). Site-wide indexing blocker still live.

### 🚨 BLOCKER UNCHANGED — Cloudflare managed challenge (403 to all crawlers)

Re-verified today: `https://straightflushplumbingoc.com/`, `/robots.txt`,
`/sitemap.xml` all return `HTTP 403` with `cf-mitigated: challenge` for a
Googlebot UA. **Every on-page change below is inert until Cloudflare is fixed.**
Actions remain the same as 2026-10-07 (Security Level: Medium; Bot Fight Mode
OFF; WAF skip rule for `cf.client.bot`). See `CLOUDFLARE-SETUP.md` §2a-2b. This
is a dashboard action that cannot be performed from the repository.

### Changes deployed (SAFE)

| # | Change | Target | Reason | Expected outcome |
|---|--------|--------|--------|------------------|
| 1 | Added 5-question diagnostic FAQ (visible, verbatim text) | `services/leak-detection.html` | Page had no FAQ block; competitors own the "how does detection work / will you break my tile" question space | AEO extraction, People-Also-Ask coverage, AI-answer grounding |
| 2 | Added matching `FAQPage` JSON-LD | `services/leak-detection.html` | Schema/text parity with #1 | FAQ rich-result eligibility |
| 3 | Added contextual inbound internal link to specialist page | `services/slab-leak-detection.html` | Specialist page had only 2 inbound links and 0 from its own service hub | Link equity + topical relationship |
| 4 | Added contextual inbound internal link to specialist page | `cities/laguna-niguel.html` (local-knowledge paragraph) | City pages are the strongest local entry points; specialist page now reachable from the flagship city | Internal discovery from priority local page |
| 5 | `lastmod` bumped to 2026-10-10 | `sitemap.xml` (2 service URLs) | Reflect real content change | Correct recrawl signal |

**Verification performed:** both edited service pages parse; all JSON-LD valid
(Service, BreadcrumbList, FAQPage); exactly one H1 each; 5 FAQ items match 5
schema Questions; 0 broken internal links site-wide; all links resolve; sitemap
XML well-formed.

### Competitor watch (observed today, DuckDuckGo SERP for "slab leak detection Laguna Niguel")

- **Evans Leak Detection** (`evansleakdetection.com/laguna-niguel-slab-leak-detection/`):
  1,502 words, dedicated city+service page, Plumber schema, H1 "Laguna Niguel's
  Top Company for Slab Leak Detection & Repair" — the benchmark to beat locally.
- **lagunaniguelcaplumbingpros.com** (exact-match domain): 1,459 words, FAQPage
  schema, city+service page — thinner expertise signal but strong local
  targeting, and it beats us on the exact city/service phrase.
- **Leak Star** (`leakstar.com`): 752 words, no FAQ/no H1, Organization schema
  only — sustainable to outrank once crawl access exists.
- **ProPlumberLagunaNiguel.com** and **lagunaniguelcaplumbingpros.com** are
  keyword-exact domains: a reminder that a strong branded domain plus genuine
  local content (not a matching domain) is the differentiator.

### Growth opportunity / weekly moat (unchanged)

Build the **slab-leak diagnostic decision tool** (symptom → likely cause →
detection method → repair-vs-reroute-vs-repipe), extending
`plumbing-health-score.html`. Hard to copy; embodies the first-hand-diagnostic
moat.

### Strategic insight

The site's on-page SEO/AEO is already above local competitor quality; the only
thing keeping Straight Flush invisible to Google, Maps and AI engines is the
Cloudflare crawler block. Fixing that single dashboard setting is worth more
than any amount of new content this month.

**Keep/modify/revert:** KEEP — no results measurable until the Cloudflare block
is lifted.

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
