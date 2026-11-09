import { guard, envelope, withRateHeaders } from "@/lib/api-v1";
import { query } from "@/lib/db";
import { COMPANY } from "@/lib/company";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/citations
 *
 * Citation intelligence in two parts, because they answer different questions:
 *
 *   sources    -- domains that AI platforms cited in answers we measured, and
 *                 how often they cited us versus a competitor
 *   actions    -- the remediation queue for sources we lose on
 *
 * Citation here means "this URL appeared as a source in a stored answer". It
 * does not claim the platform attributes authority to it.
 */
export async function GET(req: Request) {
  const g = await guard(req, "read:citations");
  if ("response" in g) return g.response;
  const { url, limit, offset } = g.ctx;

  const since = url.searchParams.get("since") ?? "-30 days";
  const include = (url.searchParams.get("include") ?? "sources,actions").split(",").map((s) => s.trim());

  const result: Record<string, unknown> = {};

  if (include.includes("sources")) {
    // cited_urls holds an array of plain URL strings, so the domain is derived
    // in TypeScript. Doing this in SQL would need json_extract on a string
    // value, which throws, and a malformed row would poison the whole query.
    const rows = query<{ cited_urls: string; ts: string }>(
      `SELECT cited_urls, ts FROM visibility_results
       WHERE ts >= datetime('now', ?)
         AND cited_urls IS NOT NULL AND json_valid(cited_urls)`,
      since,
    );

    const agg = new Map<
      string,
      { domain: string; citations: number; ownedCitations: number; firstSeenAt: string; lastSeenAt: string }
    >();
    for (const row of rows) {
      let urls: unknown;
      try {
        urls = JSON.parse(row.cited_urls);
      } catch {
        continue;
      }
      if (!Array.isArray(urls)) continue;
      for (const u of urls) {
        const domain = domainOf(typeof u === "string" ? u : (u as { url?: string })?.url);
        if (!domain) continue;
        const cur = agg.get(domain) ?? {
          domain,
          citations: 0,
          ownedCitations: 0,
          firstSeenAt: row.ts,
          lastSeenAt: row.ts,
        };
        cur.citations += 1;
        if (isOwnedDomain(domain)) cur.ownedCitations += 1;
        if (row.ts < cur.firstSeenAt) cur.firstSeenAt = row.ts;
        if (row.ts > cur.lastSeenAt) cur.lastSeenAt = row.ts;
        agg.set(domain, cur);
      }
    }

    const all = [...agg.values()].sort((a, b) => b.citations - a.citations);
    result.sources = all.slice(offset, offset + limit);
    result.sourcesTotal = all.length;
  }

  if (include.includes("actions")) {
    result.actions = query<Record<string, unknown>>(
      `SELECT id, domain, times_cited_when_we_lost, action, status, engines, example_urls, updated_at
       FROM citation_actions ORDER BY times_cited_when_we_lost DESC LIMIT ?`,
      limit,
    ).map((r) => ({
      id: Number(r.id),
      domain: String(r.domain ?? ""),
      timesCitedWhenWeLost: Number(r.times_cited_when_we_lost ?? 0),
      action: r.action ?? null,
      status: r.status ?? null,
      engines: safeJson(r.engines, []),
      exampleUrls: safeJson(r.example_urls, []),
      updatedAt: r.updated_at ?? null,
    }));
  }

  const res = envelope(result, { window: since });
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

/** Hostname from a URL, lowercased and stripped of a leading www. */
function domainOf(url: unknown): string | null {
  if (typeof url !== "string" || !url) return null;
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** A cited domain is "ours" when it is the company site or a subdomain of it. */
function isOwnedDomain(domain: string): boolean {
  const owned = new URL(COMPANY.website).hostname.toLowerCase().replace(/^www\./, "");
  return domain === owned || domain.endsWith(`.${owned}`);
}
