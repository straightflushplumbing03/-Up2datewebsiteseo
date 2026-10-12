# Industry Watch — Straight Flush Plumbing & Leak Detection

Reverse-chronological dated entries covering: plumbing-industry developments,
official Google Search Central documentation (primary sources only), recurring
homeowner questions, diagnostic technology, and legitimate local-search
opportunities. Every external claim cites the exact URL fetched and a confidence
level. "Feature observed" ≠ "caused a ranking" unless stated.

**Method note:** entries below were fetched with a normal browser User-Agent on
the date shown. Search Guidance entries use only Google's own primary
documentation (developers.google.com/search). Homeowner questions are drawn from
the *result titles* of the 2026-10-12 DuckDuckGo Lite sweep
(`data/ai_visibility_history.jsonl`), which reflect what public pages are
answering — a proxy for recurring homeowner intent, not a survey.

---


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

## 2026-10-12

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
