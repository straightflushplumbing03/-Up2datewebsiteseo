import { insert, query, queryOne, run as sqlRun } from "./db";
import { providerRegistry, type ProviderEnv } from "./engine/providers";

/**
 * Integration registry (spec §10, §17).
 *
 * Every integration reports a REAL status determined by an actual check in this
 * environment. The screen can never show "connected" for something that was not
 * verified. Missing credentials are surfaced with the exact env var needed.
 */

export type IntegrationStatus = "connected" | "disconnected" | "needs_auth" | "error" | "rate_limited" | "not_testable";

export interface IntegrationRow {
  provider: string;
  label: string;
  category: string;
  status: IntegrationStatus;
  lastSync: string | null;
  lastError: string | null;
  detail: string;
  requiredEnv: string | null;
}

export function seedIntegrations(env: ProviderEnv): void {
  const registry = providerRegistry(env);
  const rows: IntegrationRow[] = [];

  for (const p of registry) {
    rows.push({
      provider: p.id,
      label: p.label,
      category: p.testType === "conventional_proxy" ? "Search" : "AI platform",
      status: p.available ? "connected" : "not_testable",
      lastSync: null,
      lastError: p.available ? null : (p.unavailableReason ?? null),
      detail: p.available ? "Verified reachable in this environment." : (p.unavailableReason ?? "Not reachable."),
      requiredEnv: requiredEnvFor(p.id),
    });
  }

  rows.push(
    {
      provider: "github",
      label: "GitHub (repo + PR publishing)",
      category: "Source control",
      status: process.env.GITHUB_TOKEN ? "connected" : "needs_auth",
      lastSync: null,
      lastError: process.env.GITHUB_TOKEN ? null : "GITHUB_TOKEN not set.",
      detail: process.env.GITHUB_TOKEN ? "Token present; the lab pushes branches and opens PRs." : "No token.",
      requiredEnv: "GITHUB_TOKEN",
    },
    {
      provider: "google_search_console",
      label: "Google Search Console",
      category: "Search analytics",
      status: "disconnected",
      lastSync: null,
      lastError: "No GSC OAuth credentials in this environment.",
      detail: "Impressions, clicks, queries and indexing/coverage are UNVERIFIED — never reported as zero.",
      requiredEnv: "GSC_OAUTH_CLIENT_ID / GSC_REFRESH_TOKEN",
    },
    {
      provider: "google_analytics_4",
      label: "Google Analytics 4",
      category: "Analytics",
      status: "disconnected",
      lastSync: null,
      lastError: "No GA4 Data API credentials in this environment.",
      detail: "Site traffic and AI-referral traffic are UNVERIFIED. The site does carry GA4 tag G-DFS6B1LV4P.",
      requiredEnv: "GA4_PROPERTY_ID / GA4_SERVICE_ACCOUNT_JSON",
    },
    {
      provider: "google_business_profile",
      label: "Google Business Profile",
      category: "Local",
      status: "disconnected",
      lastSync: null,
      lastError: "No GBP API access.",
      detail: "Local pack visibility is UNVERIFIED. Owner-side access required.",
      requiredEnv: "GBP_OAUTH_CLIENT_ID",
    },
    {
      provider: "bing_webmaster",
      label: "Bing Webmaster Tools",
      category: "Search analytics",
      status: "disconnected",
      lastSync: null,
      lastError: "No Bing Webmaster API key.",
      detail: "BingSiteAuth.xml is present on the site; API access is not configured.",
      requiredEnv: "BING_WEBMASTER_API_KEY",
    },
    {
      provider: "pagespeed",
      label: "PageSpeed Insights",
      category: "Technical",
      status: "not_testable",
      lastSync: null,
      lastError: "No PageSpeed API key.",
      detail: "Lighthouse runs locally in CI instead (.github/workflows/site-audits.yml).",
      requiredEnv: "PAGESPEED_API_KEY",
    },
    {
      provider: "cloudflare",
      label: "Cloudflare",
      category: "Hosting / security",
      status: "not_testable",
      lastSync: null,
      lastError: "No Cloudflare API token in this environment.",
      detail: "Crawler access is still verified directly over HTTP (crawler_access_check).",
      requiredEnv: "CLOUDFLARE_API_TOKEN",
    },
  );

  for (const r of rows) {
    const existing = queryOne<{ id: number }>("SELECT id FROM integrations WHERE provider=?", r.provider);
    if (existing) {
      sqlRun(
        "UPDATE integrations SET label=?, category=?, status=?, last_error=?, detail=?, required_env=?, updated_at=datetime('now') WHERE id=?",
        r.label,
        r.category,
        r.status,
        r.lastError,
        r.detail,
        r.requiredEnv,
        existing.id,
      );
    } else {
      insert("integrations", {
        provider: r.provider,
        label: r.label,
        category: r.category,
        status: r.status,
        last_error: r.lastError,
        detail: r.detail,
        required_env: r.requiredEnv,
      });
    }
  }
}

function requiredEnvFor(id: string): string | null {
  const map: Record<string, string> = {
    tavily_search: "Tavily_api_key",
    gemini_search: "GEMINI_API_KEY (must be an AIza… Google AI Studio key)",
    chatgpt_search: "OPENAI_API_KEY",
    perplexity: "PERPLEXITY_API_KEY",
    claude_web_search: "ANTHROPIC_API_KEY",
  };
  return map[id] ?? null;
}

export function listIntegrations() {
  return query<Record<string, unknown>>("SELECT * FROM integrations ORDER BY category, label");
}

export function markSynced(provider: string): void {
  sqlRun("UPDATE integrations SET last_sync=datetime('now') WHERE provider=?", provider);
}
