import { NextResponse } from "next/server";
import { currentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { runSingleAgent, providerEnvFromProcess } from "@/lib/agents/orchestrator";
import { runPublishingAgent } from "@/lib/engine/publishing";
import { runSweep } from "@/lib/engine/visibility";

export const maxDuration = 300;

/** Manual single-agent run controls (spec §13). */
export async function POST(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { agent?: string; limit?: number };
  const agent = body.agent ?? "geo-research";
  const env = providerEnvFromProcess();

  if (agent === "publishing") {
    const out = await runPublishingAgent(Math.min(body.limit ?? 2, 3));
    return NextResponse.json({ ok: true, agent, published: out.published, results: out.results.map((r) => ({ ok: r.ok, prUrl: r.prUrl, message: r.message })) });
  }
  if (agent === "geo-research-sweep") {
    const sweep = await runSweep({ env, trigger: "manual", limit: body.limit ?? 10 });
    return NextResponse.json({ ok: true, agent, rows: sweep.rows.length, providers: sweep.providerResults });
  }

  const result = await runSingleAgent(agent, { env, trigger: "manual", visibilityLimit: body.limit });
  return NextResponse.json({ ok: result.status !== "failed", result });
}
