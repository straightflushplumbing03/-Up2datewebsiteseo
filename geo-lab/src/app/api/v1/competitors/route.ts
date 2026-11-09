import { guard, envelope, withRateHeaders } from "@/lib/api-v1";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/competitors
 *
 * Tracked competitors plus, for each, how often they appeared in the same AI
 * answers we measured. Share of voice is computed from stored observations
 * only; a competitor we have never observed reports zero rather than a guess.
 */
export async function GET(req: Request) {
  const g = await guard(req, "read:competitors");
  if ("response" in g) return g.response;
  const { url, limit, offset } = g.ctx;

  const city = url.searchParams.get("city");
  const since = url.searchParams.get("since") ?? "-30 days";

  const total = Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM competitors")?.c ?? 0);

  const rows = query<Record<string, unknown>>(
    `SELECT c.id, c.domain, c.name, c.tier, c.home_city, c.notes,
            (SELECT COUNT(*) FROM competitor_observations o
              WHERE o.competitor_id = c.id AND o.ts >= datetime('now', ?) AND o.appeared = 1) AS appearances,
            (SELECT COUNT(*) FROM competitor_observations o
              WHERE o.competitor_id = c.id AND o.ts >= datetime('now', ?)) AS observations,
            (SELECT o.platform FROM competitor_observations o
              WHERE o.competitor_id = c.id AND o.appeared = 1 ORDER BY o.id DESC LIMIT 1) AS last_platform,
            (SELECT o.ts FROM competitor_observations o
              WHERE o.competitor_id = c.id ORDER BY o.id DESC LIMIT 1) AS last_seen
     FROM competitors c
     ${city ? "WHERE c.home_city = ?" : ""}
     ORDER BY appearances DESC, c.name ASC
     LIMIT ? OFFSET ?`,
    ...(city ? [since, since, city, limit, offset] : [since, since, limit, offset]),
  );

  const totalObservations = rows.reduce((sum, r) => sum + Number(r.observations ?? 0), 0);
  const data = rows.map((r) => ({
    id: Number(r.id),
    domain: String(r.domain ?? ""),
    name: String(r.name ?? ""),
    tier: r.tier ?? null,
    homeCity: r.home_city ?? null,
    notes: r.notes ?? null,
    appearances: Number(r.appearances ?? 0),
    observations: Number(r.observations ?? 0),
    shareOfVoice:
      totalObservations > 0 ? Math.round((Number(r.appearances ?? 0) / totalObservations) * 1000) / 10 : 0,
    lastPlatform: r.last_platform ?? null,
    lastSeenAt: r.last_seen ?? null,
  }));

  const res = envelope(data, {
    pagination: { limit, offset, total, hasMore: offset + data.length < total },
    window: since,
    note: "shareOfVoice is the competitor's appearances as a percent of all observed appearances in the window",
  });
  return withRateHeaders(res, g.ctx.key.id);
}
