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

> The first daily run by the new automation appends its own ≥5 dated ideas and
> re-scores this table. This seed set documents the format and the evidence bar.

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

---

## Prioritization (impact / evidence / effort-to-value / reversibility / risk)

| Rank | Idea | Impact | Evidence | Effort→Value | Reversible | Risk gate | Decision |
|---|---|---|---|---|---|---|---|
| 1 | IDEA-01 leak-or-no-leak tool | High | Medium | Medium→High | Yes | ✅ L2 | prioritized |
| 2 | IDEA-03 FAQPage schema on method pages | Medium | Medium-High | Low→High | Yes | ✅ L2 | prioritized |
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

## Parked / rejected log

- **IDEA-06 owner-voice video** — parked 2026-10-12: blocked on owner-produced media.
- No idea rejected this run.
