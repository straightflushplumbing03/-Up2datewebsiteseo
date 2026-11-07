import { researchNotes, listQueries } from "@/lib/queries";
import { Card, StatCard, Table, Pill, SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const notes = researchNotes();
  const queries = listQueries();
  const families = [...new Set(queries.map((q) => String(q.family)))];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Research Library"
        subtitle="The permanent operational knowledge base: platform behaviour, retrieval patterns, and the full standardized query library."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Research notes" value={notes.length} source="research_notes" />
        <StatCard label="Query families" value={families.length} source="queries" />
        <StatCard label="Total queries" value={queries.length} source="queries" />
        <StatCard label="Highest-priority queries" value={queries.filter((q) => q.priority === 1).length} sub="tested first in every sweep" source="queries" />
      </div>

      <Card>
        <SectionHeader title="Research notes" subtitle="Durable findings about how AI and search systems retrieve and cite local businesses." />
        <Table
          head={["When", "Topic", "Title", "Body", "Source", "Tags"]}
          empty="No research notes yet."
          rows={notes.map((n) => [
            <span key="t" className="text-[10px] text-ink-faint">{String(n.ts).slice(0, 10)}</span>,
            <span key="tp" className="text-xs font-medium">{String(n.topic)}</span>,
            <span key="ti" className="text-[11px] font-medium">{String(n.title)}</span>,
            <span key="b" className="text-[11px] text-ink-soft">{String(n.body).slice(0, 240)}</span>,
            <span key="s" className="text-[10px] text-ink-faint">{String(n.source ?? "")}</span>,
            <span key="tg" className="text-[10px] text-ink-faint">{String(n.tags ?? "").slice(0, 40)}</span>,
          ])}
        />
      </Card>

      <Card>
        <SectionHeader title="Query library" subtitle="150+ standardized queries across services, cities and cross-cutting intent." />
        <div className="mb-3 flex flex-wrap gap-2">
          {families.map((f) => (
            <Pill key={f} tone="brand">{f}: {queries.filter((q) => q.family === f).length}</Pill>
          ))}
        </div>
        <Table
          head={["Query", "Family", "Intent", "Geo", "Service", "Priority"]}
          rows={queries.map((q) => [
            <span key="t" className="text-xs">{String(q.text)}</span>,
            <Pill key="f" tone="muted">{String(q.family)}</Pill>,
            <span key="i" className="text-[11px] text-ink-soft">{String(q.intent)}</span>,
            <span key="g" className="text-[11px]">{String(q.city ?? "—")}</span>,
            <span key="s" className="text-[11px]">{String(q.service ?? "—")}</span>,
            `P${q.priority}`,
          ])}
        />
      </Card>
    </div>
  );
}
