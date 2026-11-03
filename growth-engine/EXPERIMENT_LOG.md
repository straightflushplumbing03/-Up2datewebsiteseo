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

---

## exp-2026-11-03-indexnow-split — does IndexNow get pages into Bing faster than waiting?

- **Why this test, now:** the AI board is 0 named / 0 cited across 80 usable answers
  (2026-10-23 → 11-02), and on 2026-11-02 and again on 2026-11-03 a web search for
  `site:straightflushplumbingoc.com` returned **no first-party pages**. Content tests
  (exp-2026-11-02-dedicated-pages-vs-control, PR #105) cannot read until pages are
  indexed. This test works on that first stage. It targets the Bing index because
  Copilot and other Bing-grounded answers draw from it, and Bing accepts IndexNow.
  Google does not use IndexNow, so Google indexing still needs Search Console (P-002).
- **Hypothesis:** URLs submitted by IndexNow show up as indexed in Bing sooner than
  matched URLs left to normal sitemap crawling.
- **Change:** root key file `3ff9508dd5110375b6ea304de6df46ca.txt`,
  `scripts/indexnow_submit.py` (dry run unless `--send`), arms in
  `growth-engine/data/indexnow_experiment.json`. Also removed a duplicate
  `services/leak-detection-laguna-niguel.html` entry from `sitemap.xml` (new test
  guards against duplicates).
- **Arms (6 v 6, matched by page type):**
  - Treatment (submit on day 0): slab-leak-detection-mission-viejo,
    leak-detection-laguna-niguel, pex-repiping-mission-viejo,
    water-heater-repair-laguna-niguel, cities/laguna-niguel, cities/san-clemente.
  - Holdout (no submission until day 14): slab-leak-detection-laguna-niguel,
    slab-leak-detection-dana-point, pex-repiping-laguna-niguel,
    water-heater-repair-dana-point, cities/dana-point, cities/mission-viejo.
  - Homepage and all other pages are in neither arm.
- **Day 0:** the day the PR is merged, GitHub Pages serves the key file, and
  `python3 scripts/indexnow_submit.py --arm treatment --send` returns HTTP 200/202.
- **Metric (per URL, yes/no):** "indexed in Bing". Primary reading: Bing Webmaster
  Tools URL Inspection (owner). Fallback the crew can run: an exact-title search plus
  a `site:` + URL-path search; record which method was used.
- **Checks:** day 3, day 7, day 14 after day 0.
- **How to read it:** treatment wins if, at day 14, at least 4 of 6 treatment URLs
  are indexed **and** treatment leads holdout by 3 or more. Equal or within 2 =
  no detectable effect at this sample size (6 v 6 only detects a large effect).
  Both arms at 0 on day 14 = the blocker is not discovery (look at site quality,
  duplicate root `.html` stubs, or Bing Webmaster crawl errors instead).
- **After the read (any outcome):** submit the holdout and every other sitemap URL.
  The cost of holding out is at most 14 days of delay on 6 pages.
- **Rules during the test:** do not edit holdout pages (a content change can trigger
  Cloudflare Crawler Hints, which itself sends IndexNow pings). Sitewide edits that
  touch both arms equally are allowed but must be noted here with the date.
- **Confounders:** Cloudflare Crawler Hints may already be on (CLOUDFLARE-SETUP.md
  recommends it). If it is, it pings Bing on changed pages, so the 11-02 sitewide
  commits may already have been sent for both arms. The owner should check the
  setting; if on, the test still compares an explicit submission against no new ping.
  Single engine (Bing). Small n.
- **Baseline (2026-11-03):** 0/12 found by the crew's web search fallback (no
  first-party result for `site:straightflushplumbingoc.com`). Bing Webmaster status
  not yet read (needs owner).
- **Status:** designed, awaiting merge and owner OK to send. **Confidence:** low
  until read. **Decision:** run.
