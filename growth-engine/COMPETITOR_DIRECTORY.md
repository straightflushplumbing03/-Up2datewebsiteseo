# Competitor Directory — Straight Flush Plumbing

Rolling list built from **actual observations** (raw rows in
`data/competitor_observations.jsonl`). Only companies observed appearing for
real queries are listed. Correlation ≠ causation: a feature being present is
*evidence a competitor has it*, not proof it caused a recommendation.

**Baseline observation date:** 2026-10-09 · **Platform:** Brave Search (conventional proxy)
**Queries:** plumber in Laguna Niguel · slab leak detection Laguna Niguel · emergency plumber Laguna Niguel · leak detection Orange County · best plumber in Laguna Niguel

## Tier A — appeared across multiple high-value queries

| Competitor | Domain | Appeared for | Observed feature | Hypothesis (unverified) |
|---|---|---|---|---|
| Scott English Plumbing | scottenglishplumbing.net | general, slab, emergency, leak-detection OC, best | Per-city `/service-area/plumber-in-{city}` pages | Strong city-page + service-page pairing ranks broadly |
| Efficient Plumbing | efficientplumbing.com | general, slab | `/laguna-niguel-plumbers/` city landing + water-leak-detection page | Exact "Laguna Niguel Plumbers" title match |
| Barker and Sons | barkerandsonsplumbing.com | general, leak-detection OC, best | `/city/{city}-ca-plumber/` city pages | Long-established OC brand + city pages |
| Roto-Rooter | rotorooter.com | general, emergency, best | Franchise per-city location pages | Brand authority + directory presence |

## Tier B — appeared for one or two queries

| Competitor | Domain | Appeared for | Observed feature |
|---|---|---|---|
| Bill Metzger Plumbing | billmetzgerplumbing.com | general, best | Service-area city pages |
| Parzival Plumbing | parzivalplumbing.com | general, emergency | Laguna Niguel service page |
| Olsons Superior Plumbing | olsonsuperior.com | general | Service-area pages |
| Evans Leak Detection | evansleakdetection.com | slab, leak-detection OC | Dedicated Laguna Niguel slab-leak page |
| American Leak Detection | americanleakdetection.com | leak-detection OC | National leak-detection specialist |
| Leak Star | leakstar.com | slab | Leak-detection specialist |
| All Clear Plumbing Pros | allclearplumbingpros.com | slab | Slab-leak detection page |
| Streamline Plumbing | streamlineplumbing.org | slab | `/city/laguna-niguel/slab-leak-repair` page |
| EZ Plumbing USA | ezplumbingusa.com | slab | Slab-leak detection page |
| Pro Star Plumbing | prostarplumbingca.com | slab | — |
| Rooter Hero | rooterhero.com | slab, emergency | Franchise |
| Mr. Rooter | mrrooter.com | emergency | Franchise |
| Cal's Choice | calischoice.com | slab, emergency | Slab-leak repair location pages |
| Murphy & Sons | murphyandsonsplumbing.com | slab | — |
| Socal Repipes | socalrepipes.com | slab | Repipe specialist |
| E&Y Plumbing | eyplumbing.com | slab | — |
| Pro Plumber Laguna Niguel | proplumberlagunaniguel.com | general, slab | Exact-match local domain |
| Laguna Niguel Plumber (Champions) | lagunaniguelplumberchampions.com | emergency | Exact-match local domain |
| Laguna Niguel Plumber | lagunaniguelplumber.org | slab, emergency | Exact-match local domain |
| Equity Plumbing OC | equityplumbingoc.com | emergency | — |
| Rapid Plumbing | rapidplumbing.net | emergency | — |
| Emergency Response Plumbers | emergencyresponseplumbers.com | emergency | — |
| Service First | callservicefirst.com | leak-detection OC | — |
| Water Intrusion Specialist | waterintrusionspecialist.com | leak-detection OC | — |
| John Christopher Construction | johnchristopherconstruction.com | leak-detection OC | — |
| County Leak Services | countyleakservices.com | leak-detection OC | — |
| Plumber Orange County CA | plumberorangecountyca.com | best | — |
| Laguna Niguel Plumbing Co | lagunaniguelplumbingco.com | best | — |
| John Stevenson Plumbing | johnstevensonplumbing.com | general | — |

## Directories / aggregators appearing (not competitors, but visibility channels)

yelp.com, angi.com, thumbtack.com, homeguide.com, homeadvisor.com, nextdoor.com,
buildzoom.com, mapquest.com, lagunaniguel.com (city portal), reddit.com, facebook.com.

> These matter for **citation/NAP consistency** and reviews, not for out-ranking.

## Gap analysis (evidence-backed)

1. **City × service page pairing.** Tier A competitors pair a *city* page with a
   *specific service* page (e.g. Scott English `/service-area/plumber-in-laguna-niguel`,
   Efficient `/laguna-niguel-plumbers/` + water-leak-detection). Straight Flush has
   strong city pages and strong service pages but few *city+service* combinations
   beyond 4 Laguna Niguel case studies.
2. **Slab-leak specialist pages for each Tier-1 city.** Evans, Streamline, Cal's
   Choice, EZ Plumbing all surface a dedicated slab-leak page per city. SF has one
   `/services/slab-leak-detection.html` and a `/south-oc-slab-leak-specialist.html`.
3. **Exact-match local domains rank** (proplumberlagunaniguel.com,
   lagunaniguelplumber.org). Cannot be replicated; noted as a competitive reality,
   not an action.
4. **Directory/aggregator dominance** for "best" queries (Yelp, Angi, Thumbtack).
   This is a **GBP + reviews** problem, not only a website problem.

**Not measurable today:** whether any competitor is *recommended by an AI answer
engine* — no AI-platform access in this environment (see `AI_VISIBILITY_METHODOLOGY.md`).

## Next investigation queue

For each Tier A competitor, when crawlers can reach us (post-Cloudflare fix):
fetch homepage, one city page, one service page; extract title/meta/H1 patterns,
service list, schema types, FAQ presence, review display, and CTA; record in
`data/competitor_observations.jsonl`. Do not scrape private data or impersonate.
