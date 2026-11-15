import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { guard, envelope, fail, withRateHeaders } from "@/lib/api-v1";
import { insert, query, queryOne, run as sqlRun, logActivity } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/jobs   (spec Phase 6)
 *
 * Headquarters may request work. The design is deliberately conservative:
 *
 * - Only jobs that are read-only or internal are ever run automatically.
 * - Any job that could touch production, publish externally, or spend money is
 *   recorded as `pending_approval` and is NOT executed. Approval happens in the
 *   lab, by an owner, through the UI or /approve. This endpoint cannot be used
 *   to change production.
 *
 * GET /api/v1/jobs returns the job queue with status.
 */

/** Jobs safe to run without human approval: they only read or measure. */
const AUTO_RUN_KINDS = new Set([
  "ai_recommendation_test",
  "audit_city",
  "research_competitor",
  "analyze_citation_source",
  "recheck_service_category",
  "generate_visibility_report",
]);

/** Bounds on what one caller can write into the job queue. */
const MAX_PARAMS_BYTES = 8 * 1024;
const MAX_OPEN_JOBS = Number(process.env.GEO_LAB_API_MAX_OPEN_JOBS ?? 50);

/** Kinds that must never be auto-run, whatever the caller asks for. */
const NEVER_AUTO_RUN = new Set(["publish", "deploy", "rollback", "spend"]);

export async function POST(req: Request) {
  const g = await guard(req, "write:jobs");
  if ("response" in g) return g.response;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "Invalid JSON body.");
  }

  const kind = String(body.kind ?? "").trim();
  if (!kind) return fail(400, "kind is required.");

  const known = AUTO_RUN_KINDS.has(kind) || NEVER_AUTO_RUN.has(kind);
  if (!known) {
    return fail(400, "Unknown job kind.", `Allowed: ${[...AUTO_RUN_KINDS, ...NEVER_AUTO_RUN].join(", ")}`);
  }

  const params = (body.params as Record<string, unknown>) ?? {};
  if (typeof params !== "object" || Array.isArray(params)) return fail(400, "params must be an object.");
  if (JSON.stringify(params).length > MAX_PARAMS_BYTES) {
    return fail(413, "params too large.", `Limit ${MAX_PARAMS_BYTES} bytes.`);
  }
  // requestedBy is caller-supplied text, so it is labelled with the key that sent
  // it: a key cannot make a job look as if the owner or another key asked for it.
  const claimed = String(body.requestedBy ?? "").trim().slice(0, 80);
  const requestedBy = claimed ? `api:${g.ctx.key.name} (${claimed})` : `api:${g.ctx.key.name}`;

  const pending = Number(
    queryOne<{ c: number }>("SELECT COUNT(*) c FROM api_jobs WHERE status IN ('queued','pending_approval')")?.c ?? 0,
  );
  if (pending >= MAX_OPEN_JOBS) {
    return fail(429, "Job queue full.", `${MAX_OPEN_JOBS} jobs are already queued or awaiting approval.`);
  }

  const needsApproval = NEVER_AUTO_RUN.has(kind) || body.requireApproval === true;
  const status = needsApproval ? "pending_approval" : "queued";
  const jobId = `job_${crypto.randomBytes(8).toString("hex")}`;

  insert("api_jobs", {
    job_id: jobId,
    kind,
    params: JSON.stringify(params),
    status,
    requested_by: requestedBy,
  });

  logActivity(
    "Chief Intelligence Orchestrator",
    needsApproval
      ? `Job ${jobId} (${kind}) from Headquarters is awaiting owner approval.`
      : `Job ${jobId} (${kind}) queued by Headquarters.`,
    { evidence: `api_jobs ${jobId}` },
  );

  const res = envelope(
    {
      jobId,
      kind,
      status,
      params,
      requestedBy,
      requiresApproval: needsApproval,
      message: needsApproval
        ? "Recorded and awaiting owner approval. It will not run until approved in the lab."
        : "Queued. Read-only job; no approval required.",
    },
    {},
  );
  return withRateHeaders(res as NextResponse, g.ctx.key.id);
}

export async function GET(req: Request) {
  const g = await guard(req, "write:jobs");
  if ("response" in g) return g.response;
  const { url, limit, offset } = g.ctx;

  const status = url.searchParams.get("status");
  const clause = status ? "WHERE status = ?" : "";
  const params = status ? [status] : [];
  const total = Number(queryOne<{ c: number }>(`SELECT COUNT(*) c FROM api_jobs ${clause}`, ...params)?.c ?? 0);
  const rows = query<Record<string, unknown>>(
    `SELECT job_id, ts, kind, params, status, requested_by, approved_by, approved_at, result, error, finished_at
     FROM api_jobs ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );

  const data = rows.map((r) => ({
    jobId: String(r.job_id),
    requestedAt: String(r.ts),
    kind: r.kind,
    params: safeJson(r.params, {}),
    status: r.status,
    requestedBy: r.requested_by ?? null,
    approvedBy: r.approved_by ?? null,
    approvedAt: r.approved_at ?? null,
    result: safeJson(r.result, null),
    error: r.error ?? null,
    finishedAt: r.finished_at ?? null,
  }));

  const res = envelope(data, { pagination: { limit, offset, total, hasMore: offset + data.length < total } });
  return withRateHeaders(res, g.ctx.key.id);
}

function safeJson<T>(v: unknown, fallback: T): T {
  if (typeof v !== "string" || !v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

/** Exported for the owner-facing approval route. */
export function approveJob(jobId: string, approvedBy: string): boolean {
  const job = queryOne<{ id: number; status: string }>("SELECT id, status FROM api_jobs WHERE job_id=?", jobId);
  if (!job || job.status !== "pending_approval") return false;
  sqlRun("UPDATE api_jobs SET status='queued', approved_by=?, approved_at=datetime('now') WHERE id=?", approvedBy, job.id);
  logActivity("Chief Intelligence Orchestrator", `Job ${jobId} approved by ${approvedBy}.`, { evidence: `api_jobs ${jobId}` });
  return true;
}
