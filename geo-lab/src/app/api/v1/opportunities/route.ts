import { guard, envelope, withRateHeaders } from "@/lib/api-v1";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/opportunities
 *
 * Recommended improvements from the optimization engine, each tied to the GEO
 * layer it addresses and the evidence that produced it. Ordered by priority so
 * the consumer can surface a work queue without re-ranking.
 */
export async function GET(req: Request) {
  const g = await guard(req, "read:opportunities");
  if ("response" in g) return g.response;
  const { url, limit, offset } = g.ctx;

  const status = url.searchParams.get("status") ?? "open";
  const layer = url.searchParams.get("geoLayer");
  const where: string[] = [];
  const params: unknown[] = [];
  if (status !== "all") {
    where.push("status = ?");
    params.push(status);
  }
  if (layer) {
    where.push("geo_layer = ?");
    params.push(layer);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = Number(queryOne<{ c: number }>(`SELECT COUNT(*) c FROM opportunities ${clause}`, ...params)?.c ?? 0);
  const rows = query<Record<string, unknown>>(
    `SELECT id, ts, title, problem, evidence, url, section, geo_layer, expected_benefit,
            difficulty, impact, effort, priority, proposed, status, implemented_at, result
     FROM opportunities ${clause}
     ORDER BY priority DESC, id DESC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );

  const data = rows.map((r) => ({
    id: Number(r.id),
    identifiedAt: String(r.ts),
    title: r.title ?? null,
    problem: r.problem ?? null,
    evidence: r.evidence ?? null,
    url: r.url ?? null,
    section: r.section ?? null,
    geoLayer: r.geo_layer ?? null,
    expectedBenefit: r.expected_benefit ?? null,
    difficulty: r.difficulty ?? null,
    impact: r.impact ?? null,
    effort: r.effort ?? null,
    priority: r.priority === null || r.priority === undefined ? null : Number(r.priority),
    proposedSolution: r.proposed ?? null,
    status: r.status ?? null,
    implementedAt: r.implemented_at ?? null,
    result: r.result ?? null,
  }));

  const res = envelope(data, { pagination: { limit, offset, total, hasMore: offset + data.length < total } });
  return withRateHeaders(res, g.ctx.key.id);
}
