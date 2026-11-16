import { NextResponse } from "next/server";
import { getDb } from "./db";
import { verifyApiKey, requireScope, recordRequest, checkRateLimit, type Scope, type ApiKeyRecord } from "./api-keys";

/**
 * Shared plumbing for the /api/v1 surface (spec Phase 3).
 *
 * Every endpoint returns the same envelope so a consumer can parse it once:
 *
 *   { data, meta: { generatedAt, source, count, pagination? }, error? }
 *
 * `source` is always "geo-lab" and `generatedAt` is the server time the query
 * ran, so a consumer can tell how fresh a payload is without guessing.
 */

export const API_VERSION = "v1";
export const SOURCE = "geo-lab";

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface Meta {
  generatedAt: string;
  source: string;
  version: string;
  count: number;
  pagination?: Pagination;
  /** Provenance a consumer may need to interpret the payload honestly. */
  window?: string;
  note?: string;
  priorityMarket?: string;
  rateDefinition?: string;
  [key: string]: unknown;
}

export function envelope<T>(data: T, meta: Partial<Meta> = {}): NextResponse {
  const count = Array.isArray(data) ? data.length : 1;
  return NextResponse.json({
    data,
    meta: {
      generatedAt: new Date().toISOString(),
      source: SOURCE,
      version: API_VERSION,
      count,
      ...meta,
    },
  });
}

export function fail(status: number, error: string, detail?: string): NextResponse {
  return NextResponse.json({ error, ...(detail ? { detail } : {}), meta: { source: SOURCE, version: API_VERSION } }, { status });
}

export function parsePagination(url: URL): { limit: number; offset: number } {
  const rawLimit = Number(url.searchParams.get("limit") ?? 50);
  const rawOffset = Number(url.searchParams.get("offset") ?? 0);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(1, Math.trunc(rawLimit)), 500) : 50;
  const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.trunc(rawOffset)) : 0;
  return { limit, offset };
}

export interface GuardContext {
  key: ApiKeyRecord;
  url: URL;
  limit: number;
  offset: number;
}

/**
 * Authenticate, authorize, rate-limit and audit one request.
 *
 * Returns either a context for the handler or a NextResponse to return
 * directly. Every exit path records the request, so the audit log has no holes
 * and the rate limiter cannot be bypassed by hitting a failing endpoint.
 */
export async function guard(
  req: Request,
  scope: Scope,
): Promise<{ ctx: GuardContext } | { response: NextResponse }> {
  getDb();
  const started = Date.now();
  const url = new URL(req.url);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const path = url.pathname;

  const auth = verifyApiKey(req.headers.get("authorization"));
  if (!auth.ok || !auth.key) {
    recordRequest({ keyId: null, method: req.method, path, status: auth.status, ms: Date.now() - started, ip, note: auth.error });
    return { response: fail(auth.status, auth.error ?? "Unauthorized") };
  }
  const key = auth.key;

  if (!requireScope(key, scope)) {
    recordRequest({ keyId: key.id, method: req.method, path, status: 403, ms: Date.now() - started, ip, note: `missing scope ${scope}` });
    return { response: fail(403, "Insufficient scope.", `This key does not hold ${scope}.`) };
  }

  const rate = checkRateLimit(key.id);
  if (!rate.allowed) {
    recordRequest({ keyId: key.id, method: req.method, path, status: 429, ms: Date.now() - started, ip, note: "rate limited" });
    const res = fail(429, "Rate limit exceeded.", `${rate.limit} requests per minute.`);
    res.headers.set("Retry-After", String(rate.retryAfterSeconds));
    res.headers.set("X-RateLimit-Limit", String(rate.limit));
    res.headers.set("X-RateLimit-Remaining", "0");
    return { response: res };
  }

  const { limit, offset } = parsePagination(url);
  // The handler records the final status; we mark entry here so a crash mid-way
  // still leaves a trace of the attempt.
  recordRequest({ keyId: key.id, method: req.method, path, status: 200, ms: Date.now() - started, ip });

  return { ctx: { key, url, limit, offset } };
}

/** Add honest rate-limit headers to a successful response. */
export function withRateHeaders(res: NextResponse, keyId: number): NextResponse {
  const r = checkRateLimit(keyId);
  res.headers.set("X-RateLimit-Limit", String(r.limit));
  res.headers.set("X-RateLimit-Remaining", String(Math.max(0, r.limit - r.used)));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
