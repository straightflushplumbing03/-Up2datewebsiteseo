import { insert, queryOne } from "../db";

/**
 * Research Library (spec §19). Durable findings about how AI and search systems
 * retrieve and cite local plumbing businesses. Each note is dated, sourced, and
 * written only from something that was actually observed in this environment.
 */
export interface ResearchNote {
  topic: string;
  title: string;
  body: string;
  source: string;
  tags: string;
}

export const CANONICAL_NOTES: ResearchNote[] = [
  {
    topic: "Local retrieval",
    title: "Directory aggregators dominate local plumbing result sets",
    body:
      "In every measured result set for local plumbing intent, Yelp, Angi, HomeAdvisor and MapQuest appeared. A business website rarely appears alone. The durable lever is being present and consistent on those directories, not only on the company site.",
    source: "visibility_results (tavily_search), 2026-11-06",
    tags: "citations,directories,local",
  },
  {
    topic: "Entity hygiene",
    title: "A retired Wix site is still being surfaced for branded queries",
    body:
      "A branded query returned straightflushplumb8.wixsite.com, an owned host that now returns HTTP 404. Search indexes retain stale hosts after they go dark. Because the host is owned and dead, the remedy is removal/deprecation, not a sameAs link — a sameAs edge would reinforce the stale association.",
    source: "visibility_results, branded query, 2026-11-06",
    tags: "entity,duplicate-host,indexing",
  },
  {
    topic: "Entity hygiene",
    title: "A similarly named rooter company is a competitor, not our duplicate",
    body:
      "straightflushplumbingandrooter.com resolves (HTTP 200) but is a different business. Similar names create real disambiguation pressure, which is why the canonical business name is stored in full (Straight Flush Plumbing & Leak Detection) and bare 'straight flush' is deliberately never matched as a brand pattern.",
    source: "HTTP probe + index.html JSON-LD, 2026-11-06",
    tags: "entity,competitor,disambiguation",
  },
  {
    topic: "Measurement",
    title: "A conventional-search proxy is not an AI platform",
    body:
      "Tavily is reachable here and returns real citations, so it is used as a conventional-search proxy. It must never be reported as an AI-platform mention. The two test types are stored separately and are never averaged together, because conflating them would overstate AI visibility.",
    source: "provider probe, 2026-11-06",
    tags: "measurement,test-type",
  },
  {
    topic: "Platform access",
    title: "Most AI platforms cannot be queried from this environment",
    body:
      "Gemini returned HTTP 401 for a non-AIza credential type; ChatGPT/Claude/Perplexity have no key configured. These are recorded as inconclusive (UNMEASURED) rather than absent (0% visibility). The distinction matters: an unreachable platform is not evidence of invisibility.",
    source: "provider probe, 2026-11-06",
    tags: "measurement,blockers",
  },
  {
    topic: "Retrieval",
    title: "Script contents must be excluded before structure parsing",
    body:
      "An anchor inside an inline script block was read as real markup and produced a false 'broken internal link' finding on index.html. Structure parsing now strips <script> and <style> contents first. Any audit that reports issues must be verified against the source before acting on it.",
    source: "site audit false positive, resolved 2026-11-06",
    tags: "extractability,audit-quality",
  },
];

export function seedResearchNotes(): number {
  let n = 0;
  for (const note of CANONICAL_NOTES) {
    const existing = queryOne<{ id: number }>("SELECT id FROM research_notes WHERE title=?", note.title);
    if (existing) continue;
    insert("research_notes", { ...note });
    n++;
  }
  return n;
}
