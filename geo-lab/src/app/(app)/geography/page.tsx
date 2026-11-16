import { latestCoverage, coverageHistory } from "@/lib/engine/geography";
import { reviewPriorityCity } from "@/lib/engine/priority-market";
import { Card, StatCard, Table, Pill, SectionHeader } from "@/components/ui";
import { AgentControls } from "@/components/agent-controls";

export const dynamic = "force-dynamic";

export default function GeographyPage() {
  const review = reviewPriorityCity();
  const cities = latestCoverage();
  const history = coverageHistory("laguna-niguel", 8);
  const rate = (value: number | null) => (value == null ? "unmeasured" : `${value}%`);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Service areas"
        subtitle="Laguna Niguel is first. Every rate below is from a stored test. A blank means we have not measured it yet."
        right={<AgentControls />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Priority city" value="Laguna Niguel" sub={`${review.prompts.length} test prompts`} source="priority prompt pack" tone="brand" />
        <StatCard label="Conclusive tests" value={review.conclusiveTests} sub={review.conclusiveTests ? "stored answers" : "none stored"} source="visibility_results" tone={review.conclusiveTests ? "good" : "warn"} />
        <StatCard label="Mention rate" value={rate(review.mentionRate)} sub="named in the answer" source="stored tests only" />
        <StatCard label="Recommendation rate" value={rate(review.recommendationRate)} sub="status = recommended" source="stored tests only" tone={review.recommendationRate ? "good" : "neutral"} />
      </div>

      <Card>
        <SectionHeader title="Laguna Niguel test prompts" subtitle="These run before other cities. The near-me prompt includes the city because an API call has no phone location." />
        <Table
          head={["Prompt", "Note"]}
          rows={review.prompts.map((p) => [p.text, <span key={p.text} className="text-xs text-ink-soft">{p.note}</span>])}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="What is already on the site" subtitle="Read from the files in this repository." />
          <ul className="list-disc space-y-1 pl-5 text-xs text-ink-soft">
            {review.inPlace.map((line) => <li key={line}>{line}</li>)}
            {!review.inPlace.length ? <li>Nothing in this checklist passed.</li> : null}
          </ul>
        </Card>
        <Card>
          <SectionHeader title="What to do next" subtitle="Each item needs your approval. None of these is a claim that rank already moved." />
          <ul className="space-y-3">
            {review.actions.map((a) => (
              <li key={a.problem} className="rounded-xl border border-[color:var(--color-line)] p-3 text-xs">
                <div className="font-semibold">{a.problem}</div>
                <div className="mt-1 text-ink-soft">Why it matters: {a.why}</div>
                <div className="mt-1">Do this: {a.action}</div>
                <div className="mt-1 text-ink-soft">Benefit: {a.benefit}</div>
                <div className="mt-1"><Pill tone="warn">requires approval</Pill></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Stored results for Laguna Niguel" subtitle="Rank is shown only when the provider returned one. No rank in the row means the provider did not give a position." />
        <Table
          head={["When", "Platform", "Prompt", "Result", "Rank", "Competitors in that answer"]}
          empty="No stored tests for Laguna Niguel yet. Run a visibility sweep after a provider key is set."
          rows={review.history.map((h) => [
            <span key="t" className="text-[10px] text-ink-faint">{h.ts.slice(0, 16)}</span>,
            h.platform,
            <span key="q" className="text-xs">{h.query}</span>,
            h.status,
            h.rank == null ? "—" : String(h.rank),
            h.competitors.slice(0, 4).join(", ") || "—",
          ])}
        />
      </Card>

      <Card>
        <SectionHeader title="Competitor names to watch" subtitle="The list is from the October 2026 baseline. A number appears only when that name is in a stored answer. Blank means we have no answer to search." />
        <Table
          head={["Name", "Times named in stored answers", "Source"]}
          rows={review.watchlist.map((w) => [w.name, w.appearances == null ? "unmeasured" : String(w.appearances), <span key={w.name} className="text-[10px] text-ink-faint">{w.source}</span>])}
        />
      </Card>

      <Card>
        <SectionHeader title="All verified cities" subtitle={cities.length ? "Latest geographic review stored by the agent." : "No review stored yet. Use Service Areas above to run one."} />
        <Table
          head={["City", "Focus", "Page", "Mention rate", "Missing service pages", "Top gap"]}
          empty="Run the service-area agent to fill this table."
          rows={cities.map((c) => [
            c.name,
            c.focus,
            c.pageUrl ? "yes" : "no",
            c.mentionRate == null ? "unmeasured" : `${c.mentionRate}%`,
            c.missingServices.join(", ") || "—",
            c.gaps[0] ?? "—",
          ])}
        />
        {history.length > 1 ? (
          <p className="mt-3 text-[11px] text-ink-faint">{history.length} Laguna Niguel snapshots stored. Mention rate on a snapshot stays blank until a conclusive test exists.</p>
        ) : null}
      </Card>

      <p className="text-[11px] text-ink-faint">
        ChatGPT, Gemini, Claude, Perplexity, and Grok are queried through their APIs when a key is set. Copilot and Google AI Overviews have no key that works from here, so they stay unmeasured. An API answer is not the consumer app.
      </p>
    </div>
  );
}
