import { guard, envelope, withRateHeaders } from "@/lib/api-v1";
import { apiHealth } from "@/lib/api-keys";
import { queryOne } from "@/lib/db";
import { COMPANY } from "@/lib/company";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/health
 *
 * Connection health for a consumer (spec Phase 2). Reports what the lab can
 * measure, not just that it is up: the newest data timestamps let a consumer
 * tell a live lab from a stalled one. A stale lab is reported as stale.
 */
export async function GET(req: Request) {
  const g = await guard(req, "read:health");
  if ("response" in g) return g.response;

  const health = apiHealth();
  const lastRun = queryOne<{ ts: string; status: string; summary: string }>(
    "SELECT ts, status, summary FROM agent_runs WHERE orchestrator=1 ORDER BY id DESC LIMIT 1",
  );
  const lastVisibility = queryOne<{ ts: string }>("SELECT ts FROM visibility_runs ORDER BY id DESC LIMIT 1");
  const lastCrawl = queryOne<{ ts: string }>("SELECT updated_at AS ts FROM pages ORDER BY updated_at DESC LIMIT 1");
  const counts = {
    pages: Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM pages")?.c ?? 0),
    visibilityResults: Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM visibility_results")?.c ?? 0),
    competitors: Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM competitors")?.c ?? 0),
    opportunities: Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM opportunities WHERE status='open'")?.c ?? 0),
  };

  const res = envelope({
    status: "ok",
    company: { name: COMPANY.name, website: COMPANY.website },
    api: health,
    data: {
      lastRunAt: lastRun?.ts ?? null,
      lastRunStatus: lastRun?.status ?? null,
      lastRunSummary: lastRun?.summary ?? null,
      lastVisibilityAt: lastVisibility?.ts ?? null,
      lastCrawlAt: lastCrawl?.ts ?? null,
    },
    counts,
  });
  return withRateHeaders(res, g.ctx.key.id);
}
