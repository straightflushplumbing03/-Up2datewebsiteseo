import { entityData } from "@/lib/queries";
import { entityGraph, siteEntityFacts } from "@/lib/engine/entity";
import { COMPANY, LOCKED_FACTS, SERVICES, CITIES, CLAIM_POLICY } from "@/lib/company";
import { Card, StatCard, Table, Pill, SectionHeader, LineChart } from "@/components/ui";
import { EntityCheckButton } from "@/components/entity-check-button";

export const dynamic = "force-dynamic";

export default async function EntityPage() {
  const { checks, facts, history } = entityData();
  const graph = entityGraph();
  const siteFacts = siteEntityFacts();
  const matched = siteFacts.filter((f) => f.matches).length;
  const consistency = siteFacts.length ? Math.round((matched / siteFacts.length) * 1000) / 10 : 0;
  const liveDup = checks.filter((c) => String(c.verdict) === "live_duplicate");

  const mismatch = siteFacts.filter((f) => !f.matches && f.value !== null);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Entity Intelligence"
        subtitle="Is the business represented consistently and correctly? Checks the site's own schema against the locked knowledge base, and monitors owned duplicate hosts."
        right={<EntityCheckButton />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Schema consistency" value={`${consistency}%`} sub={`${matched}/${siteFacts.length} fields match the knowledge base`} source="index.html JSON-LD" tone={consistency >= 95 ? "good" : consistency >= 80 ? "warn" : "bad"} />
        <StatCard label="Live duplicate hosts" value={liveDup.length} sub="owned hosts still indexable" source="entity_checks" tone={liveDup.length ? "bad" : "good"} />
        <StatCard label="Services modelled" value={SERVICES.length} sub="verified offerings" source="SERVICE_CATALOG" />
        <StatCard label="Cities modelled" value={CITIES.length} sub="published service areas" source="SERVICE_AREAS" />
      </div>

      {mismatch.length ? (
        <Card className="border-[color:var(--color-warn)]/40">
          <SectionHeader title="Discrepancies found" subtitle="The site's schema differs from the locked knowledge base. These need review — never silently reconciled." />
          <Table
            head={["Field", "Site value", "Expected", "Note"]}
            rows={mismatch.map((m) => [
              <code key="f" className="text-[11px]">{m.field}</code>,
              <span key="v" className="text-xs">{m.value ?? "(absent)"}</span>,
              <span key="e" className="text-xs">{m.expected}</span>,
              <span key="n" className="text-[11px] text-ink-soft">{m.note}</span>,
            ])}
          />
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-[color:var(--color-good)]">✓ The site&apos;s identity fields (name, phone, URL, address, areaServed) match the locked knowledge base.</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Owned hosts" subtitle="Canonical site plus owned duplicates. Consolidation is removal, never linking (sameAs would strengthen the stale association)." />
          <Table
            head={["Host", "Verdict", "HTTP", "Robots", "Discrepancy"]}
            empty="No host checks stored yet — run an entity check."
            rows={checks.slice(0, 12).map((c) => [
              <span key="h" className="text-xs">{String(c.host)}</span>,
              <Pill key="v" tone={String(c.verdict) === "canonical" ? "good" : String(c.verdict) === "live_duplicate" ? "bad" : "muted"}>{String(c.verdict)}</Pill>,
              String(c.http_status ?? "—"),
              <span key="r" className="text-[10px] text-ink-faint">{String(c.robots ?? "—").slice(0, 20)}</span>,
              <span key="d" className="text-[10px] text-ink-soft">{String(c.discrepancy ?? "—").slice(0, 70)}</span>,
            ])}
          />
        </Card>

        <Card>
          <SectionHeader title="NAP & identity (locked)" subtitle="Autonomous publishing may never change these values." />
          <Table
            head={["Field", "Value"]}
            rows={Object.entries(LOCKED_FACTS).map(([k, v]) => [k, <span key="v" className="text-xs">{String(v)}</span>])}
          />
        </Card>
      </div>

      {history.length > 1 ? (
        <Card>
          <SectionHeader title="Consistency over time" subtitle="Share of entity facts matching the knowledge base, per day." />
          <LineChart points={history.map((h) => ({ date: h.ts, consistency: Math.round((h.matches / (h.total || 1)) * 100) }))} series={[{ key: "consistency", color: "var(--color-good)" }]} />
        </Card>
      ) : null}

      <Card>
        <SectionHeader title="Entity relationship graph" subtitle={`${graph.nodes.length} nodes, ${graph.edges.length} edges — how the business connects to services, cities, methods and its owner.`} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {graph.edges.slice(0, 30).map((e, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-[color:var(--color-canvas)] px-3 py-2 text-[11px]">
              <span className="font-medium">{graph.nodes.find((n) => n.id === e.from)?.label ?? e.from}</span>
              <span className="text-ink-faint">—{e.relation}→</span>
              <span className="text-ink-soft">{graph.nodes.find((n) => n.id === e.to)?.label ?? e.to}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Claim policy" subtitle="What automation may and may not publish." />
          <div className="space-y-3 text-xs">
            <div>
              <Pill tone="good">Allowed</Pill>
              <ul className="mt-1 list-disc pl-4 text-ink-soft">{CLAIM_POLICY.allowed.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
            <div>
              <Pill tone="warn">Restricted (owner confirmation)</Pill>
              <ul className="mt-1 list-disc pl-4 text-ink-soft">{CLAIM_POLICY.restricted.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
            <div>
              <Pill tone="bad">Forbidden</Pill>
              <ul className="mt-1 list-disc pl-4 text-ink-soft">{CLAIM_POLICY.forbidden.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
            <div>
              <Pill tone="brand">Owner-confirmed facts</Pill>
              <ul className="mt-1 list-disc pl-4 text-ink-soft">
                {CLAIM_POLICY.ownerConfirmed.map((c, i) => <li key={i}>{c.fact} <span className="text-ink-faint">({c.date})</span></li>)}
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Stored entity facts" subtitle="Latest rows from the automated consistency check." />
          <Table
            head={["Source", "Field", "Value", "Expected", "Match"]}
            empty="No facts stored."
            rows={facts.slice(0, 25).map((f) => [
              <span key="s" className="text-[10px] text-ink-faint">{String(f.source).slice(0, 24)}</span>,
              <span key="f" className="text-[11px]">{String(f.field)}</span>,
              <span key="v" className="text-[11px]">{String(f.value ?? "—").slice(0, 30)}</span>,
              <span key="e" className="text-[11px] text-ink-faint">{String(f.expected).slice(0, 30)}</span>,
              f.matches ? <Pill key="m" tone="good">match</Pill> : <Pill key="m" tone="warn">diff</Pill>,
            ])}
          />
        </Card>
      </div>

      <p className="text-[11px] text-ink-faint">
        The canonical business name is exactly &ldquo;{COMPANY.name}&rdquo;. Bare &ldquo;straight flush&rdquo; is deliberately not matched (it is also a poker
        hand). External property edits are owner-only and are never performed by automation.
      </p>
    </div>
  );
}
