import { listReports, getReport, costEstimate } from "@/lib/reporting";
import { Card, StatCard, SectionHeader, Pill, Table } from "@/components/ui";
import { ReportControls } from "@/components/report-controls";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ id?: string; period?: string }> }) {
  const params = await searchParams;
  const reports = listReports();
  const selectedId = params.id ? Number(params.id) : reports[0] ? Number(reports[0].id) : null;
  const selected = selectedId ? getReport(selectedId) : null;
  const costs = costEstimate();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reports"
        subtitle="Daily, weekly and monthly reports generated from stored measurements. Missing data is stated as a limitation, never as zero."
        right={<ReportControls />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Reports" value={reports.length} source="reports" />
        <StatCard label="Daily" value={reports.filter((r) => r.period === "daily").length} source="reports" />
        <StatCard label="Weekly" value={reports.filter((r) => r.period === "weekly").length} source="reports" />
        <StatCard label="Monthly" value={reports.filter((r) => r.period === "monthly").length} source="reports" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <SectionHeader title="History" />
          <div className="space-y-1">
            {reports.length === 0 ? <div className="text-xs text-ink-faint">No reports yet — run a report from the controls above.</div> : null}
            {reports.map((r) => (
              <a
                key={String(r.id)}
                href={`/reports?id=${r.id}`}
                className={`block rounded-lg px-3 py-2 text-xs transition-colors ${
                  Number(r.id) === selectedId ? "bg-[color:var(--color-brand-soft)] font-semibold text-[color:var(--color-brand-dark)]" : "text-ink-soft hover:bg-[color:var(--color-canvas)]"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{String(r.title)}</span>
                  <Pill tone="muted">{String(r.period)}</Pill>
                </span>
              </a>
            ))}
          </div>
        </Card>

        <Card>
          {selected ? (
            <>
              <SectionHeader title={String(selected.title)} subtitle={`Generated ${String(selected.ts).slice(0, 16)}`} />
              <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl bg-[color:var(--color-canvas)] p-4 text-[12px] leading-relaxed text-ink-soft">
                {String(selected.body)}
              </pre>
            </>
          ) : (
            <div className="p-6 text-center text-sm text-ink-faint">No report selected. Generate one to view it here.</div>
          )}
        </Card>
      </div>

      <Card>
        <SectionHeader title="Operating cost estimate" subtitle="Real usage counts plus known plan prices. The lab is designed to run on free tiers." />
        <Table
          head={["Provider", "Category", "Units", "Estimated USD / month", "Note"]}
          rows={costs.rows.map((r) => [
            r.provider,
            <Pill key="c" tone="muted">{r.category}</Pill>,
            `${r.units} ${r.unitLabel}`,
            `$${r.estUsd.toFixed(2)}`,
            <span key="n" className="text-[11px] text-ink-soft">{r.note}</span>,
          ])}
        />
        <div className="mt-3 text-sm font-semibold">Estimated total: ${costs.total.toFixed(2)} / month</div>
      </Card>
    </div>
  );
}
