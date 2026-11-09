import { insert, query, queryOne, run as sqlRun } from "../db";
import { round1, readJson } from "../util";
import { geDataFile } from "../paths";
import type { SiteAudit } from "./site";
import type { PageScore } from "./geo";
import type { VisibilityMetrics } from "./visibility";

/**
 * Automated Optimization Engine (spec §9).
 *
 * Turns measured evidence into prioritised, evidence-based recommendations.
 * Each opportunity records: problem, evidence, affected URL/section, GEO layer,
 * expected benefit, difficulty, priority, and proposed solution — and later the
 * actual implementation and result. Generic SEO advice is deliberately excluded:
 * an opportunity is only created when there is a concrete, observed signal.
 */

export interface OpportunityInput {
  title: string;
  problem: string;
  evidence: string;
  url: string | null;
  section: string | null;
  geoLayer: string;
  expectedBenefit: string;
  difficulty: "low" | "medium" | "high";
  impact: number; // 1..5
  effort: number; // 1..5
  proposed: string;
  dedupeKey: string;
}

export interface OpportunityRow extends OpportunityInput {
  id: number;
  ts: string;
  priority: number;
  status: string;
  implementedAt: string | null;
  result: string | null;
}

export function priorityScore(impact: number, effort: number): number {
  // High impact, low effort first. Weighted so impact dominates.
  return round1((impact * 2) / Math.max(effort, 1));
}

/**
 * Record an opportunity. Returns the new row id **only when a new row was
 * inserted**, and null when the dedupe key already exists. Callers use this to
 * count genuinely new work, so returning an existing id here would inflate the
 * "new opportunities" figure in the activity log and daily report.
 */
export function createOpportunity(o: OpportunityInput): number | null {
  const existing = queryOne<{ id: number; status: string }>("SELECT id, status FROM opportunities WHERE dedupe_key=?", o.dedupeKey);
  if (existing) return null;
  const priority = priorityScore(o.impact, o.effort);
  return insert("opportunities", {
    title: o.title,
    problem: o.problem,
    evidence: o.evidence,
    url: o.url,
    section: o.section,
    geo_layer: o.geoLayer,
    expected_benefit: o.expectedBenefit,
    difficulty: o.difficulty,
    impact: o.impact,
    effort: o.effort,
    priority,
    proposed: o.proposed,
    status: "open",
    dedupe_key: o.dedupeKey,
  });
}

/** Derive opportunities from a site audit + GEO scores + visibility metrics. */
export function deriveOpportunities(audit: SiteAudit, pageScores: PageScore[], metrics: VisibilityMetrics): number {
  let created = 0;
  const add = (o: OpportunityInput) => {
    if (createOpportunity(o) !== null) created++;
  };

  // 1. Broken internal links — high impact, low effort.
  for (const b of audit.brokenInternalLinks.slice(0, 25)) {
    add({
      title: `Fix broken internal link on ${b.from}`,
      problem: `A link points to ${b.href}, which does not resolve to a file in the repository.`,
      evidence: `site audit: broken internal link (${b.from} → ${b.href})`,
      url: b.from,
      section: null,
      geoLayer: "Extractability",
      expectedBenefit: "Restores crawl paths and removes a dead-end for both users and AI crawlers.",
      difficulty: "low",
      impact: 4,
      effort: 1,
      proposed: `Repoint or remove the link to ${b.href}.`,
      dedupeKey: `broken-link:${b.from}:${b.href}`,
    });
  }

  // 2. Missing structured data / H1 / meta on indexable pages.
  for (const i of audit.issues) {
    if (i.code === "missing-schema" || i.code === "missing-h1" || i.code === "missing-meta" || i.code === "missing-canonical") {
      add({
        title: `${labelFor(i.code)} — ${i.url}`,
        problem: i.message,
        evidence: `site audit issue ${i.code} on ${i.url}`,
        url: i.url,
        section: null,
        geoLayer: i.code === "missing-schema" ? "Entity Reinforcement" : "Extractability",
        expectedBenefit:
          i.code === "missing-schema"
            ? "Machine-readable entity/service data improves AI interpretation and rich-result eligibility."
            : "Correct head metadata improves retrieval and snippet quality.",
        difficulty: "low",
        impact: i.code === "missing-schema" ? 4 : 3,
        effort: 1,
        proposed: i.message,
        dedupeKey: `audit:${i.code}:${i.url}`,
      });
    }
  }

  // 3. Weak sections (lowest GEO overall) — content improvements.
  for (const ps of pageScores) {
    const weak = [...ps.sectionScores].sort((a, b) => a.overall - b.overall).slice(0, 2);
    for (const s of weak) {
      if (s.overall >= 60) continue;
      if (s.wordCount < 20) continue;
      add({
        title: `Strengthen "${s.heading}" on ${ps.url}`,
        problem: `Section scores ${s.overall}/100 overall; lowest layer weaknesses: ${s.weaknesses.slice(0, 2).join("; ") || "n/a"}.`,
        evidence: `GEO engine section #${s.sectionOrdinal} on ${ps.url}`,
        url: ps.url,
        section: s.heading,
        geoLayer: "Retrieval Probability",
        expectedBenefit: "Better retrieval and extraction of a section that answers a real customer question.",
        difficulty: "medium",
        impact: 3,
        effort: 2,
        proposed: s.improvements[0] ?? "Add a direct answer and name the service and city.",
        dedupeKey: `weak-section:${ps.url}:${s.sectionOrdinal}:${s.overall}`,
      });
    }
  }

  // 4. Visibility gaps: services/cities with no measured mention.
  for (const s of metrics.byService) {
    if (s.mentionRate === 0 && s.total >= 3) {
      add({
        title: `No measured visibility for service "${s.service}"`,
        problem: `Across ${s.total} measured tests in the window, Straight Flush was never mentioned for this service.`,
        evidence: `visibility metrics (${metrics.window.sinceDays}d, ${metrics.testType})`,
        url: null,
        section: null,
        geoLayer: "System Memory Readiness",
        expectedBenefit: "Closing a service-level visibility gap widens the set of queries we can be retrieved for.",
        difficulty: "medium",
        impact: 4,
        effort: 3,
        proposed: `Review the ${s.service} page and add a direct answer, city context, and a citable specific.`,
        dedupeKey: `visibility-service:${s.service}`,
      });
    }
  }

  // 5. Citation gaps: domains that are cited when we lose.
  const cit = query<{ domain: string; times_cited_when_we_lost: number; action: string; status: string }>(
    "SELECT domain, times_cited_when_we_lost, action, status FROM citation_actions WHERE status != 'done' ORDER BY times_cited_when_we_lost DESC LIMIT 5",
  ).filter((c) => c.domain);
  for (const c of cit) {
    add({
      title: `Earn presence on ${c.domain}`,
      problem: `${c.domain} was cited ${c.times_cited_when_we_lost}× in answers where Straight Flush was not recommended.`,
      evidence: "citation_engine gap analysis (citation_actions)",
      url: null,
      section: null,
      geoLayer: "Structural Authority",
      expectedBenefit: "Being present on the sources AI answers cite is the durable path to recommendations.",
      difficulty: "high",
      impact: 4,
      effort: 4,
      proposed: c.action || `Claim/complete a presence on ${c.domain} with consistent NAP.`,
      dedupeKey: `citation:${c.domain}`,
    });
  }

  return created;
}

function labelFor(code: string): string {
  const map: Record<string, string> = {
    "missing-schema": "Add JSON-LD structured data",
    "missing-h1": "Add an H1",
    "missing-meta": "Add a meta description",
    "missing-canonical": "Add a canonical URL",
  };
  return map[code] ?? code;
}

export function listOpportunities(status?: string): OpportunityRow[] {
  const rows = query<Record<string, unknown>>(
    status ? "SELECT * FROM opportunities WHERE status=? ORDER BY priority DESC, id DESC" : "SELECT * FROM opportunities ORDER BY status='done', priority DESC, id DESC",
    ...(status ? [status] : []),
  );
  return rows.map((r) => ({
    id: Number(r.id),
    title: String(r.title),
    problem: String(r.problem),
    evidence: String(r.evidence ?? ""),
    url: (r.url as string) ?? null,
    section: (r.section as string) ?? null,
    geoLayer: String(r.geo_layer),
    expectedBenefit: String(r.expected_benefit ?? ""),
    difficulty: r.difficulty as "low" | "medium" | "high",
    impact: Number(r.impact),
    effort: Number(r.effort),
    priority: Number(r.priority),
    proposed: String(r.proposed ?? ""),
    dedupeKey: String(r.dedupe_key ?? ""),
    ts: String(r.ts),
    status: String(r.status),
    implementedAt: (r.implemented_at as string) ?? null,
    result: (r.result as string) ?? null,
  }));
}

export function updateOpportunityStatus(id: number, status: string, result?: string): void {
  if (status === "done") {
    sqlRun("UPDATE opportunities SET status=?, implemented_at=datetime('now'), result=? WHERE id=?", status, result ?? null, id);
  } else {
    sqlRun("UPDATE opportunities SET status=?, result=COALESCE(?, result) WHERE id=?", status, result ?? null, id);
  }
}

/** Ingest the growth-engine citation action list so gaps show up here too. */
export function ingestCitationActions(): number {
  const file = geDataFile("citation_actions.json");
  const data = readJson<{ actions?: { domain: string; times_cited_when_we_lost: number; action: string; status: string; engines?: string[]; example_urls?: string[] }[] }>(file);
  if (!data?.actions) return 0;
  let n = 0;
  for (const a of data.actions) {
    if (!a.domain) continue;
    const exists = queryOne<{ id: number }>("SELECT id FROM citation_actions WHERE domain=?", a.domain);
    if (exists) {
      sqlRun("UPDATE citation_actions SET times_cited_when_we_lost=?, action=?, status=?, engines=?, example_urls=? WHERE id=?",
        a.times_cited_when_we_lost, a.action, a.status, JSON.stringify(a.engines ?? []), JSON.stringify(a.example_urls ?? []), exists.id);
    } else {
      insert("citation_actions", {
        domain: a.domain,
        times_cited_when_we_lost: a.times_cited_when_we_lost,
        action: a.action,
        status: a.status,
        engines: JSON.stringify(a.engines ?? []),
        example_urls: JSON.stringify(a.example_urls ?? []),
      });
      n++;
    }
  }
  return n;
}

function readJsonSafe<T>(file: string): T | null {
  return readJson<T>(file);
}

export { readJsonSafe };
