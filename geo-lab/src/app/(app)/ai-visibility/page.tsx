import { computeVisibilityMetrics } from "@/lib/engine/visibility";
import { listQueries, visibilityResults } from "@/lib/queries";
import { listIntegrations } from "@/lib/integrations";
import { Card, StatCard, Table, Pill, SectionHeader, Bar, statusTone } from "@/components/ui";
import { VisibilityRunner } from "@/components/visibility-runner";

export const dynamic = "force-dynamic";

export default async function AiVisibilityPage() {
  const metrics = computeVisibilityMetrics({ sinceDays: 90 });
  const results = visibilityResults({ limit: 120 });
  const queries = listQueries();
  const integrations = listIntegrations().filter((i) => i.category === "AI platform" || i.category === "Search");

  const families = [...new Set(queries.map((q) => String(q.family)))];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Visibility"
        subtitle="Measured AI-search and conventional-search visibility. Test types are never merged: a conventional proxy is not an AI platform."
        right={<VisibilityRunner />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Mention rate" value={`${metrics.mentionRate}%`} sub={`${metrics.mentioned + metrics.recommended + metrics.cited} of ${metrics.conclusive} conclusive`} source="visibility_results" tone="brand" />
        <StatCard label="Recommendation rate" value={`${metrics.recommendationRate}%`} sub={`${metrics.recommended} recommended`} source="visibility_results" />
        <StatCard label="Citation rate" value={`${metrics.citationRate}%`} sub={`${metrics.cited} cited our domain`} source="visibility_results" />
        <StatCard label="Test success rate" value={`${metrics.testSuccessRate}%`} sub={`${metrics.inconclusive} inconclusive (unmeasured, not zero)`} source="visibility_runs" tone={metrics.testSuccessRate > 90 ? "good" : "warn"} />
      </div>

      <Card>
        <SectionHeader title="Platform access" subtitle="Only platforms actually reachable in this environment are marked connected. Blocked platforms are shown with the exact reason." />
        <Table
          head={["Platform", "Type", "Status", "Detail / required credential"]}
          empty="No providers registered."
          rows={integrations.map((i) => [
            String(i.label),
            <Pill key="t" tone={i.category === "AI platform" ? "brand" : "muted"}>{String(i.category)}</Pill>,
            <Pill key="s" tone={statusTone(String(i.status))}>{String(i.status)}</Pill>,
            <span key="d" className="text-xs text-ink-soft">{String(i.detail)} {i.required_env ? <code className="text-[10px] text-ink-faint">({String(i.required_env)})</code> : null}</span>,
          ])}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Mention rate by platform" subtitle="Separated by test type." />
          <Table
            head={["Platform", "Type", "Conclusive", "Mention"]}
            empty="No platform results yet — run a sweep."
            rows={metrics.byPlatform.map((p) => [
              p.platform,
              <Pill key="t" tone={p.testType === "ai_platform" ? "brand" : "muted"}>{p.testType.replace("_", " ")}</Pill>,
              `${p.conclusive}/${p.total}`,
              <div key="m" className="flex items-center gap-2">
                <span className="w-10 tabular text-xs">{p.mentionRate}%</span>
                <div className="w-20"><Bar value={p.mentionRate} tone={p.mentionRate ? "good" : "bad"} /></div>
              </div>,
            ])}
          />
        </Card>

        <Card>
          <SectionHeader title="Share of voice" subtitle="Domains appearing in measured result sets." />
          <Table
            head={["Domain", "Appearances", "Share"]}
            empty="No competitor data yet."
            rows={metrics.shareOfVoice.slice(0, 10).map((c) => [
              c.domain,
              String(c.appearances),
              `${c.share}%`,
            ])}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Service-specific visibility" subtitle="Mention rate by service, from query text." />
          <Table head={["Service", "Tests", "Mention rate"]} empty="No data." rows={metrics.byService.map((s) => [s.service, String(s.total), `${s.mentionRate}%`])} />
        </Card>
        <Card>
          <SectionHeader title="Geographic visibility" subtitle="Mention rate by city, from query text." />
          <Table head={["City", "Tests", "Mention rate"]} empty="No data." rows={metrics.byCity.map((c) => [c.city, String(c.total), `${c.mentionRate}%`])} />
        </Card>
      </div>

      <Card>
        <SectionHeader title="Standardized query library" subtitle={`${queries.length} queries across ${families.length} families. Services without a verified page are excluded from offering claims but still tested for visibility.`} />
        <div className="mb-3 flex flex-wrap gap-2">
          {families.map((f) => (
            <Pill key={f} tone="muted">{f} ({queries.filter((q) => q.family === f).length})</Pill>
          ))}
        </div>
        <Table
          head={["Query", "Family", "Intent", "Priority", "Tested", "Last tested"]}
          empty="No queries."
          rows={queries.slice(0, 60).map((q) => [
            <span key="q" className="text-xs">{String(q.text)}</span>,
            <Pill key="f" tone="muted">{String(q.family)}</Pill>,
            <span key="i" className="text-[11px] text-ink-soft">{String(q.intent)}</span>,
            `P${q.priority}`,
            String(q.tested ?? 0),
            <span key="l" className="text-[11px] text-ink-faint">{q.last_tested ? String(q.last_tested).slice(0, 16) : "never"}</span>,
          ])}
        />
        {queries.length > 60 ? <p className="mt-2 text-[11px] text-ink-faint">Showing first 60 of {queries.length}.</p> : null}
      </Card>

      <Card>
        <SectionHeader title="Raw results" subtitle="The exact query, platform, date, status, and cited URLs — stored verbatim." />
        <Table
          head={["When", "Query", "Platform", "Type", "Status", "Rank", "Cited URLs / competitors"]}
          empty="No results yet."
          rows={results.slice(0, 60).map((r) => [
            <span key="t" className="text-[11px] text-ink-faint">{String(r.ts).slice(0, 16)}</span>,
            <span key="q" className="text-xs">{String(r.query)}</span>,
            String(r.platform),
            <Pill key="ty" tone={r.test_type === "ai_platform" ? "brand" : "muted"}>{String(r.test_type).replace("_", " ")}</Pill>,
            <Pill key="s" tone={statusTone(String(r.status))}>{String(r.status)}</Pill>,
            r.rank ? `#${r.rank}` : "—",
            <span key="c" className="text-[10px] text-ink-faint">{(JSON.parse(String(r.cited_urls || "[]")) as string[]).slice(0, 3).join(", ") || (JSON.parse(String(r.competitors || "[]")) as string[]).slice(0, 4).join(", ") || "—"}</span>,
          ])}
        />
      </Card>
    </div>
  );
}
