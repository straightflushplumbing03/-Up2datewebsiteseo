import { logActivity, query, queryOne, run as sqlRun } from "./db";
import { providerRegistry, type ProviderEnv } from "./engine/providers";
import { runSweep } from "./engine/visibility";
import { analyzeGeography, saveCoverage } from "./engine/geography";
import { competitorScorecard } from "./engine/competitor";
import { saveReport, type ReportPeriod } from "./reporting";

/**
 * Executes queued Headquarters jobs. Kinds that could publish, deploy, roll
 * back, or spend are never run here, even if a row was marked queued.
 */

const NEVER_RUN = new Set(["publish", "deploy", "rollback", "spend"]);

export interface JobRunSummary {
  ran: number;
  failed: number;
  held: number;
  summaries: string[];
}

export async function runQueuedJobs(env: ProviderEnv, max = 3): Promise<JobRunSummary> {
  const out: JobRunSummary = { ran: 0, failed: 0, held: 0, summaries: [] };
  const queued = query<{ id: number; job_id: string; kind: string; params: string | null }>(
    "SELECT id, job_id, kind, params FROM api_jobs WHERE status='queued' ORDER BY id ASC LIMIT ?",
    Math.max(1, max),
  );
  for (const job of queued) {
    const claimed = sqlRun("UPDATE api_jobs SET status='running' WHERE id=? AND status='queued'", job.id);
    if (claimed.changes !== 1) continue;
    if (NEVER_RUN.has(job.kind)) {
      finish(job.id, "approved_held", null, "This kind is not executed by the job runner. Nothing was published, deployed, or spent.");
      out.held += 1;
      out.summaries.push(`${job.job_id} held (${job.kind})`);
      continue;
    }
    try {
      const result = await execute(job.kind, parseParams(job.params), env);
      finish(job.id, "done", result, null);
      out.ran += 1;
      out.summaries.push(`${job.job_id} done (${job.kind})`);
      logActivity("Chief Intelligence Orchestrator", `Job ${job.job_id} (${job.kind}) finished.`, { level: "success", evidence: `api_jobs ${job.job_id}` });
    } catch (e) {
      const message = (e as Error).message;
      finish(job.id, "failed", null, message);
      out.failed += 1;
      out.summaries.push(`${job.job_id} failed (${job.kind}): ${message}`);
      logActivity("Chief Intelligence Orchestrator", `Job ${job.job_id} failed: ${message}`, { level: "error", evidence: `api_jobs ${job.job_id}` });
    }
  }
  return out;
}

function parseParams(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function execute(kind: string, params: Record<string, unknown>, env: ProviderEnv): Promise<unknown> {
  switch (kind) {
    case "audit_city": {
      const rows = analyzeGeography();
      saveCoverage(rows);
      const city = typeof params.city === "string" ? params.city.toLowerCase() : "";
      const picked = city ? rows.filter((r) => r.name.toLowerCase() === city || r.slug === city) : rows;
      if (city && !picked.length) throw new Error(`No verified city matches "${params.city}".`);
      return picked.slice(0, 8).map((r) => ({
        city: r.name,
        focus: r.focus,
        page: r.pageUrl,
        mentionRate: r.mentionRate,
        conclusiveTests: r.conclusiveTests,
        missingServices: r.missingServices,
        gaps: r.gaps,
      }));
    }
    case "research_competitor": {
      const domain = String(params.domain ?? "").toLowerCase();
      const card = competitorScorecard().find((c) => c.domain === domain);
      if (!card) return { domain: domain || null, observed: false, note: "No stored observations for this domain. Not the same as zero market share." };
      return { domain: card.domain, appearances: card.appearances, shareOfVoice: card.shareOfVoice, observed: true };
    }
    case "analyze_citation_source": {
      const domain = String(params.domain ?? "");
      const row = queryOne<{ domain: string; times_cited_when_we_lost: number; action: string; status: string }>(
        "SELECT domain, times_cited_when_we_lost, action, status FROM citation_actions WHERE domain=?",
        domain,
      );
      if (!row) return { domain, found: false, note: "No stored citation-gap row for this domain." };
      return row;
    }
    case "recheck_service_category": {
      const service = String(params.service ?? "");
      const page = queryOne<{ url: string; path: string }>(
        "SELECT url, path FROM pages WHERE path LIKE ? ORDER BY indexable DESC LIMIT 1",
        `%${service}%`,
      );
      if (!page) return { service, found: false, note: "No crawled page matches that service. Run the SEO crawl first." };
      const score = queryOne<{ overall: number }>(
        `SELECT g.overall FROM geo_scores g JOIN pages p ON p.id = g.page_id
          WHERE p.path=? AND g.section_id IS NULL ORDER BY g.id DESC LIMIT 1`,
        page.path,
      );
      return { service, url: page.url, geoOverall: score ? Number(score.overall) : null };
    }
    case "generate_visibility_report": {
      const period: ReportPeriod = params.period === "weekly" || params.period === "monthly" ? params.period : "daily";
      const id = saveReport(period);
      return { reportId: id, period };
    }
    case "ai_recommendation_test": {
      const available = providerRegistry(env).filter((p) => p.available);
      if (!available.length) {
        throw new Error("No visibility provider is configured. Result is UNMEASURED, not zero. Set a provider key and retry.");
      }
      const limit = Math.min(Number(params.limit ?? 5) || 5, 5);
      const sweep = await runSweep({ env, trigger: "api-job", limit });
      return {
        tests: sweep.rows.length,
        conclusive: sweep.rows.filter((r) => r.status !== "inconclusive").length,
        providers: sweep.providerResults,
      };
    }
    default:
      throw new Error(`Unknown job kind: ${kind}`);
  }
}

function finish(id: number, status: string, result: unknown, error: string | null): void {
  sqlRun(
    "UPDATE api_jobs SET status=?, result=?, error=?, finished_at=datetime('now') WHERE id=?",
    status,
    result == null ? null : JSON.stringify(result).slice(0, 8000),
    error,
    id,
  );
}
