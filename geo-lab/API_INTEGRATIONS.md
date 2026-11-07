# API Integrations

Every integration below reports its **real, currently-observed** status. The
registry lives in `src/lib/integrations.ts`; the provider adapters in
`src/lib/engine/providers.ts`. A status is only `connected` when a live probe in
this environment succeeded.

## Status vocabulary

| Status | Meaning |
|---|---|
| `connected` | Verified reachable/authorised in this environment |
| `needs_auth` | Credential required and not present |
| `disconnected` | Not configured (OAuth not completed) |
| `not_testable` | No permitted programmatic interface exists |
| `rate_limited` | Credential present but the provider refused due to quota |
| `error` | A probe was attempted and failed |

## AI / search visibility providers

| Platform | Test type | Status here | Why / what is needed |
|---|---|---|---|
| **Tavily Search** | `conventional_proxy` | **connected** | Working. Returns real result URLs, used as the conventional-search proxy. Requires `Tavily_api_key`. |
| **Gemini** | `ai_platform` | needs_auth | `GEMINI_API_KEY` must be an `AIza…` Google AI Studio key. A Vertex-style service-account token returns HTTP 401 here. |
| **Google AI Overviews / AI Mode** | `ai_platform` | not_testable | No SERP API key. The SERP is a JS shell to non-browser clients and returns a CAPTCHA from this egress IP. Owner manual sweep is supported. |
| **ChatGPT Search** | `ai_platform` | not_testable | `chatgpt.com` returns 403 to non-browser clients; no `OPENAI_API_KEY` present. Set the key to enable the probe. |
| **Claude web search** | `ai_platform` | not_testable | Not scriptable here without `ANTHROPIC_API_KEY`. Manual sweep supported. |
| **Perplexity** | `ai_platform` | not_testable | `PERPLEXITY_API_KEY` not set. Metered, no free tier — optional second engine. |
| **Microsoft Copilot** | `ai_platform` | not_testable | Not reachable/testable headlessly from this environment. |
| **Bing Search** | `conventional_proxy` | not_testable | Returns 200 but wraps organic anchors in redirects that do not decode to a result list here. |
| **Apple local discovery** | `manual` | not_testable | No public Apple Maps search API. Owner manual check only. |

**Rule:** a platform that cannot be reached is recorded as `inconclusive`
(UNMEASURED), never as `absent` (0% visibility). `conventional_proxy` results are
never reported as `ai_platform` results.

## Business and analytics integrations

| Integration | Category | Status here | Required env | What it unlocks |
|---|---|---|---|---|
| **GitHub** | Source control | connected (if `GITHUB_TOKEN` set) | `GITHUB_TOKEN` | Branch + PR publishing. The agent never pushes to `main` and never merges. |
| **Google Search Console** | Search analytics | disconnected | `GSC_OAUTH_CLIENT_ID`, `GSC_OAUTH_CLIENT_SECRET`, `GSC_REFRESH_TOKEN` | Impressions, clicks, queries, indexing coverage. Scope: `webmasters.readonly`. |
| **Google Analytics 4** | Analytics | disconnected | `GA4_PROPERTY_ID`, `GA4_SERVICE_ACCOUNT_JSON` | Site traffic and AI-referral traffic. The site already carries GA4 tag `G-DFS6B1LV4P`. |
| **Google Business Profile** | Local | disconnected | `GBP_OAUTH_CLIENT_ID` + refresh token | Local-pack visibility and review signals. |
| **Bing Webmaster Tools** | Search analytics | disconnected | `BING_WEBMASTER_API_KEY` | Bing indexing and query data. `BingSiteAuth.xml` is already on the site. |
| **PageSpeed Insights** | Technical | not_testable | `PAGESPEED_API_KEY` | Field performance data. Lighthouse runs locally in CI meanwhile. |
| **Cloudflare** | Hosting / security | not_testable | `CLOUDFLARE_API_TOKEN` | Cache purge, crawler-access verification. Crawler access is currently verified directly over HTTP. |

## Connecting an integration

1. Obtain the credential listed above.
2. Add it to the environment of the running lab (never to a repo file).
3. Open **Integrations → Re-check integrations** (or run the daily job). The
   registry re-probes and updates the row.
4. Confirm the status changes to `connected` and the `last_sync` timestamp
   updates.

Until a step is completed, the lab keeps reporting that integration as
unavailable and continues with the rest of its work. It never pretends a
connection exists.

## Cost

The lab is designed to run on free tiers. Only Tavily is metered in the default
configuration, and the query volume is intentionally small (a handful of tests
per run). The Reports and Settings pages show the live estimate from
`costEstimate()`, which is built from real usage counts plus known plan prices.
