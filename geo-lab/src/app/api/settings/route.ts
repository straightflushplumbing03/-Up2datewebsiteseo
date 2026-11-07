import { NextResponse } from "next/server";
import { currentUser, requireRole, changePassword } from "@/lib/auth";
import { getDb, audit, query, run as sqlRun, insert } from "@/lib/db";
import { seedIntegrations } from "@/lib/integrations";
import { providerEnvFromProcess } from "@/lib/agents/orchestrator";
import { costEstimate } from "@/lib/reporting";
import { notificationStatus, activeChannel, defaultRecipient, listNotifications, notify } from "@/lib/notifications";
import { COMPANY } from "@/lib/company";

export const maxDuration = 60;

/** Settings actions: password change, integration refresh, cost record. */
export async function POST(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { action?: string; newPassword?: string; cost?: { provider: string; category: string; units: number; unitLabel?: string; estUsd: number; note?: string } };
  const action = body.action ?? "";

  if (action === "change-password") {
    if (!body.newPassword || body.newPassword.length < 10) {
      return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });
    }
    changePassword(user!.id, body.newPassword);
    audit(user!.email, "change-password", user!.email, undefined);
    return NextResponse.json({ ok: true, message: "Password changed. Please sign in again." });
  }

  if (action === "refresh-integrations") {
    seedIntegrations(providerEnvFromProcess());
    return NextResponse.json({ ok: true });
  }

  if (action === "test-notification") {
    // Prove the configured channel end to end rather than only displaying it.
    const result = await notify({
      kind: "test",
      subject: "GEO Lab test notification",
      body: `This is a test sent from Settings at ${new Date().toISOString()}.\nChannel: ${activeChannel()}\nRecipient: ${defaultRecipient() ?? "(none set)"}`,
    });
    return NextResponse.json({ ok: result.status !== "failed", result });
  }

  if (action === "add-cost" && body.cost) {
    insert("cost_entries", {
      provider: body.cost.provider,
      category: body.cost.category,
      units: body.cost.units,
      unit_label: body.cost.unitLabel ?? null,
      est_usd: body.cost.estUsd,
      note: body.cost.note ?? null,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function GET() {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator", "viewer"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const costs = costEstimate();
  const costRows = query<Record<string, unknown>>("SELECT * FROM cost_entries ORDER BY id DESC LIMIT 50");
  const auditRows = query<Record<string, unknown>>("SELECT * FROM audit_log ORDER BY id DESC LIMIT 50");
  return NextResponse.json({
    company: { name: COMPANY.name, phone: COMPANY.phone, address: COMPANY.address, website: COMPANY.website },
    costs,
    costRows,
    auditRows,
    notifications: {
      channels: notificationStatus(),
      active: activeChannel(),
      recipient: defaultRecipient() ?? null,
      recent: listNotifications(25),
    },
    env: {
      runTokenSet: Boolean(process.env.GEO_LAB_RUN_TOKEN),
      githubTokenSet: Boolean(process.env.GITHUB_TOKEN),
      tavilySet: Boolean(process.env.Tavily_api_key || process.env.TAVILY_API_KEY),
      geminiSet: Boolean(process.env.GEMINI_API_KEY),
      notifyChannel: process.env.GEO_LAB_NOTIFY_CHANNEL ?? null,
      notifyTo: Boolean(defaultRecipient()),
    },
  });
}

export async function DELETE(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(new URL(req.url).searchParams.get("costId"));
  if (!id) return NextResponse.json({ error: "costId required" }, { status: 400 });
  sqlRun("DELETE FROM cost_entries WHERE id=?", id);
  return NextResponse.json({ ok: true });
}
