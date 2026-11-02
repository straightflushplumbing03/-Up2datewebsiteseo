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

---

## exp-2026-11-02-dedicated-pages-vs-control — staged read of the 2026-11-02 page merges
- **Date:** 2026-11-02 (experiments crew). **Deployment date:** 2026-11-02T00:41–00:46Z
  (PRs #97, #98, #99 merged via #100).
- **Hypothesis:** queries that now have a dedicated city × service page (treatment) will
  move through three stages before control queries that only have a generic city page:
  (1) first-party page indexed, (2) site cited as a source, (3) business named.
- **Treatment queries (4, fixed wording, from `ai_visibility_queries`):**
  "who can locate a hidden water leak in Laguna Niguel?" (`services/leak-detection-laguna-niguel.html`, new);
  "slab leak detection in Mission Viejo" (`services/slab-leak-detection-mission-viejo.html`, new);
  "who handles whole-house repiping near Mission Viejo?" (`services/pex-repiping-mission-viejo.html`, new);
  "who provides slab leak detection in Laguna Niguel?" (`services/slab-leak-detection-laguna-niguel.html`, live since 2026-10-24).
- **Control queries (3, no dedicated page):** "plumber in Ladera Ranch",
  "which plumbers serve San Clemente?" (drops out of control if PR #104 merges),
  "emergency plumber in South Orange County".
- **Baseline (2026-10-23 → 2026-11-01, `public.ai_visibility_observations`):** 80 usable
  answers (70 `gemini_search`, 20 `claude_web_search`, minus 10 inconclusive errors):
  named **0/80**, `straightflushplumbingoc.com` in sources **0/80**.
  Leading indicator 2026-11-02: web search `site:straightflushplumbingoc.com` and a
  domain + service query return **no first-party pages** (only directory/GBP/other-company
  results) — stage 1 is not yet reached for any page.
- **Metrics (tracked separately, per methodology):** stage 1 = target URL appears for a
  `site:` / exact-title search; stage 2 = site domain in `domains[]`; stage 3 = name in answer.
- **Read rule:** compare treatment vs control rates per stage on fixed wording, ≥3 runs per
  query per engine per check. Call a win only if treatment ≥2 of 4 queries reach a stage in
  ≥2 separate checks while control stays at 0. One-off hits = noise (AI answers vary run to run).
  If stage 1 is still 0 at 2026-11-16, the bottleneck is indexing, not content; stop adding
  pages and escalate GSC verification + sitemap submission.
- **Follow-up:** 2026-11-09 (stage 1), 2026-11-16 (stage 1–2), 2026-11-30 (all stages).
- **Confounders:** GSC/GA4/GBP not connected; Gemini rows are Gemma fallback; only two engines;
  PR #101–#104 merges would change other pages mid-test (log merge dates here).
- **Confidence:** low (baseline is a floor at zero). **Decision:** keep; measure.
