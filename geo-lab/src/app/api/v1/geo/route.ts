import { guard, envelope, withRateHeaders } from "@/lib/api-v1";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/geo
 *
 * Geographic visibility by city. Laguna Niguel is the priority market and is
 * marked as such, but every city the lab has observations for is returned, so
 * the consumer can expand into South Orange County without a code change.
 *
 * A city with no observations is absent rather than reported as zero, because
 * "never measured" and "measured and not visible" are different facts.
 */
export async function GET(req: Request) {
  const g = await guard(req, "read:geo");
  if ("response" in g) return g.response;
  const { url, limit } = g.ctx;

  const since = url.searchParams.get("since") ?? "-90 days";

  const rows = query<Record<string, unknown>>(
    `SELECT
       COALESCE(city, 'unattributed') AS city,
       COUNT(*) AS observations,
       SUM(CASE WHEN status='mentioned' OR rank IS NOT NULL THEN 1 ELSE 0 END) AS mentions,
       SUM(CASE WHEN rank IS NOT NULL AND rank > 0 AND rank <= 3 THEN 1 ELSE 0 END) AS recommendations,
       AVG(CASE WHEN rank IS NOT NULL AND rank > 0 THEN rank END) AS avg_rank,
       MAX(ts) AS lastObservedAt,
       COUNT(DISTINCT platform) AS platforms
     FROM visibility_results
     WHERE ts >= datetime('now', ?)
     GROUP BY COALESCE(city, 'unattributed')
     ORDER BY observations DESC
     LIMIT ?`,
    since,
    limit,
  );

  const PRIORITY = "Laguna Niguel";
  const data = rows.map((r) => {
    const observations = Number(r.observations ?? 0);
    const pct = (n: unknown) => (observations > 0 ? Math.round((Number(n ?? 0) / observations) * 1000) / 10 : 0);
    const city = String(r.city ?? "unattributed");
    return {
      city,
      priority: city.toLowerCase() === PRIORITY.toLowerCase(),
      observations,
      mentions: Number(r.mentions ?? 0),
      recommendations: Number(r.recommendations ?? 0),
      mentionRate: pct(r.mentions),
      recommendationRate: pct(r.recommendations),
      avgRank: r.avg_rank === null || r.avg_rank === undefined ? null : Math.round(Number(r.avg_rank) * 100) / 100,
      platforms: Number(r.platforms ?? 0),
      lastObservedAt: r.lastObservedAt ?? null,
    };
  });

  const res = envelope(data, {
    priorityMarket: PRIORITY,
    window: since,
    note: "cities with no stored observations are omitted, not reported as zero",
  });
  return withRateHeaders(res, g.ctx.key.id);
}
