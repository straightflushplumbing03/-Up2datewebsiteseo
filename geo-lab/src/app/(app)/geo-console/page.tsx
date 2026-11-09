import Link from "next/link";
import { pagesList, pageDetail, geoHistory } from "@/lib/queries";
import { Card, SectionHeader, Pill, ScoreRing, LayerBars, Bar, LineChart, Table } from "@/components/ui";
import { RescoreButton } from "@/components/rescore-button";
import { LAYERS, layerWeights } from "@/lib/engine/geo";

export const dynamic = "force-dynamic";

export default async function GeoConsolePage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const params = await searchParams;
  const pages = pagesList({ indexable: true });
  const selected = params.url ?? String(pages[0]?.url ?? "");
  const detail = selected ? pageDetail(selected) : null;
  const history = geoHistory(30);

  const sectionRows = (detail?.sections ?? []).map((s) => {
    const sc = s.score as Record<string, unknown> | null;
    return {
      ordinal: Number(s.ordinal),
      heading: String(s.heading ?? "(no heading)"),
      words: Number(s.word_count ?? 0),
      overall: sc ? Number(sc.overall) : null,
      retrieval: sc ? Number(sc.retrieval_probability) : null,
      extractability: sc ? Number(sc.extractability) : null,
      entity: sc ? Number(sc.entity_reinforcement) : null,
      authority: sc ? Number(sc.structural_authority) : null,
      memory: sc ? Number(sc.system_memory) : null,
      detail: sc?.detail ? (JSON.parse(String(sc.detail)) as { weaknesses?: string[]; improvements?: string[]; factors?: { key: string; label: string; score: number; factors: { name: string; weight: number; value: number; note: string }[] }[] }) : null,
    };
  });

  const pageScore = detail?.pageScore as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="GEO Console"
        subtitle="Section-level five-layer diagnostics. Each score is explained by named factors; scores are internal heuristics, not platform scores."
        right={<RescoreButton url={selected} />}
      />

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[320px] flex-1">
            <span className="text-xs font-medium text-ink-soft">Page</span>
            <form method="get" className="mt-1 flex gap-2">
              <input
                name="url"
                defaultValue={selected}
                list="page-urls"
                placeholder="https://straightflushplumbingoc.com/..."
                className="w-full rounded-xl border border-[color:var(--color-line)] px-3 py-2 text-sm outline-none focus:border-[color:var(--color-brand)]"
              />
              <datalist id="page-urls">
                {pages.map((p) => (
                  <option key={String(p.url)} value={String(p.url)} />
                ))}
              </datalist>
              <button className="rounded-xl bg-[color:var(--color-brand)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[color:var(--color-brand-dark)]" type="submit">
                Analyze
              </button>
            </form>
          </label>
          <div className="text-[11px] text-ink-faint">{pages.length} indexable pages available.</div>
        </div>
      </Card>

      {!detail ? (
        <Card>
          <p className="text-sm text-ink-soft">
            No stored score for <code>{selected}</code>. Click <strong>Re-score</strong> to analyze it now.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="flex items-center gap-5">
              <ScoreRing value={pageScore ? Number(pageScore.overall) : 0} size={104} />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Overall GEO diagnostic</div>
                <div className="mt-1 truncate text-sm font-medium">{String(detail.page.title ?? selected)}</div>
                <div className="mt-1 text-xs text-ink-soft">
                  {sectionRows.length} sections · {String(detail.page.word_count ?? 0)} words · {String(detail.page.jsonld_blocks ?? 0)} JSON-LD block(s)
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {String(detail.page.indexable) === "1" ? <Pill tone="good">indexable</Pill> : <Pill tone="muted">noindex</Pill>}
                  {String(detail.page.in_sitemap) === "1" ? <Pill tone="good">in sitemap</Pill> : <Pill tone="warn">not in sitemap</Pill>}
                  {Number(detail.page.heading_skips ?? 0) > 0 ? <Pill tone="warn">{String(detail.page.heading_skips)} heading skips</Pill> : null}
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <SectionHeader title="Five layers for this page" subtitle="Mean of the page's sections." />
              <LayerBars
                layers={
                  pageScore
                    ? {
                        "Retrieval Probability": Number(pageScore.retrieval_probability),
                        Extractability: Number(pageScore.extractability),
                        "Entity Reinforcement": Number(pageScore.entity_reinforcement),
                        "Structural Authority": Number(pageScore.structural_authority),
                        "System Memory Readiness": Number(pageScore.system_memory),
                      }
                    : {}
                }
              />
            </Card>
          </div>

          {history.length > 1 ? (
            <Card>
              <SectionHeader title="Site GEO trend (30 days)" subtitle="Every run appends a stored score row, so change is visible over time." />
              <LineChart
                points={history.map((h) => ({ date: h.date, overall: h.overall, entity: h.entity, authority: h.authority }))}
                series={[
                  { key: "overall", color: "var(--color-brand)" },
                  { key: "entity", color: "var(--color-good)" },
                  { key: "authority", color: "var(--color-warn)" },
                ]}
              />
            </Card>
          ) : null}

          <Card>
            <SectionHeader title="Section diagnostics" subtitle="Each row expands to show the exact factors, weaknesses and proposed improvements." />
            <div className="space-y-3">
              {sectionRows.map((s) => (
                <details key={s.ordinal} className="rounded-xl border border-[color:var(--color-line)] p-3">
                  <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold tabular text-ink-faint">#{s.ordinal}</span>
                    <span className="min-w-[200px] flex-1 text-sm font-medium">{s.heading}</span>
                    <span className="text-[11px] text-ink-faint">{s.words} words</span>
                    <span className="flex items-center gap-2">
                      <span className="tabular text-sm font-semibold">{s.overall ?? "—"}</span>
                      <div className="w-24">
                        <Bar value={s.overall ?? 0} tone={(s.overall ?? 0) >= 75 ? "good" : (s.overall ?? 0) >= 55 ? "brand" : (s.overall ?? 0) >= 40 ? "warn" : "bad"} />
                      </div>
                    </span>
                  </summary>
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Layer scores</div>
                      <div className="grid grid-cols-5 gap-2 text-center">
                        {[
                          ["L1", s.retrieval],
                          ["L2", s.extractability],
                          ["L3", s.entity],
                          ["L4", s.authority],
                          ["L5", s.memory],
                        ].map(([l, v]) => (
                          <div key={String(l)} className="rounded-lg bg-[color:var(--color-canvas)] p-2">
                            <div className="text-[10px] text-ink-faint">{l}</div>
                            <div className="tabular text-sm font-semibold">{v ?? "—"}</div>
                          </div>
                        ))}
                      </div>
                      {s.detail?.factors ? (
                        <div className="mt-3 space-y-2">
                          {s.detail.factors.map((f) => (
                            <div key={f.key}>
                              <div className="text-[11px] font-semibold text-ink-soft">{f.label} — {f.score}</div>
                              <ul className="mt-1 space-y-0.5">
                                {f.factors.map((fa) => (
                                  <li key={fa.name} className="text-[11px] text-ink-soft">
                                    <span className={fa.value >= 0.6 ? "text-[color:var(--color-good)]" : "text-[color:var(--color-warn)]"}>
                                      {fa.value >= 0.6 ? "▲" : "▼"}
                                    </span>{" "}
                                    <strong>{fa.name}</strong> (w{fa.weight}): {fa.note}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Weaknesses</div>
                        <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-ink-soft">
                          {(s.detail?.weaknesses ?? []).map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                          {!(s.detail?.weaknesses ?? []).length ? <li>No weaknesses flagged.</li> : null}
                        </ul>
                      </div>
                      <div>
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Proposed improvements</div>
                        <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-ink-soft">
                          {(s.detail?.improvements ?? []).map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                          {!(s.detail?.improvements ?? []).length ? <li>No specific improvements needed.</li> : null}
                        </ul>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </Card>
        </>
      )}

      <Card>
        <SectionHeader title="Scoring methodology" subtitle="The weights below are public and fixed, so any score can be reproduced." />
        <Table
          head={["Layer", "Weight", "What it measures"]}
          rows={LAYERS.map((l) => [
            l.label,
            String(layerWeights()[l.key]),
            <span key="d" className="text-xs text-ink-soft">{l.description}</span>,
          ])}
        />
        <p className="mt-3 text-[11px] text-ink-faint">
          Overall = weighted mean of the five layer scores. Each layer is the weighted mean of its named factors (all weights are shown in the
          expanded section rows). Scores are internal diagnostic heuristics; validate them against observed visibility in the Experiment Lab.
        </p>
      </Card>

      <Card>
        <SectionHeader title="Pages by GEO score" subtitle="Lowest first — where improvement effort pays off most." />
        <Table
          head={["Page", "Overall", "L1", "L2", "L3", "L4", "L5", ""]}
          empty="No pages scored."
          rows={[...pages]
            .sort((a, b) => Number(a.geo_overall ?? 999) - Number(b.geo_overall ?? 999))
            .slice(0, 40)
            .map((p) => [
              <span key="u" className="text-xs">{String(p.url).replace("https://straightflushplumbingoc.com", "")}</span>,
              <span key="o" className="tabular font-semibold">{p.geo_overall ? Number(p.geo_overall) : "—"}</span>,
              String(p.geo_retrieval ?? "—"),
              String(p.geo_extractability ?? "—"),
              String(p.geo_entity ?? "—"),
              String(p.geo_authority ?? "—"),
              String(p.geo_memory ?? "—"),
              <Link key="l" href={`/geo-console?url=${encodeURIComponent(String(p.url))}`} className="text-[11px] font-medium text-[color:var(--color-brand)]">
                open
              </Link>,
            ])}
        />
      </Card>
    </div>
  );
}
