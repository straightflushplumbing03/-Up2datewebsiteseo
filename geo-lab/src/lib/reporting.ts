import { insert, query, queryOne, run as sqlRun } from "./db";
import { COMPANY } from "./company";
import { round1 } from "./util";
import { computeVisibilityMetrics } from "./engine/visibility";
import { competitorScorecard } from "./engine/competitor";
import { listOpportunities } from "./engine/optimize";
import { listExperiments } from "./engine/experiment";
import { listPublications } from "./engine/publishing";
import { listIntegrations } from "./integrations";

/**
 * Reporting (spec §16). Reports are generated from stored rows only. Missing
 * data is stated as a limitation, never rendered as a zero.
 */

export type ReportPeriod = "daily" | "weekly" | "monthly";

export function generateReport(period: ReportPeriod, reportDate?: string): { title: string; body: string; date: string } {
  const date = reportDate ?? new Date().toISOString().slice(0, 10);
  const days = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
  const metrics = computeVisibilityMetrics({ sinceDays: days });
  const competitors = competitorScorecard(days).slice(0, 8);
  const opportunities = listOpportunities();
  const open = opportunities.filter((o) => o.status === "open");
  const experiments = listExperiments().slice(0, 6);
  const publications = listPublications(10);
  const integrations = listIntegrations();

  const agentRuns = query<{ agent: string; status: string; summary: string; ts: string }>(
    "SELECT agent, status, summary, ts FROM agent_runs WHERE ts >= datetime('now', ?) ORDER BY id DESC LIMIT 40",
    `-${days} day`,
  );
  const activity = query<{ ts: string; agent: string; level: string; message: string }>(
    "SELECT ts, agent, level, message FROM activity WHERE ts >= datetime('now', ?) ORDER BY id DESC LIMIT 40",
    `-${days} day`,
  );

  const lines: string[] = [];
  lines.push(`# ${period[0].toUpperCase() + period.slice(1)} report — ${date}`);
  lines.push("");
  lines.push(`${COMPANY.name} · GEO Intelligence Lab · window: last ${days} day(s)`);
  lines.push("");

  lines.push("## AI / search visibility");
  if (metrics.conclusive === 0) {
    lines.push(`- **No conclusive visibility tests in this window.** ${metrics.inconclusive} inconclusive test(s). This is UNMEASURED, not zero visibility.`);
  } else {
    lines.push(`- Tests: ${metrics.total} total, ${metrics.conclusive} conclusive, ${metrics.inconclusive} inconclusive (test success ${metrics.testSuccessRate}%).`);
    lines.push(`- Mention rate: **${metrics.mentionRate}%** · Recommendation rate: **${metrics.recommendationRate}%** · Citation rate: **${metrics.citationRate}%**.`);
    lines.push(`- Platforms measured: ${metrics.byPlatform.map((p) => `${p.platform} (${p.conclusive} conclusive, ${p.mentionRate}% mention)`).join("; ") || "none"}.`);
    if (metrics.byCity.length) lines.push(`- City coverage: ${metrics.byCity.slice(0, 6).map((c) => `${c.city} ${c.mentionRate}%`).join(", ")}.`);
    if (metrics.byService.length) lines.push(`- Service coverage: ${metrics.byService.slice(0, 6).map((s) => `${s.service} ${s.mentionRate}%`).join(", ")}.`);
  }
  lines.push("");

  lines.push("## Competitor movements");
  if (!competitors.length) lines.push("- No competitor observations in this window.");
  else for (const c of competitors) lines.push(`- ${c.domain}: ${c.appearances} appearance(s), share ${c.shareOfVoice}%.`);
  lines.push("");

  lines.push("## Website changes & published improvements");
  if (!publications.length) lines.push("- No publications recorded.");
  else for (const p of publications.slice(0, 6)) {
    lines.push(`- #${p.id} ${p.summary} — status ${p.status}${p.pr_url ? ` (${p.pr_url})` : ""}.`);
  }
  lines.push("");

  lines.push("## Open optimization opportunities");
  lines.push(`- ${open.length} open (of ${opportunities.length} total).`);
  for (const o of open.slice(0, 8)) lines.push(`  - [P${o.priority}] ${o.title} — ${o.geoLayer}${o.url ? ` (${o.url})` : ""}.`);
  lines.push("");

  lines.push("## Experiments");
  if (!experiments.length) lines.push("- None.");
  else for (const e of experiments) lines.push(`- ${e.code}: ${e.status}${e.result ? ` — ${String(e.result).slice(0, 120)}` : ""}.`);
  lines.push("");

  lines.push("## Agent activity");
  const failed = agentRuns.filter((r) => r.status === "failed");
  lines.push(`- ${agentRuns.length} agent step(s); ${failed.length} failed.`);
  for (const r of agentRuns.slice(0, 10)) lines.push(`  - ${r.ts} ${r.agent} — ${r.status}: ${r.summary ?? ""}`);
  if (activity.length) {
    lines.push("");
    lines.push("### Recent activity feed");
    for (const a of activity.slice(0, 12)) lines.push(`- [${a.level}] ${a.agent}: ${a.message}`);
  }
  lines.push("");

  lines.push("## Issues & limitations");
  const notConnected = integrations.filter((i) => i.status !== "connected");
  lines.push(`- ${notConnected.length} integration(s) not connected: ${notConnected.map((i) => i.provider).join(", ") || "none"}.`);
  lines.push("- GSC/GA4/GBP metrics remain unverified until credentials are provided (never reported as zero).");
  lines.push("");

  if (period === "monthly") {
    lines.push("## Operating cost estimate");
    lines.push("See the Settings page for the live cost table. The lab is designed to run on free tiers.");
    lines.push("");
  }

  const title = `${period[0].toUpperCase() + period.slice(1)} report — ${date}`;
  return { title, body: lines.join("\n"), date };
}

export function saveReport(period: ReportPeriod, date?: string, sourceRun?: number): number {
  const r = generateReport(period, date);
  const existing = queryOne<{ id: number }>("SELECT id FROM reports WHERE period=? AND report_date=?", period, r.date);
  if (existing) {
    sqlRun("UPDATE reports SET title=?, body=?, ts=datetime('now') WHERE id=?", r.title, r.body, existing.id);
    return existing.id;
  }
  return insert("reports", { period, report_date: r.date, title: r.title, body: r.body, source_run: sourceRun ?? null });
}

export function listReports(period?: ReportPeriod) {
  return query<Record<string, unknown>>(
    period ? "SELECT id, ts, period, report_date, title FROM reports WHERE period=? ORDER BY report_date DESC" : "SELECT id, ts, period, report_date, title FROM reports ORDER BY report_date DESC LIMIT 100",
    ...(period ? [period] : []),
  );
}

export function getReport(id: number) {
  return queryOne<Record<string, unknown>>("SELECT * FROM reports WHERE id=?", id);
}

/** Estimated monthly operating cost from real usage rows + known plan prices. */
export function costEstimate(): { rows: { provider: string; category: string; units: number; unitLabel: string; estUsd: number; note: string }[]; total: number } {
  const tavilyCalls = Number((queryOne<{ c: number }>("SELECT COUNT(*) c FROM visibility_results WHERE platform='tavily_search'")?.c ?? 0));
  const geminiCalls = Number((queryOne<{ c: number }>("SELECT COUNT(*) c FROM visibility_results WHERE platform='gemini_search'")?.c ?? 0));
  const rows = [
    { provider: "Vercel", category: "Hosting", units: 1, unitLabel: "Hobby project", estUsd: 0, note: "Free tier; the lab deploys as a separate Vercel project." },
    { provider: "SQLite (node:sqlite)", category: "Database", units: 1, unitLabel: "local file", estUsd: 0, note: "Zero-dependency embedded DB on the app's disk." },
    { provider: "GitHub", category: "Source control + Actions", units: 1, unitLabel: "public repo", estUsd: 0, note: "Public repo; Actions minutes are free." },
    { provider: "Tavily", category: "Search API", units: tavilyCalls, unitLabel: "searches to date", estUsd: 0, note: "Free tier (1,000 credits/month). Above that, usage-based." },
    { provider: "Google Gemini", category: "AI API", units: geminiCalls, unitLabel: "calls to date", estUsd: 0, note: "Free tier; grounding not included on 3.x (needs billing)." },
    { provider: "Cloudflare", category: "DNS/CDN/security", units: 1, unitLabel: "zone", estUsd: 0, note: "Free plan." },
    { provider: "GitHub Pages", category: "Static hosting", units: 1, unitLabel: "site", estUsd: 0, note: "Free; fronted by Cloudflare." },
  ];
  const total = round1(rows.reduce((a, r) => a + r.estUsd, 0));
  return { rows, total };
}
