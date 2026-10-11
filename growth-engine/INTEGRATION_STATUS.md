# Integration Status — Straight Flush Growth Engine

Verified 2026-10-09 in the active OpenHands Cloud environment. A check is only
marked ✅ after an actual successful call.

## Working ✅

| Integration | Evidence | Notes |
|---|---|---|
| OpenHands automation API | `GET /api/automation/v1` → 200 | `OPENHANDS_API_KEY` present |
| GitHub (repo + API) | `gh api user` → `straightflushplumbing03` | `GITHUB_TOKEN`; scopes enough for repo read/write + PRs |
| Active repo clone | `git fetch origin main` | `straightflushplumbing03/-Up2datewebsiteseo`, branch `main` |
| GitHub Pages deployment | Pages API: `status: built`, CNAME set | legacy build from `main` `/` |
| Brave Search (conventional proxy) | HTTP 200 with parseable results | Used for competitor baseline |
| Bun/curl/dns/TLS checks | see `data/technical_health_history.jsonl` | |

## Partially working / intermittent ⚠️

| Integration | Issue |
|---|---|
| Bing search scraping | HTTP 200 returned but organic anchors not reliably parseable here |
| DuckDuckGo HTML | 202 (anti-bot/rate-limit) on this run |

## Not available ❌

| Integration | Status | Needed to enable |
|---|---|---|
| Google Search Console | **not connected** | OAuth/API credentials or owner export; needed for impressions/clicks/indexing |
| Google Analytics 4 | **not connected** | GA4 property ID + API creds or owner report |
| Google Business Profile performance | **not connected** | GBP API access or owner export |
| Google Search AI Overviews / AI Mode | **not testable** | No SERP API key; SERP served as JS shell to curl |
| ChatGPT Search | **not testable** | chatgpt.com 403 to non-browser clients |
| Claude web search | **not testable** | not scriptable in this environment |
| Gemini | **not testable** | — |
| Microsoft Copilot | **not testable** | — |
| Grok | **not testable** | — |
| Perplexity | **not testable** | JS app; add Perplexity API key to enable |
| Notification channel (email/Slack/etc.) | **not configured / not verified** | Owner-approved notification target; Slack MCP not enabled |
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
