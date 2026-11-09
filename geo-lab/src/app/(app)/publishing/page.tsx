import { listPublications } from "@/lib/engine/publishing";
import { Card, StatCard, Table, Pill, SectionHeader, statusTone } from "@/components/ui";
import { PublishControls } from "@/components/publish-controls";

export const dynamic = "force-dynamic";

export default async function PublishingPage() {
  const pubs = listPublications(100);
  const byStatus = (s: string) => pubs.filter((p) => String(p.status) === s).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Publishing History"
        subtitle="Every autonomous change: what changed, the validations it passed, the branch and PR, and whether it verified live. Failed validations are kept as evidence."
        right={<PublishControls />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Publications" value={pubs.length} sub={`${byStatus("published")} published · ${byStatus("verified")} verified`} source="publications" />
        <StatCard label="Rejected by validation" value={byStatus("failed")} sub="never published" source="publications" tone={byStatus("failed") ? "warn" : "good"} />
        <StatCard label="Rolled back" value={byStatus("rolled_back")} source="publications" tone={byStatus("rolled_back") ? "warn" : "good"} />
        <StatCard label="Pending" value={byStatus("pending")} source="publications" />
      </div>

      <Card>
        <SectionHeader title="Publishing rules in force" subtitle="Enforced mechanically before any write — see AUTONOMOUS_OPERATIONS.md." />
        <div className="grid gap-2 text-xs text-ink-soft sm:grid-cols-2">
          <div>✓ Routine improvements publish without approval: link fixes, metadata, headings, FAQs, schema, alt text, internal links.</div>
          <div>⛔ Locked facts can never change: identity, NAP, pricing, warranties, guarantees, licensing, certifications.</div>
          <div>⛔ No invented reviews, testimonials, case studies, project results or services.</div>
          <div>✓ Every change is snapshotted first and restorable; validation must pass.</div>
          <div>✓ Changes go to a branch and open a PR — the agent never pushes to main and never merges.</div>
          <div>✓ After publish the live URL is checked; a failure is recorded for rollback.</div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Change log" subtitle="Newest first, with the full validation record." />
        <div className="space-y-3">
          {pubs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-line)] p-6 text-center text-sm text-ink-faint">
              No publications yet. Use &ldquo;Preview safe fixes&rdquo; to see what the engine would publish, then &ldquo;Publish safe fixes&rdquo;.
            </div>
          ) : null}
          {pubs.map((p) => {
            let validations: { name: string; ok: boolean; detail: string }[] = [];
            try {
              validations = JSON.parse(String(p.validations ?? "[]")) as typeof validations;
            } catch {
              validations = [];
            }
            return (
              <details key={String(p.id)} className="rounded-xl border border-[color:var(--color-line)] p-3">
                <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold tabular text-ink-faint">#{String(p.id)}</span>
                  <span className="min-w-[220px] flex-1 text-sm font-medium">{String(p.summary)}</span>
                  <Pill tone="muted">{String(p.change_type)}</Pill>
                  <Pill tone={statusTone(String(p.status))}>{String(p.status)}</Pill>
                  <span className="text-[10px] text-ink-faint">{String(p.ts).slice(0, 16)}</span>
                </summary>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="space-y-1 text-xs">
                    <div><span className="font-semibold text-ink-soft">URL:</span> {String(p.url)}</div>
                    <div><span className="font-semibold text-ink-soft">Before hash:</span> <code className="text-[10px]">{String(p.before_hash).slice(0, 16)}</code></div>
                    <div><span className="font-semibold text-ink-soft">After hash:</span> <code className="text-[10px]">{String(p.after_hash).slice(0, 16)}</code></div>
                    {p.branch ? <div><span className="font-semibold text-ink-soft">Branch:</span> <code className="text-[10px]">{String(p.branch)}</code></div> : null}
                    {p.pr_url ? (
                      <div>
                        <span className="font-semibold text-ink-soft">PR:</span>{" "}
                        <a href={String(p.pr_url)} className="text-[color:var(--color-brand)]" target="_blank" rel="noreferrer">
                          #{String(p.pr_number)}
                        </a>
                      </div>
                    ) : null}
                    {p.diff_stat ? <div><span className="font-semibold text-ink-soft">Diff:</span> {String(p.diff_stat)}</div> : null}
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Validations</div>
                    <ul className="space-y-0.5 text-[11px]">
                      {validations.map((v, i) => (
                        <li key={i} className={v.ok ? "text-[color:var(--color-good)]" : "text-[color:var(--color-bad)]"}>
                          {v.ok ? "✓" : "✗"} {v.name} — {v.detail}
                        </li>
                      ))}
                      {!validations.length ? <li className="text-ink-faint">No validation record.</li> : null}
                    </ul>
                    <RollbackButton id={Number(p.id)} status={String(p.status)} />
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function RollbackButton({ id, status }: { id: number; status: string }) {
  if (status !== "published" && status !== "verified") return null;
  return (
    <form action="/api/publish" method="post" className="mt-2">
      <input type="hidden" name="action" value="rollback" />
      <input type="hidden" name="publicationId" value={id} />
      <button
        className="rounded-lg border border-[color:var(--color-line)] px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:bg-[color:var(--color-canvas)]"
        type="submit"
      >
        Roll back #{id}
      </button>
    </form>
  );
}
