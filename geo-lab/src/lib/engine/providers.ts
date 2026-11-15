import { mentionsBrand } from "../company";
import { baseDomain, domainOf, unique } from "../util";
import { completeLlm, type LlmProviderName } from "../llm/adapter";

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
  // Being named outranks being cited (fixed 2026-11-10: a first-place Gemini
  // listing was stored as "cited" because this check ran first).
  void query;
  if (named && /recommend|suggest|best|top|consider|call/i.test(answer)) return "recommended";
  if (named) return "mentioned";
  return cited ? "cited" : "absent";
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
/** AIza… keys are Generative Language API keys. Other shapes (AQ.…) are rejected by Google. */
export function geminiKeyUsable(apiKey: string | undefined): { ok: boolean; reason?: string } {
  if (!apiKey) return { ok: false, reason: "GEMINI_API_KEY is not set." };
  if (!apiKey.startsWith("AIza")) {
    return {
      ok: false,
      reason:
        "GEMINI_API_KEY is set but is not an AIza… API key, so Google rejects it (ACCESS_TOKEN_TYPE_UNSUPPORTED). The AI surface is UNMEASURED, not zero.",
    };
  }
  return { ok: true };
}

export function geminiProvider(apiKey: string | undefined, model = process.env.GEMINI_MODEL || "gemini-2.5-flash"): Provider {
  const key = geminiKeyUsable(apiKey);
  return groundedProvider({
    id: "gemini_search",
    label: "Gemini Search API (grounded)",
    provider: "google",
    apiKey: key.ok ? apiKey : undefined,
    model,
    unavailableReason: key.reason,
    note: "Gemini API answer with Google Search grounding. This is the API, not a screenshot of the Gemini app.",
  });
}

function groundedProvider(opts: {
  id: string;
  label: string;
  provider: LlmProviderName;
  apiKey: string | undefined;
  model?: string;
  unavailableReason?: string;
  note: string;
}): Provider {
  return {
    id: opts.id,
    label: opts.label,
    testType: "ai_platform",
    available: Boolean(opts.apiKey),
    unavailableReason: opts.apiKey ? undefined : opts.unavailableReason,
    async run(query: string): Promise<ProviderResult> {
      if (!opts.apiKey) return inconclusive(opts.id, "ai_platform", opts.unavailableReason ?? "No API key.");
      const result = await completeLlm({
        provider: opts.provider,
        apiKey: opts.apiKey,
        model: opts.model,
        input: query,
        webSearch: true,
      });
      if (!result.ok) {
        return inconclusive(opts.id, "ai_platform", `${result.error} UNMEASURED — not zero visibility.`);
      }
      const status = classify(result.text, result.citations, query);
      return {
        platform: opts.id,
        testType: "ai_platform",
        status,
        rank: null,
        answer: result.text || null,
        citedUrls: result.citations,
        competitors: unique(result.citations.map((u) => baseDomain(domainOf(u)))).filter((d) => d && !SF_DOMAINS.some((s) => d.includes(s))).slice(0, 10),
        confidence: "medium",
        note: opts.note,
        engine: result.model,
      };
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
  anthropic?: string;
  xai?: string;
}

/**
 * The full platform registry. `available` reflects reality in THIS environment,
 * so the Integrations screen can never claim a connection that does not exist.
 */
export function providerRegistry(env: ProviderEnv): Provider[] {
  return [
    tavilyProvider(env.tavily),
    geminiProvider(env.gemini),
    groundedProvider({
      id: "chatgpt_search",
      label: "OpenAI web search",
      provider: "openai",
      apiKey: env.openai,
      model: process.env.OPENAI_MODEL,
      unavailableReason: "OPENAI_API_KEY is not set. chatgpt.com itself is not scraped. UNMEASURED, not zero.",
      note: "OpenAI Responses API with the web_search tool. This is not the chatgpt.com consumer product.",
    }),
    groundedProvider({
      id: "claude_web_search",
      label: "Claude web search",
      provider: "anthropic",
      apiKey: env.anthropic,
      model: process.env.ANTHROPIC_MODEL,
      unavailableReason: "ANTHROPIC_API_KEY is not set. UNMEASURED, not zero.",
      note: "Anthropic Messages API with the web_search tool. This is not claude.ai in a browser.",
    }),
    groundedProvider({
      id: "perplexity",
      label: "Perplexity",
      provider: "perplexity",
      apiKey: env.perplexity,
      model: process.env.PERPLEXITY_MODEL,
      unavailableReason: "PERPLEXITY_API_KEY is not set. The API is metered. UNMEASURED, not zero.",
      note: "Perplexity sonar answer with the citations the API returned.",
    }),
    groundedProvider({
      id: "grok_search",
      label: "Grok web search",
      provider: "xai",
      apiKey: env.xai,
      model: process.env.XAI_MODEL,
      unavailableReason: "XAI_API_KEY is not set. grok.com is not scraped. UNMEASURED, not zero.",
      note: "xAI Responses API with the web_search tool. This is not the Grok consumer app.",
    }),
    blockedProvider(
      "google_ai_overviews",
      "Google AI Overviews / AI Mode",
      "No SERP API key; the SERP is a JS shell to non-browser clients and returns a CAPTCHA from this egress IP.",
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
