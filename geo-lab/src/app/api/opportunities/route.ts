import { NextResponse } from "next/server";
import { currentUser, requireRole } from "@/lib/auth";
import { getDb, logActivity } from "@/lib/db";
import { updateOpportunityStatus, listOpportunities } from "@/lib/engine/optimize";

/** Optimization Engine: update an opportunity's status/result. */
export async function POST(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { id?: number; status?: string; result?: string };
  if (!body.id || !body.status) return NextResponse.json({ error: "id and status required." }, { status: 400 });
  const allowed = ["open", "in_progress", "done", "dismissed"];
  if (!allowed.includes(body.status)) return NextResponse.json({ error: `status must be one of ${allowed.join(", ")}` }, { status: 400 });
  updateOpportunityStatus(body.id, body.status, body.result);
  logActivity("Analytics Agent", `Opportunity #${body.id} marked ${body.status}.`, { level: "info" });
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator", "viewer"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  return NextResponse.json({ opportunities: listOpportunities(status) });
}
