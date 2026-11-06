import { NextResponse } from "next/server";
import { currentUser, requireRole } from "@/lib/auth";
import { getDb, logActivity } from "@/lib/db";
import { runEntityCheck } from "@/lib/engine/entity";

export const maxDuration = 120;

/** Entity Intelligence: run a fresh consistency check (network for live hosts). */
export async function POST() {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const report = await runEntityCheck({ live: true });
  logActivity("Entity Intelligence Agent", `On-demand entity check: ${report.consistencyScore}% consistency, ${report.discrepancies.length} discrepancy(ies).`, {
    level: report.discrepancies.length ? "warning" : "success",
  });
  return NextResponse.json({ ok: true, report });
}
