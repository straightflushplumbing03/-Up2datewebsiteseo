import { crawlRepo, auditSite, sitemapUrls } from "@/lib/engine/site";
import { pagesList } from "@/lib/queries";
import { Card, StatCard, Table, Pill, SectionHeader, Bar } from "@/components/ui";
import { RescoreButton } from "@/components/rescore-button";

export const dynamic = "force-dynamic";

export default async function WebsitePage() {
  const pages = crawlRepo();
  const audit = auditSite(pages);
  const stored = pagesList();
  const sm = sitemapUrls();
  const indexable = pages.filter((p) => p.indexable);

  const bySeverity = (s: string) => audit.issues.filter((i) => i.severity === s).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Website Intelligence"
        subtitle="Technical and content audit of the live repository. The committed .html files ARE the site (no build step)."
        right={<RescoreButton url="" />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="HTML files" value={pages.length} sub={`${indexable.length} indexable · ${audit.noindexPages} noindex`} source="repo crawl" />
        <StatCard label="Sitemap URLs" value={sm.length} sub={audit.orphans.length ? `${audit.orphans.length} orphan(s)` : "matches indexable set"} source="sitemap.xml" tone={audit.orphans.length ? "warn" : "good"} />
        <StatCard label="Audit issues" value={audit.issues.length} sub={`${bySeverity("critical")} crit · ${bySeverity("high")} high · ${bySeverity("medium")} med · ${bySeverity("low")} low`} source="audit engine" tone={bySeverity("critical") + bySeverity("high") ? "bad" : audit.issues.length ? "warn" : "good"} />
        <StatCard label="Broken internal links" value={audit.brokenInternalLinks.length} source="link checker" tone={audit.brokenInternalLinks.length ? "bad" : "good"} />
        <StatCard label="Content gaps" value={audit.contentGaps.length} source="gap analysis" tone={audit.contentGaps.length ? "warn" : "good"} />
      </div>

      <Card>
        <SectionHeader title="Audit issues" subtitle="Every issue is a measured, reproducible finding — not generic advice." />
        <Table
          head={["Severity", "Code", "URL", "Finding"]}
          empty="No issues found — the site passes all checks."
          rows={audit.issues.slice(0, 60).map((i) => [
            <Pill key="s" tone={i.severity === "critical" || i.severity === "high" ? "bad" : i.severity === "medium" ? "warn" : "muted"}>{i.severity}</Pill>,
            <code key="c" className="text-[11px]">{i.code}</code>,
            <span key="u" className="text-xs">{i.url.replace("https://straightflushplumbingoc.com", "")}</span>,
            <span key="m" className="text-xs text-ink-soft">{i.message}</span>,
          ])}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Content gaps" subtitle="Derived from verified services/cities vs. what exists, measured — not guessed." />
          <Table
            head={["Kind", "Label", "Evidence", "Suggestion"]}
            empty="No content gaps detected."
            rows={audit.contentGaps.map((g) => [
              <Pill key="k" tone="muted">{g.kind}</Pill>,
              <span key="l" className="text-xs font-medium">{g.label}</span>,
              <span key="e" className="text-[11px] text-ink-soft">{g.evidence}</span>,
              <span key="s" className="text-[11px] text-ink-soft">{g.suggestion}</span>,
            ])}
          />
        </Card>

        <Card>
          <SectionHeader title="Page inventory & GEO score" subtitle="Indexable pages with their latest stored GEO score." />
          <Table
            head={["Page", "Words", "JSON-LD", "H1", "Schema types", "GEO"]}
            empty="No pages."
            rows={[...stored]
              .filter((p) => Number(p.indexable) === 1)
              .slice(0, 60)
              .map((p) => [
                <span key="u" className="text-xs">{String(p.url).replace("https://straightflushplumbingoc.com", "")}</span>,
                String(p.word_count ?? "—"),
                String(p.jsonld_blocks ?? 0),
                String(p.h1_count ?? 0),
                <span key="s" className="text-[10px] text-ink-faint">{String(p.schema_types ?? "").replace(/[\[\]"]/g, "").slice(0, 40)}</span>,
                <div key="g" className="flex items-center gap-2">
                  <span className="tabular text-xs font-semibold">{p.geo_overall ? Number(p.geo_overall) : "—"}</span>
                  <div className="w-14"><Bar value={Number(p.geo_overall ?? 0)} tone={Number(p.geo_overall ?? 0) >= 70 ? "good" : Number(p.geo_overall ?? 0) >= 55 ? "brand" : "warn"} /></div>
                </div>,
              ])}
          />
        </Card>
      </div>

      <Card>
        <SectionHeader title="Sitemap & indexability" subtitle="The URL set must match the indexable page set exactly (the repo's own CI invariant)." />
        <div className="flex flex-wrap gap-3 text-xs">
          <Pill tone="good">sitemap URLs: {sm.length}</Pill>
          <Pill tone="good">indexable: {indexable.length}</Pill>
          <Pill tone="muted">noindex stubs: {audit.noindexPages}</Pill>
          {audit.orphans.length ? <Pill tone="warn">orphans: {audit.orphans.length}</Pill> : <Pill tone="good">no orphans</Pill>}
        </div>
      </Card>
    </div>
  );
}
