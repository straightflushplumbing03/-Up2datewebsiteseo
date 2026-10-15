# Integration Status — Straight Flush Growth Engine

<<<<<<< HEAD
<<<<<<< HEAD
> **Re-verified 2026-10-15 (owner-requested local SEO audit run):**
> `crawler_access_check.sh` **exit 0** ✅ (all UAs 200, no `cf-mitigated`);
> all **74 sitemap URLs HTTP 200** ✅ (live curl sweep); robots.txt/llms.txt/
> llms-full.txt/md mirrors ✅ 200; JSON-LD ✅ 338 blocks parse; `_headers` is
> **not honored by GitHub Pages** (no HTTP security headers — ISSUE-012);
> Google PageSpeed Insights API ✅ reachable but returned **HTTP 429 quota**
> (no CWV score produced). **Automation API from this session:** `GET
> /api/automation/v1` → `total: 0` and the two known IDs → 404 — an
> **auth/scope difference for this session**, not proof of deletion; the
> authoritative record is the 2026-10-12 verification below (both ACTIVE).
> Google Search Console, GA4 (no tag on site), and GBP remain **not connected**.

Verified **2026-10-12** (daily run) in the active OpenHands Cloud environment; a
check is only marked ✅ after an actual successful call. Prior verification
2026-10-09.
=======
Verified **2026-10-12** (daily run, executed 16:27–16:35 UTC) in the active
OpenHands Cloud environment; a check is only marked ✅ after an actual successful
call. Prior verification 2026-10-09.

> **Re-verified 2026-10-13 (second pass):** search-provider resilience tested
> with a **different query set**. Brave returned **8 parseable pages, then an
> anti-bot challenge page** for every later query (a *more specific* mode than the
> earlier 429 — the block can now trigger after as few as ~8 queries). Fallback
> chain all failed this pass: DuckDuckGo **Lite** → 202, DuckDuckGo **HTML** → 202,
> **Bing** → 200 with no parseable organic anchors, **Mojeek** → 403,
> **Ecosia** → 403. Blocked queries recorded **`inconclusive`, never "absent"**.
> Site crawler access remains ✅ (no regression).

> **Re-verified 2026-10-13 (daily run):** crawler access ✅ **PASS**
> (`crawler_access_check.sh` exit 0 — Googlebot/Bingbot/GPTBot/OAI-SearchBot/
> ClaudeBot/PerplexityBot/Applebot + curl all 200, no `cf-mitigated`; ISSUE-001
> remains RESOLVED); key paths `/`, `/llms.txt`, `/llms-full.txt`, `/md/index.md`,
> `/services/leak-detection.html`, `/cities/laguna-niguel.html` → HTTP 200 ✅
> (ISSUE-001 AI-readable-file follow-up **deployed**). **Brave Search ⚠️ PARTIAL**
> — 9/9 queries returned 200/parseable, then HTTP **429**; sweep stopped per the
> Brave-only rule (10 queries deferred, not failed). Google Search Central primary
> docs ✅ 200. Google Search Console, GA4, and GBP remain **not connected** ❌
> (blocker unchanged — see P-002).
>>>>>>> origin/intelligence-hq/daily-2026-10-13
=======
Verified **2026-10-13** (blocker-verification pass); prior verification 2026-10-12.
A check is only marked ✅ after an actual successful call.

> **Scheduled-run verification (2026-10-13) — PASS.** The daily and weekly
> automations **fired on their cron schedules and completed**:
> - `SFPL Intelligence HQ Daily 6 AM` — run `1afcbefd-e3e7-4961-8c45-daad9f091a79`,
>   `trigger_source: cron`, started `2026-10-12T13:00:54Z` = **06:00:54 PDT**;
>   COMPLETED. It persisted its report and opened **PR #33** (open, not auto-merged).
> - `SFPL Intelligence HQ Weekly Review` — run `ff3478a3-5855-4a72-8606-0b7dba26d18e`,
>   `trigger_source: cron`, started `2026-10-12T13:00:43Z` = **06:00:43 PDT**
>   (Monday); COMPLETED. Produced the first weekly review.
> - Live prompts are byte-identical to the repo's canonical prompts (daily 10443
>   chars, weekly 3652 chars) — no drift.
> - This is the strongest evidence available: the platform does not expose
>   `next_run_at`, so scheduling is proven by an actual on-time cron dispatch.
>>>>>>> origin/intelligence-hq/blockers-verification-2026-10-13

> **Phase 2 re-verified 2026-10-12 (inspection run):** `GET /api/automation/v1`
> 200 ✅ — HQ-D and HQ-W **enabled/ACTIVE**; `Growth Engine A`, `Scout`,
> `Strategist`, and `Sentinel` now **disabled** (consolidation complete).
> `PATCH {"timeout":3600}` → **HTTP 422** (platform cap 1800 s, re-confirmed).
> Google Search Central primary sources → HTTP 200 ✅ (3/3). Google Search Console,
> GA4, and GBP remain **not connected** ❌ (blocker unchanged — see P-002).

> **Re-verified 2026-10-12** (Intelligence HQ setup run): OpenHands automation API
> 200 ✅; GitHub repo/API ✅ (`gh`/REST, `GITHUB_TOKEN` present, repo read/write);
> active repo clone ✅ (`straightflushplumbing03/-Up2datewebsiteseo`, `main`);
> GitHub Pages ✅ (`status: built`, CNAME `straightflushplumbingoc.com`, source
> `main` `/`); Brave Search ✅ (7/7 queries parsed, 8th HTTP 429 rate-limited);
> Google Search Central primary docs ✅ (HTTP 200). Google Search Console, GA4,
> and GBP remain **not connected** ❌ (blocker unchanged — see P-002).

## Automations registered (verified 2026-10-12)

| Name | id | Cron (America/Los_Angeles) | State | Repo connected |
|---|---|---|---|---|
| `SFPL Intelligence HQ Daily 6 AM` | `5dc89b41-6880-40e6-950c-14a635f7bd62` | `0 6 * * *` (daily incl. weekends) | **ACTIVE** | `straightflushplumbing03/-Up2datewebsiteseo` |
| `SFPL Intelligence HQ Weekly Review` | `0582d219-de15-42c2-83b5-4bc92995edce` | `0 6 * * 1` (Mondays) | **ACTIVE** | same |

- Both use the prompt preset with `repos` = the production repo, `timeout` = 1800 s.
- Verified via `GET /api/automation/v1/{id}`: `enabled: True`, `state: ACTIVE`,
  `trigger.timezone: America/Los_Angeles`, `preset_metadata.repos` set.
- `next_run_at` is **not exposed** by this API version; scheduling is evidenced by
  `enabled` + cron + `last_triggered_at` (daily: `2026-10-12T06:09:19Z` from the
  verification dispatch).
- Superseded duplicate at the same 06:00 slot (`Growth Engine A: Morning AI Search
  Visibility`) is `INACTIVE`.

## Highest-value integrations to unlock

<<<<<<< HEAD
1. **Perplexity API key** — the cheapest way to get a *real* AI-answer-engine
   visibility signal in-automation.
2. **Google Search Console** — the only reliable source for organic impressions,
   clicks, query, and indexing/coverage data.
3. **Google Business Profile** — local pack visibility is a primary channel for
   "plumber near me" queries.
=======
| Integration | Evidence | Notes |
|---|---|---|
| OpenHands automation API | `GET /api/automation/v1?limit=1` → 200 (2026-10-12) | `OPENHANDS_API_KEY` present |
| GitHub (repo + API) | `GET /api/github.com/user` → `straightflushplumbing03` (2026-10-12) | token available as `github_token` / `GITHUB_PERSONAL_ACCESS_TOKEN`; repo read/write + PRs |
| Active repo clone | `git fetch origin main` → clean | `straightflushplumbing03/-Up2datewebsiteseo`, branch `main` |
| GitHub Pages deployment (origin) | Pages API: `status: built`, CNAME set | legacy build from `main` `/`; live responses carry `x-github-request-id` + Fastly edge headers, so Pages is the origin |
| Cloudflare proxy + Workers build | live `server: cloudflare`; PR #29/#31 show a **Cloudflare "Workers Builds"** check (success) | **Cloudflare fronts the site** (DNS+proxy). A Cloudflare Git build integration runs on PRs, but there is **no `wrangler`/Workers config in the repo** — the deployed origin is GitHub Pages. `_headers` is applied via Cloudflare Transform Rules (`CLOUDFLARE-SETUP.md`), since Pages ignores `_headers`. |
| Site crawler access | `crawler_access_check.sh` exit 0; all UAs 200 (2026-10-12) | ISSUE-001 **resolved** — no `cf-mitigated` |
| DuckDuckGo Lite (conventional proxy) | 36/36 queries HTTP 200 with parseable results (2026-10-12) | Used for the 2026-10-12 visibility sweep |
| Bun/curl/dns/TLS checks | see `data/technical_health_history.jsonl` | |

## Not available ❌

| Integration | Status | Needed to enable (exact secret name) |
|---|---|---|
| Google Search Console | **not connected** | Owner OAuth/API credentials or an export. Intended secret names: `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` + property `sc-domain:straightflushplumbingoc.com`. Needed for impressions/clicks/queries/indexing. |
| Google Analytics 4 | **not connected** | GA4 property ID + API creds or owner report. Intended secrets: `GA4_PROPERTY_ID` + `GOOGLE_ANALYTICS_CREDENTIALS`. |
| Google Business Profile performance | **not connected** | GBP API access or owner export. Intended secret: `GOOGLE_BUSINESS_PROFILE_CREDENTIALS`. |
| Google Search AI Overviews / AI Mode | **not testable** | No SERP API key; SERP served as JS shell to curl |
| ChatGPT Search | **not testable** | chatgpt.com 403 to non-browser clients |
| Claude web search | **not testable** | not scriptable in this environment |
| Gemini | **not testable** | — |
| Microsoft Copilot | **not testable** | — |
| Grok | **not testable** | — |
<<<<<<< HEAD
| Perplexity Agent API | **code ready, key not set** | `PERPLEXITY_API_KEY` missing. Client + CLI + tests committed (`growth-engine/ai_agent_client.py`, `scripts/perplexity_agent.py`); enable by exporting the key. No JS scraping involved. |
| Notification channel (email/Slack/etc.) | **not configured / not verified** | Owner-approved notification target; Slack MCP not enabled |
=======
| Perplexity | **not testable** | JS app; add secret `PERPLEXITY_API_KEY` to enable the API |
| Notification channel (email/Slack/etc.) | **not configured / not verified** | Owner-approved target (P-005). Slack MCP is not enabled in this environment. |
>>>>>>> origin/intelligence-hq/blockers-verification-2026-10-13
| Call tracking / lead data | **not connected** | Provider + creds |

## Partially working / intermittent ⚠️

| Integration | Issue |
|---|---|
| Tavily Search API (conventional proxy) | **connected & verified** | `TAVILY_API_KEY` set. Live 10-query sweep 2026-10-15 returned 10/10 HTTP 200, 0 errors. Replaces Brave/DDG scraping. Client: `growth-engine/tavily_search.py` |
| Brave Search scraping | **superseded** | HTTP **429** to our egress IP after ~7-8 queries. Tavily replaces it. |
| Bing search scraping | HTTP 200 returned but organic anchors not reliably parseable here |
| DuckDuckGo HTML | 202 (anti-bot/rate-limit) on prior runs; Lite endpoint worked 2026-10-12 |

## Secrets handling

Never print secret values into reports or logs. The automations reference
`OPENHANDS_API_KEY` / `GITHUB_TOKEN` by name only; outputs shown in this repo
are redacted.
## Working ✅

| Integration | Evidence | Notes |
|---|---|---|
| OpenHands automation API | `GET /api/automation/v1?limit=1` → 200 (2026-10-12) | `OPENHANDS_API_KEY` present |
| GitHub (repo + API) | `GET /api/github.com/user` → `straightflushplumbing03` (2026-10-12) | token available as `github_token` / `GITHUB_PERSONAL_ACCESS_TOKEN`; repo read/write + PRs |
| Active repo clone | `git fetch origin main` → clean | `straightflushplumbing03/-Up2datewebsiteseo`, branch `main` |
| GitHub Pages deployment | Pages API: `status: built`, CNAME set | legacy build from `main` `/` |
| Site crawler access | `crawler_access_check.sh` exit 0; all UAs 200 (2026-10-12) | ISSUE-001 **resolved** — no `cf-mitigated` |
| Brave Search (conventional proxy) | **28/28 queries HTTP 200 with parseable organic results (2026-10-12 HQ-D run #2)** | Recovered this run; used for the run-#2 sweep (no 429) |
| DuckDuckGo Lite (conventional proxy) | 36/36 queries HTTP 200 with parseable results (2026-10-12 run #1) | Used for the 2026-10-12 run-#1 visibility sweep |
| DuckDuckGo Lite (conventional proxy) | 36/36 queries HTTP 200 with parseable results (2026-10-12) | Used for the 2026-10-12 visibility sweep |
| Bun/curl/dns/TLS checks | see `data/technical_health_history.jsonl` | |

