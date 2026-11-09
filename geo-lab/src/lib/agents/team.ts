/**
 * Autonomous agent team (spec §12).
 *
 * Each agent has one defined responsibility. They share the project
 * intelligence (the SQLite store + the growth-engine knowledge base) and are
 * driven by the orchestrator. Agents execute real work and record it in the
 * activity log with an evidence pointer — they never just produce reports.
 */

export interface AgentDef {
  id: string;
  name: string;
  responsibility: string;
  /** Which GEO layer(s) this agent primarily improves. */
  layers: string[];
  /** What it must NOT do (policy boundaries). */
  boundaries: string[];
}

export const AGENT_TEAM: AgentDef[] = [
  {
    id: "geo-research",
    name: "GEO Research Agent",
    responsibility:
      "Executes AI/search visibility sweeps across the standardized query library, records raw results and citations, and computes mention / recommendation / citation metrics.",
    layers: ["System Memory Readiness", "Retrieval Probability"],
    boundaries: ["Never records a conventional-search result as an AI-platform result.", "Never invents a platform result; an unreachable platform is `inconclusive`."],
  },
  {
    id: "seo-technical",
    name: "SEO Technical Agent",
    responsibility:
      "Crawls the repository and live site, audits indexability, metadata, canonical URLs, headings, schema, internal links and broken links, and records technical health history.",
    layers: ["Extractability", "Entity Reinforcement"],
    boundaries: ["Never runs scripts/gen_*.py site-wide.", "Never changes canonical/URL conventions."],
  },
  {
    id: "content-intelligence",
    name: "Content Intelligence Agent",
    responsibility:
      "Scores every content section on the five GEO layers, identifies the weakest sections, and generates factual, evidence-based improvements.",
    layers: ["Retrieval Probability", "Extractability"],
    boundaries: ["Never invents facts, statistics, reviews or case studies.", "Never introduces superlatives."],
  },
  {
    id: "entity-intelligence",
    name: "Entity Intelligence Agent",
    responsibility:
      "Checks business identity consistency (name, NAP, services, geography, schema) against the knowledge base and monitors owned duplicate hosts.",
    layers: ["Entity Reinforcement", "System Memory Readiness"],
    boundaries: ["Never edits an external property (owner-only).", "Never adds sameAs to a duplicate host."],
  },
  {
    id: "competitor-intelligence",
    name: "Competitor Intelligence Agent",
    responsibility:
      "Maintains the evidence-based competitor map from observed results, and explains what competitors do well and where the opportunities are.",
    layers: ["Structural Authority"],
    boundaries: ["Never fabricates competitor performance.", "Separates observed facts from hypotheses."],
  },
  {
    id: "experiment",
    name: "Experiment Agent",
    responsibility:
      "Creates and evaluates controlled GEO experiments with a baseline, fixed query wording, and honest confounder notes.",
    layers: ["Retrieval Probability", "System Memory Readiness"],
    boundaries: ["Never claims causation without controls."],
  },
  {
    id: "publishing",
    name: "Publishing Agent",
    responsibility:
      "Implements policy-approved improvements: edits content, validates facts and structure, commits to a branch, opens a PR, verifies the deployment, and can roll back.",
    layers: ["All"],
    boundaries: [
      "Never modifies locked identity/NAP/pricing/warranty/licensing facts.",
      "Never pushes to main; always branch + PR.",
      "Never merges a PR (owner review required).",
    ],
  },
  {
    id: "analytics",
    name: "Analytics Agent",
    responsibility:
      "Computes metrics from stored rows, tracks trends, and generates daily / weekly / monthly reports.",
    layers: ["All"],
    boundaries: ["Never reports missing data as zero."],
  },
  {
    id: "security-quality",
    name: "Security & Quality Agent",
    responsibility:
      "Monitors credentials, integration status, dependency vulnerabilities, deployment health and content accuracy.",
    layers: ["Entity Reinforcement"],
    boundaries: ["Never prints secret values.", "Never claims an integration works when it does not."],
  },
  {
    id: "orchestrator",
    name: "Chief Intelligence Orchestrator",
    responsibility:
      "Assigns tasks, prevents duplicate work, prioritises, maintains the shared knowledge base, tracks completions and failures, and decides the next best action.",
    layers: ["All"],
    boundaries: ["Must get real work completed, not generate reports for their own sake."],
  },
];

export function agentById(id: string): AgentDef | undefined {
  return AGENT_TEAM.find((a) => a.id === id);
}
