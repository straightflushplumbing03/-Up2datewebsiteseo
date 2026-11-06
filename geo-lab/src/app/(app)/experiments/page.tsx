import { listExperiments, evaluateVisibilityExperiment } from "@/lib/engine/experiment";
import { Card, StatCard, Table, Pill, SectionHeader, statusTone } from "@/components/ui";
import { ExperimentForm } from "@/components/experiment-form";

export const dynamic = "force-dynamic";

export default async function ExperimentsPage() {
  const experiments = listExperiments();
  const evaluations = experiments.map((e) => ({ code: String(e.code), evaluation: evaluateVisibilityExperiment(String(e.code)) }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="GEO Experiment Lab"
        subtitle="Controlled experiments with a baseline, fixed query wording, and explicit limitations. Nothing here claims causation without controls."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Experiments" value={experiments.length} sub={`${experiments.filter((e) => e.status === "complete").length} complete`} source="experiments" />
        <StatCard label="Planned" value={experiments.filter((e) => e.status === "planned").length} source="experiments" tone="brand" />
        <StatCard label="With result" value={experiments.filter((e) => e.result).length} source="experiments" />
        <StatCard label="Canonical seeds" value={experiments.filter((e) => String(e.code).startsWith("exp-")).length} sub="spec §8 A–F" source="seeded" />
      </div>

      <Card>
        <SectionHeader title="New experiment" subtitle="Every experiment records hypothesis, target, baseline, variables, methodology and evidence." />
        <ExperimentForm />
      </Card>

      <Card>
        <SectionHeader title="Experiment records" subtitle="Permanent historical records with their measured evaluation." />
        <Table
          head={["Code", "Status", "Hypothesis", "Target", "Confidence", "Evaluation"]}
          empty="No experiments yet."
          rows={experiments.map((e) => {
            const ev = evaluations.find((x) => x.code === String(e.code))?.evaluation;
            return [
              <code key="c" className="text-[11px]">{String(e.code)}</code>,
              <Pill key="s" tone={statusTone(String(e.status))}>{String(e.status)}</Pill>,
              <span key="h" className="text-xs text-ink-soft">{String(e.hypothesis).slice(0, 100)}</span>,
              <span key="t" className="text-[10px] text-ink-faint">{String(e.target_url ?? "—")}</span>,
              <span key="cf" className="text-[10px] text-ink-faint">{String(e.confidence ?? "—")}</span>,
              ev ? (
                <span key="e" className="text-[11px]">
                  before {ev.before.mentionRate}% ({ev.before.conclusive}) → after {ev.after.mentionRate}% ({ev.after.conclusive}) = Δ{ev.delta}
                  <br />
                  <span className="text-[10px] text-ink-faint">{ev.sufficientSample ? "sample sufficient" : "sample too small — indicative only"}</span>
                </span>
              ) : (
                <span key="e" className="text-[11px] text-ink-faint">—</span>
              ),
            ];
          })}
        />
      </Card>

      <Card>
        <SectionHeader title="How evaluation works" subtitle="The evaluator compares the mean mention rate in the window before the start date with the window after." />
        <ul className="list-disc space-y-1 pl-5 text-xs text-ink-soft">
          <li>Only conventional-proxy rows are compared (a stable, repeatable signal), and only conclusive tests count.</li>
          <li>A comparison needs ≥5 conclusive tests on each side; otherwise the delta is labelled indicative only.</li>
          <li>AI answers vary run to run and other changes may be concurrent — the result is observational, not proof of causation.</li>
          <li>Query wording is held fixed for trend tracking; the exact string is stored on every result row.</li>
        </ul>
      </Card>
    </div>
  );
}
