import { NextResponse } from "next/server";
import { currentUser, requireRole } from "@/lib/auth";
import { getDb, logActivity } from "@/lib/db";
import { createExperiment, evaluateVisibilityExperiment, setResult, listExperiments, getExperiment } from "@/lib/engine/experiment";

export const maxDuration = 60;

/** Experiment Lab API (spec §8). */
export async function POST(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    code?: string;
    hypothesis?: string;
    targetUrl?: string;
    targetSection?: string;
    baseline?: string;
    variables?: string;
    methodology?: string;
    evidence?: string;
    result?: string;
    conclusion?: string;
    limitations?: string;
    confidence?: string;
  };
  const action = body.action ?? "create";

  if (action === "create") {
    if (!body.code || !body.hypothesis) return NextResponse.json({ error: "code and hypothesis are required." }, { status: 400 });
    const id = createExperiment({
      code: body.code,
      hypothesis: body.hypothesis,
      targetUrl: body.targetUrl,
      targetSection: body.targetSection,
      baseline: body.baseline,
      variables: body.variables,
      methodology: body.methodology,
      evidence: body.evidence,
    });
    logActivity("Experiment Agent", `Created experiment ${body.code}.`, { level: "success", evidence: `experiments#${id}` });
    return NextResponse.json({ ok: true, id });
  }

  if (action === "conclude") {
    if (!body.code || !body.result || !body.conclusion) return NextResponse.json({ error: "code, result and conclusion required." }, { status: 400 });
    setResult(body.code, body.result, body.conclusion, body.limitations ?? "", body.confidence ?? "low");
    logActivity("Experiment Agent", `Concluded experiment ${body.code}.`, { level: "success" });
    return NextResponse.json({ ok: true });
  }

  if (action === "evaluate") {
    if (!body.code) return NextResponse.json({ error: "code required" }, { status: 400 });
    const evaluation = evaluateVisibilityExperiment(body.code);
    return NextResponse.json({ ok: true, evaluation });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function GET(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator", "viewer"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const code = new URL(req.url).searchParams.get("code");
  if (code) {
    const exp = getExperiment(code);
    if (!exp) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ experiment: exp, evaluation: evaluateVisibilityExperiment(code) });
  }
  return NextResponse.json({ experiments: listExperiments() });
}
