# Competitor Directory — Straight Flush Plumbing

Rolling list built from **actual observations** (raw rows in
`data/competitor_observations.jsonl`). Only companies observed appearing for
real queries are listed. Correlation ≠ causation: a feature being present is
*evidence a competitor has it*, not proof it caused a recommendation.

**Baseline observation date:** 2026-10-09 · **Latest daily run:** 2026-10-13 (`reports/daily/2026-10-13.md`)
**Platform:** Brave Search (2026-10-09/10/11/13) and DuckDuckGo Lite (2026-10-12) — conventional proxies, **not** AI answer engines.
**Baseline queries:** plumber in Laguna Niguel · slab leak detection Laguna Niguel · emergency plumber Laguna Niguel · leak detection Orange County · best plumber in Laguna Niguel
**2026-10-09 daily queries (11 succeeded):** plumber in {Dana Point, San Clemente, Mission Viejo, Aliso Viejo} · leak detection {Laguna Niguel, Mission Viejo, Aliso Viejo} · slab leak repair Laguna Niguel · slab leak detection {Dana Point, San Clemente} · water heater repair Laguna Niguel
**2026-10-10 daily queries (6 succeeded):** plumber in {Irvine, Laguna Hills, Laguna Beach, Ladera Ranch, Rancho Santa Margarita, Lake Forest}
**2026-10-12 daily queries (36 succeeded):** DuckDuckGo Lite sweep across 7 services × 12 cities.
**2026-10-13 daily queries (9 succeeded):** Brave returned HTTP 429 after 9; best plumber in Laguna Niguel · slab leak detection Dana Point · slab leak repair San Clemente · leak detection Mission Viejo · emergency plumber Aliso Viejo · PEX repipe Dana Point · water heater repair Mission Viejo · slab leak specialist Orange County · hidden water leak detection Orange County.
*(5+10 further queued queries across 2026-10-10 and 2026-10-13 were not executed — rate limits; see daily report limitations.)*

---

## 2026-10-22 update — 15-query Tavily conventional proxy (10 Tavily + 5 Gemini)

**Provider note:** Brave returned HTTP 429 and DuckDuckGo Lite returned 202 to this
egress IP; **Tavily** was used as the conventional-search proxy (per the provider
policy in `INTEGRATION_STATUS.md`), plus **Gemini** Search-grounded for the AI
surface. Both are recorded in `data/ai_visibility_history.jsonl`. Straight Flush was
**absent from all 14 conclusive rows** (1 `inconclusive`: `test_failure`).

### Appeared repeatedly (2026-10-22)
- **yelp.com** — present in **15 of 15** result sets. The single most consistent
  visibility channel for local plumbing intent.
- **efficientplumbing.com** — 8 slots across city, "best leak detection", and
  emergency intents; the most frequent single *company* domain today.
- **facebook.com** (6), **barkerandsonsplumbing.com** (4), **rotorooter.com** (3),
  **scottenglishplumbing.net** (3), **evansleakdetection.com** (3),
  **mapquest.com** (3), **leakstar.com** (3), **clearwaterplumbingoc.com** (3),
  **drainandsewerpro.com** (3), **instagram.com** (3).

### Newly observed 2026-10-22 — `drainandsewerpro.com` (Drain and Sewer Pro)
First appearance in this directory. **San Bernardino / Inland Empire** plumbing and
drain company — **not** a South-Orange-County local. Two distinct service-area
signals disagree on the same page:
- Visible "Service Areas" block lists **only** San Bernardino, Rialto, Redlands,
  Highland, Colton, Loma Linda, Upland.
- Its JSON-LD `areaServed` carries **141 `City` entries**, including every South-OC
  Tier-1 city (Laguna Niguel, Mission Viejo, Dana Point, San Clemente, Aliso Viejo,
  Laguna Hills, Laguna Beach, San Juan Capistrano, Lake Forest, Rancho Santa
  Margarita, Newport Beach) and most of Los Angeles County.

It surfaced on three separate South-OC queries today. **Observation (high
confidence):** the markup claims a footprint the visible page does not. **Hypothesis
(medium, not proven):** the broad `areaServed` list contributes to its South-OC
visibility. This is a **cautionary pattern for us, not a tactic to copy** — the repo's
standing rule is that service-area cities are `areaServed` only when genuinely
served, and inventing coverage is a Level-3 identity/commitment change.

### Pattern (hypothesis, medium)
Non-local and programmatic/aggregator pages continue to surface for South-OC local
intent (this run: `drainandsewerpro.com`; previously `los-angeles-plumbers.com`
per-city subdomains). Local *visible* content is not by itself what wins these
slots — corroborating the standing conclusion that the durable lever is
first-party proof (GBP/reviews), not more pages.

## 2026-10-13 update — 9-query Brave sweep (conventional proxy; rate-limited)

9 queries across 6 core services and 6 cities/county. Brave returned **HTTP 429**
after query 9, so the sweep stopped per the Brave-only rule; raw rows in
`data/competitor_observations.jsonl` (+88) and per-query sets in
`data/ai_visibility_history.jsonl` (+9). **Straight Flush was absent from all 9**
(0/9 recommended, 0/9 mentioned, 0/9 cited). Frequency = distinct queries (of 9) in
which the domain appeared in the top-10 organic results. Presence is evidence a
competitor has a feature; it is **not** proof the feature caused a ranking.

### Appeared for ≥3 of 9 queries

| Competitor | Domain | # queries | Observed feature | Claim status |
|---|---|---|---|---|
| Yelp (directory) | yelp.com | 7 | Aggregator/local-pack channel | visibility channel, not a competitor |
| Scott English Plumbing | scottenglishplumbing.net | 6 | Per-city `/service-area/plumber-in-{city}` pages | feature **verified** (repeat) |
| Bill Metzger Plumbing | billmetzgerplumbing.com | 5 | Service-area city pages; `WebSite`/`WebPage` schema | feature **verified** (repeat) |
| Roto-Rooter | rotorooter.com | 4 | National franchise per-city pages | feature **verified** (repeat) |
| Cal's Choice | calischoice.com | 4 | Slab-leak/leak-detection location pages | feature **verified** (repeat) |
| Barker and Sons | barkerandsonsplumbing.com | 4 | `/city/{city}-ca-plumber/` city pages | feature **verified** (repeat) |
| Evans Leak Detection | evansleakdetection.com | 4 | Dedicated slab-leak pages; rich `FAQPage`(12 Q/A)+`Plumber`+`GeoCoordinates` | feature **verified** (repeat); FAQ rich result now deprecated by Google |
| Efficient Plumbing | efficientplumbing.com | 3 | `/laguna-niguel-plumbers/` city landing | feature **verified** (repeat) |
| Leak Detection Plumbers | leakdetectionplumbers.com | 3 | Leak-detection pages (site 403 to our fetch) | presence **verified**; features **unverified** |
| Pristine Plumbing | pristineplumbinginc.com | 3 | Leak-detection pages | feature **verified** (repeat) |

### Newly observed 2026-10-13 (first time in this directory)

`leakstar.com` (per-city `/slab-leak-detection-service-{city}.html`, **verified fetched
200**, `Organization`+`BreadcrumbList` schema) · `waterheatersonly.com` ·
`usawaterheaters.us` · `repipe1.com` · `repipe-dana-point.com` · `repipe-specialist.com` ·
`pexrepipe-repiping.com` · `pipease.com` · `ezleakdetection.com` ·
`integrityrepipe.com` · `247leakmasters.com` · `pacificcoastcopperrepipe.com` ·
`allstarplumbingservice.com` · `deltaplumbingoc.com` · `aaronandsonsplumbing.com` ·
`veteranairusa.net` · `slableakfix.com` · `levelupplumbinginc.com` ·
`moffettplumbing.com` · `thepassionateplumber.com`.

### Pattern (hypothesis, medium)

Repipe intent ("PEX repipe Dana Point") returns **repipe-specialist** domains
(ocrepipes, repipe1, repipe-dana-point, pexrepipe-repiping, pipease) plus
`integrityrepipe.com`/`socalrepipes.com`; general plumbers are largely absent. Slab
intent returns **leak specialists** with a *dedicated per-city slab page*
(leakstar, evans). Both patterns support idea-2026-10-13-01/-02.

---

## 2026-10-13 update — 22-query sweep (Brave conventional proxy; Bing fallback unparseable)

22 queries across core services and Tier-1/2 cities, weighted to commercially
valuable, historically weak, and not-recently-tested queries. **14 returned
parseable organic results (Brave); 8 fell through to Bing after Brave HTTP 429
and returned unparseable markup → recorded `inconclusive` (not zero).**
**Straight Flush was absent from all 14 successful result sets**
(0 recommended / 0 mentioned / 0 cited). Frequency = number of the 14 successful
queries in which the domain appeared in the observed organic results (counted
from `data/ai_visibility_history.jsonl`, not estimated). All findings are
*observations of presence* — an observed feature is evidence a competitor has it,
**not** proof it caused any ranking or recommendation.

### Appeared for 4+ of 14 successful queries

| Competitor | Domain | # queries | Observed feature | Claim status |
|---|---|---|---|---|
| Yelp (aggregator) | yelp.com | 13 | Category/city listing pages dominate local "plumber/best plumber" queries | Aggregator — directory presence, not a claim about SF |
| Scott English Plumbing | scottenglishplumbing.net | 10 | City × service pages, review widgets | Conventional result; no SF claim |
| Roto-Rooter (franchise) | rotorooter.com | 9 | National brand + local landing pages | Franchise — not a single-operator peer |
| Bill Metzger Plumbing | billmetzgerplumbing.com | 9 | Service pages, local trust signals | Conventional result; no SF claim |
| Barker & Sons Plumbing | barkerandsonsplumbing.com | 7 | Service pages, emergency positioning | Conventional result; no SF claim |
| Cal's Choice Plumbing | calischoice.com | 7 | City × leak-detection pages | Conventional result; no SF claim |
| Efficient Plumbing | efficientplumbing.com | 7 | Service pages | Conventional result; no SF claim |
| Rooter Hero | rooterhero.com | 5 | National brand + local pages | Franchise — not a single-operator peer |
| Evans Leak Detection | evansleakdetection.com | 5 | **Specialist leak-detection positioning** — direct niche peer | Conventional result; no SF claim |
| Mr. Rooter (franchise) | mrrooter.com | 4 | National brand + local pages | Franchise — not a single-operator peer |
| Emergency Response Plumbers | emergencyresponseplumbers.com | 4 | Emergency positioning | Conventional result; no SF claim |
| Clearwater Plumbing OC | clearwaterplumbingoc.com | 4 | OC-local service pages | Conventional result; no SF claim |

### Notable recurring new domains (2026-10-13)

`twinplumbing.com`, `repipepro.net`, `ocplumber.com`, `repipesoc.com` appeared on
the pinhole/copper-pipe leak query; `socalrepipes.com`, `allstarplumbingservice.com`
on slab/leak queries; `splashplumbing.com` (2). Full raw rows in
`data/competitor_observations.jsonl` (ts `2026-10-13T17:05:00Z`).

**Interpretation (hypothesis, medium confidence):** the recurring pattern is
**city × service page coverage** plus a specialist-leak-detection positioning
(Evans). SF's own `/leak-detection/` cluster is the closest match; the gap is
city-level coverage for Aliso Viejo / San Clemente / Mission Viejo
(idea-2026-10-13-01).

---

## 2026-10-12 update — 36-query sweep (DuckDuckGo Lite conventional proxy)

36 queries across 7 core services and 12 cities/counties (Tier 1–3), weighted to
commercially valuable, historically weak, and not-recently-tested queries. Raw
rows in `data/competitor_observations.jsonl`; per-query result sets in
`data/ai_visibility_history.jsonl`. **Straight Flush was absent from all 36**
(0 recommended / 0 mentioned / 0 cited). Frequency = number of the 36 queries in
which the domain appeared in the top-10 organic results (counted from
`ai_visibility_history.jsonl`, not estimated). All findings are
*observations of presence* — an observed feature is evidence a competitor has it,
**not** proof it caused any ranking or recommendation.

### Tier A — appeared for 5+ of 36 queries

| Competitor | Domain | # queries | Observed feature | Claim status |
|---|---|---|---|---|
| ProPlumber Laguna Niguel | proplumberlagunaniguel.com | 8 | Exact-match city domain; dedicated leak-detection / slab-leak / water-heater pages | feature **verified**; cause = hypothesis |
| Evans Leak Detection | evansleakdetection.com | 8 | Dedicated slab-leak detection pages | feature **verified** (repeat) |
| Roto-Rooter | rotorooter.com | 7 | National franchise, per-city location pages | feature **verified** |
| Scott English Plumbing | scottenglishplumbing.net | 6 | Per-city `/service-area/plumber-in-{city}` pages | feature **verified** (repeat) |
| American Leak Detection | americanleakdetection.com | 6 | National leak-detection franchise (ALDI); county + per-city pages | feature **verified** |
| Olson Superior | olsonsuperior.com | 5 | Per-city emergency-plumber pages | feature **verified** (repeat) |
| Coast Plumbing | coastplumbing.com | 5 | Per-city `/areas-we-serve/{city}/` pages + FAQPage schema | feature **verified**; **new repeat competitor** |
| Laguna Niguel CA Plumbing Pros | lagunaniguelcaplumbingpros.com | 5 | Exact-match city domain; slab-leak + leak-detection pages | feature **verified**; **new** |
| Primewest Plumbing | primewestplumbing.com | 5 | Per-city service URLs (`/plumbing/{city}/slab-leak-repair`, `…/leak-detection`) | feature **verified**; **new repeat competitor** |
| Pristine Plumbing | pristineplumbinginc.com | 5 | Leak-detection pages | feature **verified** (repeat) |
| Mr. Rooter | mrrooter.com | 5 | National franchise, per-city pages | feature **verified** |
| Barker and Sons | barkerandsonsplumbing.com | 5 | `/city/{city}-ca-plumber/` city pages; long-established OC brand | feature **verified** (repeat) |

### Tier B — appeared for 3–4 of 36 queries

leakstar.com (4), leak-detection-pro.com (4, verified `/location/{city}-ca.html` + FAQPage),
calischoice.com (4), plumbingsolutionspecialist.com (4), dialonesonshine.com (4),
repipesoc.com (3), ocrepipes.com (3, repipe specialist; site 403 to our fetch),
drains4less.com (3), aslplumbing.com (3), splashplumbing.com (3),
hummelplumbing.com (3), doitrightplumbers.com (3), delatorresplumbing.com (3),
integrityrepipeinc.com (3), ocproplumbers.com (3), americanleakcompany.com (3).

### New repeat competitors (≥3, not in the 2026-10-11 directory)

primewestplumbing.com (5) · coastplumbing.com (5) · lagunaniguelcaplumbingpros.com (5) ·
leak-detection-pro.com (4) · dialonesonshine.com (4) · drains4less.com (3) ·
aslplumbing.com (3) · splashplumbing.com (3) · hummelplumbing.com (3) ·
doitrightplumbers.com (3) · delatorresplumbing.com (3) · integrityrepipeinc.com (3) ·
ocproplumbers.com (3) · americanleakcompany.com (3).

### Directory/aggregator dominance (visibility channels, not competitors)

yelp.com 32/36 queries · angi.com 12 · yellowpages.com 11 · thumbtack.com 10 ·
todayshomeowner.com 3 · superpages.com 3 · expertise.com 3 · homeguide.com 2.
Yelp again appears in nearly every local query — the "best plumber" queries
remain an aggregator/GBP-reviews problem, not a website-content problem.

---


## 2026-10-11 update — 28-query sweep (Brave conventional proxy)

28 queries across all 7 core services and 11 cities (Tier 1–3). Raw rows in
`data/competitor_observations.jsonl`; per-query result sets in
`data/ai_visibility_history.jsonl`. **Straight Flush was absent from all 28**
(0 recommended / 0 mentioned / 0 cited). Frequency = number of the 28 queries in
which the domain appeared in the top-10 organic results. All findings are
*observations of presence* — an observed feature is evidence a competitor has it,
**not** proof it caused any ranking or recommendation.

### Tier A — appeared for 10+ of 28 queries

| Competitor | Domain | # queries | Observed feature | Claim status |
|---|---|---|---|---|
| Scott English Plumbing | scottenglishplumbing.net | 22 | Per-city `/service-area/plumber-in-{city}` pages | feature **verified** (URLs seen); rank cause = hypothesis |
| Barker and Sons | barkerandsonsplumbing.com | 19 | `/city/{city}-ca-plumber/` city pages; long-established OC brand | feature **verified**; cause = hypothesis |
| Roto-Rooter | rotorooter.com | 15 | National franchise, per-city location pages | feature **verified** |
| Bill Metzger Plumbing | billmetzgerplumbing.com | 13 | Service-area city pages | feature **verified** |
| Efficient Plumbing | efficientplumbing.com | 12 | `/laguna-niguel-plumbers/` city landing + water-leak-detection page | feature **verified** |
| Rooter Hero | rooterhero.com | 11 | Franchise, per-city service pages | feature **verified** |
| All Clear Plumbing Pros | allclearplumbingpros.com | 11 | Slab-leak detection page | feature **verified** |
| Parzival Plumbing | parzivalplumbing.com | 10 | Laguna Niguel service page | feature **verified** |
| Cal's Choice | calischoice.com | 10 | Slab-leak repair location pages | feature **verified** |
| Evans Leak Detection | evansleakdetection.com | 10 | Dedicated slab-leak detection pages per city | feature **verified** |

### Tier B — appeared for 4–9 of 28 queries

pristineplumbinginc.com (9), eyplumbing.com (8), emergencyresponseplumbers.com
(8), olsonsuperior.com (7), lagunaniguelplumber.org (7, exact-match domain),
mckplumb.com (6, `/areas-we-serve/{city}` pages), moffettplumbing.com (5),
proplumberlagunaniguel.com (5, exact-match domain), benjaminfranklinplumbing.com
(5), sosplumbingrooter.com (5), orangecoastplumbing.net (4),
johnstevensonplumbing.com (4), ezplumbingusa.com (4), prostarplumbingca.com (4),
murphyandsonsplumbing.com (4), socalrepipes.com (4), streamlineplumbing.org (4),
leakstar.com (4), americanleakdetection.com (4), clearwaterplumbingoc.com (4),
boothneyandsonsplumbing.com (4), biardandcrockett.com (4).

### New repeat competitors (≥3, not in the 2026-10-09 directory)

integrityrepipe.com (3), dcplumbing.net (3), mikediamondservices.com (3),
thedoneriteplumber.com (3), missionviejoplumbingco.com (3), largeplumbing.com (3).

### Directory/aggregator dominance (visibility channels, not competitors)

yelp.com 27/28 · angi.com 12 · facebook.com 8 · nextdoor.com 6 · thumbtack.com 5 ·
mapquest.com 4 · youtube.com 4 · reddit.com 4 · instagram.com 4 · lagunaniguel.com 2 ·
homeadvisor.com 2 · homeguide.com 2. Yelp appears in nearly every local query —
the "best plumber" queries are dominated by aggregators, a GBP/reviews problem
rather than a website problem.

---

## Baseline Tier A — 2026-10-09 (5-query sample, superseded by the table above)

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
| Reliable Rooter | reliablerooter.com | general (Irvine) | Per-city `/service-areas/{city}-plumber/` pages |
| Biard & Crockett | biardandcrockett.com | general (Laguna Hills) | Established OC brand |
| Andrus Plumbing | andrusplumbing.com | general (Laguna Beach) | First observation 2026-10-10 |

## Newly observed 2026-10-10 daily run (13 domains not previously in directory)

First-time observations from six Tier-2 *general* queries (Irvine, Laguna Hills,
Laguna Beach, Ladera Ranch, Rancho Santa Margarita, Lake Forest). Every row is a
**hypothesis** that the entity competes in that city; the only *verified* fact is
that its domain appeared in a Brave organic result for the query on 2026-10-10.
Source: Brave organic results — **not** an AI-answer-engine result.

- **Irvine:** reliablerooter.com, patriotrooter.com, theirvineplumbers.com.
- **Laguna Hills:** biardandcrockett.com, equityplumbingoc.com.
- **Laguna Beach:** andrusplumbing.com, bensonplumbinglagunabeach.com.
- **Ladera Ranch:** hhsplumbing.com.
- **Rancho Santa Margarita:** santamargaritaplumbing.com, partnersplumbingco.com,
  integrityoc.com, ranchoheatingandair.com.
- **Lake Forest:** fourseasonsheatingcooling.com.

**Repeat Tiers refreshed 2026-10-10:** barkerandsonsplumbing.com (5 of 6 queries),
scottenglishplumbing.net (5), rotorooter.com (6), billmetzgerplumbing.com (3),
johnstevensonplumbing.com (3), moffettplumbing.com (2), olsonsuperior.com (2).

**Competitive reality (verified, not an action):** SF did not appear in the top-10
organic domains of any of the six executed queries on 2026-10-10. Note the confounder:
the live domain returns HTTP 403 `cf-mitigated: challenge` to all crawlers
(ISSUE-001), so conventional-search absence is expected while the block persists.

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

## 2026-10-23 update — 8-query Tavily sweep (Brave/DDG/Bing blocked)

Provider note: Brave **429**, DuckDuckGo HTML **202**, DuckDuckGo Lite **200 with zero
parseable anchors**, Bing **200 with redirect-wrapped anchors**. Tavily Search API was
the only provider to return ranked URLs, so this update is Tavily-only (lower breadth
than the 2026-10-11 28-query Brave sweep; treat as directional).

**Repeat competitors (distinct queries today):**
- `efficientplumbing.com` (4) · `evansleakdetection.com` (3) ·
  `scottenglishplumbing.net` (3) · `barkerandsonsplumbing.com` (3) ·
  `clearwaterplumbingoc.com` (2) · `rotorooter.com` (2) · `ocrepipes.com` (2)

**New this run (not previously recorded):**
- `repipe-newport-beach.com` — **exact-match city+service domain** for whole-house
  repipe in Newport Beach. `primewestplumbing.com`, `repipetopteam.com` also present.
- `waterheatermaninc.com`, `waterheaterinstallrepair.com`, `usawaterheaters.us`,
  `lagunaniguelplumber.org` — **single-service water-heater** domains holding
  "water heater repair Laguna Niguel" (SF absent).
- `pristineplumbinginc.com`, `partnersplumbingco.com`, `tritonair.com` (San Clemente);
  `boothneyandsonsplumbing.com`, `drainandsewerpro.com`, `justrightservices.net`
  (Laguna Hills drains); `hanahouhome.com`, `biardandcrockett.com`,
  `americanleakdetection.com` (acoustic leak detection, OC); `leakstar.com`,
  `streamlineplumbing.org` (slab leak, Laguna Niguel).

**Gap confirmed (evidence):** the water-heater and repipe intents are served by
**dedicated single-service domains**, not general plumbers, and SF holds neither a
city × water-heater nor a city × repipe page. That these pages *cause* the ranking is
a **hypothesis**; the pages' existence is a **verified fact**.

**Directory/franchise channels (not competitors):** yelp.com, rotorooter.com,
benjaminfranklinplumbing.com on emergency queries — reproduces the standing finding.

---

## 2026-10-24 update — 10-query Tavily sweep (Brave/DDG/Bing not used this run)

Provider note: the pre-stage ran **Tavily Search API only** (the bounded default from
`scripts/daily_measure.py`). This is **conventional search**, not an AI-platform
result. Tavily has narrower breadth than the 2026-10-11 28-query Brave sweep, so
treat the *ranking order* as directional and the *presence of a domain* as the
durable signal.

**Repeat competitors (appeared on ≥2 distinct queries today):**
- `efficientplumbing.com` (7 appearances, 6 distinct queries — the single most
  pervasive local competitor in this sweep; present for plumber, leak detection,
  water leak detection, copper leak, PEX repipe, water heater)
- `barkerandsonsplumbing.com` (4) · `drainandsewerpro.com` (3) · `rotorooter.com` (3)
- `evansleakdetection.com` (2) · `leakstar.com` (2) · `streamlineplumbing.org` (2) ·
  `clearwaterplumbingoc.com` (2) · `scottenglishplumbing.net` (2) ·
  `socalrepipes.com` (2) · `billmetzgerplumbing.com` (2) · `parzivalplumbing.com` (2)

**New this run (not previously recorded as a competitor):**
- `sjplumbingoc.com`, `a-1totalserviceplumbing.com`, `avisplumbingandair.com` —
  general plumbers holding the "emergency plumber in South Orange County" slot
  alongside `pristineplumbinginc.com` and `olsonsuperior.com`.
- `speedywaterheatersoc.com` — another **single-service water-heater** domain on
  "water heater repair in Aliso Viejo", reinforcing the 2026-10-23 finding that the
  water-heater intent is served by dedicated single-service domains.
- `danapointplumbingandairpros.com` — **city-match domain** on "copper pipe leak
  repair near Dana Point".
- `pipebros.com` — repipe specialist on "PEX repiping company in Laguna Hills"
  (alongside the already-recorded `integrityrepipe.com`, `allamericanrepipe.com`,
  `socalrepipes.com`, `repipesoc.com`).

**Standing gap, re-confirmed with fresh evidence:** the **repipe** intent is held by
repipe-specialist domains and the **water-heater** intent by water-heater-only
domains, while Straight Flush holds neither a city × repipe nor a city × water-heater
page. Presence of those pages is a **verified fact**; that they *cause* the ranking is
a **hypothesis** (`idea-2026-10-24-04`, `idea-2026-10-24-05`).

**Aggregator/dictionary noise (not competitors):** `yelp.com` (11), `facebook.com`
(5), `instagram.com` (3), `mapquest.com` (3). Notably, the conversational query
"who can locate a hidden water leak in Laguna Niguel?" returned **dictionary
definitions** (`wiktionary`, `merriam-webster`, `dictionary.com`, `thefreedictionary`,
`collinsdictionary`) — i.e. the phrasing read as a definition lookup rather than a
local-service query. Recorded as an **intent-mismatch observation**, not a ranking
loss: it argues for query phrasing that carries explicit local-service intent when we
test, and for on-page answers phrased the way homeowners actually ask.
## 2026-10-26 update — 10-query Tavily sweep + 3 competitor pages fetched

Provider note: Tavily Search API only (Brave still 429 from this egress IP).
Gemini Search AI-surface sweep **BLOCKED** (key returns HTTP 401
`ACCESS_TOKEN_TYPE_UNSUPPORTED`, i.e. the key itself is invalid — a new failure
mode; previously 429 quota). Tavily rows are `absent` for SF on all 10 queries.

**Repeat competitors (distinct result appearances today, all 10 Tavily queries):**
`efficientplumbing.com` (7) · `clearwaterplumbingoc.com` (5) · `rotorooter.com` (3) ·
`barkerandsonsplumbing.com` (3) · `drainandsewerpro.com` (3) · `leakstar.com` (2) ·
`streamlineplumbing.org` (2) · `lagunaniguelcaplumbingpros.com` (2) ·
`proplumberlagunaniguel.com` (2) · `scottenglishplumbing.net` (2) ·
`aslplumbing.com` (2) · `emergencyresponseplumbers.com` (2).
Directory/aggregator channels: `yelp.com` (16), `facebook.com` (10), `mapquest.com` (2).

**New this run (not previously recorded):** `repipe-laguna-hills.com` — a
single-purpose **city+service repipe page** for Laguna Hills (see below).
`repipelagunahills.com`-style exact-match domains now confirmed for *two* Tier-2
cities (Laguna Hills + the 2026-10-23 Newport Beach find).

**Pages fetched and profiled (verified facts, not hypotheses):**
- `repipe-laguna-hills.com` (HTTP 200, 115,845 b) — H1 "Whole-house repipe in
  Laguna Hills"; 262 `repipe` mentions; names **Nellie Gail Ranch (25)**,
  **Moulton Ranch (17)**, **El Toro Water District (14)**, PEX-A **Uponor/Wirsbo
  ASTM F1960** (5/4); dedicated HOA/condo/townhome repipe section (15). JSON-LD
  types include FAQPage + HowTo + BreadcrumbList + Plumber + City + Service.
  No `aggregateRating` (no displayed reviews).
- `lagunaniguelcaplumbingpros.com` (HTTP 200, 56,651 b) — FAQPage + Answer +
  Question + Organization; a **"Laguna Niguel Communities"** section and a
  **"Laguna Niguel ZIP codes we serve"** section; slab-leak-heavy body (22 mentions).
- `proplumberlagunaniguel.com` (HTTP 200, 75,934 b) — Plumber + Service + Offer +
  OfferCatalog + OpeningHoursSpecification schema; 24/7 emergency messaging;
  "Plumbing Services FAQ" block.

**Gap confirmed (evidence):** our `cities/laguna-hills.html` is leak-detection
framed and names **no** Laguna Hills neighborhood, ZIP, or water district, and
there is **no** city × repipe page for Laguna Hills (only
`services/pex-repiping-laguna-niguel.html`). Competitors rank with exactly that
page type. That the page *causes* the ranking is a **hypothesis**; the page's
existence and its specific local entities are **verified facts**.
## 2026-11-01 update — 12-query Tavily sweep (Brave unavailable)

Provider note: Tavily Search API again the only reliable ranked-result provider (Brave
**429** to this egress IP). Lower breadth than a Brave sweep; treat as directional. 12
queries across Laguna Niguel, Dana Point, San Clemente, Mission Viejo, Irvine, Newport
Beach, and Orange County-wide. **SF `absent` on all 12** (conventional search; not an
AI-platform result).

**Repeat competitors (distinct queries today):** `efficientplumbing.com` (4 queries) ·
`barkerandsonsplumbing.com` (4) · `rotorooter.com` (3) · `billmetzgerplumbing.com` (3) ·
`evansleakdetection.com` (3) · `clearwaterplumbingoc.com` (2) · `americanleakdetection.com`
(2) · `scottenglishplumbing.net` (2) · `mckplumb.com` (2) · `sjplumbingoc.com` (2).
(Yelp appeared on 11 of 12 queries — a directory channel, not a competitor.)

**New this run (not previously recorded):** `integrityrepipe.com`, `socalrepipes.com`,
`pexrepipe-repiping.com` (PEX repipe, Laguna Niguel); `thewaterheatercompany.com`,
`waterheatersonly.com`, `waterheatermaninc.com` (water heater, Irvine);
`splashplumbing.com`, `jettersndrains.com`, `appliedrooter.com` (drains, Mission Viejo);
`primewestplumbing.com` (repipe Newport Beach + slab Laguna Niguel); `hummelplumbing.com`,
`slableakfix.com`, `parzivalplumbing.com`, `hanahouhome.com` (leak detection, OC);
`lagunaniguelplumber.org`, `lagunaniguelplumbingco.com`, `avisplumbingandair.com`,
`dialonesonshine.com` (Laguna Niguel city pages).

**Dominant observed pattern (verified feature; causation is a hypothesis):** every
commercial query tested is held by a **service × city** landing page — and for water
heaters and repipes specifically, by **single-service specialist domains** with a page
per city, not by general plumbers. SF holds a general `/services/*` page for each of
these services but no city-framed variant. Reproduced across four service families in one
sweep, so this is the strongest content-gap signal on file.

**Directory/franchise channels (not competitors):** yelp.com (11/12), facebook.com (5),
angi.com, bbb.org, thumbtack.com, reddit.com — reproduces the standing finding.

---

## Next investigation queue

For each Tier A competitor, when crawlers can reach us (post-Cloudflare fix):
fetch homepage, one city page, one service page; extract title/meta/H1 patterns,
service list, schema types, FAQ presence, review display, and CTA; record in
`data/competitor_observations.jsonl`. Do not scrape private data or impersonate.

---

## 2026-10-19 update — 18-query sweep (Tavily conventional proxy)

Provider note: Brave returned HTTP 429 to this egress IP and DuckDuckGo HTML was
unavailable, so the recorded sweep used the **Tavily Search API** as the
conventional-search proxy (`test_type: conventional_proxy`). This is **conventional
search, not an AI answer engine** — it must not be reported as a ChatGPT/Perplexity
result. 18 queries × 10 results = 180 observed result slots. Rows:
`data/ai_visibility_history.jsonl` (2026-10-19).

### Tier A — appeared for 6+ of 18 queries

| Domain | Queries | Notes |
|---|---|---|
| `efficientplumbing.com` | 9 | Laguna Niguel; fetched today (HTTP 200, 101,381 bytes). Title "Efficient Plumbing \| Best Laguna Niguel Plumber \| Water Leak". Schema `@types`: `LocalBusiness`, `OpeningHoursSpecification`, `Person`, `PostalAddress`, `AggregateRating`, `Rating`, `Review`. H1 "Efficient Plumbing & Water Leak Detection". |
| `clearwaterplumbingoc.com` | 7 | Recurring; appears twice in one result set (pinhole leak, San Clemente). |
| `scottenglishplumbing.net` | 6 | `/service-area/plumber-in-{city}` pattern. |
| `rotorooter.com` | 6 | Franchise; strongest on emergency/water-heater intents. |

### Tier B — appeared for 3–5 of 18 queries

`barkerandsonsplumbing.com` (5) · `mckplumb.com` (4) · `billmetzgerplumbing.com` (4)
· `evansleakdetection.com` (4) · `leakstar.com` (4) · `socalrepipes.com` (3) ·
`streamlineplumbing.org` (3) · `primewestplumbing.com` (3) · `pristineplumbinginc.com` (3)
· `drainandsewerpro.com` (3) · `integrityrepipe.com` (3).

### Directory / aggregator dominance (visibility channels, not competitors)

`yelp.com` appeared in **18/18** queries and `facebook.com` in **11/18** — every
plumbing intent tested surfaced at least one aggregator. `mapquest.com` (2),
`bbb.org` (1). **Hypothesis (medium confidence):** aggregator profile completeness,
not on-page content alone, gates first-page presence for these intents. Causation is
not established; the feature (aggregator presence) is verified.

### Newly observed this run (not in prior directory entries)

`lagunaniguelcaplumbingpros.com`, `proplumberlagunaniguel.com`,
`lagunaniguelplumber.org`, `pexrepipe-repiping.com`, `pipebros.com`,
`aterheatermaninc.com`, `aterheaterinstallrepair.com`, `aterheaterinstallations.com`,
`speedywaterheatersoc.com`, `parzivalplumbing.com`, `largeplumbing.com`,
`coastalinspection.us`, `tritonair.com`, `thepassionateplumber.com`,
`ezplumbingusa.com`, `americanleakdetection.com`, `drakewillsplumbing.net`,
`leakdetectionplumbers.com`. Recorded with dated source rows in
`data/competitor_observations.jsonl`; causation for any ranking is a hypothesis.

### Service-specific patterns (verified features; causation = hypothesis)

- **Water heaters:** specialist domains (`aterheatermaninc.com`,
  `aterheaterinstallrepair.com`, `speedywaterheatersoc.com`) occupy the top slots for
  both water-heater queries; **no SF presence** observed.
- **Leak detection:** specialist domains (`evansleakdetection.com`, `leakstar.com`,
  `americanleakdetection.com`) recur; SF absent on all leak-detection queries.
- **Repipe/PEX:** repipe-specialist domains (`socalrepipes.com`,
  `integrityrepipe.com`, `pexrepipe-repiping.com`) recur.

**SF visibility 2026-10-19:** `absent` on 18/18 conventional queries and 5/5
AI-platform rows. This is a consistent negative result, not a ranking measurement —
see the daily report's limitations section.

**Next investigation queue (updated):** fetch `efficientplumbing.com` city and
service pages (9/18 presence — highest observed), plus `clearwaterplumbingoc.com`
(7/18); extract title/meta/H1, service list, schema, CTA, and whether a dedicated
water-heater or leak-detection city page exists.
## 2026-10-27 update — 15-query Tavily sweep (conventional proxy)

Provider: **Tavily Search API** (`api.tavily.com/search`). Brave returned a CAPTCHA
wall and DuckDuckGo Lite returned HTTP 202 to this egress IP, so neither was usable
today; Tavily is recorded as `test_type: conventional_proxy` — **conventional search,
NOT an AI answer engine**. 15 queries across 6 services × Tier-1 cities. Raw rows in
`data/ai_visibility_history.jsonl` (+15). **Straight Flush was absent from all 15**
(0/15 recommended, 0/15 mentioned, 0/15 cited). Frequency = distinct queries (of 15)
in which the domain appeared in the top-10 results. Presence is evidence a competitor
*has* a feature; it is **not** proof the feature caused a ranking.

### Appeared for ≥3 of 15 queries

| yelp.com | 13 | directory — not a direct competitor |
| efficientplumbing.com | 9 | highest non-directory frequency |
| facebook.com | 8 | directory/social |
| rotorooter.com | 7 | national franchise |
| barkerandsonsplumbing.com | 5 | local |
| clearwaterplumbingoc.com | 5 | local |
| streamlineplumbing.org | 4 | local |
| mckplumb.com | 3 | local |
| billmetzgerplumbing.com | 3 | local |
| leakstar.com | 3 | leak-detection specialist |
| evansleakdetection.com | 3 | leak-detection specialist |
| angi.com | 3 | directory |
| drainandsewerpro.com | 3 | local |
| scottenglishplumbing.net | 3 | local |

### Verified feature observations (fetched 2026-10-27)

- **evansleakdetection.com** — FAQPage + LocalBusiness JSON-LD, geo coordinates,
  embedded map, on-page reviews, `tel:` link. Dedicated leak-detection specialist
  positioning. Confidence: medium.
- **scottenglishplumbing.net** — LocalBusiness JSON-LD, BreadcrumbList, geo
  coordinates, `aggregateRating`, `tel:` link. Confidence: medium.
- **creativerepipe.com** — LocalBusiness/Plumber JSON-LD, BreadcrumbList, geo
  coordinates, embedded map, `tel:` link; single-service (repipe) specialist site.
  Confidence: medium.
- **zoomdrain.com/locations/laguna-niguel-ca/** — per-city location landing page;
  direct fetch returned HTTP 403 (Cloudflare bot protection), so on-page features
  were **not** verified. Confidence: low.
- **efficientplumbing.com** — homepage 301-redirects on direct fetch; features not
  verified. Confidence: low.

**Gap pattern (evidence):** the recurring specialist competitors (Evans, Leak Star)
run *dedicated single-service sites with FAQ schema*, while the local generalists
run *LocalBusiness + Breadcrumb + geo* schema. Straight Flush already ships
Breadcrumb/FAQ/Service JSON-LD on its pages (per `AGENTS.md`), so the observed
schema gap is not a schema absence — it is a **query-presence** gap: SF did not
appear for any of the 15 conventional queries.
## 2026-10-28 update — 10-query Tavily sweep (Brave 429, DDG Lite unparseable)

Provider note: Brave **429** on every attempt, DuckDuckGo **Lite 200 with zero
parseable anchors** — per the provider policy the sweep stopped rather than
retrying. **Tavily Search API** returned 10/10 ranked result sets, so this update is
Tavily-only (directional, lower breadth than a Brave sweep).

**Repeat competitors (distinct queries today):**
- `efficientplumbing.com` (7) · `evansleakdetection.com` (3) ·
  `barkerandsonsplumbing.com` (5) · `clearwaterplumbingoc.com` (4) ·
  `rotorooter.com` (5) · `drainandsewerpro.com` (3) · `scottenglishplumbing.net` (2) ·
  `parzivalplumbing.com` (2) · `billmetzgerplumbing.com` (2) · `leakstar.com` (2) ·
  `streamlineplumbing.org` (2)

**New this run (not previously recorded):**
- `repipe-laguna-hills.com` — **exact-match city+service domain** for repiping in
  Laguna Hills; matches the 2026-10-23 `repipe-newport-beach.com` pattern.
- `aterheatermaninc.com`, `aterheaterinstallations.com` — single-service water-heater
  domains holding "water heater repair in Aliso Viejo". (Observed verbatim in the
  Tavily result set; both appear to be missing a leading `w`, so treat the exact
  hostnames as **medium** confidence and re-verify before citing.)
- `ezplumbingusa.com`, `saddlebackplumbing.com` — slab-leak intent, Mission Viejo.
- `mckplumb.com`, `lagunaniguelplumber.org`, `efficientplumbing.com` — Laguna Niguel
  general plumber intent (SF absent).

**Gap confirmed (evidence):** the repipe and water-heater intents are again served by
**dedicated single-service domains** (not general plumbers), and SF holds neither a
city × repipe nor a city × water-heater page. The pages' *existence* is a verified
fact; that they *cause* the ranking is a **hypothesis**.

**Directory/franchise channels (not competitors):** yelp.com (13 hits), facebook.com
(4), mapquest.com (3), bbb.org, angi.com — reproduces the standing finding that
directories take broad local queries.

---

## 2026-11-02 update — 16-query Tavily conventional proxy (AI surface blocked)

**Provider note:** the deterministic pre-stage ran **13** Tavily conventional-proxy
queries; this run added **6** more (19 total executed, **16 conclusive**, 3 Gemini rows
were `test_failure`). Brave/DDG were not used today — Tavily is the working proxy per
`INTEGRATION_STATUS.md`. Straight Flush was **absent from all 16 conclusive rows**.

### Appeared repeatedly (2026-11-02)
- `efficientplumbing.com` — 5 slots across general-plumber, leak-detection, and repipe
  intents; the most frequent single *company* domain today.
- `barkerandsonsplumbing.com` — 4 slots (Laguna Niguel, South OC, sewer-backup, slab FAQ).
- `pristineplumbinginc.com` — 3 slots (slab-leak San Clemente, water-heater Aliso Viejo,
  drain cleaning Mission Viejo).
- `evansleakdetection.com` — 3 slots (Mission Viejo slab, Laguna Niguel water-leak,
  San Clemente slab); the recurring leak-specialist domain.
- `rotorooter.com` (3), `aterheatermaninc.com` (3), `clearwaterplumbingoc.com` (2),
  `socalrepipes.com` (2), `leakstar.com` (1), `thewaterheatercompany.com` (2),
  `aterheatersonly.com` (1), `scottenglishplumbing.net` (1).

### Newly observed 2026-11-02
- **Exact-match city domains:** `proplumberlagunaniguel.com`,
  `lagunaniguelcaplumbingpros.com` (both on the *hidden-water-leak* question for Laguna
  Niguel), `bestplumberindanapoint.com` (emergency Dana Point),
  `repipe-newport-beach.com` (whole-house repipe Newport Beach),
  `plumbingdanapointca.com` (copper-leak Dana Point). Pattern: **city-name domains**
  are a recurring local tactic.
- **Single-service specialist domains** holding whole intents: `allamericanrepipe.com`,
  `repipetopteam.com`, `primewestplumbing.com`, `creativerepipe.com`, `ocrepipes.com`
  (repipe); `aterheatermaninc.com`, `aterheatersonly.com`, `thewaterheatercompany.com`
  (water heaters); `jettersndrains.com`, `zoomdrain.com`, `appliedrooter.com`
  (drains); `leakstar.com`, `evansleakdetection.com` (leak detection).
- **Directories/aggregators** (not competitors): `yelp.com`, `facebook.com`, `bbb.org`,
  `thumbtack.com`, `mapquest.com`, `youtube.com`, `reddit.com` — the standing finding
  that directories take broad local queries reproduces.

### Gap confirmed (evidence)
The **repipe, water-heater, drain, and slab-leak** intents are each served by
**specialist domains with a city page**, while SF holds only `/services/*.html` pages and
is absent from every one of these queries. The pages' *existence* is verified; that they
*cause* the ranking is a **hypothesis**. A fetched competitor FAQ
(`barkerandsonsplumbing.com/slab-leak-faqs`) shows the answer-first pattern the engine has
logged repeatedly.

---

## 2026-11-03 update — 15-query Tavily conventional proxy

**Provider note:** Tavily Search API used as the conventional-search proxy (Brave 429 /
DuckDuckGo 202 to this egress IP; see provider policy). Gemini AI-surface sweep BLOCKED
(HTTP 401, ISSUE-045) — no AI-platform row today. Straight Flush was **`cited` on 1 of 15**
conclusive rows (`who can locate a hidden water leak in Laguna Niguel?`) and **absent on
the other 14**. This is the first conventional-proxy citation observed; treat as a single
observation, not a trend.

### Appeared repeatedly (2026-11-03, Tavily; count = distinct queries in which the domain appeared)
- **yelp.com** — 12/15 (directory, not a competitor).
- **efficientplumbing.com** — 9/15. The most persistent *plumbing business* across city,
  leak, repipe, water-heater and slab-leak intent.
- **rotorooter.com** — 6/15; **barkerandsonsplumbing.com** — 6/15; **clearwaterplumbingoc.com**
  — 5/15; **billmetzgerplumbing.com** — 4/15; **mckplumb.com** — 4/15;
  **scottenglishplumbing.net** — 4/15.
- **Leak/repipe specialists:** `evansleakdetection.com` 3/15, `leakstar.com` 3/15,
  `socalrepipes.com` 3/15, `primewestplumbing.com` 2/15, `integrityrepipe.com` 2/15.
- **City-name domains:** `lagunaniguelplumber.org` 2/15, `lagunaniguelcaplumbingpros.com`
  2/15, `proplumbermissionviejo.com`, `proplumberlagunaniguel.com`, `proplumberdanapoint.com`,
  `repipe-san-clemente.com`, `plumbingdanapointca.com`, `pro-drain.com`.
- **Directories/aggregators** (not competitors): `yelp.com`, `facebook.com`, `youtube.com`,
  `thumbtack.com`, `bbb.org`.

### Newly observed this run
- **`proplumber<city>.com` multi-city network** — `proplumbermissionviejo.com` (slab leak
  detection Mission Viejo), `proplumberlagunaniguel.com` (hidden water leak Laguna Niguel),
  `proplumberdanapoint.com` (copper pipe leak Dana Point). One brand operating per-city
  domains. *Verified: the domains appeared in results. Hypothesis: the per-city domain
  structure is a deliberate tactic — not proven to cause ranking.*
- **Exact-match / near-exact-match domains** holding intents: `repipe-san-clemente.com`
  (whole-house repipe San Clemente), `emergencyplumbernearme.website`, `urgentplumberspot.com`,
  `bestserviceplumber.com`, `sewerpros.com` (emergency South OC), `ironwoodplumbing.com`,
  `sewerpros.com` (emergency South OC), `esternrooter.com` (slab leak cost Laguna Niguel),
  `aterdamagemissionviejo.com` (slab leak Mission Viejo).
- **`billmetzgerplumbing.com` and `mckplumb.com`** now appear across both leak and
  water-heater intent — added to the repeat set.

### Gap confirmed (evidence, unchanged direction)
Repipe, water-heater, drain, emergency and slab-leak intents remain served by
**specialist/city-domain pages** while SF holds only `/services/*.html`; SF is absent from
14/15 conclusive rows. Page existence is verified; causation is a **hypothesis**.
