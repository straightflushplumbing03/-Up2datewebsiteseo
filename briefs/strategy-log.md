# Strategy Log — Straight Flush Plumbing & Leak Detection

Reverse-chronological. One entry per run. Fields: date, change, reason, target,
competitor insight, expected outcome, result, keep/modify/revert.

---

## 2026-10-11 (supplementary run)

**Status:** Independent second sample on the same day; branch
`growth-engine/daily-2026-10-11-run2` (an earlier run today produced PR #25).
Read-only research + additive documentation. **No website page/schema/copy changed.**

### ✅ ISSUE-001 (Cloudflare crawler block) confirmed RESOLVED

`bash growth-engine/tests/crawler_access_check.sh` → **OK**. All 7 crawler UAs
(Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Applebot)
and plain curl return **200 with no `cf-mitigated` header** on `/`, `/robots.txt`,
`/sitemap.xml`, `/llms.txt`. The AI-readable files (`/llms-full.txt`,
`/md/services/leak-detection.md`) are now **200** (PR #24 merged). On-page work is
no longer inert.

### Visibility sweep — 28 queries, Brave conventional proxy

Expanded the sample from 5 → 28 queries covering all 7 core services and 11
cities (Tier 1–3). **Straight Flush was absent from all 28** (0 recommended /
0 mentioned / 0 cited). Highest-intent queries where SF does not surface:
*slab leak detection Laguna Niguel*, *slab leak repair Laguna Niguel*,
*PEX repipe Laguna Niguel*, *PEX repiping Orange County*, *emergency plumber
Laguna Niguel*, *best plumber in Laguna Niguel*. Data:
`growth-engine/data/ai_visibility_history.jsonl`.

### Competitor intelligence (evidence-based, not proof)

Tier A (≥10/28): scottenglishplumbing.net (22), barkerandsonsplumbing.com (19),
rotorooter.com (15), billmetzgerplumbing.com (13), efficientplumbing.com (12),
rooterhero.com (11), allclearplumbingpros.com (11), parzivalplumbing.com (10),
calischoice.com (10), evansleakdetection.com (10). New repeats:
integrityrepipe.com, dcplumbing.net, mikediamondservices.com,
thedoneriteplumber.com, missionviejoplumbingco.com, largeplumbing.com.
Directory dominance: yelp.com 27/28, angi.com 12/28 → the "best plumber" queries
are an aggregator/GBP problem, not a website-only problem. Directory updated:
`growth-engine/COMPETITOR_DIRECTORY.md`.

### Evidence-backed gaps (page + city + missing element)

1. **Per-city slab-leak sections** — competitors surface a dedicated slab-leak
   page per city (Evans, Cal's Choice, Streamline, EZ); SF city pages cover leak
   detection generically. Target: `cities/{laguna-niguel,dana-point,san-clemente,
   mission-viejo,aliso-viejo}.html`.
2. **Repipe content** — `PEX repipe Laguna Niguel` / `PEX repiping Orange County`
   are dominated by repipe specialists; SF has no repipe page in those results.
   Target: a `/services/pex-repiping.html`-linked city × repipe asset.
3. **AI-engine visibility is unverified** — no credentials in this environment;
   recorded `unverified`, never 0%.

### AI answer engines — still unverified

No AI answer engine could be executed (no credentials; sites 403/JS-only).
Recorded as `unverified` per `AI_VISIBILITY_METHODOLOGY.md`. Cheapest unlock:
a Perplexity/SerpAPI key (owner, Level 3).

### Verification

`crawler_access_check.sh` → OK; 2 technical-health rows + 28 visibility rows +
34 competitor rows appended to `data/*.jsonl`.

**Branch:** `growth-engine/daily-2026-10-11-run2` (PR opened for owner review).
**Report:** `growth-engine/reports/daily/2026-10-11.md`.

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
