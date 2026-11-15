import { insert, query, queryOne, run as sqlRun, logActivity, audit } from "../db";
import { notifyRunComplete } from "../notifications";
import { nowIso } from "../util";
import { crawlRepo, auditSite, fetchLive, sitemapUrls } from "../engine/site";
import { scorePage, type PageScore } from "../engine/geo";
import { persistPages, persistScores } from "../engine/persist";
import { runEntityCheck, ingestEntityHistory } from "../engine/entity";
import { ingestCompetitorObservations, recordFromVisibility, competitorScorecard } from "../engine/competitor";
import { seedTrackedCompetitors } from "../engine/tracked-competitors";
import { runSweep, computeVisibilityMetrics, seedQueries } from "../engine/visibility";
import { deriveOpportunities, ingestCitationActions, listOpportunities } from "../engine/optimize";
import { seedCanonicalExperiments, listExperiments, evaluateVisibilityExperiment } from "../engine/experiment";
import { seedResearchNotes } from "../engine/research";
import { analyzeGeography, saveCoverage, recordGeographicOpportunities } from "../engine/geography";
import { reviewPriorityCity, savePriorityReview, recordPriorityActions } from "../engine/priority-market";
import { saveReport } from "../reporting";
import { runQueuedJobs } from "../jobs";
import { runPublishingAgent } from "../engine/publishing";
import { AGENT_TEAM } from "./team";
import { providerRegistry, type ProviderEnv } from "../engine/providers";

/**
 * Chief Intelligence Orchestrator (spec §12, §13).
 *
 * Runs the daily operations as a sequence of agent steps, records an
 * `agent_runs` row per step and an `activity` row for every meaningful action,
 * prevents overlapping runs, and returns a structured summary. The same
 * function powers the "manual run" controls in the dashboard.
 */

export interface StepResult {
  agent: string;
  status: "ok" | "failed" | "skipped";
  summary: string;
  durationMs: number;
  detail?: unknown;
  error?: string;
}

export interface OrchestratorResult {
  startedAt: string;
  finishedAt: string;
  trigger: string;
  steps: StepResult[];
  ok: boolean;
  summary: string;
}

export interface OrchestratorOptions {
  trigger?: string;
  env: ProviderEnv;
  /** Run a live AI/search sweep (needs a working provider). */
  visibility?: boolean;
  visibilityLimit?: number;
  /** Run the live owned-host entity check (network). */
  liveEntity?: boolean;
  /** Publish queued policy-approved improvements. */
  publish?: boolean;
  /** Skip the overlap guard (manual force). */
  force?: boolean;
  /** Skip network steps that already succeeded in the last 12 hours. */
  resume?: boolean;
}

const OVERLAP_WINDOW_MIN = 40;

/** A killed process leaves status=running. Close those rows so the next run is not blocked. */
export function closeStaleRuns(): number {
  const rows = query<{ id: number; ts: string }>("SELECT id, ts FROM agent_runs WHERE status='running'");
  let closed = 0;
  for (const row of rows) {
    const age = Date.now() - new Date(row.ts.replace(" ", "T") + "Z").getTime();
    if (Number.isNaN(age) || age >= OVERLAP_WINDOW_MIN * 60_000) {
      sqlRun(
        "UPDATE agent_runs SET status='failed', error=?, finished_at=datetime('now') WHERE id=?",
        "Interrupted: the process ended before this step finished.",
        row.id,
      );
      closed += 1;
    }
  }
  return closed;
}

function recentlySucceeded(agent: string): boolean {
  const row = queryOne<{ id: number }>(
    "SELECT id FROM agent_runs WHERE agent=? AND status='ok' AND ts > datetime('now','-12 hours') LIMIT 1",
    agent,
  );
  return Boolean(row);
}

export function isRunInProgress(): boolean {
  const row = queryOne<{ id: number; ts: string }>(
    "SELECT id, ts FROM agent_runs WHERE agent='orchestrator' AND status='running' ORDER BY id DESC LIMIT 1",
  );
  if (!row) return false;
  const age = Date.now() - new Date(row.ts.replace(" ", "T") + "Z").getTime();
  return age < OVERLAP_WINDOW_MIN * 60_000;
}

async function step(
  agent: string,
  trigger: string,
  fn: () => Promise<{ summary: string; detail?: unknown; status?: "ok" | "skipped" }> | { summary: string; detail?: unknown; status?: "ok" | "skipped" },
): Promise<StepResult> {
  const t0 = Date.now();
  const runId = insert("agent_runs", { agent, orchestrator: "orchestrator", trigger, status: "running" });
  try {
    const out = await fn();
    const ms = Date.now() - t0;
    const status = out.status ?? "ok";
    sqlRun("UPDATE agent_runs SET status=?, summary=?, detail=?, finished_at=datetime('now'), duration_ms=? WHERE id=?",
      status, out.summary, out.detail ? JSON.stringify(out.detail).slice(0, 8000) : null, ms, runId);
    return { agent, status, summary: out.summary, durationMs: ms, detail: out.detail };
  } catch (e) {
    const ms = Date.now() - t0;
    const msg = (e as Error).message;
    sqlRun("UPDATE agent_runs SET status='failed', error=?, finished_at=datetime('now'), duration_ms=? WHERE id=?", msg, ms, runId);
    logActivity(agent, `Failed: ${msg}`, { level: "error", evidence: `agent_runs#${runId}`, runId });
    return { agent, status: "failed", summary: msg, durationMs: ms, error: msg };
  }
}

export async function runOrchestrator(opts: OrchestratorOptions): Promise<OrchestratorResult> {
  const startedAt = nowIso();
  const trigger = opts.trigger ?? "manual";
  const steps: StepResult[] = [];
  closeStaleRuns();

  if (!opts.force && isRunInProgress()) {
    return {
      startedAt,
      finishedAt: nowIso(),
      trigger,
      steps: [{ agent: "orchestrator", status: "skipped", summary: "A run is already in progress (overlap guard).", durationMs: 0 }],
      ok: false,
      summary: "Skipped: a run is already in progress.",
    };
  }

  const orchRunId = insert("agent_runs", { agent: "orchestrator", orchestrator: "orchestrator", trigger, status: "running" });
  logActivity("Chief Intelligence Orchestrator", `Daily operations started (${trigger}).`, { evidence: `agent_runs#${orchRunId}`, runId: orchRunId });

  // Ensure the query library + canonical experiments exist.
  const newQueries = seedQueries();
  if (newQueries) logActivity("Chief Intelligence Orchestrator", `Seeded ${newQueries} query-library rows.`, { runId: orchRunId });
  seedCanonicalExperiments();
  seedResearchNotes();

  let pageScores: PageScore[] = [];

  // 1. SEO Technical Agent — crawl, audit, score.
  steps.push(
    await step("SEO Technical Agent", trigger, () => {
      const pages = crawlRepo();
      persistPages(pages);
      const audit = auditSite(pages);
      const indexable = pages.filter((p) => p.indexable);
      pageScores = indexable.map((p) => scorePage(p.doc, p.url));
      persistScores(pageScores, orchRunId);
      insert("technical_health_history", {
        checks: JSON.stringify({
          totalHtmlFiles: audit.totalHtmlFiles,
          indexable: audit.indexablePages,
          sitemapUrls: audit.sitemapUrls,
          brokenLinks: audit.brokenInternalLinks.length,
          issues: audit.issues.length,
        }),
      });
      const critical = audit.issues.filter((i) => i.severity === "critical").length;
      const high = audit.issues.filter((i) => i.severity === "high").length;
      logActivity("SEO Technical Agent", `Crawled ${pages.length} pages (${audit.indexablePages} indexable); ${audit.issues.length} audit issues (${critical} critical, ${high} high); ${audit.brokenInternalLinks.length} broken internal links.`, {
        level: high || critical ? "warning" : "success",
        evidence: `sitemap=${audit.sitemapUrls} urls`,
        runId: orchRunId,
      });
      return { summary: `${pages.length} pages crawled, ${audit.issues.length} issues`, detail: { audit: { ...audit, issues: audit.issues.slice(0, 40) } } };
    }),
  );

  // 2. Content Intelligence Agent — section scoring is done above; derive weak sections.
  steps.push(
    await step("Content Intelligence Agent", trigger, () => {
      const weak = pageScores
        .flatMap((ps) => ps.sectionScores.map((s) => ({ url: ps.url, ...s })))
        .filter((s) => s.overall < 60 && s.wordCount >= 20)
        .sort((a, b) => a.overall - b.overall);
      logActivity("Content Intelligence Agent", `Scored ${pageScores.reduce((a, p) => a + p.sectionScores.length, 0)} sections; ${weak.length} below 60.`, {
        level: "success",
        evidence: `lowest: ${weak[0]?.heading ?? "n/a"}`,
        runId: orchRunId,
      });
      return { summary: `${weak.length} weak sections identified`, detail: { weakest: weak.slice(0, 10).map((w) => ({ url: w.url, heading: w.heading, score: w.overall })) } };
    }),
  );

  // 3. Entity Intelligence Agent.
  if (opts.resume && recentlySucceeded("Entity Intelligence Agent")) {
    steps.push({ agent: "Entity Intelligence Agent", status: "skipped", summary: "Resume: this step already succeeded in the last 12 hours.", durationMs: 0 });
  } else steps.push(
    await step("Entity Intelligence Agent", trigger, async () => {
      const ingested = ingestEntityHistory();
      const report = await runEntityCheck({ live: opts.liveEntity !== false });
      logActivity("Entity Intelligence Agent", `Entity consistency ${report.consistencyScore}%; ${report.discrepancies.length} discrepancy(ies); ${ingested} historical row(s) ingested.`, {
        level: report.discrepancies.length ? "warning" : "success",
        evidence: report.discrepancies.slice(0, 3).join(" | ") || "no discrepancies",
        runId: orchRunId,
      });
      return { summary: `consistency ${report.consistencyScore}%`, detail: { discrepancies: report.discrepancies, checks: report.checks } };
    }),
  );

  // 4. Competitor Intelligence Agent.
  steps.push(
    await step("Competitor Intelligence Agent", trigger, () => {
      const tracked = seedTrackedCompetitors();
      const a = ingestCompetitorObservations();
      const b = recordFromVisibility();
      const scorecard = competitorScorecard();
      logActivity("Competitor Intelligence Agent", `Competitor map updated (+${a} historical, +${b} from visibility); ${scorecard.length} observed domains; ${tracked.ownerNamed} owner-named and ${tracked.discovered} discovered Laguna Niguel competitors seeded.`, {
        level: "success",
        evidence: scorecard.slice(0, 3).map((c) => `${c.domain} (${c.appearances})`).join(", "),
        runId: orchRunId,
      });
      return { summary: `${scorecard.length} competitors tracked`, detail: { top: scorecard.slice(0, 10) } };
    }),
  );

  // 5. Geographic Opportunity Agent — files, scores, and stored tests only.
  steps.push(
    await step("Geographic Opportunity Agent", trigger, () => {
      const rows = analyzeGeography();
      const saved = saveCoverage(rows);
      const created = recordGeographicOpportunities(rows);
      const priority = reviewPriorityCity();
      savePriorityReview(priority);
      const priorityCreated = recordPriorityActions(priority);
      const focusGaps = rows.filter((r) => r.focus !== "extended" && r.gaps.length);
      logActivity("Geographic Opportunity Agent", `Reviewed ${saved} cities; ${focusGaps.length} focus cities have a measured gap; ${created} new opportunities.`, {
        level: focusGaps.length ? "warning" : "success",
        evidence: focusGaps.slice(0, 3).map((r) => `${r.name}: ${r.gaps[0]}`).join(" | ") || "no focus-city gaps",
        runId: orchRunId,
      });
      return {
        summary: `${saved} cities reviewed, ${created + priorityCreated} new opportunities`,
        detail: { top: focusGaps.slice(0, 8).map((r) => ({ city: r.name, focus: r.focus, mentionRate: r.mentionRate, gaps: r.gaps.slice(0, 3) })) },
      };
    }),
  );

  // 6. GEO Research Agent — live visibility sweep.
  if (opts.visibility !== false) {
    if (opts.resume && recentlySucceeded("GEO Research Agent")) {
      steps.push({ agent: "GEO Research Agent", status: "skipped", summary: "Resume: a sweep already succeeded in the last 12 hours.", durationMs: 0 });
    } else steps.push(
      await step("GEO Research Agent", trigger, async () => {
        const registry = providerRegistry(opts.env);
        const available = registry.filter((p) => p.available);
        if (!available.length) {
          logActivity("GEO Research Agent", "No AI/search provider is available in this environment; visibility left UNMEASURED (not zero).", {
            level: "warning",
            evidence: registry.map((p) => `${p.id}: ${p.unavailableReason}`).join(" | ").slice(0, 400),
            runId: orchRunId,
          });
          return { summary: "no provider available — UNMEASURED", detail: { providers: registry.map((p) => ({ id: p.id, available: p.available, reason: p.unavailableReason })) } };
        }
        const sweep = await runSweep({ env: opts.env, trigger, limit: opts.visibilityLimit ?? 20 });
        const conclusive = sweep.rows.filter((r) => r.status !== "inconclusive").length;
        logActivity("GEO Research Agent", `Visibility sweep: ${sweep.rows.length} test(s) across ${sweep.providerResults.length} provider(s), ${conclusive} conclusive.`, {
          level: "success",
          evidence: `runs=${sweep.runIds.join(",")}`,
          runId: orchRunId,
        });
        return { summary: `${sweep.rows.length} tests, ${conclusive} conclusive`, detail: sweep.providerResults };
      }),
    );
  }

  // 7. Analytics Agent — metrics + opportunities.
  steps.push(
    await step("Analytics Agent", trigger, () => {
      const pages = crawlRepo();
      const audit = auditSite(pages);
      const metrics = computeVisibilityMetrics({ sinceDays: 30 });
      ingestCitationActions();
      const created = deriveOpportunities(audit, pageScores, metrics);
      const open = listOpportunities("open").length;
      logActivity("Analytics Agent", `Metrics computed; ${created} new opportunit(ies), ${open} open. Mention rate ${metrics.mentionRate}% over ${metrics.conclusive} conclusive test(s).`, {
        level: "success",
        evidence: `window=${metrics.window.sinceDays}d platform=${metrics.byPlatform.map((p) => p.platform).join(",")}`,
        runId: orchRunId,
      });
      return { summary: `${created} new opportunities`, detail: { metrics: { ...metrics, byPlatform: metrics.byPlatform, shareOfVoice: metrics.shareOfVoice.slice(0, 10) } } };
    }),
  );

  // 8. Experiment Agent — compare stored windows. A small sample is not a result.
  steps.push(
    await step("Experiment Agent", trigger, () => {
      const experiments = listExperiments();
      let insufficient = 0;
      for (const exp of experiments) {
        const ev = evaluateVisibilityExperiment(String(exp.code));
        if (ev && !ev.sufficientSample) insufficient += 1;
      }
      logActivity("Experiment Agent", `Evaluated ${experiments.length} experiment(s); ${insufficient} lack a large enough sample to conclude anything.`, {
        level: "info",
        evidence: "evaluateVisibilityExperiment",
        runId: orchRunId,
      });
      return { summary: `${experiments.length} evaluated, ${insufficient} inconclusive samples` };
    }),
  );

  // 9. Security & Quality Agent — names missing credentials, never their values.
  steps.push(
    await step("Security & Quality Agent", trigger, () => {
      const missing = [
        "GITHUB_TOKEN",
        "GEO_LAB_RUN_TOKEN",
        "TAVILY_API_KEY",
        "GEMINI_API_KEY",
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "PERPLEXITY_API_KEY",
        "XAI_API_KEY",
      ].filter((name) => !(process.env[name] || (name === "TAVILY_API_KEY" && process.env.Tavily_api_key)));
      logActivity("Security & Quality Agent", missing.length ? `Missing credentials: ${missing.join(", ")}.` : "Checked credential presence.", {
        level: missing.length ? "warning" : "success",
        evidence: "env presence only",
        runId: orchRunId,
      });
      return { summary: missing.length ? `missing: ${missing.join(", ")}` : "credential check ok", detail: { missing } };
    }),
  );

  // 10. Queued Headquarters jobs. Publish/deploy/spend are held, not run.
  steps.push(
    await step("Job Runner", trigger, async () => {
      const jobs = await runQueuedJobs(opts.env, 3);
      return { summary: `${jobs.ran} ran, ${jobs.failed} failed, ${jobs.held} held`, detail: jobs.summaries };
    }),
  );

  // 11. Reporting Agent — daily, plus weekly on Sunday in the business timezone.
  steps.push(
    await step("Reporting Agent", trigger, () => {
      const dailyId = saveReport("daily");
      const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short" }).format(new Date());
      const weeklyId = weekday === "Sun" ? saveReport("weekly") : null;
      logActivity("Reporting Agent", `Saved daily report #${dailyId}${weeklyId ? ` and weekly report #${weeklyId}` : ""}.`, {
        level: "success",
        evidence: `reports#${dailyId}`,
        runId: orchRunId,
      });
      return { summary: weeklyId ? `daily #${dailyId}, weekly #${weeklyId}` : `daily #${dailyId}` };
    }),
  );

  const ok = steps.every((s) => s.status !== "failed");
  const summary = `${steps.filter((s) => s.status === "ok").length}/${steps.length} steps ok`;
  sqlRun("UPDATE agent_runs SET status=?, summary=?, finished_at=datetime('now'), duration_ms=? WHERE id=?",
    ok ? "ok" : "partial", summary, Date.now() - new Date(startedAt).getTime(), orchRunId);
  audit("orchestrator", "daily-run", trigger, summary);

  // Notify the owner (spec §16). A notification failure must never fail the run,
  // so the outcome is logged rather than thrown.
  await notifyRunComplete({
    trigger,
    ok,
    summary,
    failures: steps.filter((s) => s.status === "failed").map((s) => `${s.agent}: ${s.summary}`),
  });

  return { startedAt, finishedAt: nowIso(), trigger, steps, ok, summary };
}

/** Manual single-agent run controls (spec §13 "manual run controls"). */
export async function runSingleAgent(agentId: string, opts: OrchestratorOptions): Promise<StepResult> {
  const agent = AGENT_TEAM.find((a) => a.id === agentId);
  if (!agent) return { agent: agentId, status: "failed", summary: `Unknown agent: ${agentId}`, durationMs: 0 };
  switch (agentId) {
    case "seo-technical":
    case "content-intelligence":
      return step(agent.name, opts.trigger ?? "manual", () => {
        const pages = crawlRepo();
        persistPages(pages);
        const indexable = pages.filter((p) => p.indexable);
        const scores = indexable.map((p) => scorePage(p.doc, p.url));
        persistScores(scores);
        return { summary: `Re-scored ${scores.length} pages`, detail: { avg: Math.round((scores.reduce((a, s) => a + s.overall, 0) / (scores.length || 1)) * 10) / 10 } };
      });
    case "entity-intelligence":
      return step(agent.name, opts.trigger ?? "manual", async () => {
        const r = await runEntityCheck({ live: opts.liveEntity !== false });
        return { summary: `consistency ${r.consistencyScore}%`, detail: { discrepancies: r.discrepancies } };
      });
    case "competitor-intelligence":
      return step(agent.name, opts.trigger ?? "manual", () => {
        ingestCompetitorObservations();
        recordFromVisibility();
        return { summary: `${competitorScorecard().length} competitors`, detail: {} };
      });
    case "geo-research":
      return step(agent.name, opts.trigger ?? "manual", async () => {
        const sweep = await runSweep({ env: opts.env, trigger: opts.trigger ?? "manual", limit: opts.visibilityLimit ?? 10 });
        return { summary: `${sweep.rows.length} tests`, detail: sweep.providerResults };
      });
    case "analytics":
      return step(agent.name, opts.trigger ?? "manual", () => {
        const pages = crawlRepo();
        const audit = auditSite(pages);
        const scores = pages.filter((p) => p.indexable).map((p) => scorePage(p.doc, p.url));
        const metrics = computeVisibilityMetrics({ sinceDays: 30 });
        const created = deriveOpportunities(audit, scores, metrics);
        return { summary: `${created} new opportunities`, detail: { mentionRate: metrics.mentionRate } };
      });
    case "geographic":
      return step(agent.name, opts.trigger ?? "manual", () => {
        const rows = analyzeGeography();
        saveCoverage(rows);
        const created = recordGeographicOpportunities(rows);
        const priority = reviewPriorityCity();
        savePriorityReview(priority);
        recordPriorityActions(priority);
        return { summary: `${rows.length} cities, ${created} new coverage opportunities`, detail: { lagunaNiguelTests: priority.conclusiveTests } };
      });
    case "experiment":
      return step(agent.name, opts.trigger ?? "manual", () => {
        const experiments = listExperiments();
        const insufficient = experiments.filter((exp) => {
          const ev = evaluateVisibilityExperiment(String(exp.code));
          return ev ? !ev.sufficientSample : true;
        }).length;
        return { summary: `${experiments.length} evaluated, ${insufficient} without a large enough sample` };
      });
    case "security-quality":
      return step(agent.name, opts.trigger ?? "manual", () => {
        const missing = ["GITHUB_TOKEN", "GEO_LAB_RUN_TOKEN", "OPENAI_API_KEY", "GEMINI_API_KEY", "ANTHROPIC_API_KEY", "XAI_API_KEY", "PERPLEXITY_API_KEY"].filter((name) => !process.env[name]);
        return { summary: missing.length ? `missing: ${missing.join(", ")}` : "credential check ok", detail: { missing } };
      });
    case "publishing":
      return step(agent.name, opts.trigger ?? "manual", async () => {
        const out = await runPublishingAgent(2);
        return { summary: `${out.published} pull request(s) opened`, detail: out.results.map((r) => r.message) };
      });
    case "orchestrator":
      return { agent: agent.name, status: "skipped", summary: "Use Run daily operations. A nested orchestrator is not started from this button.", durationMs: 0 };
    default:
      return { agent: agentId, status: "failed", summary: `No runner for ${agentId}.`, durationMs: 0 };
  }
}

export function providerEnvFromProcess(): ProviderEnv {
  return {
    tavily: process.env.Tavily_api_key || process.env.TAVILY_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    xai: process.env.XAI_API_KEY,
  };
}

/** Plain-language description of the orchestrator's duties (spec §12). */
export function orchestratorDescription(): string[] {
  return [
    "Assigns each specialist agent its task in a fixed order and records the result of every step.",
    "Guards against overlapping runs so two scheduled executions never run at once.",
    "Seeds the query library and canonical experiments so the research surface stays complete.",
    "Reviews agent output for evidence: an agent that reports nothing measurable is logged as UNMEASURED, not as success.",
    "Derives prioritised opportunities from the crawl, scores and measured visibility.",
    "Records failures with their reason and keeps a complete, queryable history.",
    "Never publishes a change that fails validation, and never pushes to main or merges a PR.",
  ];
}
