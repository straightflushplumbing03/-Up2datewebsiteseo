import { listIntegrations } from "@/lib/integrations";
import { providerRegistry } from "@/lib/engine/providers";
import { providerEnvFromProcess } from "@/lib/agents/orchestrator";
import { Card, StatCard, Table, Pill, SectionHeader, statusTone } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const integrations = listIntegrations();
  const providers = providerRegistry(providerEnvFromProcess());
  const connected = integrations.filter((i) => i.status === "connected");

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Integrations"
        subtitle="Every status below is the result of a real check in this environment. Nothing is shown as connected unless it was verified."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Connected" value={connected.length} sub={`of ${integrations.length} registered`} source="integrations" tone={connected.length ? "good" : "warn"} />
        <StatCard label="AI/search providers live" value={providers.filter((p) => p.available).length} sub={`of ${providers.length} tested`} source="provider probe" tone="brand" />
        <StatCard label="Needs credentials" value={integrations.filter((i) => i.status === "needs_auth" || i.status === "not_testable").length} source="integrations" tone="warn" />
        <StatCard label="Disconnected" value={integrations.filter((i) => i.status === "disconnected").length} source="integrations" />
      </div>

      <Card>
        <SectionHeader title="Status board" subtitle="Provider, category, live status and the exact credential required to enable it." />
        <Table
          head={["Integration", "Category", "Status", "Last sync", "Detail", "Required env"]}
          rows={integrations.map((i) => [
            <span key="l" className="text-xs font-medium">{String(i.label)}</span>,
            <Pill key="c" tone="muted">{String(i.category)}</Pill>,
            <Pill key="s" tone={statusTone(String(i.status))}>{String(i.status)}</Pill>,
            <span key="ls" className="text-[10px] text-ink-faint">{i.last_sync ? String(i.last_sync).slice(0, 16) : "never"}</span>,
            <span key="d" className="text-[11px] text-ink-soft">{String(i.detail)}</span>,
            i.required_env ? <code key="e" className="text-[10px] text-ink-faint">{String(i.required_env)}</code> : <span key="e" className="text-[10px] text-ink-faint">—</span>,
          ])}
        />
      </Card>

      <Card>
        <SectionHeader title="AI / search provider probe" subtitle="The exact reason each provider is available or blocked, as observed now." />
        <Table
          head={["Provider", "Type", "Available", "Reason"]}
          rows={providers.map((p) => [
            <span key="l" className="text-xs">{p.label}</span>,
            <Pill key="t" tone={p.testType === "ai_platform" ? "brand" : "muted"}>{p.testType.replace("_", " ")}</Pill>,
            p.available ? <Pill key="a" tone="good">yes</Pill> : <Pill key="a" tone="bad">no</Pill>,
            <span key="r" className="text-[11px] text-ink-soft">{p.available ? "reachable" : (p.unavailableReason ?? "—")}</span>,
          ])}
        />
      </Card>

      <Card>
        <SectionHeader title="How to connect each integration" subtitle="Owner-side steps. The lab never pretends an integration works when it does not." />
        <div className="space-y-2 text-xs text-ink-soft">
          <p><strong>Google Search Console</strong> — create an OAuth client and a refresh token with <code>webmasters.readonly</code>; set <code>GSC_OAUTH_CLIENT_ID</code>, <code>GSC_OAUTH_CLIENT_SECRET</code>, <code>GSC_REFRESH_TOKEN</code>. Impressions/clicks/queries then become measured.</p>
          <p><strong>Google Analytics 4</strong> — create a service account with Data API access; set <code>GA4_PROPERTY_ID</code> and <code>GA4_SERVICE_ACCOUNT_JSON</code>. AI-referral traffic then becomes measured.</p>
          <p><strong>Bing Webmaster Tools</strong> — generate an API key and set <code>BING_WEBMASTER_API_KEY</code>. BingSiteAuth.xml is already on the site.</p>
          <p><strong>Google Business Profile</strong> — request GBP API access; set <code>GBP_OAUTH_CLIENT_ID</code> and a refresh token. Local-pack visibility then becomes measured.</p>
          <p><strong>Gemini</strong> — <code>GEMINI_API_KEY</code> must be an <code>AIza…</code> Google AI Studio key. A Vertex-style service-account token returns 401 here.</p>
          <p><strong>ChatGPT / Claude / Perplexity</strong> — set <code>OPENAI_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>, <code>PERPLEXITY_API_KEY</code> to enable those probes.</p>
          <p><strong>Cloudflare</strong> — set <code>CLOUDFLARE_API_TOKEN</code> for cache purge / crawl protection checks.</p>
          <p><strong>PageSpeed</strong> — set <code>PAGESPEED_API_KEY</code>; until then, Lighthouse runs locally in CI.</p>
        </div>
      </Card>

      <p className="text-[11px] text-ink-faint">
        Secrets are read from the server environment only. They are never written to the database, logs, reports or browser code.
      </p>
    </div>
  );
}
