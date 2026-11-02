# Daily Report — 2026-10-20 (OpenHands Intelligence HQ, second run of the UTC day)

Timezone: America/Los_Angeles · Run: SFPL AI Headquarters Daily (OpenHands Cloud) ·
Started 2026-10-20T16:43Z (09:43 PDT) · Status: **COMPLETED**

> **File naming note.** `2026-10-20.md` on `main` is the *Claude scheduled task* run
> (12:45 UTC). This is a **different, later** run on the same UTC date, so it is
> written to `2026-10-20-openhands-hq.md` to preserve the earlier record rather than
> overwrite it (same convention as `2026-10-15-second-run.md`).

## URGENT / ALERTS

**None new.** No downtime, no site-wide `noindex`, no crawler block, no business-info
error. Two standing non-critical regressions are reported below (entity duplicate
hosts; sitemap ordering — the latter fixed this run).

## Daily executive summary

- **Website health:** ✅ crawler access **OK** — `PerplexityBot /` **200**,
  `Applebot /` **200**, `curl /robots.txt` **200**, `curl /sitemap.xml` **200**,
  `curl /llms.txt` **200** (`crawler_access_check.sh`, 2026-10-20). Knowledge base
  ✅ **OK** (135 HTML files validated). SEO audit ✅ **OK**.
- **Platforms successfully tested:** **Tavily** (conventional-search proxy) and
  **Gemini → Gemma fallback** (AI-answer-engine surface). Both executed, 30 rows
  captured.
- **Platforms NOT tested:** Google Search Console, GA4, Google Business Profile —
  **not connected** (P-002 blocker, unchanged). Google/Bing/Perplexity AI surfaces —
  **not tested** (no access path from this sandbox). Brave / DuckDuckGo — **not used
  this run**: the deterministic pre-stage swept via Tavily, and per the
  search-provider policy the sweep is a success if *one* provider returns evidence.
- **Queries executed:** **30 successful / 0 failed** — 25 conventional-proxy, 5
  AI-surface.
- **Services & cities covered:** leak detection, slab leak, PEX repipe, drain
  cleaning, sewer backup, water heater, tankless, water-pressure regulator,
  emergency. Cities: Laguna Niguel (11), Orange County / South OC (6), Dana Point
  (2), San Clemente (1), Mission Viejo (2), Aliso Viejo (2), Laguna Hills (1),
  Laguna Beach (1), Ladera Ranch (1).
- **Changes since last comparable run:** sitemap ordering regression **fixed**
  (below). No visibility movement — **0/30 non-absent**.

## AI visibility

| Platform | Tested | Recommendation rate | Mention rate | Citation rate | Sample | Confidence |
|---|---|---|---|---|---|---|
| Gemini (grounded) → **Gemma fallback** | Yes | 0/5 (0%) | 0/5 | 0/5 | 5 queries | medium — labelled `engine: gemma`, `gemma-4-26b-a4b-it`; a fallback, not the primary model |
| Tavily (conventional-search proxy) | Yes | n/a | n/a | 0/25 | 25 queries | medium |

**Honesty constraints applied.** The 5 AI-surface rows are recorded with
`engine: "gemma"` because the Gemini grounding call fell through to the Gemma
fallback. They are genuine AI-answer-engine observations, but they are **not**
Gemini-model results and must not be reported as such. The 25 Tavily rows are
**conventional search** and are **not** AI-platform results (ground rule 4).

**Notable queries where SF appeared:** none. SF was `absent` in all 30 rows.

**Notable queries where SF was absent (highest-intent):**

- `best leak detection company in Laguna Niguel` — our home city, our core service.
- `who can locate a hidden water leak in Laguna Niguel?` — conversational/AEO form.
- `slab leak detection in Mission Viejo`, `slab leak repair Laguna Niguel`.
- `PEX repiping company in Laguna Hills`, `whole house repipe Laguna Niguel`.
- `water pressure regulator replacement Laguna Niguel`, `tankless water heater service Laguna Niguel`.
- `emergency plumber in South Orange County`, `emergency plumber in Laguna Beach`.

**Source URLs cited (domains, from `top_results`):** yelp.com (33 — by far the most
frequent), efficientplumbing.com (15), facebook.com (15), barkerandsonsplumbing.com
(11), rotorooter.com (10), clearwaterplumbingoc.com (8), scottenglishplumbing.net
(7), evansleakdetection.com (6), mckplumb.com (5), billmetzgerplumbing.com (5),
socalrepipes.com (5), americanleakdetection.com (5), leakstar.com (4),
drainandsewerpro.com (4), bbb.org (3), streamlineplumbing.org (3),
primewestplumbing.com (3), lagunaniguelcaplumbingpros.com (3).

> **Confounder that must accompany these zeros:** the live domain still returns
> HTTP 403 `cf-mitigated: challenge` to ordinary crawlers (ISSUE-001, open).
> Conventional-search absence is **expected** while that block persists and is not
> by itself evidence about content quality. Note that `crawler_access` shows the
> *named* AI bots returning 200 — the challenge is UA/behaviour-dependent.

## Competitor intelligence

**Newly discovered / newly verified this run** (all four are **direct fetches**, not
search-result claims; feature presence is *verified*, causation is *hypothesis*):

- **Repipe OC — repipe-laguna-hills.com** (HTTP 200, 115,845 B). `<title>` is an
  exact city+service match: *"Whole-house repipe in Laguna Hills | Repipe OC"*.
  Emits `FAQPage` **and** `HowTo` / `HowToStep` / `HowToSupply` / `HowToTool`, plus
  `City` + `GeoCoordinates` + `BreadcrumbList`. **225** occurrences of "Laguna" in
  the HTML. No `aggregateRating`. This is the clearest single-city competitor in the
  repipe niche.
- **Creative Repipe — creativerepipe.com** (HTTP 200, 325,261 B). `LocalBusiness` +
  `Organization` + `PostalAddress` + `OpeningHoursSpecification`; **no** `FAQPage`;
  **zero** "Laguna" mentions — a specialist brand ranking on service intent without
  city localisation.
- **Saddleback Plumbing Heating & Air — saddlebackplumbing.com** (HTTP 200,
  134,082 B). **No JSON-LD detected on the homepage**; 6 "Laguna" mentions; combined
  HVAC+plumbing positioning — appears to compete on legacy brand authority.
- **SJ Plumbing — sjplumbingoc.com** (HTTP 200, 197,180 B). `Plumber` + `City` +
  `PostalAddress` + `OpeningHoursSpecification`, and an **`aggregateRating`** on the
  page. That rating was **not** corroborated against a review source and must not be
  imitated (ISSUE-002 hygiene).

**Appearing repeatedly (conventional proxy):** yelp.com (33 rows),
efficientplumbing.com, barkerandsonsplumbing.com, rotorooter.com,
clearwaterplumbingoc.com, scottenglishplumbing.net, evansleakdetection.com.

**Gaps to address (evidence-backed):**

1. **Our Tier-1 city pages carry no repipe content.** Verified 2026-10-20:
   `cities/laguna-hills.html` → `has repipe section: False`, 1,154 words — while the
   city+service repipe competitor ranks with an exact-match title and HowTo schema.
2. **Our method pages lack `HowTo`.** `services/pex-repiping.html` emits
   `Service` / `FAQPage` / `Answer` / `Question` / `BreadcrumbList` / `Plumber` —
   **no** `HowTo`, which the competitor has.
3. **Directory dominance.** yelp.com appears in more `top_results` than any actual
   plumbing company, which is a citation/review surface (owner-controlled, Level 3).

## Technical findings

| Severity | URL | Evidence | Impact | Fix | Status |
|---|---|---|---|---|---|
| medium | `sitemap.xml` | `check_sitemap_idempotent` → `sitemap_dirty: true`; the Dana Point case study was hand-inserted out of the generator's canonical order | `sitemap_idempotent` check red every run; risk of a real ISSUE-016 lastmod regression hiding behind a permanently-dirty file | Committed the generator's own ordering (`refresh_sitemap.py`); URL set, lastmods, changefreq, priority **byte-identical** | ✅ **FIXED this run** |
| medium | `straight-flush-plumbing-7fb7cf71.base44.app`, `straightflushplumb8.wixsite.com` | `entity_consistency` exit 1 — both owned duplicate hosts return HTTP 200 and are indexable | Duplicate entities can split brand signals / AI-answer attribution (ISSUE-014 / ISSUE-018) | **Cannot fix here** — external property; needs owner action | open — **proposal** |
| info | `https://straightflushplumbingoc.com/` | Live crawler checks all 200 for named AI bots | none | none | ✅ OK |

**Sitemap fix — verification detail.** I compared the committed file against a clean
`refresh_sitemap.py` output in a throwaway clone: **76 URLs both sides,
`set` equal `True`, `order` equal `False`**, `only-in-committed: []`,
`only-in-generated: []`. Pure ordering, zero content change — the identical pattern
approved and shipped on 2026-10-16. After applying it, `refresh_sitemap.py` run twice
produced a **byte-identical** file, and `validate_knowledge_base.py` passed
(135 HTML files, sitemap 76 URLs, missing `[]`, extra `[]`).

## Website changes

| Files/pages | Reason | Tests | PR/deploy ref | Verification | Rollback |
|---|---|---|---|---|---|
| `sitemap.xml` (ordering only) | Restore `check_sitemap_idempotent` to green; prevent a real ISSUE-016 regression hiding behind a permanently-dirty file | `python3 -m unittest discover -s growth-engine/tests -p "test_*.py"` → **352 tests OK**; `validate_knowledge_base.py` → **OK**; double-refresh byte-identical | branch `intelligence-hq/site-2026-10-20-sitemap-order` (separate PR) | URL/lastmod sets proven equal before and after | `git checkout main -- sitemap.xml` |

**No HTML page, schema, claim, price, phone, or copy was changed.**

## Priority queue

| # | Action | Impact | Evidence | Effort | Risk |
|---|---|---|---|---|---|
| 1 | Restore Google Search Console access (P-002) — unlocks impressions/clicks/queries **and** the Generative AI performance report | High | Google's official AI-optimization guide names the GSC Generative AI performance report as the measurement surface (fetched 2026-10-20) | Owner OAuth | L3 — propose only |
| 2 | Add a repipe section + internal link to Tier-1 city pages (Laguna Hills, Laguna Niguel first) | Med-High | `cities/laguna-hills.html` has no repipe content; `repipe-laguna-hills.com` ranks with an exact city+service title and 225 city mentions | Low-Med | L2 |
| 3 | Add `HowTo` / `HowToStep` JSON-LD to the repipe and leak-detection method pages | Medium | Competitor emits HowTo; our `pex-repiping.html` does not | Low | L2 |
| 4 | Fix the entity split (ISSUE-014) — deindex/redirect the two duplicate hosts | Medium | `entity_consistency` exit 1, two owned hosts HTTP 200 | Owner | L3 — propose only |
| 5 | AEO framing rule: never describe FAQ/answer content as an AEO "hack" | Low-Med | Google's own mythbusting section (fetched 2026-10-20) | Trivial | L1 |

## Integration & data limitations

- **Google Search Console — NOT CONNECTED.** No `GOOGLE_SEARCH_CONSOLE_*` secret
  exists in this sandbox. Impressions, clicks, query mix, coverage and the
  **Generative AI performance report** are therefore **`unverified`** — **not zero,
  not a decline**. Blocker: **P-002**.
- **GA4 / Google Analytics — NOT CONNECTED.** Same as above; no `GA4_*` /
  `GOOGLE_ANALYTICS_*` secret present.
- **Google Business Profile — NOT CONNECTED.** No `GOOGLE_BUSINESS_PROFILE_*`
  secret. Insights, review counts and profile edits are **`unverified`**.
- **Gemini primary model — fell through to the Gemma fallback** (`engine: "gemma"`,
  `gemma-4-26b-a4b-it`). The 5 AI rows are genuine observations but are labelled as
  fallback results; they are **not** Gemini-model results.
- **Brave / DuckDuckGo — not exercised this run.** The deterministic pre-stage swept
  via Tavily. No provider returned a rate-limit block, so no BLOCKED check is
  recorded; the search-provider policy treats one evidence-returning provider as
  success.
- **`crawler_access` — PASS (not BLOCKED).** All five probes returned HTTP 200.
- **Clone depth:** the workspace clone is **shallow**
  (`git rev-parse --is-shallow-repository` → `true`), which is why
  `refresh_sitemap.py` reports `history unavailable: 76` for lastmod. This is the
  documented ISSUE-016 context, not a new fault.
- **No notification channel configured (P-005).** This report and its PR are the
  only channel.

## Alerts

None critical. Two non-critical, standing items need owner action and are recorded
as proposals: the **entity split** (ISSUE-014) and **GSC/GA4/GBP access** (P-002).
