# Experiment Log — Straight Flush Growth Engine

One entry per experiment. Raw rows in `data/content_experiments.jsonl`.
Distinguish genuine trends from normal AI-answer variability: repeat tests on
fixed query wording before declaring a trend. Never attribute an AI-recommendation
change to a website edit without sufficient evidence.

Templates for new entries:
- Date · Hypothesis · Evidence · Target pages/queries · Change made ·
  Deployment date · Baseline metric · Follow-up dates · Observed result ·
  Confounders · Confidence · Decision (keep / revise / revert)

---

## exp-2026-10-07-schema-orphans — schema + de-orphan city pages
- **Hypothesis:** BreadcrumbList/FAQPage schema and de-orphaning 3 city pages
  improve crawl discovery and rich-result eligibility.
- **Evidence:** `briefs/strategy-log.md` 2026-10-07.
- **Change:** schema + internal links + sitemap hub URLs. PR #14.
- **Baseline:** 0 indexable orphans after change; schema coverage partial.
- **Follow-up:** 2026-10-14, 2026-11-07.
- **Result:** pending.
- **Confounder (decisive):** Cloudflare returns 403 to all crawlers → no SERP
  or AI-search effect can be measured until lifted.
- **Confidence:** low. **Decision:** keep.

---

## exp-2026-10-09-cloudflare-crawler-access — (RESOLVED 2026-10-11)
> **Outcome (recorded 2026-10-12, weekly review):** **confirmed / closed.**
> Owner applied `PATCH /zones/{id}/settings/security_level` → `medium`
> 2026-10-11T07:27:51Z. Verified 2026-10-11T07:28:05Z and again 2026-10-12:
> all crawler UAs + curl → 200, no `cf-mitigated`. Hypothesis confirmed.
> **Decision: keep** (no revert — the block was the bug). See `KNOWN_ISSUES.md`
> ISSUE-001.
- **Hypothesis:** ~100% of the site's organic/AI discoverability is currently
  suppressed by the Cloudflare managed challenge; lifting it restores crawl
  access and is the single highest-impact change available.
- **Evidence:** live 403 `cf-mitigated: challenge` to 7 crawler UAs + curl on
  all paths, 2026-10-09 (`data/technical_health_history.jsonl`); independently
  logged 2026-10-07 in `briefs/strategy-log.md`.
- **Change:** owner applies Cloudflare settings per `CLOUDFLARE-SETUP.md` §2a–2c.
  **Not a repo change** — cannot be executed autonomously (hosting/DNS = Level 3).
- **Baseline metric:** crawler-accessible pages = 0; 403 rate = 100%.
- **Follow-up:** re-run `/tmp` crawler check after owner confirms; expect 200
  and no `cf-mitigated` header.
- **Confidence:** high. **Decision:** escalate to owner (see `proposals/`).

---

## exp-2026-10-09-measurement-providers — conventional-proxy sweep (week 2026-10-09 → 10-12)
- **Hypothesis:** a free conventional search proxy (Brave → Bing → DuckDuckGo) can
  measure whether Straight Flush appears in organic results for local-intent queries.
- **Evidence / results (all recorded in `data/ai_visibility_history.jsonl`):**
  - Brave Search — **failed**: HTTP 429 to our egress IP for most of the week.
  - Bing — **failed**: HTTP 200 but **non-localized** results (identical across 5
    cities; dictionaries/ImDb/streaming). Unusable for local intent.
  - DuckDuckGo **HTML** — **failed**: HTTP 202 anti-bot (2026-10-10, 2026-10-12).
  - DuckDuckGo **Lite** — **stalled**: worked 2026-10-12 (36 rows) then returned
    **HTTP 202 anti-bot on all 12 probe queries** in the weekly run.
  - **Observed result:** across 107 executed queries, Straight Flush was **absent
    from every executed query every day** (0 recommended / 0 mentioned / 0 cited).
    Because the channel is degraded and non-localized in part, this is a
    conventional-proxy observation only — **not** a ranking or AI-visibility measure.
- **Confounders:** provider rate-limiting/anti-bot; non-localized result blocks;
  Brave vs DDG samples are not directly comparable.
- **Confidence:** low (channel quality). **Decision:** **revise** — retain a paid
  SerpAPI/Brave API key or a Perplexity key as the path forward (see `proposals/`
  and weekly report §7). Brave kept as fallback only; Bing dropped.

---

## exp-2026-10-26-aliso-viejo-direct-answer — direct answer + FAQ on the Aliso Viejo page
- **Hypothesis:** a plain "who does slab leak detection / PEX repiping in Aliso Viejo"
  answer, a linked service list and a PEX-repiping FAQ make `/cities/aliso-viejo` a
  citable source for Aliso Viejo slab-leak and repipe AI answers, where no local
  business page answers today.
- **Evidence:** `reports/daily/2026-10-25.md` (Aliso Viejo slab/repipe results fall back to
  Mission Viejo pages, spam and out-of-market franchise pages); `reports/citation-gaps/2026-10-26.md`.
- **Change:** `cities/aliso-viejo.html` — hero direct-answer paragraph, 5 service items
  linked to service pages, new FAQ "Who does PEX repiping in Aliso Viejo?" (visible +
  FAQPage JSON-LD). Weekly run 2026-10-26, direct to `main`.
- **Target queries:** best / recommend / who does × slab leak detection and PEX repiping, Aliso Viejo (6).
- **Baseline:** `claude_web_search` sf_status = **absent** for all 6.
- **Follow-up:** 2026-11-23. **Result:** pending.
- **Confounders:** 0/96 answers recommend us anywhere; low authority; single engine.
- **Confidence:** low. **Decision:** keep.
## Weekly review 2026-10-26 — outcomes recorded

No new experiment was created this week (no site change shipped). The open
experiments below had their outcome re-assessed against this week's evidence.

### exp-2026-10-07-schema-orphans — **keep, inconclusive**

- **Follow-up 2026-10-14: elapsed, still inconclusive.** No measurable SERP change
  is possible while GSC is unconnected, and the measurement channel that replaced the
  conventional proxy (`claude_web_search`) reports 0 recommended / 0 cited for all 96
  queries — which is a *coverage* observation, not a test of the schema change.
- **Decision: keep.** Next scheduled follow-up **2026-11-07**.
- **Confounder unchanged:** no GSC/GA4/GBP access.

### exp-2026-10-09-measurement-providers — **reverted / superseded**

- Brave HTTP 429 for most of the window; Bing HTTP 200 but non-localized (identical
  results across all 5 cities); DDG HTML **202** anti-bot; DDG Lite 202 on all 12
  probes. The channel never produced a trustworthy city-level signal.
- **Decision: revert.** Replaced 2026-10-20 by `claude_web_search` (primary) and
  Tavily (fallback). Recorded so the failure is not silently forgotten.

### exp-2026-10-09-cloudflare-crawler-access — **resolved, holding**

- Re-verified 2026-10-26T13:04Z: all 7 crawler UAs + curl → **200** on `/`,
  `/robots.txt`, `/sitemap.xml`, `/llms.txt`; no `cf-mitigated`. 15 consecutive days
  green since the 2026-10-11 fix.
- **Decision: resolved / keep.**

### Gemini grounded AI-surface channel — **revise (blocked, not dropped)**

- 2026-10-16: 5 × `bad_request` HTTP 404 (retired model slug).
  2026-10-23: 4 × `server_error` 500, 4 × `quota_exhausted` 429, 1 usable row.
- **Decision: revise.** Fix = idea-2026-10-23-02 (reserve Gemini quota for the
  sweep). Until then the AI board is single-engine and must be labelled as such.

### New experiment rows for the pages shipped this week

`data/content_experiments.jsonl` gains one row per page shipped 2026-10-20→24 with
its baseline `sf_status` (all `absent`) and a 2026-11-23 re-measure date. The daily
planner retests them as they age. See the file for the machine-readable rows.

### exp-2026-11-02-san-clemente-slab-direct-answer — **shipped 2026-11-02, pending**

- **Page:** `cities/san-clemente.html` — hero direct-answer paragraph ("Need slab leak
  detection in San Clemente?…"), the 4 plain-text services now link to their service
  pages, new FAQ "Who does slab leak detection in San Clemente?" (visible + FAQPage JSON-LD).
- **Why:** 4 San Clemente slab-leak observations (10-20 → 11-02) were all `absent` and the
  AI named **no business at all** — the most open query set on the board.
- **Target queries / baseline:** best / who does / recommend × slab leak detection in
  San Clemente — all `absent`.
- **Claims used:** only APPROVED_CLAIMS (owner-operated, Laguna Niguel based, acoustic /
  electronic / thermal, locate before opening). No prices, guarantees or new facts.
- **Re-measure:** 2026-11-30.

## exp-2026-11-09-gsc-aa-noise-check — A/A noise check before reading rank tests

- **Why:** the 2026-11-05 Lake Forest title test (PR #137, unmerged) and the 2026-11-04
  rank-gate test (PR #127, unmerged) both read GSC average position. Neither had measured
  how far that number moves when nothing changes.
- **Method:** daily GSC rows (2026-09-28 → 11-08, both URL forms summed) for the fixed
  on-topic queries of arm A (`cities/lake-forest.html`) and control C
  (`cities/coto-de-caza.html`). Neither page changed in the window. `scripts/gsc_noise_check.py`
  bootstraps two 28-day windows from the same rows. Snapshot:
  `data/gsc_aa_noise_check_2026-11-09.json`.
- **Result:**
  - Volume is ~7 on-topic impressions a week per arm, about 27–29 per 28 days.
  - Weekly weighted position swings with no change: A 9.0 → 39.3 (sd 10.7), C 15.0 → 57.7 (sd 14.4).
  - Coto "plumber coto de caza" alternates between ~13–20 and ~55–60 from day to day,
    so the average is a mix of two SERP states, not one rank.
  - Null 90% band for one arm's before/after: about ±6–7 positions. For A-minus-C
    difference-in-differences: **−9.6 to +9.8**.
  - The PR #137 rule "supported if A beats C by ≥ 5" fires on pure noise **~20%** of the
    time, and "refuted if within ±3" fires ~38% of the time. Both are lower bounds,
    because the bootstrap treats impressions as independent.
  - Both arms drifted up together in the latest week (A 13.9, C 15.0), before any change.
    That is why a control is needed.
- **Decision for exp-2026-11-05-lake-forest-serp-title:** keep the design but change
  the read rule. Day 0 is the merge date of #137, not 11-05; re-pull the baseline as the
  28 days before merge. Call it **supported** only if A beats C by **≥ 10** positions
  (outside the null band) **and** A's share of impressions at ≤ 20 rises by ≥ 25 points.
  Otherwise call it **inconclusive**, never "refuted": the test cannot detect an effect
  under ~10 positions.
- **Re-run this check** before every rank readout, with the same script, on the latest
  pre-period.

## exp-2026-11-09-city-title-batch — pooled, randomized title/description test (design, not shipped)

- **Why:** one page per arm gives ~28 impressions per window, which is too few. Pooling
  three pairs of pages gives several times more impressions per arm, so the noise
  band shrinks.
- **Eligible pages:** city pages with GSC impressions and **no open page-specific PR**
  as of 2026-11-09. Excluded: aliso-viejo #115, rancho-santa-margarita #126,
  mission-viejo #133, lake-forest #137, dana-point #143, ladera-ranch #146,
  laguna-woods #149. Also excluded: pages with content merged since 11-04
  (laguna-hills, laguna-niguel, san-juan-capistrano), san-clemente (other treatment),
  and coto-de-caza (#137 control). The sitewide PRs #119 and #135 touch both arms
  equally and do not exclude a page.
- **Pairs and assignment:** pairs matched by impressions, then a seeded coin flip
  (`random.Random(20261109)`):

  | Pair | Treatment | Control |
  |---|---|---|
  | 1 | costa-mesa | newport-beach |
  | 2 | irvine | tustin |
  | 3 | foothill-ranch | laguna-beach |

- **Change (treatment only, one PR, same day):** rewrite `<title>` and meta description
  so they name the service the page already gets impressions for, plus the city and
  "CA". Body, H1 and schema stay the same. Claims come only from APPROVED_CLAIMS.
  Controls are frozen until the final check.
- **Metric:** per page, impression-weighted position over that page's fixed on-topic
  query list (both URL forms summed), 28 days after vs 28 days before. Pooled effect =
  mean of the three pair differences-in-differences. Secondary metrics: share of
  impressions at ≤ 20, and clicks.
- **Read rule:** run `scripts/gsc_noise_check.py` on the pre-period first.
  - **Supported** if the pooled difference-in-differences is beyond that null 90% band
    and at least 2 of 3 pairs move the same way.
  - **No detectable effect** if it is inside the band.
  - **Inconclusive** if any page has fewer than 15 on-topic impressions in either
    window, or if a control receives a page-specific change.
- **Decision it drives:** whether one-hour title passes beat one-day new pages as the
  next ranking lever across the city section.
- **Status:** awaiting owner go-ahead. Shipping it adds one more open PR on top of the
  ~24 already open.
