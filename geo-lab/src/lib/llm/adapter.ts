/**
 * Provider-agnostic LLM adapter.
 *
 * Nothing in the lab hard-wires a vendor. A caller either passes a provider
 * or sets LLM_PROVIDER to one of: openai, anthropic, google, xai, perplexity.
 * If neither is set, the call fails with that fact — it does not guess.
 *
 * These calls are measurements or drafts. A transport error is a failure,
 * never an empty answer that could be mistaken for "the model said nothing
 * about the company."
 */

export const LLM_PROVIDERS = ["openai", "anthropic", "google", "xai", "perplexity"] as const;
export type LlmProviderName = (typeof LLM_PROVIDERS)[number];

export interface LlmCall {
  provider: LlmProviderName;
  apiKey: string;
  model?: string;
  input: string;
  /** Ask for a web-grounded answer when the provider supports it. */
  webSearch?: boolean;
}

export interface LlmSuccess {
  ok: true;
  provider: LlmProviderName;
  model: string;
  text: string;
  citations: string[];
}

export interface LlmFailure {
  ok: false;
  provider: LlmProviderName;
  httpStatus: number | null;
  error: string;
}

const DEFAULT_MODELS: Record<LlmProviderName, string> = {
  openai: "gpt-4.1-mini",
  anthropic: "claude-sonnet-4-5",
  google: "gemini-2.5-flash",
  xai: "grok-4",
  perplexity: "sonar",
};

const ENV_KEY: Record<LlmProviderName, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GEMINI_API_KEY",
  xai: "XAI_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
};

export function llmApiKey(provider: LlmProviderName): string | undefined {
  const value = process.env[ENV_KEY[provider]];
  return value && value.trim() ? value.trim() : undefined;
}

export function resolveLlmSelection(
  explicit?: string,
): { provider: LlmProviderName; apiKey: string; model: string } | { error: string } {
  const name = (explicit || process.env.LLM_PROVIDER || "").trim().toLowerCase();
  if (!name) {
    return {
      error: "LLM_PROVIDER is unset. Set it to openai, anthropic, google, xai, or perplexity. No vendor is assumed.",
    };
  }
  if (!(LLM_PROVIDERS as readonly string[]).includes(name)) {
    return { error: `LLM_PROVIDER=${name} is not one of ${LLM_PROVIDERS.join(", ")}.` };
  }
  const provider = name as LlmProviderName;
  const apiKey = llmApiKey(provider);
  if (!apiKey) return { error: `${ENV_KEY[provider]} is not set.` };
  const model = process.env.LLM_MODEL || DEFAULT_MODELS[provider];
  return { provider, apiKey, model };
}

export async function completeLlm(call: LlmCall): Promise<LlmSuccess | LlmFailure> {
  const model = call.model || process.env.LLM_MODEL || DEFAULT_MODELS[call.provider];
  try {
    switch (call.provider) {
      case "openai":
        return await openai(call.apiKey, model, call.input, call.webSearch === true);
      case "anthropic":
        return await anthropic(call.apiKey, model, call.input, call.webSearch === true);
      case "google":
        return await google(call.apiKey, model, call.input, call.webSearch === true);
      case "xai":
        return await xai(call.apiKey, model, call.input, call.webSearch === true);
      case "perplexity":
        return await perplexity(call.apiKey, model, call.input);
      default:
        return { ok: false, provider: call.provider, httpStatus: null, error: "Unknown provider." };
    }
  } catch (e) {
    return { ok: false, provider: call.provider, httpStatus: null, error: (e as Error).message };
  }
}

async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<{ status: number; json: unknown; text: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45_000),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, text };
}

function fail(provider: LlmProviderName, status: number, text: string): LlmFailure {
  const reason = text.match(/"message"\s*:\s*"([^"]+)"/)?.[1] ?? text.slice(0, 240);
  return { ok: false, provider, httpStatus: status, error: `HTTP ${status}: ${reason}` };
}

function citationsFrom(value: unknown): string[] {
  const found = new Set<string>();
  walk(value, found, 0);
  return [...found].filter((u) => /^https?:\/\//.test(u) && !/api\.(openai|anthropic|x\.ai|perplexity)\.com/i.test(u)).slice(0, 20);
}

function walk(value: unknown, into: Set<string>, depth: number): void {
  if (depth > 8 || value == null) return;
  if (typeof value === "string") {
    if (/^https?:\/\//.test(value)) into.add(value.split("?")[0] ? value : value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) walk(v, into, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) walk(v, into, depth + 1);
  }
}

function responseText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as Record<string, unknown>;
  if (typeof d.output_text === "string") return d.output_text;
  const parts: string[] = [];
  const output = d.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) continue;
      for (const block of content) {
        const text = (block as { text?: unknown }).text;
        if (typeof text === "string") parts.push(text);
      }
    }
  }
  const choices = d.choices as { message?: { content?: unknown } }[] | undefined;
  const content = choices?.[0]?.message?.content;
  if (typeof content === "string") parts.push(content);
  const candidates = d.candidates as { content?: { parts?: { text?: string }[] } }[] | undefined;
  const gparts = candidates?.[0]?.content?.parts ?? [];
  for (const p of gparts) if (p.text) parts.push(p.text);
  const blocks = d.content;
  if (Array.isArray(blocks)) {
    for (const b of blocks) {
      const text = (b as { text?: unknown }).text;
      if (typeof text === "string") parts.push(text);
    }
  }
  return parts.join("\n").trim();
}

async function openai(apiKey: string, model: string, input: string, webSearch: boolean): Promise<LlmSuccess | LlmFailure> {
  const body: Record<string, unknown> = { model, input };
  if (webSearch) body.tools = [{ type: "web_search" }];
  const res = await postJson("https://api.openai.com/v1/responses", { Authorization: `Bearer ${apiKey}` }, body);
  if (res.status >= 400) return fail("openai", res.status, res.text);
  return { ok: true, provider: "openai", model, text: responseText(res.json), citations: citationsFrom(res.json) };
}

async function anthropic(apiKey: string, model: string, input: string, webSearch: boolean): Promise<LlmSuccess | LlmFailure> {
  const body: Record<string, unknown> = {
    model,
    max_tokens: 1024,
    messages: [{ role: "user", content: input }],
  };
  if (webSearch) body.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
  const res = await postJson(
    "https://api.anthropic.com/v1/messages",
    { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body,
  );
  if (res.status >= 400) return fail("anthropic", res.status, res.text);
  return { ok: true, provider: "anthropic", model, text: responseText(res.json), citations: citationsFrom(res.json) };
}

async function google(apiKey: string, model: string, input: string, webSearch: boolean): Promise<LlmSuccess | LlmFailure> {
  const body: Record<string, unknown> = { contents: [{ parts: [{ text: input }] }] };
  if (webSearch) body.tools = [{ google_search: {} }];
  const res = await postJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {},
    body,
  );
  if (res.status >= 400) return fail("google", res.status, res.text);
  const urls = new Set<string>(citationsFrom(res.json));
  const chunks = (res.json as { candidates?: { groundingMetadata?: { groundingChunks?: { web?: { uri?: string } }[] } }[] })
    ?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  for (const c of chunks) if (c.web?.uri) urls.add(c.web.uri);
  return { ok: true, provider: "google", model, text: responseText(res.json), citations: [...urls].slice(0, 20) };
}

async function xai(apiKey: string, model: string, input: string, webSearch: boolean): Promise<LlmSuccess | LlmFailure> {
  // xAI retired search_parameters (HTTP 410). Web search is a Responses tool.
  const body: Record<string, unknown> = { model, input };
  if (webSearch) body.tools = [{ type: "web_search" }];
  const res = await postJson("https://api.x.ai/v1/responses", { Authorization: `Bearer ${apiKey}` }, body);
  if (res.status >= 400) return fail("xai", res.status, res.text);
  return { ok: true, provider: "xai", model, text: responseText(res.json), citations: citationsFrom(res.json) };
}

async function perplexity(apiKey: string, model: string, input: string): Promise<LlmSuccess | LlmFailure> {
  const res = await postJson(
    "https://api.perplexity.ai/chat/completions",
    { Authorization: `Bearer ${apiKey}` },
    { model, messages: [{ role: "user", content: input }] },
  );
  if (res.status >= 400) return fail("perplexity", res.status, res.text);
  const cited = (res.json as { citations?: unknown })?.citations;
  const urls = new Set<string>(citationsFrom(res.json));
  if (Array.isArray(cited)) for (const c of cited) if (typeof c === "string") urls.add(c);
  return { ok: true, provider: "perplexity", model, text: responseText(res.json), citations: [...urls].slice(0, 20) };
}
