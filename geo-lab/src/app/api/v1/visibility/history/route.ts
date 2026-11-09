import { guard, envelope, withRateHeaders } from "@/lib/api-v1";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/visibility/history
 *
 * Aggregated visibility over time, grouped by day (default) or by run.
 * This is the endpoint Headquarters uses for its trend charts and its
 * mention / recommendation / citation rates.
 *
 * The three rates are computed separately and deliberately not conflated:
 *   mentionRate        -- the business appeared in the answer at all
 *   recommendationRate -- the business appeared in the top 3
 *   citationRate       -- the business's own URL was cited as a source
 *
 * `groupBy=city|service|platform` returns the same measures per dimension, so
 * the same numbers feed the geographic and service-category views without a
 * second code path.
 */
export async function GET(req: Request) {
  const g = await guard(req, "read:visibility");
  if ("response" in g) return g.response;
  const { url, limit } = g.ctx;

  const since = url.searchParams.get("since") ?? "-30 days";
  const groupBy = (url.searchParams.get("groupBy") ?? "day").toLowerCase();

  const dimension =
    groupBy === "city" ? "city" : groupBy === "service" ? "service" : groupBy === "platform" ? "platform" : null;

  const dimensionSelect = dimension ? `${dimension} AS dimension,` : "";
  const groupClause = dimension ? `, ${dimension}` : ", date(ts)";

  const rows = query<Record<string, unknown>>(
    `SELECT
       ${dimensionSelect}
       ${dimension ? "" : "date(ts) AS day,"}
       COUNT(*) AS observations,
       SUM(CASE WHEN status='mentioned' OR rank IS NOT NULL THEN 1 ELSE 0 END) AS mentions,
       SUM(CASE WHEN rank IS NOT NULL AND rank > 0 AND rank <= 3 THEN 1 ELSE 0 END) AS recommendations,
       SUM(CASE WHEN cited_urls IS NOT NULL AND cited_urls != '' AND cited_urls != '[]' THEN 1 ELSE 0 END) AS citations,
       AVG(CASE WHEN rank IS NOT NULL AND rank > 0 THEN rank END) AS avg_rank
     FROM visibility_results
     WHERE ts >= datetime('now', ?)
     GROUP BY ${dimension ? dimension : "date(ts)"}
     ORDER BY ${dimension ? dimension : "date(ts)"} DESC
     LIMIT ?`,
    since,
    limit,
  );

  const data = rows.map((r) => {
    const observations = Number(r.observations ?? 0);
    const pct = (n: unknown) => (observations > 0 ? Math.round((Number(n ?? 0) / observations) * 1000) / 10 : 0);
    return {
      ...(dimension ? { dimension: r.dimension ?? "unknown" } : { day: r.day ?? null }),
      observations,
      mentions: Number(r.mentions ?? 0),
      recommendations: Number(r.recommendations ?? 0),
      citations: Number(r.citations ?? 0),
      mentionRate: pct(r.mentions),
      recommendationRate: pct(r.recommendations),
      citationRate: pct(r.citations),
      avgRank: r.avg_rank === null || r.avg_rank === undefined ? null : Math.round(Number(r.avg_rank) * 100) / 100,
    };
  });

  const res = envelope(data, {
    pagination: { limit, offset: 0, total: data.length, hasMore: false },
    // Stated explicitly so no consumer mistakes a heuristic rate for a
    // platform-reported figure.
    rateDefinition: "percent of observations in the group; measured from stored test results",
    window: since,
  });
  return withRateHeaders(res, g.ctx.key.id);
}
