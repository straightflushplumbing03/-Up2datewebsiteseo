import { NextResponse } from "next/server";
import { currentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { saveReport, generateReport, type ReportPeriod } from "@/lib/reporting";

export const maxDuration = 120;

/** Generate / regenerate a report (spec §16). */
export async function POST(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { period?: ReportPeriod; date?: string };
  const period: ReportPeriod = body.period ?? "daily";
  const id = saveReport(period, body.date);
  const r = generateReport(period, body.date);
  return NextResponse.json({ ok: true, id, title: r.title, body: r.body });
}
