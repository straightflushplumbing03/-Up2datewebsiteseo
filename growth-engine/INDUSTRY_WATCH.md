# Industry Watch — Straight Flush Plumbing & Leak Detection

Rolling, dated record of **plumbing-industry developments**, **official search-engine
guidance**, **homeowner questions**, and **diagnostic technology**. Every entry cites
its source URL and carries a confidence level. Nothing here is invented: if a claim
cannot be traced to a fetched source, it is not written down.

**Rules**
- Official guidance comes only from primary sources (Google Search Central, Bing
  Webmaster Guidelines, schema.org, CSLB, EPA/WaterSense, etc.) — never from a
  content-marketing blog paraphrasing them.
- Confidence: `high` (primary source, fetched) · `medium` (reputable secondary,
  fetched) · `low` (single weak source / inference) · `unverified` (not fetched).
- Industry claims about *our* business go through `APPROVED_CLAIMS.md`.

---

## 2026-10-19 — Google publishes a primary-source "mythbusting" guide for generative-AI search (llms.txt, chunking, structured data)

- **What changed / observed:** Google Search Central's *AI optimization guide*
  (`/search/docs/fundamentals/ai-optimization-guide`) now carries an explicit
  "Mythbusting generative AI search: what you don't need to do" section. Verbatim
  from the fetched page (HTTP 200, 192,068 bytes, fetched 2026-10-19):
  - **LLMS.txt:** "You don't need to create new machine readable files, AI text
    files, markup, or Markdown to appear in Google Search (including its
    generative AI capabilities), as Google Search itself doesn't use them."
    Maintaining one is "completely fine … for other services or systems," and it
    "will neither harm nor help your site's visibility or rankings in Google
    Search, as Google Search ignores them."
  - **"Chunking" content:** "There's no requirement to break your content into tiny
    pieces for AI to better understand it."
  - **Rewriting content for AI:** "You don't need to write in a specific way just
    for generative AI search."
  - **Structured data:** "Structured data isn't required for generative AI search,
    and there's no special schema.org markup you need to add."
  - **Eligibility requirement (actionable):** "To be eligible to be shown in
    generative AI features on Google Search, a page must be indexed and eligible to
    be shown in Google Search with a snippet," and a site "must be included in
    Search generative AI features in Search Console."
  - **Measurement:** Google points to a **Generative AI performance report** in
    Search Console (and warns against third-party tools claiming "internal" Google
    metrics).
- **Why it matters to Straight Flush:** the repo's `llms.txt` / `llms-full.txt` /
  `/md/**` assets (ISSUE-001 follow-up, idea-2026-10-12-03) should be described
  honestly as AI-consumer/agent-readable conveniences, **not** as a Google ranking
  or AI-Overview lever. The durable levers remain the ordinary ones: indexable,
  snippet-eligible pages. The Search Console Generative AI performance report is
  the only first-party measurement path — and it sits behind the same unconnected
  Google Search Console access as P-002.
- **Source(s):** https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
  (fetched 2026-10-19, HTTP 200) · https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting
  · Search Central changelog entry "Clarifying guidance on llms.txt files"
  (https://developers.google.com/search/updates, fetched 2026-10-19).
  **Confidence:** high (primary source, fetched).
- **Proposed action (if any):** re-frame `idea-2026-10-12-03` and the
  `INTEGRATION_STATUS.md` AI-overview row; add the Generative-AI report to the
  P-002 unblock request. No website code change warranted today.

## 2026-10-19 — FAQ rich-result documentation removal confirmed in the live changelog (re-verification)

- **What changed / observed:** Re-fetched the Search Central updates page
  (2026-10-19, HTTP 200). The June 2026 entry "Removing documentation for the FAQ
  rich result feature" is live, with the reason "The FAQ rich result feature is no
  longer shown in Google Search results." The How-To deprecation entry remains
  present. This **re-confirms** the 2026-10-13 entry below against a fresh fetch
  rather than a cached recollection.
- **Why it matters to Straight Flush:** no change to the 2026-10-13 conclusion —
  `FAQPage` markup earns no Google rich result. Keep the answer-first FAQ *content*
  (human/AEO value); stop citing rich-result eligibility.
- **Source(s):** https://developers.google.com/search/updates (fetched 2026-10-19)
  · https://developers.google.com/search/docs/appearance/structured-data/faqpage.
  **Confidence:** high (primary source, fetched).
- **Proposed action (if any):** none new; supports the 2026-10-13 entry.

## 2026-10-19 — Third-party search-result quality degraded during this run (measurement caveat, not a site finding)

- **What changed / observed:** During the 2026-10-19 run an exploratory **Bing**
  fallback probe returned partially degraded SERPs for several plumbing queries —
  generic/definitional results (dictionary domains) rather than local plumbing
  pages — and several requests were rate-limited (HTTP 429). No row was recorded
  from that probe; the recorded sweep used Tavily, which returned 10/10 results per
  query. The degraded probe was therefore **not** used to classify any query.
- **Why it matters to Straight Flush:** a weak *result set* is not evidence about
  our ranking. It is a caveat on today's confidence, not a signal about the site.
- **Source(s):** run observation 2026-10-19 (Bing fallback probe; HTTP 429 +
  definitional results); recorded sweep in `growth-engine/data/ai_visibility_history.jsonl`
  (provider `tavily_search`). **Confidence:** medium (observed, provider-side).
- **Proposed action (if any):** none; note in the report.
## 2026-10-20 — Search Console exposes a Generative AI performance report (re-verified primary source)

- **What changed / observed:** Google Search Central's *Optimizing for generative
  AI search* page directs site owners to measure AI-feature performance **inside
  Search Console**, not through third-party tooling. Verbatim: "To measure how
  your content is performing in generative AI features on Google Search and
  Discover, use the Generative AI performance report in Search Console." The same
  page warns: "Be wary of third-party tools that promise ranking success or claim
  to use 'internal' Google metrics. No third-party tool has access to our
  internal ranking or AI systems."
- **Also re-confirmed on the same fetch:** `llms.txt` is explicitly a no-op for
  Google Search — "Doing so will neither harm nor help your site's visibility or
  rankings in Google Search, as Google Search ignores them."
  (fetched 2026-10-20, HTTP 200, ~192 KB; all three quotes re-verified verbatim against the live page).
- **Proposed action:** the GSC ask in P-002 now names the Generative AI
  performance report; day-one procedure written to
  `growth-engine/runbooks/gsc-measurement-runbook.md`. No HTML change; the
  `/llms.txt` copy re-frame remains a documentation item (idea-2026-10-13-18).

---

## 2026-10-13 — Google Search Central deprecates the FAQ rich result

- **What changed / observed:** Google Search Central removed the FAQ rich-result
  documentation; the feature "is no longer shown in Google Search results"
  (announced in the Search Central changelog in May 2026). Any `FAQPage`
  structured data now earns **no** rich-result eligibility. A separate, older
  changelog entry also states the FAQ feature "is only shown for well-known,
  authoritative government and health websites" — which for a residential plumbing
  business means **no eligibility at all** either way. Fetched directly from the
  primary source (page emitted Oct 2026; page `Last updated 2026-10-08`).
- **Why it matters to Straight Flush:** Several site pages and ideas (e.g.
  `idea-2026-10-12-07`, and pages carrying `FAQPage` JSON-LD) were justified, in
  part, by FAQ rich-result eligibility. That justification is now void. The FAQ
  *content* can still help readers and AI answer engines (AEO), but it must no
  longer be described as producing a Google FAQ rich result. This is a
  documentation/reporting correctness matter — not a reason to delete FAQ pages.
- **Source(s):** https://developers.google.com/search/blog (Search Central
  changelog, FAQ entries) · https://developers.google.com/search/docs/appearance/structured-data/faqpage
  · **Confidence:** high (primary source, fetched).
- **Proposed action (if any):** Update `idea-2026-10-12-07` scoring/notes and the
  FAQ-related framing; keep answer-first FAQ content for AEO/human value. No code
  change warranted this run (re-scoring is a knowledge-base edit, not a website edit).

## 2026-10-13 — EPA WaterSense household-leak statistics (primary source)

- **What changed / observed:** EPA WaterSense states the average family can waste
  **180 gallons per week / 9,400 gallons annually** from household leaks (≈ 300
  loads of laundry), and that household leaks waste **~900 billion gallons
  annually nationwide**. Fetched directly from EPA.
- **Why it matters to Straight Flush:** These are *primary-source* figures usable in
  leak-detection education content without inventing statistics or crossing into
  Level-3 claims. They are the EPA's numbers, cite EPA, and are safe to attribute.
- **Source(s):** https://www.epa.gov/watersense/statistics-and-facts · **Confidence:** high (fetched).
- **Proposed action (if any):** cite EPA figures on an education page (candidate;
  owner review for any local framing). See `INNOVATION_IDEAS.md` idea-2026-10-13-04.

---

## 2026-10-12

### 2026-10-12 — Phase 2 inspection: HQ-D run budget + automation consolidation (infrastructure)
- **What changed / observed:** Phase-2 inspection of OpenHands Cloud / Intelligence
  HQ. Root-caused the HQ-D failure (run `2026-10-12T05:33:52Z`, "Timed out: command
  timed out"): the platform **hard-caps automation `timeout` at 1800 s (30 min)** —
  a 3600 request returns HTTP 422 `value_error: timeout must not exceed 1800
  seconds`. The successful run (`2026-10-12T06:09:19Z`) needed longer than 30 min,
  so open-ended research can exceed the wall clock before the report is committed.
- **Why it matters to Straight Flush:** a research run that never persists is a
  silent intelligence gap — the durable knowledge base stops growing even though the
  automation reports "enabled".
- **Remediation:** the canonical HQ-D prompt now carries a mandatory time budget
  (~40% research / 60% write+commit) and a reduced query count (15–25). The live
  automation prompt was re-synced to the committed canonical file (prompt_chars
  10443) so the live definition and the repo no longer drift.
- **Consolidation:** legacy `Scout: Daily Competitor Intel`,
  `Strategist: Daily SEO Action Plan`, and `Sentinel: Scout Auto-Retry` are disabled
  (redundant with HQ-D/HQ-W); `Automation A` was already disabled when HQ-D was
  enabled.
- **Source(s):** repository files + OpenHands automation API (fetched 2026-10-12).
  **Confidence:** high (repo/API-verified).
- **Proposed action:** none new; tracked as `KNOWN_ISSUES.md` ISSUE-005/ISSUE-006.

### Supplementary entries (concurrent 2026-10-12 run — additive, not merged)

- **Google: "AI Features and Your Website"** — primary source
  https://developers.google.com/search/docs/appearance/ai-features (page **last
  updated 2025-12-10 UTC**). States SEO best practices remain relevant for AI
  Overviews / AI Mode; **"You don't need to create new machine readable files, AI
  text files, or markup to appear in these features"**; a supporting link must be
  indexed and snippet-eligible. *Relevance:* SF's `llms.txt` / `llms-full.txt` /
  `/md/**` are harmless but **not a Google lever** — crawlability + helpful content
  is. Confidence: **high**.
- **EPA WaterSense household-leak statistics** — primary sources
  https://www.epa.gov/watersense/statistics-and-facts and
  https://www.epa.gov/watersense/fix-leak-week. Fetched: average family can waste
  **180 gal/week / 9,400 gal/year** from leaks; a 1-drip/second faucet wastes
  **>3,000 gal/year**; **a family of four exceeding 12,000 gal/month may have
  serious leaks**; fixing leaks can save **~10% on water bills**. *Relevance:*
  citable figures (with EPA attribution) for high-water-bill / hidden-leak pages —
  no invented stats. Confidence: **high**.
- **Note:** Brave Search was rate-limited (**HTTP 429**) this run; competitor
  observations used DuckDuckGo HTML as the single permitted alternate.


### Search guidance — Google Search Central (primary sources)

- **New learning paths: curated YouTube playlists for Search fundamentals and
  Technical SEO** (published 2026-10). Google added curated YouTube learning
  paths for Search fundamentals and technical SEO. *Relevance:* free, authoritative
  training material for keeping the site's technical SEO current; the technical
  path is directly applicable to crawl/index/schema hygiene on a static site.
  Confidence: **high** (primary source).
  Source: https://developers.google.com/search/blog/2026/10/seo-learning-paths
- **Announcing web multimodal Search performance reporting in Search Console**
  (published 2026-09). Search Console now reports performance for web multimodal
  Search, i.e. results that include images/video-style surfaces. *Relevance:* once
  GSC access exists, local-image and video assets on service pages become
  measurable, not just text queries. Confidence: **high**.
  Source: https://developers.google.com/search/blog/2026/09/web-multimodal-in-sc
- **Introducing Search Generative AI performance reports in Search Console**
  (published 2026-06). Search Console added Generative AI performance reporting.
  *Relevance:* this is the first first-party way to measure AI-surface impressions
  without third-party AI-platform testing; still requires GSC access (blocked —
  see `INTEGRATION_STATUS.md`). Confidence: **high**.
  Source: https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- **A new resource for optimizing for generative AI in Google Search**
  (published 2026-05). Google published guidance on optimizing for generative AI
  in Search. *Relevance:* primary-source guidance to align the site's
  content/AEO approach; read and map to the Academy pages. Confidence: **high**.
  Source: https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing
- **Update to the Site Reputation Policy** (published 2026-08). Google updated
  its site-reputation policy (third-party/parasite content on host sites).
  *Relevance:* confirms that thin, syndicated or parasite content is a risk; the
  knowledge base's "no thin/doorway pages" rule matches current policy.
  Confidence: **high**.
  Source: https://developers.google.com/search/blog/2026/08/update-site-reputation-policy
- **New Location for the Google Crawlers' IP Range Files** (published 2026-03).
  Google moved the published crawler IP-range files. *Relevance:* if the owner
  later adds server-side crawler allowlisting, use the new location; do not
  hardcode the old path. Confidence: **high**.
  Source: https://developers.google.com/search/blog/2026/03/crawler-ip-ranges

### Plumbing-industry developments

- **Rheem "strengthens leadership to advance AI and digital transformation"**
  (phcppros, 2026-10). A major water-heater manufacturer is publicly investing in
  AI/digital transformation. *Relevance:* a hypothesis worth watching — manufacturer
  diagnostic/AI tooling and connected water-heater data may reach homeowners, which
  could shift what "water heater service" pages should explain. Confidence: **medium**
  (headline-level; article body not fully parsed).
  Source: https://www.phcppros.com/articles/24275-rheem-strengthens-leadership-to-advance-ai-and-digital-transformation
- **"Code changes due for the 2030 model plumbing and mechanical codes"**
  (phcppros). Code-cycle news relevant to repipe/water-heater content accuracy.
  *Relevance:* do not publish code claims; monitor only, and route any code
  statement to the owner for verification. Confidence: **medium**.
  Source: https://www.phcppros.com/articles/24118-code-changes-due-for-the-2030-model-plumbing-and-mechanical-codes
- **Watsco Q3 conference call** (phcppros) — HVAC/plumbing distribution earnings
  cadence; a weak-demand/industry-health signal, not directly actionable for SEO.
  Confidence: **low** (headline only).
  Source: https://www.phcppros.com/articles/24274-watsco-schedules-third-quarter-conference-call
- **phcppros maintains a dedicated "AI Technology" topic hub** — evidence the
  trade press treats AI in the trades as a standing beat. *Relevance:* useful
  standing feed for future INDUSTRY_WATCH entries. Confidence: **high** (page exists).
  Source: https://www.phcppros.com/topics/780-ai-technology

### Diagnostic technology (acoustic, electronic, thermal, camera)

- No new diagnostic-technology product launch was verified this run (searches of
  the trade press surfaced only the leadership/finance items above). The site's
  existing three-method explainer set (acoustic, electronic pipe locating, thermal
  imaging) remains the differentiator; treat new-equipment claims as **unverified**
  until a primary source is fetched. Confidence: **low** (absence of evidence).

### Recurring homeowner questions (from 2026-10-12 result titles)

Question-shaped pages recur across the sweep, indicating durable homeowner intent:
"how to locate a hidden water leak" (Dana Point query returned
`plumbingsolutionspecialist.com/leak-detection-dana-point-ca/` and
`leak-detection-pro.com` location pages), plus the site's own Academy cluster
already covers "water meter still moving everything off", "warm spot on floor",
"sound of running water in wall". *Opportunity:* these map cleanly to
answer-first Academy/FAQ content. Confidence: **medium**.

### Legitimate local-search opportunities

- **Repipe queries are dominated by specialists, not generalists.** `ocrepipes.com`
  and `repipesoc.com` appeared on the repipe-family queries; the site has a
  verified `/services/pex-repiping.html` page but no per-city repipe framing.
  *Opportunity (proposal only):* a repipe education/eligibility page — not a
  doorway page — is a candidate. Confidence: **medium**.
- **"Near me" queries returned non-localized sets** (cities = `""`), consistent
  with prior runs: near-me results are device-location driven and not measurable
  from a sandbox. Treat as **inconclusive**, not as an SF failure. Confidence: **medium**.

---

## 2026-10-11 (seeded from the 2026-10-11 run)

- Google Search Central published/updated the Search Console AI (generative)
  performance reporting and multimodal reporting surfaces (see 2026-10-12 entries
  for URLs). Confidence: **high**.
- Trade press (phcppros, contractormag.com) continued coverage of AI adoption and
  workforce/industry events in plumbing. Confidence: **medium**.

<!--
New entries are prepended directly under this line, newest first, using:

### YYYY-MM-DD — <short title>
- **What changed / observed:**
- **Why it matters to Straight Flush:**
- **Source(s):** <exact URL(s)>  · **Confidence:** high|medium|low|unverified
- **Proposed action (if any):** <idea id / PR / none>
-->
## Dated entries

### 2026-10-22 — Google Search Console now reports web multimodal Search performance (primary source)
- **What changed / observed:** Google Search Central announced Search Console
  reporting for **web multimodal search**, live in both the *performance on Search
  results* report and the *Generative AI features* report, rolling out globally
  from 2026-09-24. It covers searches made with **Lens**, **Circle to Search**
  (Android), image uploads to Google Search, and the Chrome right-click "Search
  this image" action, exposed via a new *multimodal search* type filter in the
  Performance report (with CSV export).
- **Why it matters to Straight Flush:** two implications. (1) The report's
  existence confirms Google now tracks and surfaces **Generative AI feature**
  performance in Search Console — the first-party channel this repo has been
  waiting on (P-002); when GSC access is granted, AI-feature impressions become
  measurable rather than inferred. (2) Multimodal (camera/image) search is a
  natural discovery path for plumbing symptoms — a homeowner photographing a
  stained ceiling or a corroded pipe. Our pages carry real photographs and
  descriptive `alt` text, which is the crawlable surface multimodal search reads.
  No page change is justified by this alone (no first-party data yet), so it stays
  an **observation**, not an action.
- **Source(s):** https://developers.google.com/search/blog/2026/09/web-multimodal-in-sc
  (fetched 2026-10-22, HTTP 200); feed listing confirmed at
  https://developers.google.com/search/blog/feed.xml (HTTP 200).
  **Confidence:** high (primary source, official blog).
- **Proposed action:** none today. Feeds idea-2026-10-22-04 (photo/alt-text
  audit) and reinforces the existing P-002 GSC runbook (idea-2026-10-13-18).

### 2026-10-22 — Official Search-fundamentals learning paths published (primary source)
- **What changed / observed:** Google Search Central published curated YouTube
  learning paths for **Search fundamentals** and **Technical SEO**
  (dated 2026-10-06, fetched HTTP 200). It is training material, not a ranking
  rule change — no documented ranking or policy effect.
- **Why it matters to Straight Flush:** low direct impact. Recorded so the daily
  log does not misattribute a ranking change to it, and so the standing
  "official guidance" table can cite a current, verified primary source.
- **Source(s):** https://developers.google.com/search/blog/2026/10/seo-learning-paths
  (fetched 2026-10-22, HTTP 200). **Confidence:** high (primary source).
- **Proposed action:** none.

### 2026-10-12 — Knowledge base extended for Intelligence HQ (infrastructure)
- **What:** Added `INDUSTRY_WATCH.md`, `INNOVATION_IDEAS.md`, weekly-report
  structure, and the Intelligence HQ automation. No external claims added.
- **Sources:** repository files only. **Confidence:** high (repo-verified).
- **Follow-up:** daily runs populate dated findings below.

### 2026-10-12 — Official Google guidance re-verified (primary sources, fetched)
- **What:** Fetched and confirmed live (HTTP 200) two primary Google Search Central
  references used by every run:
  - *AI features and your website* — https://developers.google.com/search/docs/appearance/ai-features
  - *Local business (LocalBusiness) structured data* — https://developers.google.com/search/docs/appearance/structured-data/local-business
- **Why it matters to Straight Flush:** AI-feature guidance confirms that appearing
  in AI features depends on standard Search fundamentals (crawlability, helpful
  content, structured data) — consistent with this repo's diagnose-first strategy.
  The LocalBusiness page is the authority for the ISSUE-002 `aggregateRating`
  hygiene question.
- **Source(s):** the two URLs above (fetched 2026-10-12, HTTP 200).
  **Confidence:** high (primary source).
- **Proposed action:** none new; supports idea-2026-10-12-02 (rating hygiene).

## 2026-10-23 — Google names "unique point of view" as the AI-search differentiator, and states AEO/GEO is still SEO

- **What changed / observed:** Google Search Central now publishes a dedicated guide,
  *Optimizing for generative AI search* (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide,
  fetched 2026-10-23, HTTP 200). Two statements matter operationally:
  1. **There is no separate AEO/GEO playbook.** The page says AEO ("answer engine
     optimization") and GEO ("generative engine optimization") are terms for "work
     specifically focused on improving visibility in AI search experiences" and that
     "from Google Search's perspective, optimizing for generative AI search is
     optimizing for the search experience, and thus **still SEO**."
  2. **Mechanism, not magic.** AI features use **retrieval-augmented generation
     (grounding)** over Google's existing Search index plus **query fan-out** —
     "a set of concurrent, related queries generated by the model to request more
     information and fetch additional relevant search results."
  3. **The content bar is first-hand experience:** the guide says the strongest
     long-run influence is content that is "unique, compelling, and useful", and
     names "**Providing a unique point of view**" — "a first-hand review provides a
     unique perspective based on personal experience, whereas a summary of existing
     content simply restates information already available elsewhere."
- **Why it matters to Straight Flush:** this is a *primary-source* confirmation of the
  repo's diagnose-first strategy and a caution against the temptation to generate more
  city-page permutations. Because responses are assembled from fan-out subqueries, the
  productive question is not "which page ranks" but "which subqueries does our existing
  page set actually answer". It also raises the value of the owner's own job knowledge
  (Lance's field experience) over any rephrasing of publicly available plumbing
  content — the one input a competitor or an AI cannot copy.
- **Source(s):** https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
  · **Confidence:** high (primary source, fetched).
- **Proposed action (if any):** none on the site this run. Created
  `idea-2026-10-23-05` (query fan-out coverage map, docs-only) and re-framed
  `idea-2026-10-23-06` (owner field-notes) around the quoted "unique point of view"
  language. No page, schema, or copy changed.

## 2026-10-23 — Google adds a Search Console "Search generative AI control"; the docs update lands 2026-10-21

- **What changed / observed:** the *What's new in Google Search* changelog
  (https://developers.google.com/search/updates, fetched 2026-10-23, HTTP 200) lists an
  **October 21, 2026** documentation update to *Control what you share with Google
  Search* (https://developers.google.com/search/docs/crawling-indexing/control-what-you-share,
  fetched 2026-10-23, HTTP 200; page footer reads `Last updated 2026-10-21 UTC`). The
  refresh folds in "the `robots` meta tag, `data-nosnippet`, `X-Robots-Tag`, and the
  **Search generative AI control**". That control is described as the site-wide method
  to "manage your site's inclusion in generative AI features on Google Search, including
  AI Overviews and AI Mode".
- **Why it matters to Straight Flush:** this is a *site-wide opt-in/opt-out* for AI
  features that lives in Search Console — i.e. behind the P-002 credential blocker, so
  it is currently **unavailable to this automation**. Two consequences: (a) nobody has
  verified that the property is not opted out of generative AI features, and (b) it is
  one more reason P-002 (Search Console access) is the highest-value unblocked item in
  the register. Also worth noting for accuracy: the changelog entry is a *documentation*
  update, not a product launch — the doc says "existing options".
- **Source(s):** https://developers.google.com/search/updates ·
  https://developers.google.com/search/docs/crawling-indexing/control-what-you-share
  · **Confidence:** high (both primary sources, fetched, HTTP 200).
- **Proposed action (if any):** recorded only. Folded into the P-002 note in this run's
  report; no proposal file created because P-002 already covers it.
## 2026-10-20 — Google publishes an official "Optimizing for generative AI search" guide (primary source)

- **What changed / observed:** Google Search Central now ships a first-party guide,
  *"Optimizing your website for generative AI features on Google Search"*, at
  https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
  (fetched 2026-10-20, HTTP 200; `<title>` "Google's Guide to Optimizing for
  Generative AI Features on Google Search"). Verbatim points captured this run:
  - *"Is SEO still relevant for generative AI search? In short, yes! The best
    practices for SEO continue to be relevant because our generative AI features on
    Google Search are rooted in our core Search ranking and quality systems."*
  - *"Create valuable, non-commodity content for your audience"* — *"Creating
    content that people find unique, compelling, and useful will likely influence
    your website's presence in generative AI search in the long run more than any of
    the other suggestions in this guide."*
  - *"Build and maintain a clear technical structure"* — existing technical SEO
    best practices continue to be worthwhile.
  - *"Optimize your local business and ecommerce details"* — *"Where appropriate,
    generative AI responses can include ... information about local businesses.
    Using products like Merchant Center ... and Google Business Profiles can help
    your products and services to be visible in both AI responses and other Google
    Search results."*
  - A **"Mythbusting generative AI search: what you don't need to do"** section:
    *"While terms like Answer Engine Optimization (AEO) or Generative Engine
    Optimization (GEO) are common online, many suggested 'hacks' aren't effective or
    supported by how Google Search actually works."*
  - *"To measure how your content is performing in generative AI features on Google
    Search and Discover, use the Generative AI performance report in Search
    Console."*
  - An **agentic experiences** section describing browser agents that *"may access
    your website to gather the data they need to complete these tasks, such as
    analyzing visual renderings (like screenshots), inspecting the DOM structure,
    and interpreting the accessibility tree"*, pointing to
    https://web.dev/articles/ai-agent-site-ux and mentioning *"Protocols like
    Universal Commerce Protocol (UCP)"* as emerging.
- **Why it matters to Straight Flush:** This is the first *official* Google statement
  that AI-feature visibility is gated on ordinary Search fundamentals plus Google
  Business Profile / local business details — i.e. it directly supports the repo's
  diagnose-first, no-hack strategy and *argues against* buying AEO/GEO "hacks". It
  also names the **Generative AI performance report in Search Console** as the
  measurement surface, which is the same access blocked by P-002 (no GSC
  connection) — so our AI-surface numbers stay `unverified` for first-party data.
  The local-business sentence is additional evidence for prioritising Google
  Business Profile completeness (a Level-3/owner action, so proposal-only).
  (fetched 2026-10-20, HTTP 200) · https://developers.google.com/search/docs/appearance/establish-business-details
  (fetched 2026-10-20, HTTP 200) · https://web.dev/articles/ai-agent-site-ux (cited by
  the guide; **not** fetched this run) · **Confidence:** high (primary source, fetched;
  quotes verbatim).
- **Proposed action (if any):** (1) keep FAQ/answer content for humans and AI answers
  but never describe it as an AEO "hack"; (2) add "GBP completeness" to the
  proposal queue for owner action (Level 3 — we cannot edit the profile);
  (3) treat the Generative AI performance report as the *first* thing to read when
  P-002 is approved. No code change warranted this run.

## 2026-10-20 — Google Search Central blog: curated "learning paths" (SEO fundamentals / technical SEO)

- **What changed / observed:** The most recent Search Central blog post in the index
  fetched this run (https://developers.google.com/search/blog, HTTP 200) is
  *"New learning paths: curated YouTube playlists for Search fundamentals and
  Technical SEO"* — https://developers.google.com/search/blog/2026/10/seo-learning-paths
  (fetched 2026-10-20, HTTP 200). It is a **training-resource** announcement, not a
  ranking or policy change.
- **Why it matters to Straight Flush:** No ranking impact. Recorded so future runs do
  not mistake it for a substantive algorithm/policy update. The genuinely relevant
  recent items in the same index remain *"update-site-reputation-policy"* (2026-08)
  and *"gen-ai-performance-reports"* (2026-06) — both already tracked.
- **Source(s):** https://developers.google.com/search/blog/2026/10/seo-learning-paths
  · https://developers.google.com/search/blog · **Confidence:** high (primary source,
  fetched; classified as informational).

## 2026-10-20 — Trade-press observation: tankless/heat-pump water-heater product flow continues

- **What changed / observed:** The PHCPPros home page (https://www.phcppros.com/,
  fetched 2026-10-20, HTTP 200) leads with product and technical items including a
  condensing combi-boiler, an electric tankless water heater, a residential ducted
  ventilation unit, and video explainers on domestic pressure boosting and
  air-to-water heat-pump efficiency. Observed as **topic flow only** — no ranking
  claim, no statistic taken from it.
- **Why it matters to Straight Flush:** Consistent with the standing, evidence-backed
  demand signal that Orange County homeowners ask about water-heater *type* choices
  (tank vs tankless) and pressure issues — both already present in
  `KEYWORD_UNIVERSE.md`. Supports keeping water-heater and water-pressure content
  current; it does **not** justify any new product claim (that would be Level 3).
- **Source(s):** https://www.phcppros.com/ (fetched 2026-10-20, HTTP 200).
  **Confidence:** low (trade-press home page, editorial flow only — not a verified
  demand measurement).

## 2026-10-20 — Google has fully retired the FAQ rich result (primary source, high confidence)

- **What changed / observed:** Google's own structured-data changelog states that the
  FAQ rich result was deprecated (changelog entry dated **May 8**, "This feature will
  no longer appear in Google Search starting **May 7, 2026**"), and that documentation
  for the feature was **removed** ("Removed documentation for the FAQ rich result
  feature … The FAQ rich result feature is no longer shown in Google Search results").
  A prior change (September) had already restricted the feature to "well-known,
  authoritative government and health websites." Verbatim from
  https://developers.google.com/search/docs/appearance/structured-data/faqpage
  (fetched 2026-10-20, HTTP 200).
- **Why it matters to Straight Flush:** It **changes the evidence for IDEA-03**
  (FAQPage schema on method pages). FAQPage markup no longer produces a Google rich
  result for a local plumbing business, so it must **not** be justified as a rich-result
  play. It remains defensible only as machine-readable entity/answer clarity for
  AI answer engines and non-Google consumers — which is a *different, weaker* claim
  than the one originally recorded. IDEA-03 is therefore re-scoped and its rank
  lowered; see `INNOVATION_IDEAS.md`.
- **Counter-observation (verified, same day):** repeat competitor Evans Leak Detection
  still ships `FAQPage`+`Question`+`Answer` markup (https://evansleakdetection.com/,
  HTTP 200, 3 `ld+json` blocks). Presence is verified; that it *causes* ranking is a
  hypothesis and the deprecation argues against it.
- **Source(s):** https://developers.google.com/search/docs/appearance/structured-data/faqpage
  (fetched 2026-10-20, HTTP 200). **Confidence:** high (primary source, verbatim).
- **What we should do:** keep FAQ *content* for users and AI surfaces; stop treating
  `FAQPage` as a Google rich-result win, and do not spend a change window on it.

---

## 2026-10-20 — Google states its spam policies apply to generative-AI answers (primary source)

- **What changed / observed:** Google's structured-data changelog records a change
  "Clarifying that spam policies apply to generative AI responses in Google Search …
  To make it clear that the spam policies apply to all of Google Search, including
  generative AI responses." Verbatim from
  https://developers.google.com/search/docs/appearance/structured-data/faqpage
  (fetched 2026-10-20, HTTP 200).
- **Why it matters to Straight Flush:** Reinforces existing policy — no fabricated
  reviews, no doorway city pages, no invented claims — now explicitly extending to AI
  answers. It validates the engine's existing no-manipulation rule (ground rule 8)
  as an *official* requirement, not just our ethics.
- **Source(s):** https://developers.google.com/search/docs/appearance/structured-data/faqpage
  (fetched 2026-10-20, HTTP 200). **Confidence:** high (primary source, verbatim).
## 2026-10-21 — Google Search Central: "AI features and your website" (primary source, fetched)

- **What changed / observed:** Google Search Central now carries a dedicated guide
  *AI features and your website* covering how **AI Overviews** and **AI Mode** work
  from a site owner's perspective. Key statements fetched verbatim: both features
  "may use a **query fan-out** technique — issuing multiple related searches across
  subtopics and data sources"; AI features "surface relevant links"; and to be
  eligible "a page must be **indexed and eligible to be shown in Google Search**"
  and follow the same foundations — technical requirements, Search policies, and
  "creating helpful, reliable, people-first content". A companion navigation entry
  *Optimizing for generative AI search* now appears in the Search Essentials section
  (its deep-link 404s at the time of fetch; the AI-features page is the live one).
- **Why it matters to Straight Flush:** This is the **primary-source** confirmation of
  the AEO premise the Growth Engine has been acting on: there is no separate
  AI-only ranking trick — eligibility is inherited from being indexed and helpful.
  It also explains *why* query fan-out rewards **breadth of specific, answerable
  service/city content**: one homeowner question fans out into several sub-queries,
  and each page that can answer a sub-query is a candidate supporting link. This
  supports the existing per-service and per-city page strategy (and the FAQ *content*
  for AEO) while confirming there is nothing to game.
- **Source(s):** https://developers.google.com/search/docs/appearance/ai-features
  (fetched 2026-10-21, HTTP 200) · https://developers.google.com/search/blog
  (Search Central changelog index, fetched 2026-10-21, HTTP 200).
  **Confidence:** high (primary source, fetched).
- **Proposed action (if any):** none required. Reinforces existing strategy; no
  website change warranted by this entry alone.

## 2026-10-21 — Google Search Central: "Establish your business details with Google" (primary source, fetched)

- **What changed / observed:** Google publishes a consolidated guide on establishing
  official business details: **claim your Business Profile** (address, contact info,
  business type, photos → Google Maps + knowledge panel), **register the website in
  Search Console** to "verify website ownership", **update the Google knowledge panel**
  as a verified representative, and add **structured data** — explicitly naming
  `Organization` (site logo) and `Breadcrumbs` as features "all websites can benefit
  from".
- **Why it matters to Straight Flush:** The guide names the exact levers the entity
  work depends on. Two are already done (BreadcrumbList JSON-LD; Search Console
  verification is *blocked* on owner credentials, P-002). The **Business Profile
  claim** and **knowledge-panel ownership** are the unblocked-but-owner-gated items
  that ISSUE-014/ISSUE-018 (duplicate base44/wix hosts splitting the entity) make
  urgent: Google can only let a verified owner override what it finds automatically.
- **Source(s):** https://developers.google.com/search/docs/appearance/establish-business-details
  (fetched 2026-10-21, HTTP 200). **Confidence:** high (primary source, fetched).
- **Proposed action (if any):** propose (owner action) — claim Business Profile and
  knowledge panel; no website change.

---

## 2026-10-24 — Google: "query fan-out" is how AI Overviews / AI Mode gather sources; sitemap `<priority>`/`<changefreq>` are ignored, `<lastmod>` is used only if verifiably accurate

- **What changed / observed (entry 1 — AI surface):** The primary Google Search
  Central page "AI features and your website" states that AI Overviews and AI Mode
  "may use a **query fan-out** technique — issuing multiple related searches across
  subtopics and data sources — to develop a response". It also states that to be
  eligible as a *supporting link* a page must be indexed and eligible to show a
  snippet, that "there are no additional requirements" beyond the normal technical
  requirements, that no AI-specific optimization is required, and that AI-feature
  impressions are folded into the ordinary Search Console Performance report. The
  page was fetched live this run and is unchanged in its core claims from the
  standing reference row, but the **query fan-out** wording is the operational
  detail worth recording: a single conversational query is decomposed into several
  sub-queries, so coverage of *adjacent* sub-topics (cost, insurance, diagnosis,
  prevention) is what makes a page reachable across the fan-out, not repetition of
  one head term.
- **Why it matters to Straight Flush:** It reframes "AI visibility" from a single
  keyword to a **topic cluster** test. It also confirms the site's existing
  strategy — plain-language answer-first content on slab leaks, insurance, and
  diagnostics — is directionally right, and that the measured absence in AI answers
  is a *coverage/authority* problem rather than a missing "AI trick". It is
  consistent with the P-002 blocker: AI-feature performance is only diagnosable
  inside Search Console, which is not connected.
- **Source(s):** https://developers.google.com/search/docs/appearance/ai-features
  (fetched 2026-10-24, HTTP 200) · **Confidence:** high (primary source, fetched).
- **What changed / observed (entry 2 — sitemap semantics):** The primary Google
  sitemap documentation states plainly: "**Google ignores `<priority>` and
  `<changefreq>` values**" and "Google uses the `<lastmod>` value **if it's
  consistently and verifiably (for example by comparing to the last modification of
  the page) accurate**."
- **Why it matters to Straight Flush:** Directly validates today's sitemap fix.
  `refresh_sitemap.py` preserves existing `changefreq`/`priority` and derives
  `lastmod` from `git log -1 --format=%cs` — i.e. it keeps the one field Google
  actually reads **verifiably accurate**, and treats the two ignored fields as inert
  carry-through. It also lowers the stakes of the ordering-only diff: ordering has no
  documented effect on Google, so the fix is purely about making our own idempotency
  check meaningful, not about ranking.
- **Source(s):** https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
  (fetched 2026-10-24, HTTP 200) · **Confidence:** high (primary source, fetched).
- **Proposed action (if any):** Recorded only. Idea `idea-2026-10-24-03` (query
  fan-out coverage map) is derived from entry 1; no code change follows from entry 2.

## 2026-10-25 — Google Search Central documents AI features (primary source)

- **What changed / observed:** Google Search Central now documents, on its own
  primary page, how a site appears in **AI Overviews** and **AI Mode** —
  `https://developers.google.com/search/docs/appearance/ai-features`
  (fetched 2026-10-25, HTTP 200, page `Last updated 2025-12-10 UTC`). The
  substantive points, quoted or paraphrased from that page:
  - "You can apply the same foundational SEO best practices for AI features as you
    do for Google Search overall" — the only *technical* requirement to be a
    supporting link is that the page "must be indexed and eligible to be shown in
    Google Search with a snippet."
  - "You don't need to create new machine readable files, AI text files, or markup
    to appear in these features. There's also no special schema.org structured data
    that you need to add."
  - Worthwhile fundamentals it lists: crawlable in `robots.txt`, findable via
    **internal links**, good page experience, important content available as
    **text**, supporting images/video, **structured data matching the visible
    text**, and up-to-date Merchant Center / Business Profile information.
  - A **query fan-out** technique: AI Overviews / AI Mode "issu[ing] multiple
    related searches across subtopics and data sources", surfacing "a wider and
    more diverse set of helpful links".
  - Measurement: AI-feature clicks count in the Search Console Performance report
    under the "Web" search type; "clicks from search results pages with AI
    Overviews … are higher quality."
- **Confidence:** high — primary source, fetched directly.
- **Why it matters to Straight Flush:** Google states on the record that appearing
  in AI answers needs **no special markup**. Any plan resting on "AI files"
  (`llms.txt` as a *Google ranking* lever) or new schema for AI eligibility is
  unsupported. It validates the site's existing strengths (text-first content,
  internal linking, matching JSON-LD) and lifts **internal linking** and **Business
  Profile accuracy** to the top of the AI-visibility checklist. `llms.txt` remains
  useful for non-Google AI crawlers but is **not** a Google AI-feature requirement,
  and the repo should not claim otherwise (see `idea-2026-10-25-05`).

---


## 2026-10-26 — Google Search Central clarifies hyphen-vs-underscore URL word separation (changelog 2026-10-23)

- **What changed / observed:** the *What's new in Google Search* changelog
  (https://developers.google.com/search/updates, fetched 2026-10-26, HTTP 200) lists an
  **October 23, 2026** update: "Updated guidance on crawlable URL structures … to clarify
  word separation guidelines using hyphens versus underscores." The underlying page
  *URL structure best practices*
  (https://developers.google.com/search/docs/crawling-indexing/url-structure, fetched
  2026-10-26, HTTP 200) now states: "Use hyphens to separate words … instead of
  underscores. For historical reasons, we don't recommend using underscores, as
  underscores are commonly used for denoting concepts that should be kept together,
  whereas hyphens clearly signal a word boundary."
- **Why it matters to Straight Flush:** our canonical URL convention is already
  hyphenated. Verified locally this run: `sitemap.xml` contains **89** `<loc>` URLs and
  **0** of them contain an underscore (`grep -o '<loc>[^<]*</loc>' sitemap.xml | grep -c '_'`
  → 0). So this guidance change requires **no** URL migration for us, and it is worth
  recording as a *confirmed compliance* rather than an action item — a change to this
  guidance would otherwise have been a plausible trigger for a costly redirect map.
- **Source(s):** https://developers.google.com/search/updates ·
  https://developers.google.com/search/docs/crawling-indexing/url-structure
  · **Confidence:** high (both primary sources, fetched, HTTP 200).
- **Proposed action (if any):** none. Recorded; the hyphen convention is a standing
  invariant to re-check if a future generator emits filenames.

## 2026-10-26 — Google Search Console Indexing API quota page refreshed (changelog 2026-10-16)

- **What changed / observed:** the same changelog lists an **October 16, 2026** update:
  "Updating the Indexing API quota page … to reflect the current quota limits and
  process," removing "an outdated form". The affected page is
  https://developers.google.com/search/apis/indexing-api/v3/quota (linked from
  https://developers.google.com/search/updates, fetched 2026-10-26, HTTP 200).
- **Why it matters to Straight Flush:** the Indexing API is *not* a general-purpose
  submission channel — Google restricts it to `JobPosting` and livestream
  (`BroadcastEvent`) structured data, so it is **not applicable** to a plumbing site and
  must not be proposed as an indexing shortcut. Recording the quota-page refresh mainly
  prevents a future run from mis-reading it as a new submission opportunity, and keeps
  the "how do we get new pages indexed" question pointed at `sitemap.xml` + Search
  Console URL inspection (still behind P-002) rather than an ineligible API.
- **Source(s):** https://developers.google.com/search/updates ·
  https://developers.google.com/search/apis/indexing-api/v3/quota
  · **Confidence:** high (changelog primary source fetched; scope restriction is
  long-standing documented Google policy).

## 2026-10-30 — Google Search Central: October 2026 doc updates (UGC spam, crawlable URLs, share controls)

- **What changed / observed:** the *Latest documentation updates* page
  (https://developers.google.com/search/updates, fetched 2026-10-30, HTTP 200)
  lists three October 2026 refreshes: **Oct 26** — updated guidance on preventing
  **user-generated spam** (block indexing of link-shared content; monitor abuse in
  Search Console); **Oct 23** — updated **crawlable URL structures** guidance,
  clarifying **hyphens vs underscores** word separation; **Oct 21** — the
  *Control what you share with Google Search* refresh that folds in the
  **Search generative AI control** (already logged here 2026-10-23). The URL
  structure page itself (https://developers.google.com/search/docs/crawling-indexing/url-structure,
  fetched 2026-10-30, HTTP 200, footer `Last updated 2026-10-21 UTC`) confirms:
  "we recommend using **hyphens** ( - ) instead of underscores ( _ ) to separate
  words in your URLs", and that "URLs are case sensitive".
- **Why it matters to Straight Flush:** the site already uses hyphenated,
  `.html`-terminated paths (`/cities/laguna-niguel.html`, `/case-studies/...`), so
  it is **already compliant** with the Oct 23 clarification — no change warranted.
  The value is confirmatory: it removes any temptation to "optimise" URL shape and
  documents that the repo's canonical `.html` convention is aligned with current
  Google guidance. The UGC-spam note is **not applicable** — the site has no
  user-generated content or link-sharing surface (only two pages carry forms, and
  neither publishes submissions).
- **Source(s):** https://developers.google.com/search/updates ·
  https://developers.google.com/search/docs/crawling-indexing/url-structure
  · **Confidence:** high (both primary sources, fetched, HTTP 200).
- **Proposed action (if any):** none. Recorded only; no page, schema, or copy changed.


---

## 2026-11-01 — Google plans a shared AI-training control in robots.txt (AIPREF)

- **What changed / observed:** Google Search Central published *Supporting a shared AI
  training control for websites* on **Friday, 30 October 2026**
  (https://developers.google.com/search/blog/2026/10/ai-training-control, fetched
  2026-11-01, HTTP 200). Google plans to support a **shared robots.txt "policy token"**
  so a site can express AI-training preferences **once** across participating AI
  providers, based on the IETF **AIPREF** working group. Key operational details quoted
  from the post: if a site uses the policy token to **opt out** of training and
  **Google-Extended is not explicitly specified**, Google "plans to interpret that as if
  the publisher had disallowed Google-Extended"; and "**Websites that specifically allow
  Google-Extended are eligible to appear in responses and receive clicks via grounding in
  Gemini Apps**." Existing per-crawler controls (e.g. Google-Extended) continue to work
  alongside the new joint signal.
- **Why it matters to Straight Flush:** the business goal is *AI recommendation*, and this
  post confirms the mechanism by which a site keeps that eligibility: an **explicit
  `Google-Extended: Allow`**. SF's `robots.txt` (repo and live, verified 2026-11-01) already
  names `User-agent: Google-Extended` / `Allow: /` alongside GPTBot, OAI-SearchBot,
  ClaudeBot, Claude-SearchBot, PerplexityBot, Applebot-Extended, Bingbot, and others. So SF
  is already opted **in** on the documented path — nothing to change today. The forward risk
  is a *future* edit that adopts a generic shared opt-out token and thereby silently drops
  Google-Extended eligibility. That is a monitoring note, not a change.
- **Source(s):** https://developers.google.com/search/blog/2026/10/ai-training-control
  · **Confidence:** high (primary source, fetched, HTTP 200). The proposal is a **plan** —
  Google writes "We aim to support this new control"; it is not yet a live product, so it
  is recorded as an announced direction, not an available feature.
- **Proposed action (if any):** recorded only. Added a `robots.txt` guard note to the
  standing monitoring list (idea-2026-11-01-04). No file changed.

## 2026-11-01 — Google Search Console adds a Generative AI performance report (context for P-002)

- **What changed / observed:** the Search Central blog index
  (https://developers.google.com/search/blog, fetched 2026-11-01, HTTP 200) lists
  *Introducing Search Generative AI performance reports in Search Console*
  (June 2026) and *Announcing web multimodal Search performance reporting in Search
  Console* (September 2026), plus *See how content from social and video platforms
  performs on Google Search* (July 2026). These are **Search Console reporting surfaces**
  for AI-feature and multimodal performance.
- **Why it matters to Straight Flush:** measuring whether SF appears in Google's
  generative-AI features is exactly the goal this engine reports on, and Google now exposes
  a first-party report for it — but it lives **inside Search Console**, behind the **P-002**
  credential blocker. This run again confirms **no GSC/GA4/GBP credentials** are present in
  the environment (see the report's limitations section). Recording this as *unmeasured*,
  never zero. It is one more concrete reason P-002 is the highest-value unblocked item.
- **Source(s):** https://developers.google.com/search/blog (index, HTTP 200; individual post
  slugs `/search/blog/2026/06/gen-ai-performance-reports`,
  `/search/blog/2026/09/web-multimodal-in-sc`) · **Confidence:** medium (post titles and
  dates verified on the official index; the report contents were **not** fetched this run).
- **Proposed action (if any):** recorded only; folded into the P-002 note. No proposal file
  (P-002 already covers Search Console access).

## Standing official references (stable primary sources)

| Topic | Source | URL | Verified | Confidence |
|---|---|---|---|---|
| Google Search Essentials | Google Search Central | https://developers.google.com/search/docs/essentials | 2026-10-11 | high |
| Structured data policies | Google Search Central | https://developers.google.com/search/docs/appearance/structured-data/sd-policies | 2026-10-11 | high |
| Local business structured data | Google Search Central | https://developers.google.com/search/docs/appearance/structured-data/local-business | 2026-10-11 | high |
| Helpful content / people-first | Google Search Central | https://developers.google.com/search/docs/fundamentals/creating-helpful-content | 2026-10-11 | high |
| AI features & your site | Google Search Central | https://developers.google.com/search/docs/appearance/ai-features | 2026-10-25 | high |
| Search Console performance report | Google Search Central | https://support.google.com/webmasters/answer/7576553 | 2026-10-11 | high |
| Schema.org LocalBusiness | schema.org | https://schema.org/LocalBusiness | 2026-10-11 | high |
| CSLB license lookup (CA) | CA Contractors State License Board | https://www.cslb.ca.gov/onlineServices/CheckLicenseII/CheckLicense.aspx | 2026-10-11 | high |

> These are seeded, stable references used by every run. Daily/weekly runs append
> dated entries below and refresh `Verified` when a page changes materially.

## 2026-10-29 — Google Search Central: Oct 23 URL-structure guidance and Oct 26 user-generated-spam guidance

- **What changed / observed:** the *What's new in Google Search* changelog
  (https://developers.google.com/search/updates, fetched 2026-10-29, HTTP 200) lists
  two October documentation updates newer than the entries recorded on 2026-10-23:
  - **October 23, 2026 — "Updated guidance on crawlable URL structures"**: the URL
    structure best-practices page
    (https://developers.google.com/search/docs/crawling-indexing/url-structure)
    was updated "to clarify word separation guidelines using hyphens versus
    underscores". This is a *clarification*, not a new ranking factor.
  - **October 26, 2026 — "Updated guidance on preventing user-generated spam"**:
    the user-generated spam prevention guide gained guidance on "blocking indexing
    of link-shared content and monitoring abuse in Search Console".
- **Why it matters to Straight Flush:** (a) the hyphen/underscore clarification
  confirms the site's existing convention — every URL in `sitemap.xml` uses
  hyphenated words (`case-studies/laguna-niguel-slab-leak-detection-1.html`), so no
  URL change is warranted and none should be made. (b) The UGC-spam guidance is
  aimed at platforms that host user content, not a static owner-operated site, so it
  is **not applicable** here — recorded for completeness, no action.
- **Source(s):** https://developers.google.com/search/updates ·
  https://developers.google.com/search/docs/crawling-indexing/url-structure
  · **Confidence:** high (primary source, fetched, HTTP 200).
- **Proposed action (if any):** none. Confirmed the existing hyphenated-URL
  convention is correct; no page, schema, or copy changed.

---

## 2026-10-29 — Recurring homeowner question: "how to find a hidden water leak" is answered by generic guides, not by a licensed-local voice

- **What changed / observed:** a conventional-search probe on 2026-10-29
  (Tavily Search API, `test_type: conventional_proxy`) for the homeowner-intent
  query *"homeowner questions how to find a hidden water leak"* returned a top set
  dominated by **national content/lead-gen sites** rather than local licensed
  plumbers: `homealliance.com`, `watercalculator.us`, `ircplumbing.com`,
  `plumbingtoolsreview.com`, `repairingwaterdamage.com`, `plumbingsniper.com`
  (all fetched as ranked result titles on 2026-10-29; individual pages **not**
  fetched this run, so the *content* of each is unverified — only its ranking is
  observed). The companion probe *"acoustic leak detection technology plumbing 2026"*
  returned a single forum thread (`plumbingforums.com`), i.e. thin authoritative
  coverage of the *diagnostic-technology* angle.
- **Why it matters to Straight Flush:** the informational "hidden water leak"
  question is a high-intent entry point (it precedes an emergency call) and the
  current answer set is generic, not local or license-backed. This is consistent
  with the 2026-10-23 Google guidance that AI/search rewards a "unique point of
  view" — the owner's actual field diagnostics (acoustic listening, thermal imaging,
  meter/dye isolation) are the differentiated input. It supports the existing
  `idea-2026-10-23-06` (owner field-notes) rather than a new city-page permutation.
- **Source(s):** Tavily Search API ranked results, 2026-10-29
  (`data/ai_visibility_history.jsonl`, `platform: tavily_search`);
  https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
  · **Confidence:** medium (result set observed; page contents not fetched).
- **Proposed action (if any):** none on the site this run; recorded to reinforce
  the owner field-notes idea. No page, schema, or copy changed.

---




---



---

## 2026-10-27 — Google's official guide to generative-AI search (primary source)

**Source:** https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
(fetched 2026-10-27; page shows "Last updated 2026-07-10 UTC"). Confidence: **high**
(Google Search Central, primary source).

Key claims quoted/paraphrased from the page:

- **SEO still applies to AI search.** Google states its generative AI features "are
  rooted in our core Search ranking and quality systems," using RAG (grounding) and
  **query fan-out** (a model generates concurrent related queries to fetch more
  results). Implication: a page must rank in the *core* index to be retrievable for
  AI features — the AI surface is downstream of conventional ranking, not separate.
- **"AEO"/"GEO" are not a separate discipline.** Google frames them as SEO for the
  AI search experience and points to its "evaluating third-party SEO advice"
  guidance. This matches `AI_VISIBILITY_METHODOLOGY.md`: measure AI surfaces
  directly, don't infer them from conventional results.
- **Non-commodity content wins.** "Create valuable, non-commodity content … will
  likely influence your website's presence in generative AI search in the long run
  more than any of the other suggestions." Google contrasts *commodity* content
  ("7 Tips for First-Time Homebuyers") with a *non-commodity* example that is
  strikingly close to this business: "**Why We Waived the Inspection & Saved Money:
  A Look Inside the Sewer Line**." It calls out **"providing a unique point of
  view"** — first-hand experience — as a differentiator over summaries.
- **Supporting signals:** clear headings/structure, high-quality images and video
  (Google says AI features can surface images/video, "more opportunities for your
  website to appear beyond web page links").

**Why it matters for SFPL (hypothesis, medium confidence):** SF is owner-operated
with 30+ years of hands-on experience (per `BUSINESS_PROFILE.md`). That is exactly
the "unique point of view / first-hand experience" Google says distinguishes
non-commodity content. The actionable, low-risk direction is *owner-experience*
content (real diagnostic reasoning, decision trade-offs) rather than more
city/service templated pages. This reinforces the existing `candidate` ideas in
`INNOVATION_IDEAS.md` about owner field-notes, which are blocked on real
owner-supplied detail (fabricating case notes is forbidden).

**Not claimed:** the page does not publish ranking factors, weights, or a list of
"AI signals," and this run does not infer any from it.
## 2026-10-28 (Intelligence HQ daily)

- **What changed / observed:** the *What's new in Google Search* changelog
  (https://developers.google.com/search/updates, fetched 2026-10-28, HTTP 200,
  page footer `Last updated 2026-10-26 UTC`) lists an **April 30, 2026** entry:
  *"Expanding preferred sources to all languages where Google Search is available"* —
  the **preferred sources** feature now works in **all languages where Google Search
  is available**, including new translated downloadable buttons. The AI-features
  documentation (https://developers.google.com/search/docs/appearance/ai-features,
  fetched 2026-10-28, HTTP 200, `Last updated 2025-12-10 UTC`) is unchanged from the
  version already logged.
- **Why it matters to Straight Flush:** "preferred sources" lets a searcher
  nominate outlets they want to see more of — a **personalisation** signal, not a
  ranking boost, so it does not change what a first-time local searcher sees for
  "plumber in Laguna Niguel". Its practical value to SF is indirect: it reinforces
  that Google is investing in **source-trust** surfaces, which rewards the things
  this engine can still act on without credentials — a real, consistently-named
  business entity, a physical service area, and first-hand method content. The
  language expansion matters little for an English-only Orange County audience.
  The **Search generative AI control** (from the 2026-10-21 doc update, still behind
  P-002) remains the higher-value unverified item.
- **Source(s):** https://developers.google.com/search/updates ·
  https://developers.google.com/search/docs/appearance/ai-features ·
  **Confidence:** high (both primary Google Search Central sources, fetched, HTTP 200).
- **Proposed action (if any):** recorded only; no proposal. Preferred sources is a
  consumer-side control with no site-side change required.

---

## 2026-11-02 (Intelligence HQ daily)

- **What changed / observed:** the Google Search Central documentation changelog
  (https://developers.google.com/search/updates, fetched 2026-11-02, HTTP 200, footer
  `Last updated 2026-10-26 UTC`) still lists **no new entries after October 26, 2026**
  (the user-generated-spam and crawlable-URL updates already logged 2026-10-30). The
  Google Search Central blog index (https://developers.google.com/search/blog, fetched
  2026-11-02, HTTP 200) shows only category landing pages and no dated posts newer than
  the 2026-10-30 AIPREF post. The AI-optimization guide
  (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide, HTTP
  200, `Last updated 2026-07-10 UTC`) and the local-business structured-data doc
  (https://developers.google.com/search/docs/appearance/structured-data/local-business,
  HTTP 200, `Last updated 2026-09-08 UTC`) are both unchanged from the versions already
  recorded. **No new official Google guidance to action today.**
- **Why it matters to Straight Flush:** this is a "nothing changed" observation recorded
  deliberately — it confirms the standing guidance in `AI_VISIBILITY_METHODOLOGY.md` is
  still current, so the engine does not invent a change to justify content. The practical
  read is unchanged: SF's differentiator is first-hand, non-commodity owner experience
  (the AI-optimization guide's own framing), and the highest-value unverified item remains
  the **P-002** Search Console / Generative-AI performance report.
- **Source(s):** https://developers.google.com/search/updates ·
  https://developers.google.com/search/blog ·
  https://developers.google.com/search/docs/fundamentals/ai-optimization-guide ·
  https://developers.google.com/search/docs/appearance/structured-data/local-business ·
  **Confidence:** high (all primary Google Search Central sources, fetched, HTTP 200).
- **Proposed action (if any):** recorded only; no change.

## 2026-11-02 — Diagnostic-technology / industry signal: leak detection is the lead 2026 service theme (third-party, medium confidence)

- **What changed / observed:** a third-party industry blog
  (https://fieldedge.com/blog/new-plumbing-technology-in-2026-whats-worth-paying-attention-to-whats-not,
  fetched 2026-11-02, HTTP 200, dated September 17, 2026) frames the 2026 plumbing
  technology themes as **smart leak detection systems, water-monitoring/conservation
  tools, advanced sewer/drain inspection equipment, and predictive maintenance**, and
  argues the value is "technology that helps plumbing companies solve real customer
  problems" rather than novelty. A separate Tavily result set for
  "plumbing industry news 2026 leak detection technology" surfaced multiple
  **leak-detection market reports** and "certification" framing for leak-detection
  services. This is **third-party commentary, not official Google guidance** — it is
  corroborating context, not a ranking input.
- **Why it matters to Straight Flush:** the recurring market theme matches SF's core
  positioning (leak detection) and the still-recurring gap observed this run — SF is
  **absent from every leak/slab query tested** while dedicated leak-specialist domains
  (evansleakdetection.com, leakstar.com, americanleakdetection.com) appear. The
  actionable, low-risk direction remains an **owner-experience explainer** of SF's own
  verified methods (acoustic/electronic/thermal/camera), which is the "unique point of
  view" the official Google guide rewards — *not* more templated pages.
- **Source(s):** https://fieldedge.com/blog/new-plumbing-technology-in-2026-whats-worth-paying-attention-to-whats-not
  (HTTP 200) · Tavily result set, 2026-11-02 (`data/ai_visibility_history.jsonl`).
  **Confidence:** medium (vendor blog = commercial interest; treated as context only).
- **Proposed action (if any):** reinforces `candidate` idea-2026-11-01-06 (equipment
  explainer); no file changed.

## 2026-11-02 — Recurring homeowner question: "slab leak — what happens next?" is answered by competitors' FAQ pages, not by SF

- **What changed / observed:** a Tavily query for
  `homeowner questions slab leak repair what to expect` (2026-11-02) returned
  **competitor FAQ/education pages** — `barkerandsonsplumbing.com/slab-leak-faqs`
  (fetched 2026-11-02, HTTP 200, titled "Slab Leak FAQs for Orange County & Anaheim
  Homeowners"), `leaktronics.com` ("Find the Leak Before You Break the Floor"),
  `servpro.com`, `callmother.com` ("When to Tunnel vs When to Reroute"), plus a Reddit
  r/homeowners thread. The recurring homeowner questions are: *how do I know it's a slab
  leak, what will the repair involve, will you break the floor, tunnel vs reroute, and
  what does it cost.* SF was **absent** from this set.
- **Why it matters to Straight Flush:** this is the same answer-first, question-intent
  pattern the engine has logged repeatedly, now confirmed with a fetched competitor page.
  A **symptom-first, question-answering section** (no prices — Level 3) on SF's existing
  slab-leak page is the low-risk response; it extends the standing idea cluster rather
  than creating a new thin page.
- **Source(s):** https://www.barkerandsonsplumbing.com/slab-leak-faqs (HTTP 200) ·
  Tavily result set, 2026-11-02. **Confidence:** medium (competitor page fetched; the
  Reddit thread was observed in results but not fetched).
- **Proposed action (if any):** reinforces `candidate` idea-2026-11-02-04 (below); no
  file changed this run.
