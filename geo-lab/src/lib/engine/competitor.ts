import { insert, query, queryOne } from "../db";
import { baseDomain, domainOf, readJsonl, unique, pct } from "../util";
import { geDataFile } from "../paths";

/**
 * Competitor Intelligence Engine (spec §7).
 *
 * Built strictly from *observed* data — the growth-engine
 * `competitor_observations.jsonl` rows plus the competitor domains seen in
 * visibility results. Observed facts and hypotheses are kept separate: a
 * domain appearing for a query is a fact; "they rank because of X" is a
 * hypothesis and is labelled as such.
 */

export interface CompetitorRow {
  domain: string;
  name: string | null;
  appearances: number;
  queriesSeen: number;
  platforms: string[];
  tiers: string[];
  topServices: string[];
  topCities: string[];
  observedFeatures: string[];
  shareOfVoice: number;
}

interface RawObs {
  ts: string;
  platform: string;
  competitor?: string;
  domain?: string;
  appeared_for?: string[];
  observed_feature?: string;
  confidence?: string;
  query?: string;
}

const LEADGEN = ["yelp.com", "angi.com", "homeadvisor.com", "thumbtack.com", "facebook.com", "instagram.com", "mapquest.com", "porch.com", "yellowpages.com", "ignitionlabs.com"];

export function ingestCompetitorObservations(): number {
  const rows = readJsonl<RawObs>(geDataFile("competitor_observations.jsonl"));
  let n = 0;
  for (const r of rows) {
    const domain = r.domain || (r.competitor ? domainOf(r.competitor) : "");
    if (!domain) continue;
    const compId = upsertCompetitor(domain, r.competitor ?? null);
    const appearedFor = Array.isArray(r.appeared_for)
      ? r.appeared_for
      : typeof r.appeared_for === "string"
        ? [r.appeared_for]
        : r.query
          ? [r.query]
          : [];
    insert("competitor_observations", {
      ts: r.ts,
      competitor_id: compId,
      domain: baseDomain(domain),
      platform: r.platform || "unknown",
      query: appearedFor.join(" | "),
      appeared: 1,
      rank: null,
      observed_feature: r.observed_feature ?? null,
      confidence: r.confidence ?? null,
      source: "competitor_observations.jsonl",
    });
    n++;
  }
  return n;
}

function upsertCompetitor(domain: string, name: string | null): number {
  const bd = baseDomain(domainOf(domain));
  const existing = queryOne<{ id: number }>("SELECT id FROM competitors WHERE domain=?", bd);
  if (existing) return existing.id;
  return insert("competitors", { domain: bd, name: name ?? null, tier: "observed", home_city: null, notes: null });
}

/** Record competitor domains observed in a live visibility sweep. */
export function recordFromVisibility(): number {
  const rows = query<{ competitors: string; query: string; ts: string; platform: string }>(
    "SELECT competitors, query, ts, platform FROM visibility_results WHERE competitors IS NOT NULL AND competitors != '[]'",
  );
  let n = 0;
  const seen = new Set<string>();
  for (const r of rows) {
    let comps: string[] = [];
    try {
      comps = JSON.parse(r.competitors) as string[];
    } catch {
      continue;
    }
    for (const c of comps) {
      const bd = baseDomain(c);
      if (LEADGEN.includes(bd)) continue;
      const key = `${r.ts}|${bd}|${r.query}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const compId = upsertCompetitor(bd, null);
      insert("competitor_observations", {
        ts: r.ts,
        competitor_id: compId,
        domain: bd,
        platform: r.platform,
        query: r.query,
        appeared: 1,
        rank: null,
        observed_feature: null,
        confidence: "medium",
        source: "visibility_results",
      });
      n++;
    }
  }
  return n;
}

export function competitorScorecard(sinceDays = 90): CompetitorRow[] {
  const from = new Date(Date.now() - sinceDays * 86400_000).toISOString();
  const rows = query<{ domain: string; query: string; platform: string; ts: string; observed_feature: string | null }>(
    "SELECT domain, query, platform, ts, observed_feature FROM competitor_observations WHERE ts >= ?",
    from,
  );
  const total = rows.length || 1;
  const map = new Map<string, CompetitorRow & { featureSet: Set<string>; platformSet: Set<string>; serviceSet: Set<string>; citySet: Set<string> }>();
  for (const r of rows) {
    const bd = baseDomain(r.domain);
    if (LEADGEN.includes(bd)) continue;
    const cur =
      map.get(bd) ??
      ({
        domain: bd,
        name: null,
        appearances: 0,
        queriesSeen: 0,
        platforms: [],
        tiers: ["observed"],
        topServices: [],
        topCities: [],
        observedFeatures: [],
        shareOfVoice: 0,
        featureSet: new Set<string>(),
        platformSet: new Set<string>(),
        serviceSet: new Set<string>(),
        citySet: new Set<string>(),
      } as CompetitorRow & { featureSet: Set<string>; platformSet: Set<string>; serviceSet: Set<string>; citySet: Set<string> });
    cur.appearances++;
    cur.queriesSeen += 1;
    cur.platformSet.add(r.platform);
    if (r.observed_feature) cur.featureSet.add(r.observed_feature);
    const ql = (r.query || "").toLowerCase();
    for (const svc of ["slab leak", "leak detection", "repipe", "water heater", "drain", "sewer", "emergency"]) {
      if (ql.includes(svc)) cur.serviceSet.add(svc);
    }
    for (const city of ["laguna niguel", "dana point", "san clemente", "mission viejo", "aliso viejo", "irvine", "newport beach"]) {
      if (ql.includes(city)) cur.citySet.add(city);
    }
    map.set(bd, cur);
  }
  return [...map.values()]
    .map((c) => ({
      domain: c.domain,
      name: c.name,
      appearances: c.appearances,
      queriesSeen: c.queriesSeen,
      platforms: [...c.platformSet],
      tiers: c.tiers,
      topServices: [...c.serviceSet].slice(0, 6),
      topCities: [...c.citySet].slice(0, 6),
      observedFeatures: [...c.featureSet].slice(0, 6),
      shareOfVoice: pct(c.appearances, total),
    }))
    .sort((a, b) => b.appearances - a.appearances);
}

/** The competitor domains that dominate the spaces we care about. */
export function competitorDomainsForQuery(queryText: string, limit = 10): string[] {
  const rows = query<{ competitors: string }>(
    "SELECT competitors FROM visibility_results WHERE query = ? ORDER BY ts DESC LIMIT 20",
    queryText,
  );
  const counts = new Map<string, number>();
  for (const r of rows) {
    try {
      for (const c of JSON.parse(r.competitors || "[]") as string[]) {
        const bd = baseDomain(c);
        if (LEADGEN.includes(bd)) continue;
        counts.set(bd, (counts.get(bd) ?? 0) + 1);
      }
    } catch {
      /* ignore */
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([d]) => d);
}

export { unique };
