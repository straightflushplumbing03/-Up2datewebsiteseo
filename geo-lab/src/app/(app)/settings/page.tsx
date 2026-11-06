import { COMPANY, LOCKED_FACTS, CLAIM_POLICY } from "@/lib/company";
import { costEstimate } from "@/lib/reporting";
import { query } from "@/lib/db";
import { Card, StatCard, Table, Pill, SectionHeader } from "@/components/ui";
import { SettingsForms } from "@/components/settings-forms";
import { AUTONOMOUS_SCHEDULE } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const costs = costEstimate();
  const costRows = query<Record<string, unknown>>("SELECT * FROM cost_entries ORDER BY id DESC LIMIT 40");
  const auditRows = query<Record<string, unknown>>("SELECT * FROM audit_log ORDER BY id DESC LIMIT 40");

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Company knowledge base, security, autonomous schedule and operating costs." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Owner account" value={COMPANY.email.split("@")[0]} sub={COMPANY.email} source="users" />
        <StatCard label="Sessions" value={query<{ c: number }>("SELECT COUNT(*) c FROM sessions WHERE expires_at > datetime('now')")[0]?.c ?? 0} sub="active" source="sessions" />
        <StatCard label="Audit entries" value={query<{ c: number }>("SELECT COUNT(*) c FROM audit_log")[0]?.c ?? 0} source="audit_log" />
        <StatCard label="Estimated cost" value={`$${costs.total.toFixed(2)}`} sub="per month" source="cost model" tone="good" />
      </div>

      <Card>
        <SectionHeader title="Company knowledge base (locked)" subtitle="These values can only be changed by the owner editing the source of truth. Automation can never alter them." />
        <Table head={["Field", "Value"]} rows={Object.entries(LOCKED_FACTS).map(([k, v]) => [k, <span key="v" className="text-xs">{String(v)}</span>])} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
          <div>
            <Pill tone="good">Claim policy — allowed</Pill>
            <ul className="mt-1 list-disc pl-4 text-ink-soft">{CLAIM_POLICY.allowed.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
          <div>
            <Pill tone="bad">Forbidden</Pill>
            <ul className="mt-1 list-disc pl-4 text-ink-soft">{CLAIM_POLICY.forbidden.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Autonomous schedule" subtitle="Persistent background execution. The lab must not depend on an open browser or terminal." />
        <Table
          head={["Cadence", "Time (America/Los_Angeles)", "Operations"]}
          rows={AUTONOMOUS_SCHEDULE.map((s) => [
            <Pill key="c" tone="brand">{s.cadence}</Pill>,
            s.time,
            <span key="o" className="text-[11px] text-ink-soft">{s.operations.join(" · ")}</span>,
          ])}
        />
        <p className="mt-3 text-[11px] text-ink-faint">
          Delivered by the existing OpenHands daily automation (&ldquo;SFPL Intelligence HQ Daily 6 AM&rdquo;) calling this app&apos;s
          <code> POST /api/run</code> with a bearer token, and a GitHub Actions cron as a secondary heartbeat. Both call the same orchestrator as the
          manual buttons, so behaviour is identical. See AUTONOMOUS_OPERATIONS.md.
        </p>
      </Card>

      <Card>
        <SectionHeader title="Account & maintenance" subtitle="Owner and operator actions. Every action is written to the audit log." />
        <SettingsForms />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Operating cost model" subtitle="Real usage counts and known plan prices." />
          <Table
            head={["Provider", "Category", "Est. USD / month"]}
            rows={costs.rows.map((r) => [r.provider, <Pill key="c" tone="muted">{r.category}</Pill>, `$${r.estUsd.toFixed(2)}`])}
          />
          <div className="mt-3 text-sm font-semibold">Total: ${costs.total.toFixed(2)} / month</div>
          {costRows.length ? (
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Manually recorded costs</div>
              <Table head={["Provider", "Category", "Units", "USD", "Note"]} rows={costRows.map((c) => [String(c.provider), String(c.category), String(c.units), `$${Number(c.est_usd).toFixed(2)}`, String(c.note ?? "")])} />
            </div>
          ) : null}
        </Card>

        <Card>
          <SectionHeader title="Audit log" subtitle="Who did what, to which target, and when." />
          <Table
            head={["When", "Actor", "Action", "Target", "Detail"]}
            empty="No audit entries."
            rows={auditRows.map((a) => [
              <span key="t" className="text-[10px] text-ink-faint">{String(a.ts).slice(0, 16)}</span>,
              <span key="a" className="text-[11px]">{String(a.actor)}</span>,
              <Pill key="ac" tone="muted">{String(a.action)}</Pill>,
              <span key="tg" className="text-[11px]">{String(a.target ?? "—")}</span>,
              <span key="d" className="text-[10px] text-ink-faint">{String(a.detail ?? "").slice(0, 50)}</span>,
            ])}
          />
        </Card>
      </div>
    </div>
  );
}
