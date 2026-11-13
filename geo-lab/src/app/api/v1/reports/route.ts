import { guard, envelope, withRateHeaders } from "@/lib/api-v1";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/reports
 *
 * Completed audit / activity reports. Without ?id the list is returned with
 * bodies omitted (they are large); ?id=<n> returns one report in full.
 */
export async function GET(req: Request) {
  const g = await guard(req, "read:reports");
  if ("response" in g) return g.response;
  const { url, limit, offset } = g.ctx;

  const id = url.searchParams.get("id");
  if (id) {
    const row = queryOne<Record<string, unknown>>(
      "SELECT id, ts, period, report_date, title, body, source_run FROM reports WHERE id = ?",
      Number(id),
    );
    if (!row) {
      const res = envelope(null, {});
      return withRateHeaders(res, g.ctx.key.id);
    }
    const res = envelope({
      id: Number(row.id),
      generatedAt: String(row.ts),
      period: row.period ?? null,
      reportDate: row.report_date ?? null,
      title: row.title ?? null,
      body: row.body ?? null,
      sourceRun: row.source_run ?? null,
    });
    return withRateHeaders(res, g.ctx.key.id);
  }

  const period = url.searchParams.get("period");
  const clause = period ? "WHERE period = ?" : "";
  const params = period ? [period] : [];
  const total = Number(queryOne<{ c: number }>(`SELECT COUNT(*) c FROM reports ${clause}`, ...params)?.c ?? 0);
  const rows = query<Record<string, unknown>>(
    `SELECT id, ts, period, report_date, title, LENGTH(body) AS body_length, source_run
     FROM reports ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );

  const data = rows.map((r) => ({
    id: Number(r.id),
    generatedAt: String(r.ts),
    period: r.period ?? null,
    reportDate: r.report_date ?? null,
    title: r.title ?? null,
    bodyLength: Number(r.body_length ?? 0),
    sourceRun: r.source_run ?? null,
    // Bodies are fetched per-report so a list call stays small.
    bodyAvailableAt: `/api/v1/reports?id=${r.id}`,
  }));

  const res = envelope(data, { pagination: { limit, offset, total, hasMore: offset + data.length < total } });
  return withRateHeaders(res, g.ctx.key.id);
}
