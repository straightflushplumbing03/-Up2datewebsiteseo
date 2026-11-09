import { listOpportunities } from "@/lib/engine/optimize";
import { Card, StatCard, Table, Pill, SectionHeader } from "@/components/ui";
import { OpportunityActions } from "@/components/opportunity-actions";
import { RunControls } from "@/components/run-controls";

export const dynamic = "force-dynamic";

export default async function OptimizationPage() {
  const all = listOpportunities();
  const open = all.filter((o) => o.status === "open");
  const byLayer = new Map<string, number>();
  for (const o of open) byLayer.set(o.geoLayer, (byLayer.get(o.geoLayer) ?? 0) + 1);
  const byImpact = (n: number) => open.filter((o) => o.impact === n).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Optimization Engine"
        subtitle="Prioritised, evidence-based work items. Each one names the problem, evidence, affected URL/section, GEO layer, expected benefit and effort."
        right={<RunControls />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open" value={open.length} sub={`of ${all.length} total`} source="opportunities" tone={open.length ? "warn" : "good"} />
        <StatCard label="High impact" value={byImpact(3)} sub="impact 3 of 3" source="opportunities" tone="brand" />
        <StatCard label="In progress" value={all.filter((o) => o.status === "in_progress").length} source="opportunities" />
        <StatCard label="Completed" value={all.filter((o) => o.status === "done").length} source="opportunities" tone="good" />
      </div>

      <Card>
        <SectionHeader title="By GEO layer" subtitle="Where the open work concentrates." />
        <div className="flex flex-wrap gap-2">
          {[...byLayer.entries()].map(([l, n]) => (
            <Pill key={l} tone="brand">{l}: {n}</Pill>
          ))}
          {!byLayer.size ? <span className="text-xs text-ink-faint">No open work.</span> : null}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Work queue" subtitle="Sorted by priority (highest first). Actions are real: they update stored state." />
        <div className="space-y-3">
          {all.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-line)] p-6 text-center text-sm text-ink-faint">
              No opportunities yet — run the daily operations to generate them from a fresh crawl.
            </div>
          ) : null}
          {all.slice(0, 60).map((o) => (
            <details key={o.id} className="rounded-xl border border-[color:var(--color-line)] p-3">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                <Pill tone={o.priority >= 70 ? "bad" : o.priority >= 45 ? "warn" : "muted"}>P{o.priority}</Pill>
                <span className="min-w-[220px] flex-1 text-sm font-medium">{o.title}</span>
                <Pill tone="brand">{o.geoLayer}</Pill>
                <span className="text-[11px] text-ink-faint">{o.difficulty}</span>
                <Pill tone={o.status === "open" ? "warn" : o.status === "done" ? "good" : "muted"}>{o.status}</Pill>
              </summary>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 text-xs">
                  <div><span className="font-semibold text-ink-soft">Problem:</span> {o.problem}</div>
                  <div><span className="font-semibold text-ink-soft">Evidence:</span> <span className="text-ink-soft">{o.evidence}</span></div>
                  <div><span className="font-semibold text-ink-soft">Expected benefit:</span> {o.expectedBenefit}</div>
                  <div><span className="font-semibold text-ink-soft">Proposed solution:</span> {o.proposed}</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div><span className="font-semibold text-ink-soft">URL:</span> <code className="text-[11px]">{o.url ?? "—"}</code></div>
                  <div><span className="font-semibold text-ink-soft">Section:</span> {o.section ?? "—"}</div>
                  <div><span className="font-semibold text-ink-soft">Impact / difficulty:</span> {o.impact}/3 · {o.difficulty}</div>
                  {o.result ? <div><span className="font-semibold text-ink-soft">Result:</span> {o.result}</div> : null}
                  <OpportunityActions id={o.id} status={o.status} />
                </div>
              </div>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
