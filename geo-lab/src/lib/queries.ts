import { query, queryOne } from "./db";
import { computeVisibilityMetrics, type VisibilityMetrics } from "./engine/visibility";
import { competitorScorecard } from "./engine/competitor";
import { listOpportunities } from "./engine/optimize";
import { listExperiments } from "./engine/experiment";
import { listPublications } from "./engine/publishing";
import { listIntegrations } from "./integrations";
import { round1 } from "./util";

/**
 * Read-side helpers. Every value is derived from stored rows — the dashboard
 * has no hardcoded metrics. Each metric carries the timestamp of its source.
 */

export interface DashboardSummary {
  geo: {
    overall: number;
    layers: Record<string, number>;
    pagesScored: number;
    sectionsScored: number;
    asOf: string | null;
  };
  visibility: VisibilityMetrics;
  shareOfVoice: { domain: string; appearances: number; share: number }[];
  website: {
    indexablePages: number;
    totalPages: number;
    issues: number;
    brokenLinks: number;
    sitemapUrls: number;
    asOf: string | null;
  };
  opportunities: { open: number; total: number; top: ReturnType<typeof listOpportunities> };
  publications: { total: number; verified: number; recent: Record<string, unknown>[] };
  experiments: { total: number; complete: number; recent: Record<string, unknown>[] };
  agents: { runs: number; failed: number; recent: { agent: string; status: string; summary: string | null; ts: string }[] };
  activity: { ts: string; agent: string; level: string; message: string; evidence: string | null }[];
  integrations: { connected: number; total: number };
  entityConsistency: number | null;
}

export function latestGeoOverall(): { overall: number; layers: Record<string, number>; pages: number; sections: number; asOf: string | null } {
  const pageRows = query<{ overall: number; retrieval_probability: number; extractability: number; entity_reinforcement: number; structural_authority: number; system_memory: number; ts: string }>(
    `SELECT g.overall, g.retrieval_probability, g.extractability, g.entity_reinforcement, g.structural_authority, g.system_memory, g.ts
       FROM geo_scores g
       JOIN (SELECT page_id, MAX(id) AS mid FROM geo_scores WHERE section_id IS NULL GROUP BY page_id) t
         ON t.mid = g.id`,
  );
  const n = pageRows.length || 1;
  const avg = (k: keyof (typeof pageRows)[number]) => round1(pageRows.reduce((a, r) => a + Number(r[k]), 0) / n);
  const sectionCount = Number(queryOne<{ c: number }>("SELECT COUNT(DISTINCT section_id) c FROM geo_scores WHERE section_id IS NOT NULL")?.c ?? 0);
  return {
    overall: avg("overall"),
    layers: {
      "Retrieval Probability": avg("retrieval_probability"),
      Extractability: avg("extractability"),
      "Entity Reinforcement": avg("entity_reinforcement"),
      "Structural Authority": avg("structural_authority"),
      "System Memory Readiness": avg("system_memory"),
    },
    pages: pageRows.length,
    sections: sectionCount,
    asOf: pageRows.length ? pageRows.map((r) => r.ts).sort().slice(-1)[0] : null,
  };
}

export function websiteHealth() {
  const indexable = Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM pages WHERE indexable=1")?.c ?? 0);
  const total = Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM pages")?.c ?? 0);
  const sitemap = Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM pages WHERE in_sitemap=1")?.c ?? 0);
  const last = queryOne<{ checks: string; ts: string }>("SELECT checks, ts FROM technical_health_history ORDER BY id DESC LIMIT 1");
  let issues = 0;
  let broken = 0;
  if (last) {
    try {
      const c = JSON.parse(last.checks) as { issues?: number; brokenLinks?: number };
      issues = c.issues ?? 0;
      broken = c.brokenLinks ?? 0;
    } catch {
      /* ignore */
    }
  }
  return { indexablePages: indexable, totalPages: total, issues, brokenLinks: broken, sitemapUrls: sitemap, asOf: last?.ts ?? null };
}

export function dashboardSummary(): DashboardSummary {
  const geo = latestGeoOverall();
  const visibility = computeVisibilityMetrics({ sinceDays: 30 });
  const website = websiteHealth();
  const opps = listOpportunities();
  const pubs = listPublications(10);
  const exps = listExperiments();
  const runs = query<{ agent: string; status: string; summary: string | null; ts: string }>(
    "SELECT agent, status, summary, ts FROM agent_runs ORDER BY id DESC LIMIT 12",
  );
  const activity = query<{ ts: string; agent: string; level: string; message: string; evidence: string | null }>(
    "SELECT ts, agent, level, message, evidence FROM activity ORDER BY id DESC LIMIT 25",
  );
  const integrations = listIntegrations();
  // Consistency must reflect the LATEST check, not the sum of every historical
  // run — otherwise a discrepancy that has since been fixed keeps dragging the
  // figure down forever. entity_facts rows are written per run with a shared ts.
  const entity = queryOne<{ matches: number; total: number }>(
    `SELECT SUM(matches) matches, COUNT(*) total FROM entity_facts
     WHERE ts = (SELECT MAX(ts) FROM entity_facts)`,
  );

  return {
    geo: { overall: geo.overall, layers: geo.layers, pagesScored: geo.pages, sectionsScored: geo.sections, asOf: geo.asOf },
    visibility,
    shareOfVoice: visibility.shareOfVoice,
    website,
    opportunities: { open: opps.filter((o) => o.status === "open").length, total: opps.length, top: opps.filter((o) => o.status === "open").slice(0, 6) },
    publications: {
      total: pubs.length,
      verified: pubs.filter((p) => p.status === "verified").length,
      recent: pubs.slice(0, 5),
    },
    experiments: { total: exps.length, complete: exps.filter((e) => e.status === "complete").length, recent: exps.slice(0, 5) },
    agents: {
      runs: runs.length,
      failed: runs.filter((r) => r.status === "failed").length,
      recent: runs,
    },
    activity,
    integrations: { connected: integrations.filter((i) => i.status === "connected").length, total: integrations.length },
    entityConsistency: entity && entity.total ? round1((Number(entity.matches) / Number(entity.total)) * 100) : null,
  };
}

export function geoHistory(days = 30) {
  const rows = query<{ d: string; overall: number; retrieval: number; extractability: number; entity: number; authority: number; memory: number }>(
    `SELECT substr(ts,1,10) d,
            AVG(overall) overall,
            AVG(retrieval_probability) retrieval,
            AVG(extractability) extractability,
            AVG(entity_reinforcement) entity,
            AVG(structural_authority) authority,
            AVG(system_memory) memory
       FROM geo_scores
      WHERE section_id IS NULL AND ts >= datetime('now', ?)
      GROUP BY d ORDER BY d`,
    `-${days} day`,
  );
  return rows.map((r) => ({
    date: r.d,
    overall: round1(r.overall),
    retrieval: round1(r.retrieval),
    extractability: round1(r.extractability),
    entity: round1(r.entity),
    authority: round1(r.authority),
    memory: round1(r.memory),
  }));
}

export function pagesList(filter: { indexable?: boolean; q?: string } = {}) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.indexable !== undefined) {
    where.push("indexable=?");
    params.push(filter.indexable ? 1 : 0);
  }
  if (filter.q) {
    where.push("(url LIKE ? OR title LIKE ?)");
    params.push(`%${filter.q}%`, `%${filter.q}%`);
  }
  const sql = `SELECT p.*, 
      (SELECT overall FROM geo_scores g WHERE g.page_id=p.id AND g.section_id IS NULL ORDER BY g.id DESC LIMIT 1) AS geo_overall,
      (SELECT retrieval_probability FROM geo_scores g WHERE g.page_id=p.id AND g.section_id IS NULL ORDER BY g.id DESC LIMIT 1) AS geo_retrieval,
      (SELECT extractability FROM geo_scores g WHERE g.page_id=p.id AND g.section_id IS NULL ORDER BY g.id DESC LIMIT 1) AS geo_extractability,
      (SELECT entity_reinforcement FROM geo_scores g WHERE g.page_id=p.id AND g.section_id IS NULL ORDER BY g.id DESC LIMIT 1) AS geo_entity,
      (SELECT structural_authority FROM geo_scores g WHERE g.page_id=p.id AND g.section_id IS NULL ORDER BY g.id DESC LIMIT 1) AS geo_authority,
      (SELECT system_memory FROM geo_scores g WHERE g.page_id=p.id AND g.section_id IS NULL ORDER BY g.id DESC LIMIT 1) AS geo_memory
    FROM pages p ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY geo_overall IS NULL, geo_overall DESC`;
  return query<Record<string, unknown>>(sql, ...params);
}

export function pageDetail(url: string): {
  page: Record<string, unknown>;
  sections: (Record<string, unknown> & { score: Record<string, unknown> | null })[];
  pageScore: Record<string, unknown> | undefined;
  history: { ts: string; overall: number }[];
} | null {
  const page = queryOne<Record<string, unknown>>("SELECT * FROM pages WHERE url=?", url);
  if (!page) return null;
  const pageId = Number(page.id);
  const sections = query<Record<string, unknown>>("SELECT * FROM sections WHERE page_id=? ORDER BY ordinal", pageId);
  const scores = query<Record<string, unknown>>(
    "SELECT * FROM geo_scores WHERE page_id=? AND section_id IS NOT NULL ORDER BY id DESC LIMIT 200",
    pageId,
  );
  const latestBySection = new Map<number, Record<string, unknown>>();
  for (const s of scores) {
    const sid = Number(s.section_id);
    if (!latestBySection.has(sid)) latestBySection.set(sid, s);
  }
  const pageScore = queryOne<Record<string, unknown>>(
    "SELECT * FROM geo_scores WHERE page_id=? AND section_id IS NULL ORDER BY id DESC LIMIT 1",
    pageId,
  );
  const history = query<{ ts: string; overall: number }>(
    "SELECT ts, overall FROM geo_scores WHERE page_id=? AND section_id IS NULL ORDER BY id DESC LIMIT 30",
    pageId,
  ).reverse();
  return {
    page,
    sections: sections.map((s) => ({ ...s, score: latestBySection.get(Number(s.id)) ?? null })),
    pageScore,
    history,
  };
}

export function visibilityResults(opts: { platform?: string; status?: string; limit?: number; q?: string } = {}) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.platform) {
    where.push("platform=?");
    params.push(opts.platform);
  }
  if (opts.status) {
    where.push("status=?");
    params.push(opts.status);
  }
  if (opts.q) {
    where.push("query LIKE ?");
    params.push(`%${opts.q}%`);
  }
  return query<Record<string, unknown>>(
    `SELECT * FROM visibility_results ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT ?`,
    ...params,
    opts.limit ?? 100,
  );
}

export function competitorsDetailed() {
  const scorecard = competitorScorecard(120);
  const observations = query<Record<string, unknown>>(
    "SELECT domain, platform, query, observed_feature, confidence, ts FROM competitor_observations ORDER BY id DESC LIMIT 200",
  );
  return { scorecard, observations };
}

export function entityData() {
  const checks = query<Record<string, unknown>>("SELECT * FROM entity_checks ORDER BY id DESC LIMIT 40");
  const facts = query<Record<string, unknown>>("SELECT * FROM entity_facts ORDER BY id DESC LIMIT 200");
  const history = query<{ ts: string; matches: number; total: number }>(
    "SELECT substr(ts,1,10) ts, SUM(matches) matches, COUNT(*) total FROM entity_facts GROUP BY substr(ts,1,10) ORDER BY ts",
  );
  return { checks, facts, history };
}

export function activityFeed(limit = 100) {
  return query<Record<string, unknown>>(
    "SELECT a.*, r.agent AS run_agent FROM activity a LEFT JOIN agent_runs r ON r.id = a.run_id ORDER BY a.id DESC LIMIT ?",
    limit,
  );
}

export function agentRuns(limit = 100) {
  return query<Record<string, unknown>>("SELECT * FROM agent_runs ORDER BY id DESC LIMIT ?", limit);
}

export function researchNotes() {
  return query<Record<string, unknown>>("SELECT * FROM research_notes ORDER BY id DESC LIMIT 100");
}

export function listQueries() {
  return query<Record<string, unknown>>(
    `SELECT q.*, 
       (SELECT COUNT(*) FROM visibility_results r WHERE r.query=q.text) AS tested,
       (SELECT MAX(ts) FROM visibility_results r WHERE r.query=q.text) AS last_tested
     FROM queries q ORDER BY q.family, q.priority, q.text LIMIT 400`,
  );
}
