# Competitor Directory — Straight Flush Plumbing

Rolling list built from **actual observations** (raw rows in
`data/competitor_observations.jsonl`). Only companies observed appearing for
real queries are listed. Correlation ≠ causation: a feature being present is
*evidence a competitor has it*, not proof it caused a recommendation.

**Baseline observation date:** 2026-10-09 · **Daily run:** 2026-10-09 (`reports/daily/2026-10-09.md`)
**Platform:** Brave Search (conventional proxy) — **not** an AI answer engine.
**Baseline queries:** plumber in Laguna Niguel · slab leak detection Laguna Niguel · emergency plumber Laguna Niguel · leak detection Orange County · best plumber in Laguna Niguel
**Daily queries (11 succeeded):** plumber in {Dana Point, San Clemente, Mission Viejo, Aliso Viejo} · leak detection {Laguna Niguel, Mission Viejo, Aliso Viejo} · slab leak repair Laguna Niguel · slab leak detection {Dana Point, San Clemente} · water heater repair Laguna Niguel
*(21 further queued queries were not executed — Brave rate-limited/blocked after 11; see daily report limitations.)*

**Frequency across all records to date (baseline + daily):** yelp.com 15 · scottenglishplumbing.net 14 · billmetzgerplumbing.com 10 · rotorooter.com 8 · calischoice.com 8 · efficientplumbing.com 7 · barkerandsonsplumbing.com 7 · evansleakdetection.com 7 · rooterhero.com 6.

## Tier A — appeared across multiple high-value queries

| Competitor | Domain | Appeared for | Observed feature | Hypothesis (unverified) |
|---|---|---|---|---|
| Scott English Plumbing | scottenglishplumbing.net | general, slab, emergency, leak-detection, water-heater (all cities) | Per-city `/service-area/plumber-in-{city}` pages | Strong city-page + service-page pairing ranks broadly |
| Bill Metzger Plumbing | billmetzgerplumbing.com | general, slab, leak-detection, water-heater, best | Service-area city pages across Tier-1 cities | Broad city-page coverage |
| Cal's Choice Plumbing | calischoice.com | leak-detection, slab, emergency (Laguna Niguel, Dana Point, San Clemente, Mission Viejo, Aliso Viejo) | Slab-leak/leak-detection location pages per city | Dedicated per-city leak pages rank for slab queries |
| Evans Leak Detection | evansleakdetection.com | slab, leak-detection (Laguna Niguel, Dana Point, San Clemente, Aliso Viejo) | Dedicated per-city slab/leak-detection pages | Leak-specialist focus outranks generalists on slab queries |
| Efficient Plumbing | efficientplumbing.com | general, slab, leak-detection | `/laguna-niguel-plumbers/` city landing + water-leak-detection page | Exact "Laguna Niguel Plumbers" title match |
| Barker and Sons | barkerandsonsplumbing.com | general, leak-detection, best | `/city/{city}-ca-plumber/` city pages | Long-established OC brand + city pages |
| Roto-Rooter | rotorooter.com | general, emergency, best, leak-detection, water-heater | Franchise per-city location pages | Brand authority + directory presence |

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

## Newly observed 2026-10-09 daily run (54 domains, not previously in directory)

First-time observations from the four Tier-1 *general* queries and the
city×service leak/slab/water-heater queries. Every row below is a **hypothesis**
that the entity competes in that city; the only *verified* fact is that its domain
appeared in a Brave organic result for the query on 2026-10-09. Raw rows:
`data/competitor_observations.jsonl`. Source: Brave organic results — **not** an
AI-answer-engine result.

- **General plumbing (Tier-1 cities):** mckplumb.com, jeffshafferplumbing.com,
  bestplumberindanapoint.com, joetheplumberoc.com, plumbing-serve.com,
  graham-plumbing.com, moderncultureplumbing.com, dansplumbingandsewer.com,
  protechplumbingrepair.com, dcplumbing.net (Dana Point); thepassionateplumber.com,
  aw-sons.com, lomonacocoast.com, benjaminfranklinplumbing.com, drakewillsplumbing.net,
  splashplumbing.com (San Clemente); missionviejoplumbingco.com, thedoneriteplumber.com,
  largeplumbing.com, boothneyandsonsplumbing.com, swellplumbing.com, mikediamondservices.com,
  moffettplumbing.com (Mission Viejo); sosplumbingrooter.com, alisoviejoplumbingprosca.com,
  ocplumbingandrestoration.com, plumberinalisoviejo247.com (Aliso Viejo).
- **Leak detection:** pristineplumbinginc.com, jetresto.com,
  laguna-niguel.los-angeles-plumbers.com (Laguna Niguel); xpressleakdetection.com,
  missionplumbingandrooter.com (Mission Viejo); proplumberalisoviejo.com,
  aliso-viejo-ca.caleak.com, alisoviejoplumbing.net, pacificstarplumbinginc.com (Aliso Viejo).
- **Slab leak:** pacificcoastcopperrepipe.com, integrityrepipe.com,
  aboveandbeyond-plumbing.com, plumbingsolutionspecialist.com (Laguna Niguel);
  allstarplumbingservice.com, leakdetectionplumbers.com, deltaplumbingoc.com (Dana Point);
  theleaklocators.com, clearwaterplumbingoc.com, repipesoc.com, atozleakdetection.com
  (San Clemente).
- **Water heaters:** usawaterheaters.us, aterheatermaninc.com, powerproplumbing.com,
  plumbinganaheimca.net, jnbplumbing.com (Laguna Niguel).

**Notable pattern (hypothesis, medium confidence):** two multi-city programmed
directories — `los-angeles-plumbers.com` and `anytimeplumbingaustin.com` /
`powellplumbing.net` — publish per-*city* subdomains (e.g.
`laguna-niguel.los-angeles-plumbers.com`, `laguna-niguel-ca.anytimeplumbingaustin.com`).
They surface for local intent despite being non-local. This is a directory/programmatic
pattern, not a single competitor; treat as a visibility channel to monitor, not a
company to out-content.

## Next investigation queue

For each Tier A competitor, when crawlers can reach us (post-Cloudflare fix):
fetch homepage, one city page, one service page; extract title/meta/H1 patterns,
service list, schema types, FAQ presence, review display, and CTA; record in
`data/competitor_observations.jsonl`. Do not scrape private data or impersonate.
