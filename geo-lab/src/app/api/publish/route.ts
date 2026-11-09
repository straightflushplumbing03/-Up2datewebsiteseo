import { NextResponse } from "next/server";
import { currentUser, requireRole } from "@/lib/auth";
import { getDb, audit } from "@/lib/db";
import { generateSafeLinkFixes, publishChange, rollback, validateChange, type ProposedChange } from "@/lib/engine/publishing";
import { crawlRepo } from "@/lib/engine/site";
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "@/lib/paths";

export const maxDuration = 300;

/**
 * Autonomous publishing endpoint (spec §11). Owner/operator only.
 * POST with { action: "publish-safe" } publishes the deterministic, policy-safe
 * link fixes; { action: "validate", url } previews validation; { action:
 * "rollback", publicationId } restores a snapshot.
 */
export async function POST(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { action?: string; publicationId?: number; repoPath?: string; changeType?: ProposedChange["changeType"]; summary?: string; newContent?: string; url?: string };
  const action = body.action ?? "publish-safe";

  if (action === "validate") {
    if (!body.repoPath || !body.newContent || !body.changeType) {
      return NextResponse.json({ error: "repoPath, changeType and newContent are required." }, { status: 400 });
    }
    const v = validateChange({
      url: body.url ?? "",
      repoPath: body.repoPath,
      changeType: body.changeType,
      summary: body.summary ?? "validation preview",
      newContent: body.newContent,
    });
    return NextResponse.json({ ok: v.ok, validation: v });
  }

  if (action === "rollback") {
    if (!body.publicationId) return NextResponse.json({ error: "publicationId required" }, { status: 400 });
    const r = rollback(body.publicationId, user!.email);
    audit(user!.email, "rollback-request", `publication #${body.publicationId}`, r.message);
    return NextResponse.json(r);
  }

  if (action === "preview-safe") {
    const fixes = generateSafeLinkFixes();
    return NextResponse.json({
      ok: true,
      count: fixes.length,
      fixes: fixes.map((f) => ({ repoPath: f.repoPath, summary: f.summary, changeType: f.changeType })),
    });
  }

  // publish-safe
  const fixes = generateSafeLinkFixes();
  if (!fixes.length) {
    return NextResponse.json({ ok: true, published: 0, message: "No routine improvement currently passes the autonomous-publishing gates." });
  }
  const results = fixes.map((f) => publishChange(f, user!.email));
  audit(user!.email, "publish-safe", `${results.length} change(s)`, results.map((r) => `${r.ok ? "ok" : "fail"}:${r.prUrl ?? r.message}`).join(" | "));
  return NextResponse.json({
    ok: results.every((r) => r.ok),
    published: results.filter((r) => r.ok).length,
    results: results.map((r) => ({ ok: r.ok, prUrl: r.prUrl, branch: r.branch, message: r.message, validation: r.validation.checks })),
  });
}

/** GET returns the current routine-change candidates without publishing. */
export async function GET() {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator", "viewer"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const fixes = generateSafeLinkFixes();
  const pages = crawlRepo().length;
  void fs;
  void path;
  void REPO_ROOT;
  return NextResponse.json({ candidates: fixes.map((f) => ({ repoPath: f.repoPath, summary: f.summary })), pages });
}
