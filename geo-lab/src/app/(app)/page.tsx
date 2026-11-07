import { dashboardSummary, geoHistory } from "@/lib/queries";
import { listQueries } from "@/lib/queries";
import { Card, StatCard, LayerBars, Bar, LineChart, Pill, SectionHeader, Table, statusTone, ScoreRing } from "@/components/ui";
import { RunControls } from "@/components/run-controls";
import { COMPANY } from "@/lib/company";

export const dynamic = "force-dynamic";

export default async function CommandCenter() {
  const s = dashboardSummary();
  const history = geoHistory(30);
  const queries = listQueries();
  const testedQueries = queries.filter((q) => Number(q.tested ?? 0) > 0).length;

  const v = s.visibility;
  const lastActivity = s.activity[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Command Center"
        subtitle={`${COMPANY.name} — live GEO operations. Every metric below is read from a stored measurement.`}
        right={<RunControls />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-4 flex items-center gap-4">
          <ScoreRing value={s.geo.overall} size={88} />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Overall GEO diagnostic</div>
            <div className="mt-1 text-xs text-ink-soft">
              {s.geo.pagesScored} pages · {s.geo.sectionsScored} sections
            </div>
            {s.geo.asOf ? <div className="mt-1 text-[10px] text-ink-faint">as of {s.geo.asOf}</div> : null}
          </div>
        </div>
        <StatCard
          label="AI Mention Rate"
          value={`${v.mentionRate}%`}
          sub={`${v.conclusive} conclusive / ${v.total} tests`}
          source={`${v.testType}, last ${v.window.sinceDays}d`}
          tone="brand"
        />
        <StatCard
          label="AI Recommendation Rate"
          value={`${v.recommendationRate}%`}
          sub={`${v.recommended} recommended`}
          source={`${v.testType}, last ${v.window.sinceDays}d`}
          tone={v.recommendationRate > 0 ? "good" : "neutral"}
        />
        <StatCard label="AI Citation Rate" value={`${v.citationRate}%`} sub={`${v.cited} cited our site`} source="visibility_results" tone={v.cited ? "good" : "neutral"} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Website Health" value={`${s.website.indexablePages}`} sub={`indexable pages · ${s.website.issues} audit issues · ${s.website.brokenLinks} broken links`} source={s.website.asOf ?? "crawl"} tone={s.website.brokenLinks ? "warn" : "good"} />
        <StatCard label="Open Opportunities" value={`${s.opportunities.open}`} sub={`of ${s.opportunities.total} total`} source="opportunities" tone={s.opportunities.open ? "warn" : "good"} />
        <StatCard label="Published Improvements" value={`${s.publications.total}`} sub={`${s.publications.verified} verified live`} source="publications" tone="brand" />
        <StatCard label="Integrations" value={`${s.integrations.connected}/${s.integrations.total}`} sub="connected / total" source="integrations" tone={s.integrations.connected ? "good" : "warn"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="GEO diagnostic trend" subtitle="Page-level five-layer roll-up over time (stored scores)." />
          {history.length > 1 ? (
            <LineChart
              points={history.map((h) => ({ date: h.date, overall: h.overall, retrieval: h.retrieval, extractability: h.extractability }))}
              series={[
                { key: "overall", color: "var(--color-brand)" },
                { key: "retrieval", color: "var(--color-good)" },
                { key: "extractability", color: "var(--color-warn)" },
              ]}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-[color:var(--color-line)] p-6 text-center text-sm text-ink-faint">
              Trend appears after two or more scored runs. Currently {history.length} run(s) recorded.
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-ink-soft">
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-[color:var(--color-brand)]" /> overall</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-[color:var(--color-good)]" /> retrieval</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-[color:var(--color-warn)]" /> extractability</span>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Five GEO layers" subtitle="Mean score across scored pages." />
          <LayerBars layers={s.geo.layers} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Visibility by platform" subtitle="Test type is separated: a conventional-search proxy is never shown as an AI platform." />
          <Table
            head={["Platform", "Type", "Conclusive", "Mention rate"]}
            empty="No visibility tests stored yet."
            rows={v.byPlatform.map((p) => [
              p.platform,
              <Pill key="t" tone={p.testType === "ai_platform" ? "brand" : "muted"}>{p.testType.replace("_", " ")}</Pill>,
              `${p.conclusive} / ${p.total}`,
              <div key="r" className="flex items-center gap-2">
                <span className="w-10 tabular text-xs">{p.mentionRate}%</span>
                <div className="w-20"><Bar value={p.mentionRate} tone={p.mentionRate ? "good" : "bad"} /></div>
              </div>,
            ])}
          />
        </Card>

        <Card>
          <SectionHeader title="Competitor share of voice" subtitle="Domains appearing in our measured result sets (last 30 days)." />
          <Table
            head={["Domain", "Appearances", "Share"]}
            empty="No competitor observations yet."
            rows={s.shareOfVoice.slice(0, 8).map((c) => [
              c.domain,
              String(c.appearances),
              <div key="s" className="flex items-center gap-2">
                <span className="w-10 tabular text-xs">{c.share}%</span>
                <div className="w-24"><Bar value={c.share} max={Math.max(10, s.shareOfVoice[0]?.share ?? 10)} /></div>
              </div>,
            ])}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Latest experiments" subtitle="Controlled GEO experiments (spec §8)." />
          <Table
            head={["Code", "Status", "Hypothesis"]}
            empty="No experiments."
            rows={s.experiments.recent.map((e) => [
              <code key="c" className="text-[11px]">{String(e.code)}</code>,
              <Pill key="s" tone={statusTone(String(e.status))}>{String(e.status)}</Pill>,
              <span key="h" className="text-xs text-ink-soft">{String(e.hypothesis).slice(0, 90)}</span>,
            ])}
          />
        </Card>

        <Card>
          <SectionHeader
            title="Autonomous activity"
            subtitle={lastActivity ? `Latest: ${lastActivity.ts}` : "Nothing recorded yet."}
            right={<a href="/agents" className="text-xs font-medium text-[color:var(--color-brand)]">View all →</a>}
          />
          <ul className="space-y-2">
            {s.activity.slice(0, 9).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Pill tone={a.level === "error" ? "bad" : a.level === "warning" ? "warn" : a.level === "success" ? "good" : "muted"}>{a.agent.replace(" Agent", "")}</Pill>
                <span className="text-ink-soft">{a.message}</span>
              </li>
            ))}
            {!s.activity.length ? <li className="text-xs text-ink-faint">No activity yet — run the daily operations.</li> : null}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Query library" value={queries.length} sub={`${testedQueries} tested at least once`} source="queries table" />
        <StatCard label="Service visibility" value={`${v.byService.length} services`} sub={v.byService.slice(0, 3).map((x) => `${x.service} ${x.mentionRate}%`).join(" · ") || "no data"} source="visibility by service" />
        <StatCard label="Geographic visibility" value={`${v.byCity.length} cities`} sub={v.byCity.slice(0, 3).map((x) => `${x.city} ${x.mentionRate}%`).join(" · ") || "no data"} source="visibility by city" />
      </div>

      {s.agents.failed > 0 ? (
        <Card className="border-[color:var(--color-bad)]/30">
          <SectionHeader title="Recent failures" subtitle={`${s.agents.failed} of the last ${s.agents.runs} agent steps failed.`} />
          <Table
            head={["Agent", "Status", "Summary", "When"]}
            rows={s.agents.recent.filter((r) => r.status === "failed").map((r) => [
              r.agent,
              <Pill key="s" tone="bad">{r.status}</Pill>,
              <span key="m" className="text-xs">{r.summary ?? ""}</span>,
              <span key="t" className="text-[11px] text-ink-faint">{r.ts}</span>,
            ])}
          />
        </Card>
      ) : null}

      <p className="text-[11px] text-ink-faint">
        Scores shown are internal diagnostic heuristics, not official platform scores or measured probabilities of AI citation.
        Missing data is reported as unmeasured, never as zero.
      </p>
    </div>
  );
}
