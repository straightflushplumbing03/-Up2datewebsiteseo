# Innovation Ideas — Straight Flush Plumbing & Leak Detection

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
