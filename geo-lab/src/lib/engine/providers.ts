import { mentionsBrand } from "../company";
import { baseDomain, domainOf, unique } from "../util";

/**
 * AI / search visibility providers (spec §4 and §10).
 *
 * Honesty rules baked in (from growth-engine/AI_VISIBILITY_METHODOLOGY.md):
 *  - A provider that cannot be reached returns `inconclusive`, never `absent`.
 *  - A conventional-search proxy (Tavily) is recorded as `conventional_proxy`,
 *    NEVER as an AI-platform result.
 *  - No result is invented. Every row carries the raw evidence.
 *
 * Each provider is a small module so engines can be added or swapped without
 * touching the runner (spec §17 "design integrations so AI providers can be
 * switched").
 */

export type TestType = "ai_platform" | "conventional_proxy" | "manual";

export interface ProviderResult {
  platform: string;
  testType: TestType;
  /** recommended | mentioned | cited | absent | inconclusive */
  status: "recommended" | "mentioned" | "cited" | "absent" | "inconclusive";
  rank: number | null;
  answer: string | null;
  citedUrls: string[];
  competitors: string[];
  confidence: "high" | "medium" | "low";
  note: string;
  /** Which model/engine actually answered (e.g. gemma fallback). */
  engine?: string;
  raw?: unknown;
}

export interface Provider {
  id: string;
  label: string;
  testType: TestType;
  /** Live status of the credential/endpoint for this environment. */
  available: boolean;
  unavailableReason?: string;
  run(query: string): Promise<ProviderResult>;
}

const SF_DOMAINS = ["straightflushplumbingoc.com", "straightflushplumbing"];
const LEADGEN = [
  "yelp.com",
  "angi.com",
  "homeadvisor.com",
  "thumbtack.com",
  "porch.com",
  "facebook.com",
  "instagram.com",
  "mapquest.com",
  "ignitionlabs.com",
  "yellowpages.com",
  "bbb.org",
];

function classify(answer: string, urls: string[], query: string): ProviderResult["status"] {
  const named = mentionsBrand(answer);
  const cited = urls.some((u) => SF_DOMAINS.some((d) => u.includes(d)));
  if (cited) return "cited";
  if (named && /recommend|suggest|best|top|consider|call/i.test(answer)) return "recommended";
  if (named) return "mentioned";
  void query;
  return "absent";
}

/** Tavily Search API — the working conventional-search proxy. */
export function tavilyProvider(apiKey: string | undefined): Provider {
  return {
    id: "tavily_search",
    label: "Tavily Search (conventional proxy)",
    testType: "conventional_proxy",
    available: Boolean(apiKey),
    unavailableReason: apiKey ? undefined : "TAVILY_API_KEY / Tavily_api_key not present in the environment.",
    async run(query: string): Promise<ProviderResult> {
      if (!apiKey) {
        return inconclusive("tavily_search", "conventional_proxy", "No Tavily API key available.");
      }
      try {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            query,
            max_results: 10,
            search_depth: "basic",
            include_answer: false,
          }),
        });
        if (!res.ok) {
          return inconclusive("tavily_search", "conventional_proxy", `Tavily returned HTTP ${res.status}.`);
        }
        const data = (await res.json()) as {
          results?: { url: string; title?: string; content?: string }[];
          answer?: string | null;
        };
        const results = data.results ?? [];
        const urls = results.map((r) => r.url);
        const combined = [data.answer ?? "", ...results.map((r) => `${r.title ?? ""} ${r.content ?? ""}`)].join("\n");
        const status = classify(combined, urls, query);
        const rank = urls.findIndex((u) => SF_DOMAINS.some((d) => u.includes(d)));
        const competitors = unique(
          urls
            .map((u) => baseDomain(domainOf(u)))
            .filter((d) => !LEADGEN.includes(d) && !SF_DOMAINS.some((s) => d.includes(s))),
        ).slice(0, 10);
        return {
          platform: "tavily_search",
          testType: "conventional_proxy",
          status,
          rank: rank >= 0 ? rank + 1 : null,
          answer: data.answer ?? null,
          citedUrls: urls,
          competitors,
          confidence: "medium",
          note: `Tavily Search API ranked ${results.length} web result(s) — CONVENTIONAL SEARCH, NOT an AI-platform result.`,
          raw: { resultCount: results.length },
        };
      } catch (e) {
        return inconclusive("tavily_search", "conventional_proxy", `Tavily request failed: ${(e as Error).message}`);
      }
    },
  };
}

/**
 * Gemini Search API provider. Implemented faithfully, but the credential in
 * this environment is an OAuth-style token (`AQ.…`) that the Generative
 * Language API rejects with HTTP 401 ACCESS_TOKEN_TYPE_UNSUPPORTED, so it is
 * reported as blocked rather than silently skipped.
 */
export function geminiProvider(apiKey: string | undefined, model = "gemini-2.5-flash"): Provider {
  return {
    id: "gemini_search",
    label: "Gemini Search API (grounded)",
    testType: "ai_platform",
    available: false,
    unavailableReason:
      "GEMINI_API_KEY is set but rejected with HTTP 401 ACCESS_TOKEN_TYPE_UNSUPPORTED (the value is not an AIza… API key). The AI surface is UNMEASURED, not zero.",
    async run(query: string): Promise<ProviderResult> {
      if (!apiKey) return inconclusive("gemini_search", "ai_platform", "No Gemini API key available.");
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: query }] }],
              tools: [{ google_search: {} }],
            }),
          },
        );
        if (!res.ok) {
          const body = await res.text();
          const reason = body.match(/"reason"\s*:\s*"([^"]+)"/)?.[1] ?? "";
          return inconclusive(
            "gemini_search",
            "ai_platform",
            `Gemini grounded call returned HTTP ${res.status}${reason ? ` (${reason})` : ""}. UNMEASURED — not zero visibility.`,
          );
        }
        const data = (await res.json()) as {
          candidates?: {
            content?: { parts?: { text?: string }[] };
            groundingMetadata?: { groundingChunks?: { web?: { uri?: string; title?: string } }[] };
          }[];
        };
        const answer = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n") ?? "";
        const urls = (data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [])
          .map((c) => c.web?.uri ?? "")
          .filter(Boolean);
        const status = classify(answer, urls, query);
        return {
          platform: "gemini_search",
          testType: "ai_platform",
          status,
          rank: null,
          answer,
          citedUrls: urls,
          competitors: unique(urls.map((u) => baseDomain(domainOf(u)))).slice(0, 10),
          confidence: "medium",
          note: "Gemini Search-grounded answer with citations.",
          engine: model,
        };
      } catch (e) {
        return inconclusive("gemini_search", "ai_platform", `Gemini request failed: ${(e as Error).message}`);
      }
    },
  };
}

/** A provider that is documented but not reachable from this environment. */
export function blockedProvider(id: string, label: string, reason: string, testType: TestType = "ai_platform"): Provider {
  return {
    id,
    label,
    testType,
    available: false,
    unavailableReason: reason,
    async run(): Promise<ProviderResult> {
      return inconclusive(id, testType, reason);
    },
  };
}

function inconclusive(platform: string, testType: TestType, note: string): ProviderResult {
  return {
    platform,
    testType,
    status: "inconclusive",
    rank: null,
    answer: null,
    citedUrls: [],
    competitors: [],
    confidence: "low",
    note: `${note} Recorded as inconclusive (test not executed) — never as zero visibility.`,
  };
}

export interface ProviderEnv {
  tavily?: string;
  gemini?: string;
  perplexity?: string;
  openai?: string;
}

/**
 * The full platform registry. `available` reflects reality in THIS environment,
 * so the Integrations screen can never claim a connection that does not exist.
 */
export function providerRegistry(env: ProviderEnv): Provider[] {
  return [
    tavilyProvider(env.tavily),
    geminiProvider(env.gemini),
    blockedProvider(
      "google_ai_overviews",
      "Google AI Overviews / AI Mode",
      "No SERP API key; the SERP is a JS shell to non-browser clients and returns a CAPTCHA from this egress IP.",
    ),
    blockedProvider(
      "chatgpt_search",
      "ChatGPT Search",
      "chatgpt.com returns 403 to non-browser clients; no OPENAI_API_KEY is present in this environment.",
    ),
    blockedProvider(
      "claude_web_search",
      "Claude web search",
      "Not scriptable from this environment without a Claude API key; owner manual sweep supported via data/manual.",
    ),
    blockedProvider(
      "perplexity",
      "Perplexity",
      "PERPLEXITY_API_KEY not set. Metered, no free tier — optional second engine.",
    ),
    blockedProvider(
      "copilot",
      "Microsoft Copilot",
      "copilot.microsoft.com is not reachable/testable headlessly from this environment.",
    ),
    blockedProvider(
      "bing_search",
      "Bing Search",
      "Bing returns 200 but wraps organic anchors in redirects that do not decode to a result list here.",
      "conventional_proxy",
    ),
    blockedProvider(
      "apple_local",
      "Apple local discovery (Apple Maps)",
      "No public Apple Maps search API; owner manual check only.",
      "manual",
    ),
  ];
}

export { classify as classifyStatus };
