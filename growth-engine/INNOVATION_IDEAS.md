# Innovation Ideas — Straight Flush Plumbing & Leak Detection

Internal idea register. **Every daily run adds at least five new candidate ideas**
(website or business), then *prioritizes* them — the ranking must be evidence-backed,
not "easiest content to generate". An idea is only promoted to a proposal/PR when it
clears the evidence bar below.

**Scoring (each 1–5, higher is better):** Impact · Evidence · Effort-to-value ·
Reversibility (5 = trivially reversible). Risk is a separate gate (see below).

**Evidence bar:** an idea needs at least one *fetched, cited* observation
(a competitor feature actually seen, an official guideline actually read, a
homeowner question actually encountered). Ideas with no evidence stay in
`candidate` and are never actioned.

**Risk gate:** anything touching identity, phone, prices, legal claims, warranty,
service-area commitments, DNS/hosting, or business profiles is Level 3 — propose to
the owner, never execute.

**Status values:** `candidate` · `scored` · `proposed` · `approved` · `in-progress`
· `shipped` · `rejected` · `parked`. Rejected/parked ideas are kept with the reason.

---

## Register

| ID | Date | Idea | Type | Impact | Evid | Effort | Rev | Risk | Status | Evidence / source | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| idea-2026-10-12-01 | 2026-10-12 | Add per-city × slab-leak-detection landing pages for Tier-1 cities | Website | 5 | 4 | 3 | 5 | L2 | scored | Tier A competitors (evansleakdetection.com, streamlineplumbing.org, calischoice.com) surface a dedicated slab-leak page per city — feature verified 2026-10-11, `COMPETITOR_DIRECTORY.md` | Gap #2 in `COMPETITOR_DIRECTORY.md`. Reuse existing city + service templates; no new claims. |
| idea-2026-10-12-02 | 2026-10-12 | Resolve `aggregateRating` structured-data hygiene (ISSUE-002) | Website | 3 | 3 | 2 | 5 | L2 | scored | Google structured-data policies (self-serving ratings) — `INDUSTRY_WATCH.md`; `KNOWN_ISSUES.md` ISSUE-002 | Corroborate rating against live Google/Yelp profiles before changing; else remove. |
| idea-2026-10-12-03 | 2026-10-12 | Ship the `llms-full.txt` / `/md/**` AI-readable files (still 404 in prod) | Website | 3 | 4 | 2 | 5 | L2 | scored | `KNOWN_ISSUES.md` ISSUE-001 follow-up; live 404 observed | Deploy step; files exist in repo. |
| idea-2026-10-12-04 | 2026-10-12 | Add a "How we find your leak" annotated process/photo sequence | Website | 4 | 3 | 3 | 5 | L2 | candidate | Brand-voice reference pages; no first-hand asset confirmed yet | Needs owner-supplied field photos (owner input). |
| idea-2026-10-12-05 | 2026-10-12 | Strengthen Google Business Profile + review flow (not a website change) | Business | 5 | 4 | 3 | 4 | L3 | proposed | Directory/aggregator dominance on "best plumber" queries — Yelp 27/28 in `COMPETITOR_DIRECTORY.md` | GBP is the channel; requires owner access. Propose only. |
| idea-2026-10-12-06 | 2026-10-12 | Publish an insurance-claim documentation checklist tool (interactive) | Website | 4 | 3 | 3 | 5 | L2 | candidate | `/insurance/` hub exists; `documentation-checklist.html` present | Extend existing asset; no coverage promises (APPROVED_CLAIMS). |
| idea-2026-10-12-07 | 2026-10-12 | Add FAQ schema + plain-language answers to top slab-leak pages | Website | 3 | 3 | 2 | 5 | L2 | candidate | FAQPage schema already used on some pages | **Re-scored 2026-10-13:** Google has **deprecated the FAQ rich result** (no Google eligibility), so the schema no longer yields a rich result. Keep answer-first FAQ *content* for AEO/human value; drop the "rich result" justification. See `INDUSTRY_WATCH.md` 2026-10-13. |
| idea-2026-10-13-01 | 2026-10-13 | City × slab-leak-detection landing for the 4 Tier-1 cities that lack one (Dana Point, San Clemente, Mission Viejo, Aliso Viejo) | Website | 5 | 4 | 3 | 5 | L2 | scored | This run: `leakstar.com` ranks a dedicated **/slab-leak-detection-service-laguna-niguel.html** page 1st for "slab leak detection Dana Point" and appears for San Clemente; `evansleakdetection.com`, `splashplumbing.com`, `clearwaterplumbingoc.com`, `americanleakdetection.com` recur. Feature verified; causation = hypothesis. | Extends idea-2026-10-12-01. One substantive page per city (no permutation), reuse existing city+service templates, no new claims. |
| idea-2026-10-13-02 | 2026-10-13 | Add a per-city **repipe/PEX** framing page (Dana Point, Mission Viejo) | Website | 4 | 4 | 3 | 5 | L2 | scored | "PEX repipe Dana Point" returned `ocrepipes.com`, `repipe1.com`, `repipe-dana-point.com`, `pexrepipe-repiping.com` — repipe queries skew to repipe-specialist domains; SF has `/services/pex-repiping.html` but no per-city frame. | Education/eligibility content, not a doorway page. Corroborate with `KNOWN_ISSUES` and `APPROVED_CLAIMS`. |
| idea-2026-10-13-03 | 2026-10-13 | Publish a "what the leak-detection equipment actually does" explainer (acoustic / electronic / thermal / camera) | Website | 4 | 3 | 3 | 5 | L2 | candidate | Repeated appearance of leak *specialists* (leakstar, evansleakdetection, leakdetectionplumbers.com) for slab/leak queries; SF's own service page lists the methods but no explanatory asset. | Differentiates the specialist positioning; no new claims. Needs brand-voice pass. |
| idea-2026-10-13-04 | 2026-10-13 | Add a "how much water is a hidden leak wasting?" education block using EPA WaterSense figures | Website | 3 | 5 | 2 | 5 | L2 | scored | EPA WaterSense primary source fetched: 180 gal/week, 9,400 gal/yr per family; ~900B gal/yr nationwide. | Attribute to EPA explicitly; no invented stats. High evidence, low effort. |
| idea-2026-10-13-05 | 2026-10-13 | Add `Service`/`areaServed` structured data to per-city service pages (not FAQ) | Website | 3 | 3 | 3 | 5 | L2 | candidate | Continued aggregator dominance + competitor use of `Plumber`/`FAQPage` schema (evansleakdetection.com: `Plumber` + `GeoCoordinates` + `OpeningHours`). | `FAQPage` is now worthless for Google rich results; `Service`/`areaServed` is the more durable local signal. Validate before shipping. |
| idea-2026-10-13-06 | 2026-10-13 | Add an on-page "Laguna Niguel · Dana Point · San Clemente · Mission Viejo · Aliso Viejo" service-area trust strip to primary service pages | Website | 3 | 3 | 2 | 5 | L2 | candidate | Verified city set in `SERVICE_AREAS.md`; competitors pair city + service on the same URL (e.g. Scott English `/service-area/plumber-in-{city}`). | Only verified areas; reinforces local relevance without new commitments. |
| idea-2026-10-13-07 | 2026-10-13 | Score and prepare (do **not** dispatch) a Google Business Profile review-request cadence | Business | 5 | 4 | 3 | 4 | L3 | proposed | Yelp appeared in 14 of 181 observed result slots (9 queries) this run, and 3/20 on "best plumber in Laguna Niguel"; aggregators dominate "best" queries. | GBP requires owner access. Propose only; no execution. |
| idea-2026-10-13-08 | 2026-10-13 | Add per-city × slab-leak/leak-detection pages for **Aliso Viejo + San Clemente + Mission Viejo** (Tier-1 gap fill) | Website | 5 | 4 | 3 | 5 | L2 | scored | 2026-10-13 Brave sweep: `evansleakdetection.com`, `calischoice.com`, `allstarplumbingservice.com`, `socalrepipes.com` recur on slab/leak queries in exactly these cities; `data/ai_visibility_history.jsonl` 2026-10-13 | Extends idea-2026-10-12-01. Reuse existing templates; no new claims. |
| idea-2026-10-13-09 | 2026-10-13 | Add a **Googlebot 2 MB byte-size sanity check** to the standing health checks | Website/ops | 2 | 5 | 1 | 5 | L2 | scored | Google Search Central Blog 2026-03-31 (fetched, HTTP 200) — 2 MB per-URL cap incl. headers; `INDUSTRY_WATCH.md` 2026-10-13 | Deterministic, cheap, catches future bloat. Purely additive test script. |
| idea-2026-10-13-10 | 2026-10-13 | Publish a "what drives slab-leak repair cost" explainer (no prices) | Website | 4 | 4 | 3 | 5 | L2 | candidate | Cost-intent query "how much does slab leak repair cost in Laguna Niguel" in 2026-10-13 sweep; 0 SF cost content on-page | Must NOT quote prices (Level 3). Explains variables only; proposal first. |
| idea-2026-10-13-11 | 2026-10-13 | Build a pinhole/copper-pipe leak diagnostic explainer page | Website | 3 | 3 | 3 | 5 | L2 | candidate | "pinhole leak in copper pipe Orange County" sweep: `twinplumbing.com`, `repipepro.net`, `ocplumber.com`, `repipesoc.com` rank; `data/ai_visibility_history.jsonl` 2026-10-13 | Academy-style; ties to existing leak-detection cluster. |
| idea-2026-10-13-12 | 2026-10-13 | Ship `llms-full.txt` / `/md/**` AI-readable files (still 404 in prod) | Website | 3 | 4 | 2 | 5 | L2 | scored | `KNOWN_ISSUES.md` ISSUE-001 follow-up; still 404 in prod | Restates idea-2026-10-12-03 with a deploy-plan angle; still unshipped. |
| idea-2026-10-13-13 | 2026-10-13 | Add a **"review our work" QR/print card** driving Google reviews after a job | Business | 4 | 3 | 3 | 4 | L3 | proposed | Yelp/aggregator dominance on "best plumber" queries (13/19 in 2026-10-13 sweep) — `COMPETITOR_DIRECTORY.md` | Review acquisition is owner-side; propose only. No incentive/fake reviews. |
| idea-2026-10-13-14 | 2026-10-13 | Add an internal-linking pass from Academy articles to the matching city/service pages | Website | 3 | 3 | 2 | 5 | L2 | candidate | Academy cluster exists; competitors pair city+service pages (`scottenglishplumbing.net`, `efficientplumbing.com`) | On-page only; no new pages; reversible. |
| idea-2026-10-13-15 | 2026-10-13 | Publish a **South-Orange-County slab-leak city-guide hub** binding the existing city pages with descriptive anchors | Website | 4 | 4 | 3 | 5 | L2 | candidate | **Second pass:** `evansleakdetection.com` recurred on **6/8** parsed leak queries *across four cities + county* — breadth of one domain recurs; SF city pages have no hub binding them. Feature verified; causation = hypothesis. | Genuinely useful hub, not a doorway index; reuse existing city pages; no new claims. |
| idea-2026-10-13-16 | 2026-10-13 | Add a **per-city symptom-first "hidden leak" section** to the existing leak-detection city pages (not new thin pages) | Website | 4 | 3 | 3 | 5 | L2 | candidate | **Second pass:** question-intent phrasings recur (`hidden water leak detection Orange County`, `water leak detection Aliso Viejo`); leak specialists cluster on these. | Symptom-first (meter still moving · warm floor spot · running-water sound); reuse approved claims; no new service promise. |
| idea-2026-10-13-17 | 2026-10-13 | Add a **provider-fallback + challenge-page detection** line to `run_sweep.py` and record HTTP status per attempt | Website/ops | 3 | 5 | 4 | 5 | L2 | scored | **Second pass:** Brave block is now a **challenge page** (not just 429) and can trigger after ~8 queries; DDG Lite/HTML 202, Bing no anchors, Mojeek/Ecosia 403. | Deterministic tooling; prevents recording a blocked query as "absent". Aligns with the runbook lesson. |
| idea-2026-10-13-18 | 2026-10-13 | Write the **GSC measurement runbook** to execute on the day P-002 clears | Website/ops (docs) | 4 | 4 | 5 | 5 | L1/L2 | scored | GSC now surfaces generative-AI (2026-06), web-multimodal (2026-09), and social/video platform properties (2026-07) — primary sources; GSC still not connected (P-002). | Documentation only; makes the first connected run productive instead of exploratory. |
| idea-2026-10-13-19 | 2026-10-13 | Publish a **"calling an emergency plumber: what to have ready"** prep checklist | Website | 3 | 3 | 3 | 5 | L2 | candidate | Both emergency queries today franchise-dominated (`rotorooter.com`, `mrrooter.com`, `emergencyresponseplumbers.com`); homeowner intent = "what do I do now". | **No** response-time or service-area commitment (Level 3). Reduces call friction only. |
| idea-2026-10-13-20 | 2026-10-13 | Point a lightweight **`llms.txt` path-200 self-check** at every URL referenced in `llms.txt`/`llms-full.txt` | Website/ops | 3 | 4 | 5 | 5 | L2 | candidate | `/llms-full.txt` + `/md/**` are now live (200), but `/md/` root 404s — a referenced-but-broken path would silently starve an AI crawler. | Read-only check; fail loudly on drift. |
| idea-2026-10-19-01 | 2026-10-19 | **Re-frame `llms.txt`/`/md/**` copy** as agent/AI-consumer conveniences — remove any "helps Google / AI Overviews" framing | Website (docs+copy) | 3 | 5 | 2 | 5 | L1/L2 | scored | Google Search Central AI-optimization guide, fetched 2026-10-19 (HTTP 200): "Google Search itself doesn't use them"; llms.txt "will neither harm nor help your site's visibility or rankings in Google Search". | Primary-source correction of a claim we currently make; no behaviour change, text only. |
| idea-2026-10-19-02 | 2026-10-19 | Add the **Search Console "Generative AI performance" report** to the P-002 unblock request + runbook | Business/measurement | 4 | 5 | 5 | 5 | L1/L2 | scored | Same primary source: eligibility needs the site "included in Search generative AI features in Search Console", and Google names the Generative AI performance report as the measurement surface. | Extends idea-2026-10-13-18; documentation only, no access change. |
| idea-2026-10-19-03 | 2026-10-19 | Strengthen **third-party profile completeness** (Google Business Profile + Yelp) | Business | 5 | 4 | 3 | 4 | L3 | proposed | 2026-10-19 sweep: `yelp.com` appeared in **18/18** conventional queries and `facebook.com` in **11/18** — aggregator surfaces are the recurring answer for every plumbing intent we tested. Feature observed; causation = hypothesis. | Owner access required; propose only. No fake reviews, no paid placement. |
| idea-2026-10-19-04 | 2026-10-19 | Add verified **`OpeningHoursSpecification` + `Person` (owner)** structured data to the LocalBusiness block | Website | 3 | 4 | 2 | 5 | L2 | candidate | `efficientplumbing.com` (Laguna Niguel, 9/18 queries today) ships `LocalBusiness` + `OpeningHoursSpecification` + `Person` + `PostalAddress`; SF's business facts are already approved in `APPROVED_CLAIMS.md`. | Only pre-approved facts; no hours invention (must match `BUSINESS_PROFILE.md`). Validates with `seo_audit.py`. |
| idea-2026-10-19-05 | 2026-10-19 | Add **water-heater-repair per-city framing** (Aliso Viejo, Laguna Niguel) | Website | 4 | 4 | 3 | 5 | L2 | candidate | Two water-heater queries today returned specialist domains (`aterheatermaninc.com`, `aterheaterinstallrepair.com`, `speedywaterheatersoc.com`) and **no** SF presence; SF has `/services/` water-heater content but no city frame. | Extends idea-2026-10-13-02 pattern to water heaters. No prices (Level 3). |
| idea-2026-10-19-06 | 2026-10-19 | Record **`inconclusive`** (never `absent`) when a provider returns generic/definitional SERPs or 429 | Website/ops | 3 | 5 | 2 | 5 | L2 | scored | Today's Bing fallback probe returned dictionary/definitional results and 429s; the provider policy requires we not convert a degraded result set into a ranking claim. | Extends idea-2026-10-13-17; makes the honesty rule mechanical rather than manual. |

| idea-2026-10-23-01 | 2026-10-23 | Add a **provider-fallback + HTTP-status recorder** to the daily sweep (Brave → DDG Lite → Bing → Tavily) so a blocked provider can never be written down as `absent` | Website/ops | 4 | 5 | 3 | 5 | L2 | scored | **Fetched this run:** Brave `https://search.brave.com/search?q=…` → HTTP **429**; DuckDuckGo HTML → **202** with no results; DuckDuckGo **Lite** → 200 but **0 parseable result anchors**; Bing → 200 with **redirect-wrapped** anchors (`bing.com/ck/a?...&u=a1<base64>`) that parse to nothing without decoding; Gemini grounded call → **429**. Only Tavily returned usable ranked URLs. | Extends idea-2026-10-13-17. Deterministic tooling; a provider that fails must be recorded `BLOCKED`, never `absent`. Add Bing `u=a1…` base64 unwrapping. |
| idea-2026-10-23-02 | 2026-10-23 | Reserve **Gemini quota for the sweep** (pre-stage and sweep currently share one key, so the AI surface is measured with a spent quota) | Website/ops | 3 | 4 | 3 | 5 | L2 | scored | This run: the step-0b pre-stage consumed the Gemini quota; all 4 post-stage grounded calls returned **HTTP 429**, recorded `inconclusive`. `data/daily_context.json` `ai_visibility_sweep` shows 4/5 rows `inconclusive`. | Measurement-integrity fix, not a visibility claim. Options: separate key, smaller pre-stage Gemini budget, or retry-with-backoff after a cooldown. |
| idea-2026-10-23-03 | 2026-10-23 | Add a **per-city water-heater page** for Laguna Niguel (and the other Tier-1 cities that lack one) | Website | 4 | 3 | 3 | 5 | L2 | candidate | Tavily "water heater repair Laguna Niguel" → SF **absent**; ranking set is single-service specialist domains (`waterheatermaninc.com`, `waterheaterinstallrepair.com`, `usawaterheaters.us`, `lagunaniguelplumber.org`) plus `scottenglishplumbing.net`. Feature verified (they hold a dedicated water-heater page); causation = hypothesis. | Extends the 13-01/13-08 city × service pattern to water heaters. Reuse existing service + city templates; no new claims, no prices (Level 3). |
| idea-2026-10-23-04 | 2026-10-23 | Add a **Newport Beach whole-house repipe** framing page | Website | 4 | 3 | 3 | 5 | L2 | candidate | Tavily "whole house repipe Newport Beach" → SF **absent**; `repipe-newport-beach.com` is a **dedicated exact-match domain**, plus `repipetopteam.com`, `primewestplumbing.com`, `ocrepipes.com`. | Extends idea-2026-10-13-02 to a city where the repipe intent is served by specialist domains. Education/eligibility content, not a doorway page. |
| idea-2026-10-23-05 | 2026-10-23 | Write an internal **query fan-out coverage map** (Google's fan-out subqueries × existing SF pages) to find answer gaps before writing new content | Website/ops (docs) | 4 | 4 | 2 | 5 | L1 | scored | Google Search Central, *Optimizing for generative AI search* (fetched 2026-10-23, HTTP 200): AI features use **RAG/grounding** and **query fan-out** ("concurrent, related queries … to fetch additional relevant search results"); the same page states AEO/GEO "is still SEO". | Docs-only, reversible. Prevents the pattern of writing pages that duplicate an existing answer. Feeds idea-2026-10-23-03/04 with evidence instead of guesswork. |
| idea-2026-10-23-06 | 2026-10-23 | Publish an **owner field-notes** asset ("what we actually found on this slab leak") to supply the first-hand point of view Google now names as a differentiator | Website | 4 | 3 | 4 | 5 | L2/⛔ | candidate | Google Search Central, *Optimizing for generative AI search* (fetched 2026-10-23): "**Providing a unique point of view** … a first-hand review provides a unique perspective based on personal experience, whereas a summary of existing content simply restates information already available elsewhere." | Blocked on **owner-supplied** job detail/photos (same dependency as idea-2026-10-12-04). No fabricated cases — every note must be a real job. Do not publish until the owner provides it. |
| idea-2026-10-22-01 | 2026-10-22 | Extend the **P-002 GSC runbook** to cover the new *multimodal search* type filter and the *Generative AI features* report | Website/ops (docs) | 4 | 5 | 5 | 5 | L1/L2 | scored | Google Search Central Blog 2026-09-24 (fetched 2026-10-22, HTTP 200): multimodal search performance is now reported in **both** the Search-results report and the **Generative AI features** report. | Extends idea-2026-10-13-18. Documentation only; makes the first connected GSC run able to report AI-feature impressions instead of inferring them. |
| idea-2026-10-22-02 | 2026-10-22 | Add a **"cities we actually serve" verification block** to the service-areas hub | Website | 3 | 4 | 2 | 5 | L2 | candidate | `drainandsewerpro.com` (fetched 2026-10-22) lists 7 visible service areas but ships **141 `areaServed` cities** including every SF Tier-1 city; non-local markup inflation is winning South-OC slots. | Differentiator is *genuine* local coverage (`SERVICE_AREAS.md`). On-page text only; no new area commitments (L3 boundary). |
| idea-2026-10-22-03 | 2026-10-22 | Audit existing page images for **descriptive `alt` text and captions** (multimodal-search readiness) | Website | 3 | 3 | 2 | 5 | L2 | candidate | GSC multimodal reporting covers Lens / Circle to Search / image uploads (2026-09-24, fetched); SF pages carry real photographs, which is the crawlable surface these queries read. | Purely additive accessibility/SEO hygiene; no content invention. Cheap, deterministic. |
| idea-2026-10-22-04 | 2026-10-22 | Publish a **"where is your main water shut-off?"** homeowner explainer (with photos) | Website | 4 | 3 | 2 | 5 | L2 | candidate | Emergency queries in today's sweep are franchise-dominated (`rotorooter.com` 3 slots); homeowner intent at that moment is "what do I do right now". | Universal, claim-free safety content. **No** response-time or service-area promise (L3). Ties to the leak-detection cluster. |
| idea-2026-10-22-05 | 2026-10-22 | Record **which provider served each sweep query + HTTP status** in `ai_visibility_history.jsonl` | Website/ops | 3 | 5 | 3 | 5 | L2 | scored | Today Brave 429 / DuckDuckGo Lite 202 → Tavily carried the sweep; the row records `platform` but not the fallback chain or per-attempt status. | Extends idea-2026-10-13-17. Prevents a blocked provider being misread as "absent". Deterministic tooling. |
| idea-2026-10-22-06 | 2026-10-22 | Run an **intent-coverage map** of existing pages against the tested query set (city × service × emergency × cost) | Website/ops | 3 | 3 | 2 | 5 | L2 | candidate | `efficientplumbing.com` took **8 of 15** slots today across three different intent classes — breadth of intent coverage, not page count. | Research only; output is a gap list, not new pages. Feeds the existing per-city idea cluster. |

> The first daily run by the new automation appends its own ≥5 dated ideas and
> re-scores this table. This seed set documents the format and the evidence bar.

### Prioritization (2026-10-22)

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-22-01 GSC runbook × multimodal + AI-features reports | 4 | 5 | Low→High | Yes | ✅ L1/L2 | scored |
| 2 | idea-2026-10-22-05 provider + HTTP-status provenance in sweep rows | 3 | 5 | Low→High | Yes | ✅ L2 | scored |
| 3 | idea-2026-10-22-03 image `alt`/caption audit (multimodal readiness) | 3 | 3 | Low→High | Yes | ✅ L2 | candidate |
| 4 | idea-2026-10-22-02 "cities we actually serve" verification block | 3 | 4 | Low→Med | Yes | ✅ L2 | candidate |
| 5 | idea-2026-10-22-04 main water shut-off explainer | 4 | 3 | Low→Med | Yes | ✅ L2 | candidate |
| 6 | idea-2026-10-22-06 intent-coverage map (research only) | 3 | 3 | Low→Med | Yes | ✅ L2 | candidate |

**Selection rule applied (2026-10-22):** the two **scored** items are the ones that
convert a *blocked* channel (GSC/P-002) and a *noisy* channel (search-provider
fallback) into reliable signal, at near-zero risk and near-zero effort. They are
preferred over the content ideas, which remain `candidate` pending the risk gate and
(for any HTML change) `validate_knowledge_base.py` + `scripts/seo_audit.py`.
**No idea was actioned today** — every new observation is either documentation
(not done in this run's remaining budget) or a page change that needs a separate
site branch. Nothing here justifies a Level-3 change.

### Second-pass prioritization (2026-10-13)

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-13-18 GSC measurement runbook | 4 | 4 | Low→High | Yes | ✅ L1/L2 | scored |
| 2 | idea-2026-10-13-17 sweep provider-fallback/challenge detection | 3 | 5 | Low→High | Yes | ✅ L2 | scored |
| 3 | idea-2026-10-13-15 OC slab-leak city-guide hub | 4 | 4 | Med→High | Yes | ✅ L2 | candidate |
| 4 | idea-2026-10-13-20 `llms.txt` path-200 self-check | 3 | 4 | Low→High | Yes | ✅ L2 | candidate |
| 5 | idea-2026-10-13-16 per-city symptom-first hidden-leak sections | 4 | 3 | Med→Med | Yes | ✅ L2 | candidate |
| 6 | idea-2026-10-13-19 emergency-call prep checklist | 3 | 3 | Med→Med | Yes | ✅ L2 | candidate |

**Selection rule applied (second pass):** evidence-backed and cheap-to-verify
actions are preferred over the easiest content to generate. The two **scored**
items (GSC runbook, sweep hardening) convert a *blocked* channel and a *noisy*
channel into reliable signal at near-zero risk; the OC hub (15) is the strongest
response to a **demonstrated** cross-city breadth advantage. No item is actioned
until it clears the risk gate and (for any HTML change) `validate_knowledge_base.py`
+ `scripts/seo_audit.py`.

---

### Prioritization (2026-10-19 daily run)

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-19-01 re-frame llms.txt / `/md/**` copy | 3 | 5 | Low→High | Yes | ✅ L1/L2 | scored |
| 2 | idea-2026-10-19-06 provider-degradation → `inconclusive` rule | 3 | 5 | Low→High | Yes | ✅ L2 | scored |
| 3 | idea-2026-10-19-02 add Generative-AI report to P-002 runbook | 4 | 5 | Low→High | Yes | ✅ L1/L2 | scored |
| 4 | idea-2026-10-19-04 `OpeningHoursSpecification` + `Person` schema | 3 | 4 | Low→High | Yes | ✅ L2 | candidate |
| 5 | idea-2026-10-19-05 water-heater per-city framing | 4 | 4 | Med→High | Yes | ✅ L2 | candidate |
| 6 | idea-2026-10-19-03 GBP/Yelp profile completeness | 5 | 4 | Med→High | No (owner) | ⛔ L3 | proposed |

**Selection rule applied (2026-10-19):** the run produced one **high-evidence,
primary-source correction** (Google states llms.txt neither helps nor harms Google
Search visibility) and one **measurement-integrity** rule. Both are cheap and
reversible, so they outrank the higher-impact-but-blocked L3 profile work. No item
was actioned on the website today: ideas 01/02/06 are documentation/knowledge
changes (applied as report + `INDUSTRY_WATCH.md` + `INTEGRATION_STATUS.md` edits,
not HTML), and 03–05 stay `candidate`/`proposed` until a further confirming sweep.

---

## Rejected / parked (kept deliberately)

| ID | Idea | Decision | Reason |
|---|---|---|---|
| idea-rej-01 | Buy backlinks / guest-post networks | **rejected** | Forbidden — manipulative links. See `APPROVED_CLAIMS.md`. |
| idea-rej-02 | Generate hundreds of thin city × service pages at once | **rejected** | Forbidden — thin/doorway pages; also violates Google spam policies. |
| idea-rej-03 | Fabricate review counts or testimonials | **rejected** | Forbidden — fabrication. |
Candidate website and business ideas, each tied to a **fetched, cited observation**.
An idea with no cited observation stays `candidate` and is **not actioned**.
Prioritized by impact / evidence / effort-to-value / reversibility, then passed
through a risk gate (Level 1 research · Level 2 branch/PR · Level 3 owner-only).

**Risk gate legend:** ✅ L1/L2 allowed (research or reversible code/PR) ·
⛔ L3 owner-only (identity, prices, claims, hosting, deletions).

Status values: `candidate` · `prioritized` · `proposed` · `parked` · `rejected`.

---

## 2026-10-12 (daily run) — 6 new ideas

### IDEA-2026-10-12-01 — "Leak-or-No-Leak" self-check decision tool (interactive)
- **Observation:** `leak-detection-pro.com` and `plumbingsolutionspecialist.com`
  rank on "who can locate a hidden water leak" / "water leak detection {city}"
  queries with `/location/{city}-ca.html` + FAQPage schema (fetched 2026-10-12;
  `data/competitor_observations.jsonl`). The site already ships an interactive
  "Plumbing Health Score" (`/plumbing-health-score.html`) — the pattern is proven on-site.
- **Idea:** a guided "Is it a leak or normal?" wizard that asks 3–4 questions
  (meter-still-moving, warm spot, sound of running water) and routes to the matching
  Academy article + the phone CTA. Pure client-side, no data collected.
- **Impact:** high (top-of-funnel, matches question intent). **Evidence:** medium.
  **Effort:** medium. **Reversibility:** high. **Risk gate:** ✅ L2.
- **Status:** `prioritized`.

### IDEA-2026-10-12-02 — Add per-city repipe eligibility framing (not a doorway page)
- **Observation:** repipe-family queries ("PEX repiping Orange County", "whole
  house repipe Orange County", "PEX repipe Laguna Niguel") are dominated by
  specialists `ocrepipes.com` and `repipesoc.com` (fetched 2026-10-12). The site
  has a verified `/services/pex-repiping.html` but no repipe-specific decision content.
- **Idea:** a single educational page ("When a slab leak means repipe, not repair")
  linking to the existing repipe service page and Academy copper-vs-PEX article —
  one page, not 21 city permutations (doorway risk avoided).
- **Impact:** medium-high. **Evidence:** medium. **Effort:** medium.
  **Reversibility:** high. **Risk gate:** ✅ L2 (content only; no new service claims).
- **Status:** `prioritized`.

### IDEA-2026-10-12-03 — FAQPage schema on the three diagnostic-method Academy pages
- **Observation:** competitors ranking on leak queries display FAQPage schema
  (`coastplumbing.com` areas-we-serve pages, `leak-detection-pro.com` location
  pages; both fetched 2026-10-12). The site's Academy explainers
  (`acoustic-leak-detection-explained.html`, `thermal-imaging-…`,
  `electronic-pipe-locating-explained.html`) already answer the questions but do
  not all carry FAQPage markup.
- **Idea:** add FAQPage JSON-LD mirroring existing on-page Q&A to those three pages.
  Google's own guidance on optimizing for generative AI (2026-05) supports
  clear Q&A structure.
- **Impact:** medium. **Evidence:** medium-high (schema present on ranking competitors
  + Google primary guidance). **Effort:** low. **Reversibility:** high.
  **Risk gate:** ✅ L2 (must not invent answers — mirror existing copy only).
- **Status:** `prioritized`.

### IDEA-2026-10-12-04 — "Insurance documentation" walkthrough as a differentiator page
- **Observation:** the site already has an `/insurance/` hub (verified). No
  competitor observed in the 2026-10-12 sweep leads with insurance-claim
  documentation. The site's own brand voice lists "insurance-claim documentation
  partner" as a differentiator.
- **Idea:** a step-by-step "What your insurer will ask for after a slab leak" page
  linking the existing insurance hub — educational, no coverage promises.
- **Impact:** medium (high-intent, low-competition). **Evidence:** medium.
  **Effort:** low-medium. **Reversibility:** high. **Risk gate:** ✅ L2, but the
  copy must avoid any coverage/claim guarantee (brand-voice "don't" list).
- **Status:** `candidate`.

### IDEA-2026-10-12-05 — Local "leak-detection cost" calculator (no prices published)
- **Observation:** the site has `/guides/leak-detection-cost.html` and
  `/guides/slab-leak-repair-cost.html`. "How much does leak detection cost" is a
  recurring homeowner question. Publishing actual prices is Level 3.
- **Idea:** an interactive *range/education* tool that explains what drives cost
  (access, slab type, detection method) **without** quoting company prices, and
  routes to the phone. Complements, not replaces, the guides.
- **Impact:** medium. **Evidence:** low-medium. **Effort:** medium.
  **Reversibility:** high. **Risk gate:** ⛔ if any price is shown; ✅ L2 if
  strictly cost-driver education. **Constraint:** owner must confirm before any
  number is published.
- **Status:** `candidate` (gated on owner confirmation of approach).

### IDEA-2026-10-12-06 — Owner-voice "diagnose-first" short video embeds
- **Observation:** Google Search Console added **web multimodal Search performance
  reporting** (2026-09, primary source) and a curated **SEO learning path** that
  covers multimodal basics (2026-10). Competitors show text-only local pages.
- **Idea:** embed 30–60s owner-recorded clips (e.g. "listen to this acoustic
  signature") on the existing acoustic explainer page; adds multimodal surface
  eligibility once GSC access exists.
- **Impact:** medium-high. **Evidence:** medium (Google primary guidance) but
  execution depends on owner-recorded footage (Level 3 media/brand approval).
- **Effort:** high. **Reversibility:** high. **Risk gate:** ⛔ owner produces media.
- **Status:** `parked` (needs owner media + measurement).

### Supplementary ideas (concurrent 2026-10-12 run — additive)

- **IDEA-2026-10-12-07 — Quote EPA WaterSense leak figures (with attribution) on
  high-water-bill pages.** *Evidence:* EPA statistics fetched 2026-10-12 (URLs in
  `INDUSTRY_WATCH.md`). Gives `why-is-my-water-bill-so-high` /
  `water-meter-still-moving` a citable figure instead of generic language — no
  invented stats. Impact 3 · Evidence 4 · Effort-to-value 4 · Reversibility 5.
  **Risk gate:** ✅ L2. **Status:** `candidate`.
- **IDEA-2026-10-12-08 — Per-city "slab leak symptoms" self-check sections (Tier-1
  cities).** *Evidence:* 2026-10-12 sweep — slab queries are dominated by
  competitors with a **dedicated slab/leak page per city**
  (evansleakdetection.com, calischoice.com, leakstar.com,
  scottenglishplumbing.net); SF absent from all slab queries tested. Real
  diagnostic content (symptoms → cause → detection), **not** a doorway page.
  Impact 4 · Evidence 4 · Effort-to-value 3 · Reversibility 5. **Risk gate:** ✅ L2.
  **Status:** `candidate` — top-scoring of the supplementary set.
- **IDEA-2026-10-12-09 — Interactive "slab leak vs foundation crack" decision
  helper.** *Evidence:* `briefs/strategy-log.md` (2026-10-07) names an interactive
  slab-leak tool as the durable moat; `/plumbing-health-score.html` proves
  feasibility; no competitor in the 2026-10-12 sweep surfaced an interactive tool.
  Impact 5 · Evidence 3 · Effort-to-value 2 · Reversibility 5. **Risk gate:** ✅ L2.
  **Status:** `candidate`.
- **IDEA-2026-10-12-10 — Exact-match, non-spammy HQ-city landing pattern.**
  *Evidence:* exact-match domains recur (proplumberlagunaniguel.com 6/20,
  laguaniguelcaplumbingpros.com 4/20) — an observed presence pattern, not
  causation. Impact 3 · Evidence 3 · Effort-to-value 4 · Reversibility 5.
  **Risk gate:** ✅ L2 (must stay genuinely useful, not a doorway page).
  **Status:** `candidate`.
- **IDEA-2026-10-12-11 — Annual "Orange County leak-cost" data note from EPA +
  published site facts.** *Evidence:* EPA WaterSense citable national figures
  (fetched 2026-10-12). Aggregates *cited* public figures without publishing SF
  prices (APPROVED_CLAIMS). Impact 3 · Evidence 3 · Effort-to-value 3 ·
  Reversibility 5. **Risk gate:** ✅ L2 (EPA attribution only). **Status:**
  `candidate`.

### 2026-10-12 (HQ-D daily run #2) — 6 new ideas

Evidence base: the 28-query Brave sweep this run (rows in
`data/ai_visibility_history.jsonl`; competitor frequencies in
`data/competitor_observations.jsonl`). SF was absent from all 28 — the highest-value
gaps are below.

#### IDEA-2026-10-12-15 — "Which detection method?" explainer hub (acoustic vs electronic vs thermal)
- **Observation:** the *acoustic leak detection Orange County* query surfaced only
  generalists and national franchises (`americanleakdetection.com`,
  `thedoneriteplumber.com`, `precisionplumbingoc.com`) — none showed a dedicated
  method-comparison page. SF already has three separate Academy explainers
  (`acoustic-…`, `electronic-pipe-locating-…`, `thermal-imaging-…`) but no single
  page that compares them and answers *"which method will you use on my house?"*.
- **Idea:** one comparison/decision page that links the three existing explainers and
  routes to the phone CTA. Consolidates existing content; no new claims.
- **Impact:** medium-high (matches high-intent diagnostic queries). **Evidence:**
  medium-high (competitor gap observed + US-facing search terms). **Effort:**
  low-medium. **Reversibility:** high. **Risk gate:** ✅ L2. **Status:** `prioritized`.

#### IDEA-2026-10-12-16 — Sewer-camera-inspection content (education only) for the drain cluster
- **Observation:** the *sewer camera inspection Orange County* query was dominated by
  dedicated drain/camera pages (`socal1plumbing.com`, `vipdrainservices.com`,
  `myorangecountyplumber.com`, `jettersndrains.com`) while SF appeared for none.
  SF has a verified `/services/drain-services.html` but no camera-inspection
  explainer.
- **Idea:** an educational "what a sewer camera inspection shows (and when you need
  one)" page that links the existing drain-services page. **Do not** introduce new
  service claims; `SERVICE_CATALOG.md` lists sewer-line work as *claimed, verify* —
  so the page must stay diagnostic-education unless the owner confirms the service.
- **Impact:** medium. **Evidence:** medium (competitor gap observed). **Effort:**
  low-medium. **Reversibility:** high. **Risk gate:** ⛔ *if* it implies an
  unconfirmed service; ✅ L2 if scoped to education. **Status:** `candidate`
  (owner confirmation of the sewer service recommended first).

#### IDEA-2026-10-12-17 — Repipe cost/eligibility explainer ("will my leak need a repipe?")
- **Observation:** repipe-family queries are specialist-dominated this run too —
  `repipe1.com`, `ocrepipes.com`, `repipe.pro`, `copperrepipeorangecounty.com`,
  `orange-county.repipe.com` (2), `allprocopper.com`, `repipeplus.com`,
  `repipesoc.com`. SF has `/services/pex-repiping.html` but no decision content.
- **Idea:** one page: how to tell repair vs reroute vs repipe, with EPA-style
  citable framing and no published SF prices (cost drivers only). Links existing
  `/guides/repair-vs-reroute-vs-repipe.html` and the PEX page. One page, not 21 —
  doorway risk avoided.
- **Impact:** medium-high. **Evidence:** medium-high (repeated specialist pattern
  across three runs). **Effort:** medium. **Reversibility:** high.
  **Risk gate:** ✅ L2. **Status:** `prioritized`.

#### IDEA-2026-10-12-18 — FAQPage schema on the higher-value city pages
- **Observation:** ranking competitors repeatedly show FAQPage/schema-rich layouts
  (`leak-detection-pro.com` location pages; `coastplumbing.com` areas-we-serve).
  SF city pages are ~5.2k-byte stubs (see `SERVICE_AREAS.md`).
- **Idea:** add FAQPage JSON-LD that mirrors *visible* on-page Q&A on the Tier-1
  city pages, and only where real Q&A already exists. No invented answers.
- **Impact:** medium. **Evidence:** medium-high (schema observed on ranking
  competitors; Google primary guidance on Q&A structure). **Effort:** low.
  **Reversibility:** high. **Risk gate:** ✅ L2. **Status:** `prioritized`.

#### IDEA-2026-10-12-19 — "Best plumber" query reality → owner GBP/review playbook (not a website change)
- **Observation:** every "best plumber" query this run was aggregator-dominated
  (`yelp.com` 14/28, `angi.com` 5, `thumbtack.com` 3, `homeadvisor.com`,
  `buildzoom.com`). *best plumber in Dana Point* top set: yelp, angi,
  billmetzgerplumbing, mckplumb, bestplumberindanapoint, homeadvisor — no SF.
- **Idea:** a one-page internal owner playbook (in `proposals/`) listing the
  concrete GBP actions that move "best/nearest" visibility: complete profile,
  consistent NAP, review-request flow, photo cadence, service list. Website content
  cannot win these queries alone.
- **Impact:** high (this is the dominant local channel). **Evidence:** high
  (aggregator share measured across runs). **Effort:** low (documentation).
  **Reversibility:** n/a. **Risk gate:** ⛔ L3 for the profile itself (owner access);
  the *proposal document* is ✅ L1. **Status:** `proposed`.

#### IDEA-2026-10-12-20 — Localized "water pressure & pipe health" content for the pressure-regulator query family
- **Observation:** *water pressure regulator replacement Orange County* returned a
  distinct competitor set (`ackplumbers.com`, `speedeedrains.com`,
  `ezplumbingrestoration.com`, `parzivalplumbing.com`) with no SF. SF has
  `/academy/water-pressure-and-pipe-health.html` — relevant content that did not
  surface.
- **Idea:** strengthen the existing water-pressure Academy page with an answer-first
  "signs your pressure regulator failed" section and FAQ schema; link from
  city/service pages. Uses existing verified content, no new service claims.
- **Impact:** medium. **Evidence:** medium (competitor gap + existing on-site asset).
  **Effort:** low. **Reversibility:** high. **Risk gate:** ✅ L2 (education only).
  **Status:** `candidate`.

#### Prioritization (2026-10-12 HQ-D #2)

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | IDEA-17 repipe decision page | Med-High | Med-High | Med→High | Yes | ✅ L2 | prioritized |
| 2 | IDEA-15 "which detection method" hub | Med-High | Med-High | Low-Med→High | Yes | ✅ L2 | prioritized |
| 3 | IDEA-18 FAQPage on city pages | Medium | Med-High | Low→High | Yes | ✅ L2 | prioritized |
| 4 | IDEA-20 water-pressure page strengthening | Medium | Medium | Low→Med | Yes | ✅ L2 | candidate |
| 5 | IDEA-16 sewer-camera education | Medium | Medium | Low-Med→Med | Yes | ⛔/L2 | candidate |
| 6 | IDEA-19 GBP/review playbook | High | High | Low→High | n/a | ⛔ L3 (proposal) | proposed |

**Selection rule applied:** evidence-backed, lowest-risk first. IDEA-17 and IDEA-15
have the best evidence-to-effort ratio and reuse existing verified content. No idea
is actioned until it survives the risk gate and `validate_knowledge_base.py` +
`scripts/seo_audit.py` pass on any HTML change.

### Phase 2 (infrastructure / ops) — 3 ideas, from the 2026-10-12 inspection

- **IDEA-2026-10-12-12 — Ship Automation B as a deterministic no-LLM health check.**
  *Observation:* the platform **hard-caps automation `timeout` at 1800 s** and
  `crawler_access_check.sh` is a pure HTTP check that needs no reasoning (API/HTTP
  verified 2026-10-12). Running it as an LLM agent spends tokens on a fixed task.
  Impact 4 · Evidence 5 (platform-documented + repo script) · Effort-to-value 5 ·
  Reversibility 5. **Risk gate:** ✅ L2 (custom no-LLM script; see
  `automations/README.md` B). **Status:** `prioritized`.
- **IDEA-2026-10-12-13 — Commit-early checkpointing in the HQ-D prompt.**
  *Observation:* HQ-D run `2026-10-12T05:33:52Z` **timed out before committing**
  any report, so the run produced zero durable output (OpenHands API, fetched
  2026-10-12). *Idea:* instruct the agent to commit a minimal skeleton report +
  `.jsonl` rows within the first ~10 minutes, then amend as evidence lands — a
  partial commit is recoverable, a lost run is not. Impact 5 · Evidence 4 ·
  Effort-to-value 5 · Reversibility 5. **Risk gate:** ✅ L2 (prompt text only).
  **Status:** `prioritized` — top-scoring of the Phase-2 set.
- **IDEA-2026-10-12-14 — Automation drift check (live vs. canonical prompt).**
  *Observation:* this run found the **live HQ-D prompt had drifted** from the
  committed `intelligence-hq-daily.prompt.md` (a bounded revision was live while
  the canonical file was unchanged); a weekly deterministic diff would have caught
  it immediately (verified 2026-10-12). Impact 3 · Evidence 5 · Effort-to-value 4 ·
  Reversibility 5. **Risk gate:** ✅ L2 (read-only API compare). **Status:**
  `candidate`.

### HQ-W weekly review (2026-10-12) — status transitions

Appended, not rewritten (history preserved). The live HQ-W prompt was diffed
against the canonical file this run: **no drift** (clean diff), so IDEA-14 applies
to HQ-D only for now.

| Idea | Previous | New (this week) | Reason |
|---|---|---|---|
| IDEA-2026-10-12-13 commit-early checkpointing | approved (Priority 3) | **implemented 2026-10-20** | Applied to the daily + weekly prompts: explicit deadlines, ~10-min checkpoint commit, bounded post-push verification. Addresses ISSUE-006. |
| IDEA-2026-10-12-12 Automation B (no-LLM health check) | prioritized | **approved (Priority 3)** | Platform caps timeout at 1800 s; deterministic task, zero tokens, L2. |
| IDEA-2026-10-12-08 per-city slab-leak sections | candidate | **prioritized (Priority 2)** | Matches the demonstrated competitor gap (dedicated slab page per Tier-1 city). |
| IDEA-2026-10-12-14 automation drift check | candidate | **prioritized** | Weekly live-vs-canonical diff is cheap and would have caught the HQ-D drift. |
| IDEA-2026-10-12-01 leak-or-no-leak tool | prioritized | **prioritized (Priority 2)** | Additional evidence this week: recurring competitor per-city slab pages do not include an interactive tool. |
| IDEA-2026-10-12-03 FAQPage on method pages | prioritized | **prioritized (Priority 2)** | Competitor FAQPage features re-verified this run (coastplumbing.com, leak-detection-pro.com). |

---

### 2026-10-20 daily run — new candidate ideas (evidence-backed)

Every idea below cites a fetched observation from this run. Feature presence in a
competitor is **verified**; that it *caused* a ranking remains a **hypothesis**.

| ID | Idea | Type | Impact | Evid | Effort | Rev | Risk | Status | Evidence / source |
|---|---|---|---|---|---|---|---|---|---|
| idea-2026-10-20-01 | Add a "repipe" section + service link to Tier-1 city pages (Laguna Hills, Laguna Niguel first) | Website | 4 | 4 | 4 | 5 | L2 | candidate | `cities/laguna-hills.html` contains **no** repipe content (verified 2026-10-20: `has repipe section: False`, 1,154 words), while `repipe-laguna-hills.com` ranks with an exact city+service `<title>` and 225 "Laguna" mentions. Source: fetched 2026-10-20. |
| idea-2026-10-20-02 | Add `HowTo` / `HowToStep` JSON-LD to the PEX-repiping and leak-detection method pages | Website | 3 | 4 | 4 | 5 | L2 | candidate | `repipe-laguna-hills.com` emits FAQPage **and** HowTo/HowToStep/HowToSupply/HowToTool (verified 2026-10-20). Our `services/pex-repiping.html` emits Service/FAQPage/Answer but **no** HowTo (verified 2026-10-20). |
| idea-2026-10-20-03 | "Non-commodity content" differentiation pass on city pages (unique local detail, not template permutation) | Website | 5 | 5 | 2 | 5 | L2 | candidate | Google's official AI-optimization guide states unique/compelling content "will likely influence your website's presence in generative AI search ... more than any of the other suggestions" (fetched 2026-10-20, HTTP 200). |
| idea-2026-10-20-04 | Agent-readability pass: ensure critical content is in the DOM/semantic HTML and labelled for the accessibility tree | Website | 3 | 4 | 3 | 5 | L2 | candidate | Google's guide's agentic-experiences section says browser agents read "screenshots, the DOM structure, and the accessibility tree" (fetched 2026-10-20). |
| idea-2026-10-20-05 | Stop describing FAQ/answer content as an AEO "hack"; record the Google mythbusting statement as the framing rule | Knowledge-base / docs | 3 | 5 | 5 | 5 | L1 | candidate | Google's guide "Mythbusting generative AI search" says many AEO/GEO "hacks" "aren't effective or supported by how Google Search actually works" (fetched 2026-10-20). |
| idea-2026-10-20-06 | Owner proposal: complete/verify the Google Business Profile (categories, services, hours, photos) | Business (Level 3 — propose only) | 5 | 5 | 2 | 3 | ⛔ L3 | proposed | Google's guide: using Google Business Profiles "can help your products and services to be visible in both AI responses and other Google Search results" (fetched 2026-10-20). We cannot edit the profile. |
| idea-2026-10-20-07 | Page-weight / performance budget on heavy pages | Website | 2 | 3 | 4 | 5 | L2 | candidate | `creativerepipe.com` homepage is 325 KB of HTML and `sjplumbingoc.com` 197 KB (verified 2026-10-20). Not proven to matter for ranking — recorded as a hygiene candidate, low impact. |
| idea-2026-10-20-08 | Directory/citation presence review (Yelp dominates conventional results) | Business (Level 3 — propose only) | 4 | 4 | 3 | 3 | ⛔ L3 | candidate | yelp.com appeared in **33** of 30 tracked rows' `top_results` today, by far the most frequent domain (computed from `data/ai_visibility_history.jsonl`, 2026-10-20). Reviews/profiles are owner-controlled. |

#### Prioritization (2026-10-20)

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-20-03 non-commodity content pass | 5 | 5 | 2→High | Yes | ✅ L2 | prioritized — best evidence-to-impact, but slow |
| 2 | idea-2026-10-20-01 repipe section on Tier-1 city pages | 4 | 4 | 4→High | Yes | ✅ L2 | prioritized — clearest demonstrated gap |
| 3 | idea-2026-10-20-02 HowTo schema on method pages | 3 | 4 | 4→Med | Yes | ✅ L2 | prioritized — cheap, mirrors a verified competitor feature |
| 4 | idea-2026-10-20-05 AEO-hack framing rule (docs) | 3 | 5 | 5→Med | Yes | ✅ L1 | prioritized — zero-risk documentation correctness |
| 5 | idea-2026-10-20-04 agent-readability pass | 3 | 4 | 3→Med | Yes | ✅ L2 | candidate |
| 6 | idea-2026-10-20-06 Google Business Profile completeness | 5 | 5 | 2→High | No | ⛔ L3 | proposed to owner (cannot execute) |
| 7 | idea-2026-10-20-08 directory/citation review | 4 | 4 | 3→Med | No | ⛔ L3 | candidate — needs owner |
| 8 | idea-2026-10-20-07 page-weight budget | 2 | 3 | 4→Low | Yes | ✅ L2 | candidate — no evidence it affects ranking |

**Selection rule applied:** ranked by evidence strength first, then impact, then
effort-to-value — not by ease of generation. Ideas 1–4 are L1/L2 and would clear the
risk gate, but **none was actioned this run** because the run budget went to
measurement and reconciliation; they are queued for the next run with the tests
already named. Ideas 6 and 8 are Level 3 and are **proposal-only**.

---

### 2026-10-20 daily run #2 (OpenHands HQ) — new candidate ideas + primary-source correction

**Primary-source correction (high confidence, fetched 2026-10-20, HTTP 200).** Two
prioritized ideas from the earlier 2026-10-20 run rested on rich-result premises that
Google has since retired:

- **idea-2026-10-20-02 (`HowTo` schema)** — invalidated as a rich-result play. Google
  removed the How-to structured-data documentation "as this rich result is no longer
  shown in search results, on both desktop and mobile devices."
  Source: https://developers.google.com/search/updates (final URL; the old
  `.../structured-data/how-to` URL now redirects to `#how-to-deprecation`), fetched
  2026-10-20, HTTP 200.
- **IDEA-03 (`FAQPage` schema on method pages)** — same class of error: the FAQ rich
  result "will no longer appear in Google Search starting May 7, 2026" and its
  documentation was removed. Source:
  https://developers.google.com/search/updates#removing-faq-rich-result, fetched
  2026-10-20, HTTP 200.

Neither is *harmful* (Google states such files "won't negatively or positively impact
your visibility or rankings"), but neither should consume a change window as a
rich-result win. Both are re-scoped to **machine-readable answer clarity only**.

| ID | Idea | Type | Impact | Evid | Effort | Rev | Risk | Status | Evidence / source |
|---|---|---|---|---|---|---|---|---|---|
| idea-2026-10-20-09 | Retire rich-result justification for `FAQPage`/`HowTo` in the KB and re-label them "AI-surface answer clarity only" | Knowledge-base / docs | 3 | 5 | 5 | 5 | L1 | candidate | Google removed both features' docs (fetched 2026-10-20, HTTP 200): https://developers.google.com/search/updates |
| idea-2026-10-20-10 | Structured-data eligibility matrix: map every JSON-LD `@type` we ship to whether Google still supports a rich result for it | Website / docs | 3 | 5 | 4 | 5 | L1 | candidate | Two of the types we ship (`FAQPage`, `HowTo`) lost their rich results in 2026; no inventory exists to catch the next one (observed 2026-10-20). |
| idea-2026-10-20-11 | Entity-consolidation follow-through for ISSUE-014: make the owner-controlled `base44` and Wix "Straight Flush" properties point to the canonical site | Business (owner-controlled) | 5 | 5 | 2 | 3 | ⛔ L3 | proposed | Two live duplicate entities verified 2026-10-20: `straight-flush-plumbing-7fb7cf71.base44.app` and `straightflushplumb8.wixsite.com`; owner confirmed ownership 2026-10-15. Plan: `ENTITY_CONSOLIDATION_PLAN.md`. |
| idea-2026-10-20-12 | Keep FAQ *visible content* (not markup) on method/service pages, since AI answer engines read page text even though the Google rich result is gone | Website | 4 | 4 | 4 | 5 | L2 | candidate | Google's FAQ rich result is retired, but the deprecation concerns the *rich result*, not page content; AI surfaces read text (Google AI-features doc, verified 2026-10-11). |
| idea-2026-10-20-13 | Competitor structured-data drift monitor: track which repeat competitors still ship now-deprecated types | Knowledge-base / docs | 2 | 4 | 4 | 5 | L1 | candidate | Evans Leak Detection still ships `FAQPage`+`Question`+`Answer` (https://evansleakdetection.com/, HTTP 200, 3 `ld+json` blocks, fetched 2026-10-20) — evidence of post-deprecation drift worth tracking, not copying. |

#### Prioritization (2026-10-20 run #2)

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-20-11 entity consolidation (ISSUE-014) | 5 | 5 | 2→High | No | ⛔ L3 | **proposed to owner** — highest impact, cannot self-execute |
| 2 | idea-2026-10-20-09 retire dead rich-result justification | 3 | 5 | 5→Med | Yes | ✅ L1 | prioritized — zero-risk correctness |
| 3 | idea-2026-10-20-10 schema eligibility matrix | 3 | 5 | 4→Med | Yes | ✅ L1 | prioritized — prevents repeating this error |
| 4 | idea-2026-10-20-12 keep FAQ visible content | 4 | 4 | 4→Med | Yes | ✅ L2 | candidate |
| 5 | idea-2026-10-20-13 competitor schema drift monitor | 2 | 4 | 4→Low | Yes | ✅ L1 | candidate — hygiene |

**Corrections applied to earlier ranking (same day):** idea-2026-10-20-02 (`HowTo`)
moves from *prioritized* to **deprioritized**; IDEA-03 (`FAQPage`) moves from rank 2
to **deprioritized**. Idea 1 in the earlier table (non-commodity content pass) is
unaffected and remains the top evidence-backed website action.

---
| idea-2026-10-24-01 | 2026-10-24 | Restore **canonical sitemap URL ordering** so the daily idempotency check is meaningful again | Website/ops | 3 | 5 | 2 | 5 | L1 | shipped | Committed `sitemap.xml` held a non-canonical `case-studies/` block while `refresh_sitemap.py` writes canonical order (homepage → depth → alphabetical), so every run reported `sitemap_dirty=true` and `check_sitemap_idempotent` failed. Verified ordering-only: URL set identical (85), per-URL `lastmod` identical. | Shipped on `intelligence-hq/site-2026-10-24-sitemap-order` (PR #80). 352 tests OK; `seo_audit.py` clean; re-running the generator now yields 0 changes. |
| idea-2026-10-24-02 | 2026-10-24 | **Retire the superseded 2026-10-20 sitemap PR (#74)** rather than let a stale, oversized branch sit open | Ops | 3 | 4 | 2 | 5 | L1 | candidate | `gh` PR list fetched this run: PR #74 (`intelligence-hq/site-2026-10-20-sitemap-order`, "restore canonical sitemap.xml ordering") is still **open** and its branch diff against `main` is **190 files changed, 1259 insertions / 7368 deletions** — far larger than the ordering fix it claims. PR #80 supersedes its intent with a 1-file diff. | Closing a stale PR is reversible and non-destructive. Do **not** merge #74: a 7,368-line deletion is not the ordering fix. Recommend owner/agent closes #74 with a pointer to #80. |
| idea-2026-10-24-03 | 2026-10-24 | Build the **query fan-out coverage map** (Google fan-out sub-topics × existing SF pages) and use it to pick the next content page | Website/ops (docs) | 4 | 5 | 2 | 5 | L1 | scored | Google Search Central *AI features and your website* (fetched 2026-10-24, HTTP 200): AI Overviews/AI Mode "may use a **query fan-out** technique — issuing multiple related searches across subtopics and data sources". Extends idea-2026-10-23-05 with the primary-source wording captured today. | Docs-only, L1. Should be done **before** ideas 04/05 so new pages cover distinct fan-out sub-topics (cost, insurance, diagnosis, prevention) instead of duplicating an existing answer. |
| idea-2026-10-24-04 | 2026-10-24 | Add a **Laguna Hills × PEX-repipe** framing page | Website | 4 | 4 | 3 | 5 | L2 | candidate | Tavily "PEX repiping company in Laguna Hills" → SF **absent**; result set is repipe-specialist domains: `efficientplumbing.com`, `integrityrepipe.com`, `pipebros.com` (**new this run**), `allamericanrepipe.com`, `socalrepipes.com`, `repipesoc.com`. Specialist pages verified to exist; causation = hypothesis. | Extends idea-2026-10-13-02 to Laguna Hills. Education/eligibility content on an existing service, not a doorway page; no prices (Level 3). |
| idea-2026-10-24-05 | 2026-10-24 | Add an **Aliso Viejo × water-heater** framing page | Website | 4 | 3 | 3 | 5 | L2 | candidate | Tavily "water heater repair in Aliso Viejo" → SF **absent**; `speedywaterheatersoc.com` (**new this run**) joins the single-service water-heater pattern already recorded (`waterheatermaninc.com`, `usawaterheaters.us`), plus `primewestplumbing.com`. | Same shape as idea-2026-10-23-03 (Laguna Niguel water heater). Reuse templates; no prices, no invented credentials. |
| idea-2026-10-24-06 | 2026-10-24 | Test with **intent-explicit query phrasing** and mirror that phrasing in on-page answers (fix the "definition lookup" failure mode) | Website/ops | 3 | 4 | 2 | 5 | L1 | candidate | Tavily "who can locate a hidden water leak in Laguna Niguel?" returned **dictionary definitions** (`wiktionary`, `merriam-webster`, `dictionary.com`, `thefreedictionary`, `collinsdictionary`) — the phrasing was parsed as a definition lookup, so the row measures the *query*, not our visibility. | Measurement-integrity + content-phrasing fix. Add explicit local-service anchors ("near me", "in <city>", "contractor") to future test queries; keep a small set of conversational queries but record the intent-mismatch note instead of scoring it `absent`. |
| idea-2026-10-24-07 | 2026-10-24 | Fix the **Gemini credential type** so the AI-surface sweep can run at all | Website/ops | 4 | 5 | 3 | 5 | L2 | scored | This run the pre-stage's Gemini calls returned **HTTP 401 UNAUTHENTICATED** (`reason: ACCESS_TOKEN_TYPE_UNSUPPORTED`) on both the `?key=` query param and the `x-goog-api-key` header, and on `models.list`. The injected value is 53 chars with prefix `AQ.Ab8…`, not the classic `AIza…` API-key shape. Hypothesis (not yet verified): the registered secret holds an OAuth/access-token-type credential rather than a Gemini API key. | Measurement-integrity, highest-value item today: without it the AI surface stays UNMEASURED (ISSUE-032). Fix is a credential/secret change → **propose**, do not alter. Also relates to idea-2026-10-23-02 (quota). |
| idea-2026-10-24-08 | 2026-10-24 | Record **`network_budget_s` in `daily_context.json`** so the report can cite the ceiling each run actually ran under | Ops | 2 | 4 | 2 | 5 | L1 | candidate | The task brief states `daily_context.json` "carries `network_budget_s` so the report can cite the ceiling it ran under", but the file written this run has `network_budget_s: None` (key absent). Verified by reading `growth-engine/data/daily_context.json`. | Small tooling fix with a test; makes the bounded-sweep guarantee auditable rather than asserted. |

## Prioritization — 2026-10-24

| 1 | idea-2026-10-24-07 fix Gemini credential type | 4 | 5 | 3 | 5 | ✅ L2 (propose) | **prioritized** |
| 2 | idea-2026-10-24-02 retire superseded sitemap PR #74 | 3 | 4 | 2 | 5 | ✅ L1 | **prioritized** |
| 3 | idea-2026-10-24-03 query fan-out coverage map | 4 | 5 | 2 | 5 | ✅ L1 | **prioritized** |
| 4 | idea-2026-10-24-06 intent-explicit query phrasing | 3 | 4 | 2 | 5 | ✅ L1 | **prioritized** |
| 5 | idea-2026-10-24-04 Laguna Hills × PEX repipe page | 4 | 4 | 3 | 5 | ✅ L2 | candidate |
| 6 | idea-2026-10-24-05 Aliso Viejo × water-heater page | 4 | 3 | 3 | 5 | ✅ L2 | candidate |
| 7 | idea-2026-10-24-08 record `network_budget_s` | 2 | 4 | 2 | 5 | ✅ L1 | candidate |
| — | idea-2026-10-24-01 canonical sitemap ordering | 3 | 5 | 2 | 5 | ✅ L1 | **shipped** (PR #80) |

**Selection rule applied:** the four prioritized items are *measurement-integrity*
items, ranked above the two content ideas, because today's evidence is again that the
instrument produced part of the gap — the AI-surface sweep could not run at all (Gemini
**401**), one test query was parsed as a dictionary lookup, and our own sitemap
idempotency check was failing for an ordering-only reason. Ranking content above a
broken instrument would encode a false picture of visibility. Ideas 04 and 05 are
genuine, evidence-backed content gaps (specialist domains verified to exist) and stay
`candidate` pending idea 03 so they are not written blind.

**Actioned this run:** idea-2026-10-24-01 only — the canonical sitemap ordering, a
one-file, ordering-only change on its own branch and PR (#80), tests green before and
after. No content, claim, price, identity, or service-area change was made. Nothing
was rejected; the two content ideas are `candidate`, not `rejected`.

### Parked / rejected log (2026-10-24)

- No idea parked or rejected this run. `idea-2026-10-23-06` (owner field-notes asset)
  remains **parked** — still blocked on owner-supplied real job detail/photos;
  fabricating case notes is forbidden (`APPROVED_CLAIMS.md`).

## Prioritization (impact / evidence / effort-to-value / reversibility / risk)

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | IDEA-01 leak-or-no-leak tool | High | Medium | Medium→High | Yes | ✅ L2 | prioritized |
| 2 | IDEA-03 FAQPage schema on method pages | Medium | **Low** (rich result retired 2026-05-07) | Low→Low | Yes | ✅ L2 | **deprioritized 2026-10-20** |
| 3 | IDEA-02 repipe decision page | Med-High | Medium | Medium→Med | Yes | ✅ L2 | prioritized |
| 4 | IDEA-04 insurance walkthrough | Medium | Medium | Low-Med→Med | Yes | ✅ L2 (no promises) | candidate |
| 5 | IDEA-05 cost-driver tool | Medium | Low-Med | Med→Med | Yes | ⛔ if priced | candidate |
| 6 | IDEA-06 owner-voice video | Med-High | Medium | High→Med | Yes | ⛔ owner media | parked |

**Selection rule applied:** evidence-backed actions are preferred over the easiest
content to generate. IDEA-01 and IDEA-03 have the best evidence-to-effort ratio;
IDEA-02 is the strongest match to a *demonstrated* competitor gap (repipe queries).
No idea is actioned until it survives the risk gate and (for any HTML change) the
`validate_knowledge_base.py` + `scripts/seo_audit.py` tests.

---

## 2026-10-21 — new candidates (daily run)

Evidence gathered this run: Tavily conventional sweep (13 queries, SF absent 13/13) and
Gemini/Gemma grounded sweep (5 queries, SF `recommended` 1/5) — see
`growth-engine/data/ai_visibility_history.jsonl` (ts 2026-10-21); competitor pages fetched
2026-10-21 (efficientplumbing.com, evansleakdetection.com, HTTP 200); Google Search
Central `ai-features` + `establish-business-details` (fetched 2026-10-21).

| ID | Date | Idea | Type | Impact | Evid | Effort | Rev | Risk | Status | Evidence / source | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| idea-2026-10-21-01 | 2026-10-21 | Add an explicit "serving Laguna Niguel & South Orange County" service line to the H1/near-H1 region of the leak-detection page | Website | 4 | 4 | 5 | 5 | L2 | scored | evansleakdetection.com H1 fetched 2026-10-21 reads "…\| Orange County CA" + explicit "Servicing Orange County, Riverside, and South LA Counties" line; SF was `recommended` only for the home-city leak query | Cheapest measurable copy change; matches the one query SF already wins. Feature-presence ≠ cause — hypothesis, hence scored not shipped. |
| idea-2026-10-21-02 | 2026-10-21 | Publish an answer-first "hidden water leak: 5 things you can check before calling" guide, one Q per heading | Website | 4 | 4 | 4 | 5 | L2 | scored | Google `ai-features` (fetched 2026-10-21): AI features "may use a query fan-out technique — issuing multiple related searches across subtopics"; two conventional queries this run were literal homeowner questions ("who can locate a hidden water leak in Laguna Niguel?") | Query fan-out rewards several answerable sub-questions on one page. No new claims; diagnostic only. |
| idea-2026-10-21-03 | 2026-10-21 | Ship a free "repipe vs. spot-repair" decision tool (no pricing) | Website | 4 | 3 | 3 | 5 | L2 if unpriced | candidate | No competitor fetched this run offers an interactive tool on leak/slab pages (efficientplumbing.com, evansleakdetection.com inspected 2026-10-21: forms only); reinforces earlier IDEA-2026-10-12-01 | Must not quote prices (Level 3). Blocked on a decision-tree content review by the owner. |
| idea-2026-10-21-04 | 2026-10-21 | Out-answer the exact-match city domain `lagunaniguelcaplumbingpros.com` with a genuinely deeper Laguna Niguel leak-detection page | Website | 4 | 3 | 4 | 5 | L2 | candidate | Domain surfaced for 2 leak queries this run (`water leak detection Laguna Niguel`, `who can locate a hidden water leak in Laguna Niguel?`) | Must be depth/evidence, **not** a thin doorway page — explicitly forbidden by the ground rules. Needs a real differentiator (local case detail, method photos) before action. |
| idea-2026-10-21-05 | 2026-10-21 | Add `Organization` structured data with the site logo (Google names it a "features all websites can benefit from") | Website | 3 | 4 | 4 | 5 | L2 | scored | Google `establish-business-details` (fetched 2026-10-21) explicitly lists Site logo via `Organization` and `Breadcrumbs` as universally beneficial | Entity hygiene supports ISSUE-014/018 remediation. Needs a check against existing Organization/LocalBusiness nodes first to avoid duplicate entities. |
| idea-2026-10-21-06 | 2026-10-21 | Track the two live duplicate hosts as a weekly entity-health trend (not a daily re-alert) | Business | 4 | 4 | 5 | 5 | L2 | scored | `entity_consistency_history.jsonl` FAILs on 2026-10-15/16/21 with identical duplicate-host findings; `establish-business-details` says only a **verified owner** can override what Google finds automatically | Converts a recurring daily FAIL into a trend + one owner ask, instead of re-reporting the same known blocker. |
| idea-2026-10-21-07 | 2026-10-21 | Publish an `/academy/` entry explaining *how* acoustic + thermal leak detection works, with method photos | Website | 3 | 3 | 3 | 5 | L2 (no media yet) | candidate | AI-features guidance (fetched 2026-10-21) rewards "helpful, reliable, people-first content"; diagnostic technology is a standing INDUSTRY_WATCH theme | Parked until owner supplies real method photos — no stock imagery. |

**Prioritization (this run).** Scoring is Impact / Evidence / Effort-to-value /
Reversibility; risk gate applied separately.

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-21-02 answer-first fan-out guide | High | Med-High | Med→High | Yes | ✅ L2 | prioritized |
| 2 | idea-2026-10-21-06 weekly entity-health trend | Med-High | High | Low→High | Yes | ✅ L2 | prioritized |
| 3 | idea-2026-10-21-05 Organization + logo schema | Medium | High | Low→Med | Yes | ✅ L2 | scored |
| 4 | idea-2026-10-21-01 explicit service-area line | Med-High | Med-High | Low→Med | Yes | ✅ L2 | scored |
| 5 | idea-2026-10-21-04 out-answer exact-match city domain | High | Medium | Med→Med | Yes | ✅ L2 (depth required) | candidate |
| 6 | idea-2026-10-21-03 repipe decision tool | Med-High | Med | Med→Med | Yes | ✅ L2 if unpriced | candidate |
| 7 | idea-2026-10-21-07 method-explainer academy page | Medium | Med | Med→Med | Yes | ⛔ owner media | parked |

**Selection rule applied:** #1 and #2 have the best evidence-to-effort ratio and are
**knowledge/reporting** work, not new claims — nothing was actioned as an HTML change
this run (no change cleared the evidence bar for a website edit without owner input).

---

## Parked / rejected log

### 2026-10-20

- **idea-2026-10-20-07 page-weight budget** — kept `candidate`, not actioned: no
  fetched evidence that page weight affects ranking for these queries. Recorded as
  hygiene only, deliberately low impact.
- No idea rejected this run.

- **IDEA-06 owner-voice video** — parked 2026-10-12: blocked on owner-produced media.
- No idea rejected this run.

---

## 2026-10-23 (daily run) — 6 new ideas, prioritized

Scored 1–5 (higher is better). Risk gate: **L1** read-only/docs · **L2** reversible
on-page or tooling · **L3** identity/price/legal/area/profile (propose only).

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-23-01 sweep provider-fallback + HTTP-status recorder | 4 | 5 | 3 | 5 | ✅ L2 | **prioritized** |
| 2 | idea-2026-10-23-02 reserve Gemini quota for the sweep | 3 | 4 | 3 | 5 | ✅ L2 | **prioritized** |
| 3 | idea-2026-10-23-05 query fan-out coverage map (docs) | 4 | 4 | 2 | 5 | ✅ L1 | **prioritized** |
| 4 | idea-2026-10-23-03 per-city water-heater page (Laguna Niguel) | 4 | 3 | 3 | 5 | ✅ L2 | candidate |
| 5 | idea-2026-10-23-04 Newport Beach whole-house repipe page | 4 | 3 | 3 | 5 | ✅ L2 | candidate |
| 6 | idea-2026-10-23-06 owner field-notes asset | 4 | 3 | 4 | 5 | ⛔ owner media | parked |

**Selection rule applied:** the top three are *measurement-integrity* items, chosen
over the easiest content to generate, because today's evidence is that the measuring
apparatus — not the site — produced the gaps: Brave/DDG/Bing all failed and the
Gemini quota was exhausted before the AI-surface sweep ran. Ranking a content idea
above a broken instrument would encode a false picture of visibility. Ideas 03 and 04
are genuine, evidence-backed content gaps (dedicated specialist pages observed) and
are kept as `candidate` pending a fan-out map (idea 05) so they are not written blind.

**No idea actioned this run:** every candidate is either docs/tooling (deferred to a
future run with its own tests) or an HTML change that would touch page content, which
this run is constrained not to do. Nothing was rejected.

### Parked / rejected log (2026-10-23)

- **idea-2026-10-23-06 owner field-notes asset** — parked: needs owner-supplied real
  job detail/photos. Fabricating case notes is forbidden (`APPROVED_CLAIMS.md`).
- No idea rejected this run.

---

### 2026-10-25 register entries

| # | Idea | Impact | Evidence | Effort-to-value | Reversibility | Risk | Status |
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-25-01 Replace the `GEMINI_API_KEY` so the AI-surface sweep runs | 5 | HTTP 401 UNAUTHENTICATED on every `gemini_search` call today (ISSUE-034); AI surface unmeasured, not zero | 5 | 5 | ⛔ owner credential (L3) | proposed |
| 2 | idea-2026-10-25-02 Add `--network-budget` (600 s) and lower `daily_measure.py` defaults to 12 Tavily + 3 Gemini, with a test | 5 | defaults still 40+5 with no budget arg (ISSUE-033); brief cites three runs killed pre-research | 4 | 5 | ✅ L2 script-only | candidate |
| 3 | idea-2026-10-25-03 Internal-linking pass: hub-and-spoke links from each service page to its city pages | 4 | Google AI-features doc (fetched 2026-10-25) names internal links as a core AI-eligibility fundamental | 4 | 5 | ✅ L2 content | candidate |
| 4 | idea-2026-10-25-04 "Leak detection in <city>" supporting section where we already hold the city page, using only approved claims | 4 | evansleakdetection.com present in 6/20 queries on the core service (verified presence) | 3 | 5 | ✅ L2 content | candidate |
| 5 | idea-2026-10-25-05 Remove any repo claim that `llms.txt` earns Google AI-feature eligibility | 3 | AI-features doc states no new files/markup are needed; an overstated claim is a correctness defect | 5 | 5 | ✅ L2 docs | candidate |
| 6 | idea-2026-10-25-06 Owner field-notes asset (real job detail) | 4 | no fetched evidence; needs owner-supplied media | 2 | 5 | ⛔ owner media | parked |

**Prioritisation (impact / evidence / effort-to-value / reversibility, risk-gated):**
1. **idea-2026-10-25-01** — highest: it is the difference between a measured and an
   unmeasured AI surface, and it is the only item blocking the engine's core signal.
   An owner credential action (L3), so `proposed`, not executed.
2. **idea-2026-10-25-02** — the highest-scoring item the engine may execute itself.
   Evidence is a direct read of the script plus the brief's own budget table.
   Deferred to a dedicated test-covered PR rather than bundled here, because it
   changes the measurement contract.
3. **idea-2026-10-25-03** — first content idea, ranked above 04 because its evidence
   is a *primary official source* fetched today rather than competitor presence, and
   it is trivially reversible.
4. **idea-2026-10-25-04** — real evidence (a dedicated leak-detection competitor in
   6/20 queries), but content work needs a fan-out map so pages are not written blind.
5. **idea-2026-10-25-05** — cheap correctness fix; keeps the repo's own claims honest.
6. **idea-2026-10-25-06** — parked, unchanged: needs owner-supplied real job detail.

**Selection rule applied:** measurement-integrity first. The top two ideas repair the
instrument (an invalid credential; an over-long sweep) before any content is written,
because today's evidence is again that the measuring apparatus — not the site —
produced the gaps. Ideas 03–05 are genuine, evidence-backed and reversible, and stay
`candidate` pending their own tested PRs.

**No idea actioned this run:** 01 is a Level 3 owner credential; 02 changes the
measurement contract and needs its own tests; 03–05 are HTML/docs changes that this
run is constrained not to bundle with the daily report. Nothing was rejected.
## 2026-10-26 (Intelligence HQ daily) — 6 new ideas, prioritized
## 2026-10-28 (daily run) — 6 new ideas, prioritized

Evidence base this run: 10 Tavily conventional-search result sets (Brave **429**,
DDG Lite **no parseable anchors**), 0 usable AI-surface rows (Gemini **401**, see
ISSUE-035). Repeat specialist domains confirmed: `efficientplumbing.com` (7 hits),
`evansleakdetection.com`, `barkerandsonsplumbing.com`, `clearwaterplumbingoc.com`,
`rotorooter.com`. New exact-match city+service domains this run:
`repipe-laguna-hills.com`, `aterheatermaninc.com` — reinforcing the 2026-10-23
finding that **single-service city domains** hold repipe and water-heater intents.

Scored 1–5 (higher is better). Risk gate: **L1** read-only/docs · **L2** reversible
on-page or tooling · **L3** identity/price/legal/area/profile (propose only).

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
| 1 | idea-2026-10-26-04 pre-stage sitemap dirty-flag: distinguish self-inflicted dirt from generator non-idempotency | 4 | 5 | 3 | 5 | ✅ L2 | **prioritized** |
| 2 | idea-2026-10-26-03 record Gemini `ACCESS_TOKEN_TYPE_UNSUPPORTED` as a broken instrument and rotate the key | 4 | 5 | 4 | 5 | ✅ L1 (docs) | **prioritized** |
| 3 | idea-2026-10-26-01 Laguna Hills city × PEX-repipe page | 4 | 5 | 3 | 5 | ✅ L2 | **prioritized** |
| 4 | idea-2026-10-26-02 verifiable geography block (ZIP + water district) on city pages | 4 | 4 | 3 | 4 | ⛔ L3 area claim | propose |
| 5 | idea-2026-10-26-05 "how to choose a plumber in <city>" answer block | 3 | 3 | 3 | 5 | ✅ L2 | candidate |
| 6 | idea-2026-10-26-06 claim/complete HomeAdvisor + Porch listings | 4 | 4 | 2 | 3 | ⛔ L3 profile | propose |

**Selection rule applied:** the top two are *measurement-integrity* items. Today the
two failing checks in `daily_context.json` (`sitemap_idempotent`,
`ai_visibility_sweep`) both trace to the instrument, not to the site — one is a
one-shot migration artifact, the other a dead API key. Fixing the instrument first
is what keeps tomorrow's *absent* readings interpretable; ranking a content idea
above a broken instrument would encode a false picture of visibility. Idea 03 is the
first content gap in this log backed by a **single-purpose city × service page** that
is actually ranking (see evidence below), so it outranks the older repipe ideas.

### Evidence per idea

- **idea-2026-10-26-04** — `growth-engine/data/daily_context.json` →
  `checks[sitemap_idempotent]`: `ok: false, sitemap_dirty: true`, yet running
  `python3 scripts/refresh_sitemap.py` by hand leaves `git status --porcelain --
  sitemap.xml` **empty** and the file is byte-identical on a second run. Diffing
  `origin/main:sitemap.xml` against the refreshed file: 89 URLs both sides, URL set
  equal, **0 per-URL `<url>` blocks differing**, 22 URLs in a different *order*. So
  the generator is idempotent; `main`'s committed copy is simply in a non-canonical
  order, and the pre-stage's own refresh rewrites it before the check reads
  `git status`. Expected to self-clear when this branch merges. *Confidence: high.*
- **idea-2026-10-26-03** — `ai_visibility_history.jsonl` 2026-10-26 `gemini_search`
  rows: HTTP 401 `ACCESS_TOKEN_TYPE_UNSUPPORTED`, "API key not valid". Re-verified by
  hand naming the secret explicitly (`export GEMINI_API_KEY="${GEMINI_API_KEY}"` then
  `GET https://generativelanguage.googleapis.com/v1beta/models`) → same 401, so this
  is a **dead key**, not a missing injection. All 5 rows correctly recorded
  `inconclusive`, never zero. *Confidence: high.*
- **idea-2026-10-26-01** — `competitor_observations.jsonl` 2026-10-26T13:10Z:
  `repipe-laguna-hills.com` ranks for "PEX repiping company in Laguna Hills" with a
  single-purpose city × service page (262 "repipe" mentions; names Nellie Gail Ranch
  ×25 and Moulton Ranch ×17; El Toro Water District ×14; PEX-A Uponor/Wirsbo
  ASTM F1960 ×4; an HOA/condo repipe section ×15; FAQPage+HowTo+BreadcrumbList+Plumber
  schema). SF holds no city × repipe page for Laguna Hills. A feature *observed* on
  their page is verified evidence they have it; that it *caused* the ranking is a
  hypothesis. *Confidence: high (observation), medium (causal).*
- **idea-2026-10-26-02** — two independent competitors publish geography blocks:
  `lagunaniguelcaplumbingpros.com` ("Laguna Niguel Communities" + "Laguna Niguel ZIP
  codes we serve") and `repipe-laguna-hills.com` (named ranch neighborhoods + water
  district). Tempting and effective-looking — but naming neighborhoods we serve is a
  **service-area commitment** (ground rule 9, L3). Proposed, not built: a factual
  ZIP-code/water-district framing would still need owner confirmation that the 21-city
  list is actively serviced (`SERVICE_AREAS.md` "Owner confirmation required").
- **idea-2026-10-26-05** — Claude run report `reports/daily/2026-10-26.md`: Roto-Rooter
  surfaces for Aliso Viejo via a "how to find a good plumber" guide, i.e. an
  answer-shaped page outranking service pages. *Confidence: medium (single source,
  title/URL only).*
- **idea-2026-10-26-06** — today's Tavily top-result domain counts: `yelp.com` 16,
  `facebook.com` 10, `homeadvisor.com` + `pro.porch.com` + `homeguide.com` in the
  Claude run's top-5 lost-answer list. Directory presence, not site content, is where
  the answers are being taken from. Claiming a profile is a business-profile change
  (L3) → `proposals/`. *Confidence: medium-high.*

**No idea actioned as a site change this run.** Ideas 01/05 would touch page content
(and 01 needs the fan-out map from idea-2026-10-23-05 first, so it is not written
blind); 02 and 06 are L3; 03/04 are documentation this run and tooling for a later
run with its own tests. Nothing rejected.

### Parked / rejected log (2026-10-26)

- **idea-2026-10-23-06 owner field-notes asset** — still parked (owner-supplied media;
  fabricating case notes is forbidden by `APPROVED_CLAIMS.md`). No new evidence.
- No idea rejected this run.
## 2026-10-26 (weekly run) — status review, no new ideas

This weekly run added **no new ideas**; it reviewed the open register and updated
statuses against this week's evidence. Nothing was deleted.

| Idea | Was | Now | Reason (evidence) |
|---|---|---|---|
| idea-2026-10-23-01 sweep provider-fallback + HTTP-status recorder | prioritized | **prioritized (unchanged, overdue)** | Still unshipped after 3 days; 9 of 10 Gemini rows were lost to 429/500 on 2026-10-23 and a 429 can still be recorded as `absent`. Now a top-3 priority. |
| idea-2026-10-23-02 reserve Gemini quota for the sweep | prioritized | **prioritized (unchanged, overdue)** | Same; the free Gemini quota is still spent by the step-0b pre-stage before the AI sweep runs. Now a top-3 priority. |
| idea-2026-10-23-05 query fan-out coverage map (docs) | prioritized | **prioritized** | Kept ahead of further page writing: 7 city pages shipped 2026-10-20→24 with no map of which sub-queries existing pages answer. Ranked #6 of 10 this week. |
| idea-2026-10-23-03 per-city water-heater page (Laguna Niguel) | candidate | **shipped (2026-10-23)** | `services/water-heater-repair-laguna-niguel.html` is live; the same pattern also shipped for Dana Point and San Clemente. Baseline `sf_status` for its target queries is `absent` (3 queries). Re-measure 4 weeks out. |
| idea-2026-10-23-04 Newport Beach whole-house repipe page | candidate | **candidate (evidence strengthened)** | `repipe-newport-beach.com` — a single-service, single-city domain — appeared in repipe answers this window, confirming the specialist-domain pattern. Still gated on the fan-out map (idea 05). |
| idea-2026-10-23-06 owner field-notes asset | parked | **parked (unchanged)** | Still needs owner-supplied real job detail/photos; fabricating case notes is forbidden. |
| idea-2026-10-12-13 commit-early checkpointing | prioritized | **in-progress / proven** | This run used it successfully: a skeleton report was committed before the body was written, so a budget overrun could not lose the review. |
| **NEW THIS RUN — not an idea but a defect to fix:** daily-runner WebFetch permission | — | **prioritized (top-3)** | 6 consecutive INCONCLUSIVE daily health checks (2026-10-21→26) caused by an interactive permission prompt no unattended run can answer. Recorded here because it is a *measurement* fix, not a site fix, and blocks daily verification. |

**Selection rule applied this week:** the loop's binding constraint is verification,
not production. The two overdue measurement-integrity ideas (01, 02) plus the
runner-permission defect outrank any new content idea. No content idea was promoted.


## 2026-10-27 — Daily idea batch (evidence-backed)

Evidence base: 15-query Tavily conventional sweep (SF absent 0/15);
fetched competitor pages (Evans, Scott English, Creative Repipe, Zoom Drain,
Efficient Plumbing); Google Search Central AI-optimization guide
(https://developers.google.com/search/docs/fundamentals/ai-optimization-guide,
fetched 2026-10-27). None of these ideas is actioned today; each needs its own
evidence and tests.

| ID | Idea | Type | Impact | Evidence | Effort | Reversible | Risk gate | Status |
|---|---|---|---|---|---|---|---|---|
| idea-2026-10-27-01 | **Specialist "leak detection" landing page** modeled on Evans/Leak Star: one deep page on *residential leak detection in South OC* with FAQ schema, diagnostic-method explainer (acoustic/thermal/camera), and decision guidance | Website | High | Evans + Leak Star recur 3/15 each with dedicated specialist pages + FAQPage schema | Medium | Yes | Level 1 (content) | candidate |
| idea-2026-10-27-02 | **"Diagnostic methods" explainer page** — how SF actually finds a hidden leak (acoustic listening, thermal imaging, pressure testing, camera) with what each method is good at | Website | High | Google AI guide: non-commodity, first-hand experience content; competitor pages don't detail methods | Medium | Yes | Level 1 (content) | candidate |
| idea-2026-10-27-03 | **Owner-experience "decision" content** ("when a repipe is *not* worth it", "slab leak vs. supply-line leak: how we tell") — matches Google's cited non-commodity example almost exactly | Website | High | Google AI guide "unique point of view"; owner has 30+ yrs experience per BUSINESS_PROFILE | Medium | Yes | Level 1 (content) | candidate |
| idea-2026-10-27-04 | **Verify SF's own AI-answer presence on a working AI surface** — build a small script that queries an available AI answer engine (the Gemini key is OAuth-typed and 401s; needs a real API key or an alternative engine) so the AI-surface check stops returning BLOCKED | Tooling | High | Gemini sweep BLOCKED today (HTTP 401, secret prefix `AQ.` is not a `AIza…` API key) | Medium | Yes | Level 1 (tooling) | candidate |
| idea-2026-10-27-05 | **Per-city "response time / service-area" content on Tier-1 city pages** — competitors use per-city location pages (Zoom Drain); add genuinely local detail (drive-time context, local plumbing quirks like hard water) rather than thin doorways | Website | Medium | Zoom Drain per-city page observed; Google warns against commodity/thin content so must be non-commodity | Medium | Yes | Level 1 (content) | candidate |
| idea-2026-10-27-06 | **Directory-presence audit** — Yelp appears in 13/15 queries; ensure SF's NAP is correct/complete on Yelp/Angi/Google Business Profile (a listing fix, not a site change) | Business | Medium | yelp.com 13/15, angi.com 3/15 in today's sweep | Low | Yes | Level 2 (owner action; propose) | candidate |

### Prioritization (impact / evidence / effort-to-value / reversibility + risk gate)

1. **idea-2026-10-27-03** (owner-experience decision content) — highest score:
   directly matches a *primary-source* Google example, high impact, reversible,
   Level 1. Gate: needs real owner detail; do not fabricate.
2. **idea-2026-10-27-02** (diagnostic methods explainer) — high impact, strong
   evidence, Level 1, reversible.
3. **idea-2026-10-27-04** (fix AI-surface measurement) — high leverage on the
   *instrument*: without a working AI engine every AI-visibility number is BLOCKED.
   Level 1 tooling.
4. **idea-2026-10-27-01** (specialist leak-detection page) — high impact but must
   not duplicate existing leak pages; needs a content map first.
5. **idea-2026-10-27-05** (per-city local detail) — medium; risk of thin/doorway
   content, so only with genuinely local non-commodity detail.
6. **idea-2026-10-27-06** (directory NAP audit) — medium impact, lowest effort,
   but Level 2 (owner/business profile) → **propose**, do not action.

**No idea actioned this run:** every candidate is either an HTML content change
(which needs its own evidence, tests, and a site-branch PR) or an owner/business
action (Level 2). Nothing rejected.
|---|---|---|---|---|---|---|---|
| 1 | idea-2026-10-28-01 fix the AI-surface credential path (documented owner re-provision, with a `--smoke` preflight gate in the daily runner) | 5 | 5 | 4 | 5 | ✅ L2 | **prioritized** |
| 2 | idea-2026-10-28-02 sitemap-ordering regression test (assert committed file equals generator output byte-for-byte) | 3 | 5 | 5 | 5 | ✅ L2 | **prioritized** |
| 3 | idea-2026-10-28-03 fan-out coverage map for water-heater × Tier-1 city (docs) | 4 | 4 | 3 | 5 | ✅ L1 | **prioritized** |
| 4 | idea-2026-10-28-04 Laguna Hills PEX-repiping page (city × repipe) | 4 | 4 | 3 | 5 | ✅ L2 | candidate |
| 5 | idea-2026-10-28-05 Aliso Viejo water-heater page (city × water-heater) | 4 | 4 | 3 | 5 | ✅ L2 | candidate |
| 6 | idea-2026-10-28-06 "which specialist do I need?" decision guide (leak vs repipe vs water heater) | 3 | 3 | 3 | 5 | ✅ L2 | candidate |

**Selection rule applied:** the top three are *measurement-integrity* items again.
Two independent instruments failed today (Gemini 401, search providers blocked) and
the one content check that failed (sitemap) was a false positive that had been
masking regressions. Ranking a content idea above a broken instrument would encode a
false picture of visibility — the same reasoning as 2026-10-23. Ideas 04 and 05 are
genuine, evidence-backed city×service gaps (dedicated specialist domains observed
holding those intents), kept `candidate` pending idea 03's fan-out map so they are
not written blind.

**No idea actioned this run:** ideas 01–03 are documentation/tooling whose tests
belong in their own change; 04–06 are HTML changes this run is constrained not to
make (a report-only run). Nothing rejected.

### Parked / rejected log (2026-10-28)

- **idea-2026-10-28-06** kept `candidate` — the decision-guide concept overlaps the
  existing `guides/` hub; would need a fan-out map to justify a new page vs a section.
## 2026-10-29 (daily run) — 6 new ideas, prioritized

Scored 1–5 (higher = better). Risk gate: **L1** read-only/docs · **L2** reversible

| ID | Date | Idea | Type | Impact | Evid | Effort | Rev | Risk | Status | Evidence / source | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| idea-2026-10-29-01 | 2026-10-29 | Make the **`sitemap_idempotent` check actionable** — commit the generator-canonical `sitemap.xml` order and have the check report *what* changed (order vs. URL set vs. lastmod) | Website/ops | 3 | 5 | 1 | 5 | L1 | scored | This run: `refresh_sitemap.py` rewrote `sitemap.xml` on a clean tree; diff is **URL set identical (89/89), every lastmod/changefreq/priority identical**, only the ordering differs from the generator's `sort_key`. The check reports `sitemap_dirty: true` with no hint. | The committed order was normalised on 2026-10-16 but has since drifted (later direct edits reordered blocks). Committing the generator's own output makes the check pass on a clean tree and keeps it diagnostic. Docs/tooling + one data file; reversible with `git checkout HEAD -- sitemap.xml`. |
| idea-2026-10-29-02 | 2026-10-29 | Add a **Tavily result-quality guard**: flag a query whose top-10 is dominated by aggregators (yelp/facebook/youtube) as `low_signal` rather than a plain `absent` | Website/ops | 3 | 4 | 2 | 5 | L1 | scored | Today 3 of 14 queries returned aggregator-heavy sets (`water leak detection Laguna Niguel` → 5× yelp/facebook; `tankless water heater descale Newport Beach` → yelp/youtube/mapquest; `best leak detection company in Laguna Niguel` → 5× yelp). A plain `absent` conflates "SF missing" with "no plumbing result set exists". | Prevents reading an aggregator-dominated SERP as a competitive loss. Docs/tooling; reversible. |
| idea-2026-10-29-03 | 2026-10-29 | Add a per-city **slab-leak-detection page for Ladera Ranch** (Tier-1/Tier-2 gap) | Website | 4 | 4 | 3 | 5 | L2 | candidate | Tavily "slab leak detection Ladera Ranch" → SF **absent**; dedicated single-city domains rank (`proplumberladeraranch.com`, `repipe-ladera-ranch.com`) plus `integrityrepipe.com`, `leakdetectionplumbers.com`. Feature verified; causation = hypothesis. | Extends idea-2026-10-13-01/08. One substantive page, reuse city+service templates, no new claims. Do not permute. |
| idea-2026-10-29-04 | 2026-10-29 | Add a per-city **water-main / main-line leak** page for Rancho Santa Margarita | Website | 4 | 3 | 3 | 5 | L2 | candidate | Tavily "water main leak detection Rancho Santa Margarita" → SF **absent**; set is the water district (`smwd.com`) + local plumbers (`rsmplumbing.net`, `calischoice.com`, `appliedrooter.com`). | New service × city framing; no water-district claims, no prices. Corroborate with `SERVICE_AREAS.md` + `APPROVED_CLAIMS.md` before writing. |
| idea-2026-10-29-05 | 2026-10-29 | Publish a **"hidden water leak: how a pro actually finds it"** explainer (meter isolation → acoustic → thermal → camera) | Website | 4 | 4 | 3 | 5 | L2 | candidate | Today's homeowner-intent probe: the "how to find a hidden water leak" answer set is national lead-gen content (`homealliance.com`, `watercalculator.us`, `ircplumbing.com`, `plumbingtoolsreview.com`), **no licensed-local voice**; Google 2026-10-23 guidance names "unique point of view" as the differentiator. | Reinforces idea-2026-10-13-03 and idea-2026-10-23-06 but does not require owner media — a process explainer can be written from approved method descriptions. No new claims. |
| idea-2026-10-29-06 | 2026-10-29 | Fix the **Gemini AI-surface measurement blocker** (key returns HTTP 401 `ACCESS_TOKEN_TYPE_UNSUPPORTED`) — validate/rotate the registered `GEMINI_API_KEY`, or fail the pre-stage loudly with the exact status | Website/ops | 4 | 5 | 2 | 4 | L3 (secret) | proposed | This run: `GET https://generativelanguage.googleapis.com/v1beta/models?key=…` returned **HTTP 401 "API key not valid … ACCESS_TOKEN_TYPE_UNSUPPORTED"**; all 5 Gemini rows `inconclusive`. The AI surface has been unmeasured for ≥7 days (429 quota on 2026-10-23, 401 today). | Requires a valid key, which is a credential/secret change → propose, never self-execute. Proposal file created this run. |

### Second-pass prioritization (2026-10-29)

| 1 | idea-2026-10-29-06 validate/rotate Gemini key (restore AI-surface measurement) | 4 | 5 | 2 | 4 | ⛔ L3 secret | **proposed** |
| 2 | idea-2026-10-29-01 commit generator-canonical sitemap order + make check diagnostic | 3 | 5 | 1 | 5 | ✅ L1 | **prioritized** |
| 3 | idea-2026-10-29-02 Tavily `low_signal` guard for aggregator-dominated SERPs | 3 | 4 | 2 | 5 | ✅ L1 | **prioritized** |
| 4 | idea-2026-10-29-05 "how a pro finds a hidden water leak" explainer | 4 | 4 | 3 | 5 | ✅ L2 | candidate |
| 5 | idea-2026-10-29-03 Ladera Ranch slab-leak-detection page | 4 | 4 | 3 | 5 | ✅ L2 | candidate |
| 6 | idea-2026-10-29-04 Rancho Santa Margarita water-main leak page | 4 | 3 | 3 | 5 | ✅ L2 | candidate |

**Selection rule applied:** the top rank is the measurement instrument again — the
AI surface has produced zero usable rows for over a week (429 then 401), so the
single highest-value action is restoring it, which needs a credential change and is
therefore **proposed, not executed**. Ranks 2–3 are the deterministic tooling fixes
that this run can actually land (and rank 2 is actioned below). Content ideas (4–6)
are genuine, evidence-backed gaps but stay `candidate` until the instrument is sound,
consistent with the 2026-10-23 rule.

**Actioned this run:** idea-2026-10-29-01 (committed generator-canonical
`sitemap.xml` order; the `sitemap_idempotent` check now passes on a clean tree).

### Parked / rejected log (2026-10-29)

- **idea-2026-10-23-06 owner field-notes asset** — remains parked: still needs
  owner-supplied real job detail/photos (`APPROVED_CLAIMS.md`).
- **idea-2026-10-29-06 Gemini key rotation** — proposed (needs a valid credential);
  never self-executed.
## 2026-10-30 (daily run) — 6 new ideas, prioritized

Evidence today: Brave returned **6/12** parseable queries then HTTP 429; the Gemini
key is **401 invalid** (see new ISSUE-034); the site is **absent** from all 6
executed Brave queries but the query set was small and rate-limited.

| 1 | idea-2026-10-30-01 sitemap canonical-order normaliser + idempotency guard | 4 | 5 | 4 | 5 | ✅ L2 | **prioritized** |
| 2 | idea-2026-10-30-02 record provider HTTP status in every sweep row (blocked ≠ absent) | 5 | 5 | 4 | 5 | ✅ L2 | **prioritized** |
| 3 | idea-2026-10-30-03 Tavily remains primary; Brave demoted to opportunistic probe | 3 | 4 | 4 | 5 | ✅ L2 | **prioritized** |
| 4 | idea-2026-10-30-04 "leak star / plumber champions" thin-page competitors — pattern dossier (docs) | 3 | 4 | 3 | 5 | ✅ L1 | candidate |
| 5 | idea-2026-10-30-05 dedicated `/services/slab-leak-detection.html` FAQ block | 4 | 3 | 3 | 5 | ✅ L2 | candidate |
| 6 | idea-2026-10-30-06 owner-verified "repeat competitor" service-feature table (docs) | 3 | 3 | 3 | 5 | ✅ L1 | candidate |

**Selection rule applied:** the top three are again *measurement-integrity* items.
Today's evidence is that the instrument (Brave rate-limit, invalid Gemini key, and a
sitemap check that fails on ordering alone) — not the site — produced the visible
gaps. Ideas 04–06 are genuine content observations kept as `candidate` because a
6-query, half-blocked sample cannot justify an HTML edit.

### Detail — top idea

**idea-2026-10-30-01 — sitemap canonical-order normaliser + idempotency guard.**
`scripts/refresh_sitemap.py` rebuilds `sitemap.xml` in a canonical order
(`sort_key`: homepage → depth → index-first → rel). The committed `sitemap.xml`
had its `case-studies/` block in a **non-canonical order**, so the first
`refresh_sitemap.py` run rewrote the file — byte-content-identical (same 89 `<loc>`,
same `(loc,lastmod)` pairs, same changefreq/priority multiset) but reordered. That
dirty diff is what `daily_measure.py::check_sitemap_idempotent` reads as FAIL
(`sitemap_dirty: True`). Verified today: a **second** run produces **no diff**
(truly idempotent on the normalised tree). Fix: (a) treat an ordering-only change
as a pass (compare the parsed entry *set*, not the raw bytes), or (b) commit the
canonicalised sitemap so the first run is a no-op. (b) is what happened this run.
Impact 4 · Evidence 5 · Effort-to-value 4 · Reversibility 5. **Risk gate:** ✅ L2.
**Status:** `prioritized`.

**idea-2026-10-30-02 — provider HTTP status in every sweep row.** Today 6 Brave
queries returned HTTP 429 and were *initially* written `absent`; only manual review
caught it. Encode the HTTP status (and a `blocked: true` flag) in each
`ai_visibility_history.jsonl` row so a rate-limited query can never be silently
counted as a genuine absence. Impact 5 · Evidence 5 · Effort→value 4 · Reversibility
5. **Risk gate:** ✅ L2. **Status:** `prioritized`.

### Parked / rejected log (2026-10-30)

- No idea rejected this run. idea-2026-10-30-06 overlaps idea-2026-10-30-04 and is
  kept only as a docs companion.
## 2026-11-01 (daily run) — 6 new ideas, prioritized

Today's evidence base: 12 fresh Tavily conventional-search queries (SF `absent` on all
12), the step-0b sweep, and two fetched Google Search Central primary sources. The
dominant observed pattern is that **service×city landing pages on both specialist and
multi-city domains** hold every commercial query tested, and that a **robots.txt /
Google-Extended** mechanism now governs AI-answer eligibility. Scored 1–5 (higher is
better). Risk gate: **L1** read-only/docs · **L2** reversible on-page or tooling ·
**L3** identity/price/legal/area/profile (propose only).

| ID | Idea | Type | Impact | Evid | Effort→Value | Rev | Risk | Status | Evidence / source |
|---|---|---|---|---|---|---|---|---|---|
| idea-2026-11-01-01 | Surface the live **service×city coverage matrix** for SF (which city×service page exists vs. which competitor page holds that query) | Docs/tooling | 4 | 5 | 3 | 5 | ✅ L2 | **prioritized** | Today: repipe→integrityrepipe/socalrepipes/pacificcoastcopperrepipe; water-heater→thewaterheatercompany/waterheatersonly/waterheatermaninc; drains→splashplumbing/jettersndrains/appliedrooter; slab→evansleakdetection/primewest/americanleakdetection — each on a **city×service** page. |
| idea-2026-11-01-02 | Fix the **AI-surface instrument**: `GEMINI_API_KEY` returns HTTP 401 `authentication_failed` (invalid/expired key), so every Gemini grounded row is `inconclusive` | Tooling/ops | 5 | 5 | 2 | 5 | ✅ L2 | **prioritized** | This run: `scripts/gemini_visibility.py --smoke` → `{"error_type":"authentication_failed","status_code":401, "reason":"ACCESS_TOKEN_TYPE_UNSUPPORTED"}`. Distinct from the 2026-10-23 HTTP 429 quota cause; the Gemma fallback never engages because the key is rejected outright. Needs a **valid** key (owner action). |
| idea-2026-11-01-03 | Add a **`robots.txt` guard test** asserting `Google-Extended: Allow` (and the other named AI crawlers) stay present | Tooling | 3 | 5 | 2 | 5 | ✅ L2 | **prioritized** | Google post 2026-10-30: "Websites that specifically allow Google-Extended are eligible to appear in responses … via grounding in Gemini Apps." SF's robots.txt already allows it; a guard prevents a future silent opt-out. |
| idea-2026-11-01-04 | Publish a **per-city water-heater** page for the home city (Laguna Niguel) | Website | 4 | 4 | 3 | 5 | ✅ L2 | candidate | Water-heater queries are held by **single-service** domains (`thewaterheatercompany.com`, `waterheatersonly.com`, `waterheatermaninc.com`) on city pages; SF has no city×water-heater page. Feature verified; causation = hypothesis. |
| idea-2026-11-01-05 | Publish a **per-city repipe/PEX** page for Laguna Niguel | Website | 4 | 4 | 3 | 5 | ✅ L2 | candidate | "PEX repipe Laguna Niguel" returned `integrityrepipe.com`, `socalrepipes.com`, `pexrepipe-repiping.com`, `pacificcoastcopperrepipe.com` — all **repipe-specialist** domains with a city page. SF has `/services/pex-repiping.html` but no city frame. |
| idea-2026-11-01-06 | Add a **"what the leak-detection equipment does"** explainer tied to SF's own verified methods | Website | 4 | 3 | 3 | 5 | ✅ L2 | candidate | Leak **specialists** (evansleakdetection.com, americanleakdetection.com, sjplumbingoc.com) recur on acoustic/hidden/slab queries with dedicated detection pages; SF's service page lists methods but no explainer asset. Needs brand-voice pass; no new claims. |

**Prioritization rationale:** the top three are **measurement-integrity** items, chosen
over the easiest content to generate, because today's largest finding is that the
**AI-surface instrument is broken by an invalid key** (idea-02) — a content idea ranked
above a broken instrument would encode a false picture of visibility. Idea-01 turns
today's 12-query evidence into a reusable coverage map so the two content candidates
(04/05) are not written blind. Idea-03 is a cheap, high-evidence guard justified by a
fetched primary source.

**No idea actioned this run:** idea-02 needs an owner-supplied valid key (Level 3
credential); ideas 01/03 are tooling that warrants its own tested PR; ideas 04–06 are
HTML changes this run is constrained not to make. Nothing rejected.

### Parked / rejected log (2026-11-01)

- **idea-2026-11-01-04 / -05 per-city water-heater & repipe pages** — held as `candidate`
  (not rejected): the same city×service pattern also needs a *local-differentiation*
  pass so the pages are not thin permutations; deferred behind idea-01's coverage map.

## 2026-11-02 (weekly review) — 6 new ideas, statuses updated

Evidence base: the week 2026-10-27 → 2026-11-02 (7 daily reports, 7 citation-gap
reports, ~1.9k `competitor_observations` rows, ~120 `ai_visibility_history` rows),
plus the Gemini 401 reproduced this run. Scored 1–5 (higher is better). Risk gate:
**L1** read-only/docs · **L2** reversible on-page or tooling · **L3** identity/price/
legal/area/profile (propose only).

| ID | Idea | Type | Impact | Evid | Effort→Value | Rev | Risk | Status | Evidence / source |
|---|---|---|---|---|---|---|---|---|---|
| idea-2026-11-02-01 | Re-provision `GEMINI_API_KEY` as a valid AI Studio **API key** (`AIza…`) and add a smoke assertion to the daily pre-stage | Tooling/ops | 5 | 5 | 2 | 5 | ✅ L2 | **prioritized** | This run: `scripts/gemini_visibility.py --smoke` → HTTP 401 `authentication_failed` / `ACCESS_TOKEN_TYPE_UNSUPPORTED`; key length 53, prefix `AQ.A` (not `AIza`). 0 usable AI rows since 2026-10-23. |
| idea-2026-11-02-02 | Ship the **service×city coverage matrix** as a committed, regenerable artifact (exists / who-holds-the-query / last observed) | Docs/tooling | 4 | 5 | 3 | 5 | ✅ L2 | **prioritized** | Every commercial query this week is held by a service×city page: repipe→integrityrepipe/socalrepipes; water-heater→thewaterheatercompany/waterheatersonly; slab→evansleakdetection/primewest; drains→splashplumbing/jettersndrains. Extends idea-2026-11-01-01. |
| idea-2026-11-02-03 | Owner claim/complete the **top directory listings** (HomeAdvisor → This Old House → Angi → Porch → BBB → HomeGuide) | Business | 5 | 5 | 3 | 4 | ⚠️ L3 | **proposed** | `reports/citation-gaps/2026-11-01.md`: HomeAdvisor 70 lost answers, This Old House near-me 40, Angi 30, Porch 25, HomeGuide 21, BBB 20. Directories, not plumbers, own the lost answers. |
| idea-2026-11-02-04 | Add a **`robots.txt` guard test** asserting `Google-Extended: Allow` + named AI crawlers stay present | Tooling | 3 | 5 | 2 | 5 | ✅ L2 | **scored** | Google post 2026-10-30 (fetched, `INDUSTRY_WATCH.md`): sites that allow Google-Extended stay eligible for Gemini grounding. Restates idea-2026-11-01-03; still unshipped. |
| idea-2026-11-02-05 | Publish a **per-city water-heater** page for the home city (Laguna Niguel), with local differentiation | Website | 4 | 4 | 3 | 5 | ✅ L2 | candidate | Water-heater queries held by single-service domains on city pages (`thewaterheatercompany.com`, `waterheatersonly.com`, `waterheatermaninc.com`); SF still has no city×water-heater page. Feature verified; causation = hypothesis. |
| idea-2026-11-02-06 | Publish a **per-city repipe/PEX** page for Laguna Niguel, with local differentiation | Website | 4 | 4 | 3 | 5 | ✅ L2 | candidate | "PEX repipe Laguna Niguel" → `integrityrepipe.com`, `socalrepipes.com`, `pexrepipe-repiping.com`, `pacificcoastcopperrepipe.com` — all repipe-specialist city pages. SF has `/services/pex-repiping.html`, no city frame. |

**Prioritization rationale:** the top two remain measurement-integrity items, not
content, because the week's defining fact is that the AI-answer instrument is **blind**
(idea-01) and the content gaps are still written from a one-engine board (idea-02).
Idea-03 is the only new high-impact *owner* action this week and is a Level 3 listing
task, so it is proposed, not executed.

**Status updates this week:**
- idea-2026-11-01-01 → **in-progress** (coverage matrix; no artifact committed yet).
- idea-2026-11-01-02 → **prioritized** (unchanged; blocked on the owner's key).
- idea-2026-10-12-01 / idea-2026-10-13-01 / idea-2026-10-13-08 (city × slab-leak
  pages) → **partially shipped**: Mission Viejo slab+PEX (#97), Laguna Niguel
  hidden-leak (#99) merged 2026-11-02.
- idea-2026-10-13-02 (per-city repipe/PEX) → **partially shipped**: Dana Point +
  Laguna Niguel + Mission Viejo PEX pages live; Laguna Niguel specialist-depth page
  still a candidate.

### Parked / rejected log (2026-11-02)

- **idea-2026-11-02-05 / -06 per-city water-heater & repipe pages** — held as
  `candidate` (not rejected): both need a local-differentiation pass so the pages are
  not thin permutations; deferred behind the coverage matrix (idea-02).
- No idea rejected this week.
