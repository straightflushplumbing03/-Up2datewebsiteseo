# Integration Status — Straight Flush Growth Engine

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

## Working ✅

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

## Partially working / intermittent ⚠️

| Integration | Issue |
|---|---|
| Brave Search scraping | HTTP **429** to our egress IP on 2026-10-12 (used DuckDuckGo Lite instead) |
| Bing search scraping | HTTP 200 returned but organic anchors not reliably parseable here |
| DuckDuckGo HTML | 202 (anti-bot/rate-limit) on prior runs; Lite endpoint worked 2026-10-12 |

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
| Perplexity | **not testable** | JS app; add secret `PERPLEXITY_API_KEY` to enable the API |
| Notification channel (email/Slack/etc.) | **not configured / not verified** | Owner-approved target (P-005). Slack MCP is not enabled in this environment. |
| Call tracking / lead data | **not connected** | Provider + creds |

## Highest-value integrations to unlock

1. **Perplexity API key** — the cheapest way to get a *real* AI-answer-engine
   visibility signal in-automation.
2. **Google Search Console** — the only reliable source for organic impressions,
   clicks, query, and indexing/coverage data.
3. **Google Business Profile** — local pack visibility is a primary channel for
   "plumber near me" queries.

## Secrets handling

Never print secret values into reports or logs. The automations reference
`OPENHANDS_API_KEY` / `GITHUB_TOKEN` by name only; outputs shown in this repo
are redacted.
