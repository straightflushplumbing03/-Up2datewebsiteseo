import { NextResponse } from "next/server";
import { bearerTokenMatches, currentUser, requireRole } from "@/lib/auth";
import { getDb, logActivity } from "@/lib/db";
import { runOrchestrator, providerEnvFromProcess, isRunInProgress } from "@/lib/agents/orchestrator";
import { saveReport } from "@/lib/reporting";
import { seedIntegrations } from "@/lib/integrations";

export const maxDuration = 300;

/**
 * The autonomous daily run, exposed over HTTP so a scheduler that is NOT this
 * process can drive it (spec §13: the system must not depend on an open
 * browser/terminal/OpenHands session). GitHub Actions calls this on a cron and
 * passes the bearer token; a signed-in owner can also trigger it manually.
 *
 * Auth: either an authenticated owner/operator session, or the
 * GEO_LAB_RUN_TOKEN bearer (used by the scheduler).
 */
export async function POST(req: Request) {
  getDb();
  const url = new URL(req.url);
  const triggerParam = url.searchParams.get("trigger") ?? "manual";

  const tokenOk = bearerTokenMatches(req.headers.get("authorization"), process.env.GEO_LAB_RUN_TOKEN);

  let actor = "scheduler";
  if (!tokenOk) {
    const user = await currentUser();
    try {
      requireRole(user, ["owner", "operator"]);
      actor = user!.email;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (isRunInProgress()) {
    return NextResponse.json({ ok: false, skipped: true, reason: "A run is already in progress." }, { status: 409 });
  }

  const env = providerEnvFromProcess();
  seedIntegrations(env);

  const visibility = url.searchParams.get("visibility") !== "0";
  const liveEntity = url.searchParams.get("liveEntity") !== "0";
  const limit = Number(url.searchParams.get("limit") ?? 20);

  logActivity("Chief Intelligence Orchestrator", `Scheduled run triggered by ${actor}.`, { evidence: `trigger=${triggerParam}` });

  const result = await runOrchestrator({
    trigger: triggerParam,
    env,
    visibility,
    visibilityLimit: limit,
    liveEntity,
  });

  // Always leave a report behind.
  const period = url.searchParams.get("report") === "weekly" ? "weekly" : url.searchParams.get("report") === "monthly" ? "monthly" : "daily";
  saveReport(period);

  return NextResponse.json({ ok: result.ok, summary: result.summary, steps: result.steps, startedAt: result.startedAt, finishedAt: result.finishedAt });
}

export async function GET() {
  getDb();
  return NextResponse.json({ inProgress: isRunInProgress() });
}
