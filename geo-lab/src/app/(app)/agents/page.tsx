import { activityFeed, agentRuns } from "@/lib/queries";
import { AGENT_TEAM } from "@/lib/agents/team";
import { orchestratorDescription } from "@/lib/agents/orchestrator";
import { Card, StatCard, Table, Pill, SectionHeader, statusTone } from "@/components/ui";
import { AgentControls } from "@/components/agent-controls";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const runs = agentRuns(150);
  const activity = activityFeed(120);
  const failed = runs.filter((r) => String(r.status) === "failed");

  const perAgent = AGENT_TEAM.map((a) => ({
    ...a,
    runs: runs.filter((r) => r.agent === a.name).length,
    last: runs.find((r) => r.agent === a.name)?.ts ?? null,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Autonomous Agents"
        subtitle="A coordinated team with a single orchestrator. The orchestrator assigns work, prevents duplicate runs, and records every step."
        right={<AgentControls />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Agent steps" value={runs.length} sub="stored in agent_runs" source="agent_runs" />
        <StatCard label="Failures" value={failed.length} sub={failed.length ? "see below" : "none"} source="agent_runs" tone={failed.length ? "bad" : "good"} />
        <StatCard label="Agents" value={AGENT_TEAM.length} sub="+ orchestrator" source="team" />
        <StatCard label="Activity events" value={activity.length} sub="latest 120" source="activity" />
      </div>

      <Card>
        <SectionHeader title="Chief Intelligence Orchestrator" subtitle="What it does on every run." />
        <ul className="list-disc space-y-1 pl-5 text-xs text-ink-soft">
          {orchestratorDescription().map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionHeader title="The team" subtitle="Each agent has a defined responsibility and a real, runnable action." />
        <Table
          head={["Agent", "Responsibility", "Runs", "Last run"]}
          rows={perAgent.map((a) => [
            <span key="n" className="text-xs font-medium">{a.name}</span>,
            <span key="r" className="text-[11px] text-ink-soft">{a.responsibility}</span>,
            String(a.runs),
            <span key="l" className="text-[10px] text-ink-faint">{a.last ? String(a.last).slice(0, 16) : "never"}</span>,
          ])}
        />
      </Card>

      {failed.length ? (
        <Card className="border-[color:var(--color-bad)]/30">
          <SectionHeader title="Failures & retries" subtitle="Detailed failure records with the reason, for every agent step that failed." />
          <Table
            head={["When", "Agent", "Summary", "Detail"]}
            rows={failed.slice(0, 25).map((r) => [
              <span key="t" className="text-[10px] text-ink-faint">{String(r.ts).slice(0, 16)}</span>,
              <span key="a" className="text-xs">{String(r.agent)}</span>,
              <span key="s" className="text-[11px] text-ink-soft">{String(r.summary ?? "")}</span>,
              <span key="d" className="text-[10px] text-ink-faint">{String(r.detail ?? "").slice(0, 120)}</span>,
            ])}
          />
        </Card>
      ) : null}

      <Card>
        <SectionHeader title="Activity log" subtitle="Live feed. Each entry links to its underlying evidence." />
        <div className="space-y-2">
          {activity.map((a, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-[color:var(--color-line)]/60 pb-2 last:border-0">
              <span className="w-32 shrink-0 text-[10px] text-ink-faint tabular">{String(a.ts).slice(0, 16)}</span>
              <Pill tone={statusTone(String(a.level))}>{String(a.agent)}</Pill>
              <span className="flex-1 text-xs text-ink-soft">{String(a.message)}</span>
              {a.evidence ? <code className="text-[10px] text-ink-faint">{String(a.evidence).slice(0, 40)}</code> : null}
            </div>
          ))}
          {!activity.length ? <div className="text-xs text-ink-faint">No activity yet.</div> : null}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Agent run history" subtitle="Every orchestrator step, newest first." />
        <Table
          head={["When", "Agent", "Status", "Summary", "Duration"]}
          empty="No runs yet."
          rows={runs.slice(0, 60).map((r) => [
            <span key="t" className="text-[10px] text-ink-faint">{String(r.ts).slice(0, 16)}</span>,
            <span key="a" className="text-xs">{String(r.agent)}</span>,
            <Pill key="s" tone={statusTone(String(r.status))}>{String(r.status)}</Pill>,
            <span key="m" className="text-[11px] text-ink-soft">{String(r.summary ?? "")}</span>,
            <span key="d" className="text-[10px] text-ink-faint">{r.duration_ms ? `${r.duration_ms}ms` : "—"}</span>,
          ])}
        />
      </Card>
    </div>
  );
}
