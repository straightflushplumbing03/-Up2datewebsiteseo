# GEO Methodology

This document defines exactly how every number in the lab is produced. If a
score or rate appears in the interface, its derivation is here.

## The five layers

Each content **section** (not page) is scored on five layers. Section granularity
is deliberate: retrieval systems select passages, not whole pages, so a page
score that hides a weak section is misleading.

| Layer | Key | Weight | Question it answers |
|---|---|---|---|
| Retrieval Probability | `retrieval` | 0.30 | Is this section a candidate for retrieval by an AI/search system? |
| Extractability | `extractability` | 0.25 | Can a machine parse, extract and summarise it cleanly? |
| Entity Reinforcement | `entity` | 0.20 | Does it reinforce the business entity (name, NAP, service, geography)? |
| Structural Authority | `authority` | 0.15 | Is there real supporting evidence behind the claim? |
| System Memory Readiness | `memory` | 0.10 | Will platforms represent the business accurately and consistently? |

Page score = weighted mean of its section scores. Overall dashboard score =
mean of page scores over indexable pages.

### Layer 1 — Retrieval Probability

| Factor | Weight | Signal |
|---|---|---|
| Search intent fit | 0.18 | Heading reads as a real query/topic (≥3 words, not "read more") |
| Direct answer lead | 0.20 | Opens with a short declarative answer under the heading |
| Local relevance | 0.16 | Names a target city or region |
| Service relevance | 0.16 | Names a verified service |
| Semantic completeness | 0.14 | Word count vs a 120-word target, scaled by paragraph presence |
| Query coverage | 0.10 | Share of target query terms present |
| Topical focus | 0.06 | Length appropriate for a single retrievable section |

### Layer 2 — Extractability

| Factor | Weight | Signal |
|---|---|---|
| Descriptive heading | 0.16 | Heading is 3–12 words |
| Heading level | 0.10 | H2/H3 ideal, H1 acceptable, deeper penalised |
| Paragraph structure | 0.14 | 1–8 paragraphs |
| Lists / tables | 0.12 | Structured content present |
| Page schema | 0.12 | Page carries JSON-LD |
| Duplication | 0.12 | Not a near-duplicate of another section on the page |
| Unambiguous language | 0.08 | No vague filler ("etc.", "various", "things") |
| Information density | 0.08 | Sentences are not padded |
| Terminology consistency | 0.08 | Consistent vocabulary across the page |

### Layer 3 — Entity Reinforcement

| Factor | Weight | Signal |
|---|---|---|
| Business named | 0.16 | Canonical business name appears |
| NAP consistency | 0.14 | Phone/address match the knowledge base |
| Service named | 0.16 | A verified service is named |
| Geography named | 0.14 | A target city/region is named |
| Entity schema | 0.14 | Page-level structured data describes the entity |
| Internal links | 0.14 | Links to related service/area pages |
| Accuracy | 0.12 | No locked-fact drift, no superlatives |

### Layer 4 — Structural Authority

| Factor | Weight | Signal |
|---|---|---|
| Original content | 0.22 | First-hand explanation, not boilerplate |
| Internal links | 0.20 | Supporting internal references |
| Trust signals | 0.18 | Licensing, insurance, real credentials (only if approved) |
| Author/owner attribution | 0.14 | Ownership/attribution present |
| Cited sources | 0.14 | References to standards or official sources |
| Local authority | 0.12 | Local specificity |

### Layer 5 — System Memory Readiness

| Factor | Weight | Signal |
|---|---|---|
| Brand accuracy | 0.24 | Canonical name used consistently |
| Citable specifics | 0.20 | Concrete, quotable detail (no vagueness) |
| Uniqueness | 0.18 | Distinct from other pages/sections |
| Service recognition | 0.14 | Services stated unambiguously |
| Geographic recognition | 0.14 | Geography stated unambiguously |
| Stability | 0.10 | Content is not churning between runs |

## Scoring mechanics

- Each factor produces a normalised value in `[0,1]`; the layer score is the
  weighted mean × 100.
- Layer scores are combined with `LAYER_WEIGHTS` (above) to give the section
  overall.
- Every factor records a human-readable `note` explaining the value it received.
  The UI shows these as **weaknesses** (factors below 0.6) and **improvements**.
- Scores are rounded to one decimal.

## What these scores are and are not

**They are internal diagnostic heuristics.** They are:

- **not** official scores from any platform;
- **not** measured probabilities of citation;
- **not** comparable across different sites without recalibration.

They exist to rank sections against each other and to show whether an edit
improved a section. Any use that treats them as ground truth is a misuse.

## Calibration against real results

`calibrate()` computes a Spearman-style rank correlation between page GEO score
and that page's measured mention rate. It refuses to report a number below four
paired observations and states plainly when agreement is weak. This is the
mechanism for checking the heuristic against reality — it is not a claim that
the heuristic is validated.

## Visibility measurement

Separate from scoring. Each test records:

`query`, `platform`, `test_type`, `status`, `rank`, `answer`, `cited_urls`,
`competitors`, `confidence`.

### Status values

| Status | Meaning |
|---|---|
| `recommended` | The business is named **and** the answer uses recommend/suggest/best/top/consider/call language |
| `mentioned` | The business is named without recommendation language |
| `cited` | Our domain appears in the result URLs (checked before naming) |
| `absent` | The platform answered and did not reference the business |
| `inconclusive` | The platform could not be reached — **UNMEASURED** |
| `incorrect` | The business was described inaccurately |

### Metrics

- **AI Mention Rate** = (mentioned + recommended + cited) ÷ conclusive
- **AI Recommendation Rate** = recommended ÷ conclusive
- **AI Citation Rate** = cited ÷ conclusive
- **Competitor Share of Voice** = a competitor's appearances ÷ all competitor appearances in the window
- **Geographic / Service visibility** = the same rates grouped by `city` / `service`

### Rules that must never be broken

1. `inconclusive` is excluded from the denominator and reported separately. An
   unreachable platform is never counted as zero visibility.
2. A view is always for a **single `test_type`**. `ai_platform`,
   `conventional_proxy` and `manual` are never averaged together. Tavily is a
   conventional-search proxy and is labelled as such wherever it appears.
3. Mention, recommendation and citation are **not** interchangeable and are
   never collapsed into one figure.

## Competitor intelligence

Competitors are derived only from **observed** result sets — the domains that
actually appeared in stored `visibility_results`. Nothing is invented. Observed
facts (appearances, share of voice, which queries) are stored separately from
hypotheses (why a competitor appears, what it does well), and the UI labels each.

## Experiments

Every experiment stores: id/code, hypothesis, target page, target section,
baseline, variables, methodology, start date, follow-up dates, result,
limitations, conclusion and evidence. A single website change is never recorded
as the cause of a visibility change. Findings rely on repeat testing, a
consistent query set, and a comparison period.

## Known limitations

- Only one visibility provider is reachable from this environment.
- GEO scores are heuristics, as stated above.
- No search-console or analytics data is available, so ranking and traffic
  effects are unmeasured.
- Small samples: a mention rate computed from fewer than ten conclusive tests is
  noisy and is shown with its sample size.
