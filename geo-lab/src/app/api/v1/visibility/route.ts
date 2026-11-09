import { guard, envelope, withRateHeaders } from "@/lib/api-v1";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/visibility
 *
 * Latest AI visibility results, one row per (query, platform) observation.
 * Filters: platform, city, service, testType, since, runId.
 *
 * Every row carries the raw observation (rank, answer excerpt, citations,
 * competitors) plus provenance, so a consumer can show evidence rather than a
 * derived number it cannot audit.
 */
export async function GET(req: Request) {
  const g = await guard(req, "read:visibility");
  if ("response" in g) return g.response;
  const { url, limit, offset } = g.ctx;

  const where: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, v: unknown) => {
    where.push(sql);
    params.push(v);
  };

  const platform = url.searchParams.get("platform");
  const city = url.searchParams.get("city");
  const service = url.searchParams.get("service");
  const testType = url.searchParams.get("testType");
  const since = url.searchParams.get("since");
  const runId = url.searchParams.get("runId");
  if (platform) add("platform = ?", platform);
  if (city) add("city = ?", city);
  if (service) add("service = ?", service);
  if (testType) add("test_type = ?", testType);
  if (since) add("ts >= ?", since);
  if (runId) add("run_id = ?", Number(runId));

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = Number(queryOne<{ c: number }>(`SELECT COUNT(*) c FROM visibility_results ${clause}`, ...params)?.c ?? 0);
  const rows = query<Record<string, unknown>>(
    `SELECT id, run_id, ts, query_id, query, platform, test_type, status, rank,
            answer, cited_urls, competitors, city, service, confidence, note
     FROM visibility_results ${clause}
     ORDER BY id DESC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );

  const data = rows.map((r) => ({
    id: Number(r.id),
    runId: Number(r.run_id),
    observedAt: String(r.ts),
    queryId: r.query_id ?? null,
    query: String(r.query ?? ""),
    platform: String(r.platform ?? ""),
    testType: String(r.test_type ?? ""),
    status: String(r.status ?? ""),
    rank: r.rank === null || r.rank === undefined ? null : Number(r.rank),
    // Mentioned = appeared at all. Recommended = ranked in the top set.
    // These are distinct signals and are reported separately, never merged.
    mentioned: r.status === "mentioned" || r.rank !== null,
    recommended: r.rank !== null && Number(r.rank) > 0 && Number(r.rank) <= 3,
    answerExcerpt: r.answer ? String(r.answer).slice(0, 500) : null,
    citedUrls: safeJson(r.cited_urls, []),
    competitors: safeJson(r.competitors, []),
    city: r.city ?? null,
    service: r.service ?? null,
    confidence: r.confidence ?? null,
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
