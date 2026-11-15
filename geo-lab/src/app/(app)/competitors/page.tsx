import { competitorsDetailed } from "@/lib/queries";
import { competitorScorecard } from "@/lib/engine/competitor";
import { Card, StatCard, Table, Pill, SectionHeader, Bar } from "@/components/ui";
import { COMPETITOR_DIRECTORY_NOTE } from "@/lib/notes";
import { listTrackedCompetitors } from "@/lib/engine/tracked-competitors";

export const dynamic = "force-dynamic";

export default async function CompetitorsPage() {
  const { scorecard, observations } = competitorsDetailed();
  const all = competitorScorecard(365);
  const tracked = listTrackedCompetitors();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Competitor Intelligence"
        subtitle="Built only from observed results. A domain appearing for a query is a fact; why it appears is a labelled hypothesis."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Competitor domains" value={all.length} sub="observed in our result sets" source="competitor_observations" />
        <StatCard label="Observations" value={observations.length} sub="raw rows (latest 200 shown)" source="competitor_observations" />
        <StatCard label="Top domain" value={all[0]?.domain ?? "—"} sub={all[0] ? `${all[0].appearances} appearances` : "no data"} source="share of voice" />
        <StatCard label="Lead-gen/aggregator share" value={`${leadgenShare(all)}%`} sub="yelp, angi, homeadvisor…" source="derived" tone="warn" />
      </div>

      <Card>
        <SectionHeader
          title="Laguna Niguel competitors"
          subtitle="Owner-named businesses were checked on their own sites. Discovered domains are counted from stored search results, not from a live ranking."
        />
        <Table
          head={["Business", "Domain", "How we know", "Office", "Times in stored Laguna Niguel results"]}
          empty="No tracked competitors yet. Run the competitor agent."
          rows={tracked.map((c) => [
            c.name ?? "Name not verified",
            c.domain,
            c.origin === "owner_named"
              ? "Owner-named"
              : c.origin === "owner_named_and_discovered"
                ? "Owner-named, and in stored results"
                : "Discovered",
            c.homeCity ?? "Not verified",
            c.appearances == null ? "—" : String(c.appearances),
          ])}
        />
        <p className="mt-3 text-[11px] text-ink-faint">
          American Leak Detection’s Orange County office publishes an Anaheim address and lists Laguna Niguel as a city it serves. Efficient Plumbing publishes a Laguna Niguel address. Counts are how often the domain showed up in stored results. They are not a rank.
        </p>
      </Card>

      <Card>
        <SectionHeader title="Competitor scorecard" subtitle="Ranked by observed appearances across all measured queries." />
        <Table
          head={["Domain", "Appearances", "Share", "Platforms", "Services seen", "Cities seen", "Observed feature"]}
          empty="No competitor observations ingested yet."
          rows={all.slice(0, 30).map((c) => [
            <span key="d" className="text-xs font-medium">{c.domain}</span>,
            String(c.appearances),
            <div key="s" className="flex items-center gap-2">
              <span className="w-10 tabular text-xs">{c.shareOfVoice}%</span>
              <div className="w-16"><Bar value={c.shareOfVoice} max={Math.max(10, all[0]?.shareOfVoice ?? 10)} /></div>
            </div>,
            <span key="p" className="text-[10px] text-ink-faint">{c.platforms.slice(0, 2).join(", ")}</span>,
            <span key="sv" className="text-[10px] text-ink-faint">{c.topServices.join(", ") || "—"}</span>,
            <span key="cy" className="text-[10px] text-ink-faint">{c.topCities.join(", ") || "—"}</span>,
            <span key="f" className="text-[10px] text-ink-soft">{c.observedFeatures[0]?.slice(0, 70) ?? "—"}</span>,
          ])}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="What the data supports" subtitle="Observed patterns, clearly separated from interpretation." />
          <div className="space-y-3 text-xs">
            <div>
              <Pill tone="good">Observed</Pill>
              <p className="mt-1 text-ink-soft">
                Yelp, Angi, HomeAdvisor and similar aggregators appear in nearly every result set for local plumbing intent — they are the most
                consistent visibility channel, and being present on them is the durable lever.
              </p>
            </div>
            <div>
              <Pill tone="brand">Hypothesis</Pill>
              <p className="mt-1 text-ink-soft">
                Non-local and programmatic pages (broad <code>areaServed</code> lists, per-city subdomains) surface for South-OC intent. This is a
                cautionary pattern, not a tactic: the repo rule is that service-area cities are declared only when genuinely served.
              </p>
            </div>
            <div>
              <Pill tone="warn">Limitation</Pill>
              <p className="mt-1 text-ink-soft">
                Conventional-search proxies and AI answers vary run to run. Presence is evidence a competitor has a feature; it is not proof the
                feature caused the visibility.
              </p>
            </div>
            <p className="text-[11px] text-ink-faint">{COMPETITOR_DIRECTORY_NOTE}</p>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Raw observations" subtitle="Latest rows with platform, query, feature and confidence." />
          <Table
            head={["When", "Domain", "Platform", "Query", "Feature", "Conf."]}
            empty="No observations."
            rows={observations.slice(0, 40).map((o) => [
              <span key="t" className="text-[10px] text-ink-faint">{String(o.ts).slice(0, 10)}</span>,
              <span key="d" className="text-xs">{String(o.domain)}</span>,
              <span key="p" className="text-[10px] text-ink-soft">{String(o.platform)}</span>,
              <span key="q" className="text-[10px] text-ink-soft">{String(o.query ?? "").slice(0, 50)}</span>,
              <span key="f" className="text-[10px] text-ink-faint">{String(o.observed_feature ?? "—").slice(0, 40)}</span>,
              <span key="c" className="text-[10px] text-ink-faint">{String(o.confidence ?? "—")}</span>,
            ])}
          />
        </Card>
      </div>
    </div>
  );
}

function leadgenShare(all: { domain: string; appearances: number }[]): number {
  const leadgen = ["yelp.com", "angi.com", "homeadvisor.com", "thumbtack.com", "facebook.com", "instagram.com", "mapquest.com", "porch.com"];
  const total = all.reduce((a, c) => a + c.appearances, 0) || 1;
  const lg = all.filter((c) => leadgen.includes(c.domain)).reduce((a, c) => a + c.appearances, 0);
  return Math.round((lg / total) * 1000) / 10;
}
