import { insert, query, queryOne, run as sqlRun, logActivity } from "../db";
import { nowIso, pct, round1, unique } from "../util";
import { QUERY_LIBRARY } from "./queries";
import type { Provider, ProviderEnv, ProviderResult } from "./providers";
import { providerRegistry } from "./providers";

/**
 * AI / search visibility runner + metrics (spec §4).
 *
 * A "sweep" executes a rotating sample of the standardized query library
 * against one or more providers and stores every raw result. Metrics are then
 * computed from the stored rows — the dashboard never computes a number that
 * was not measured.
 */

export function seedQueries(): number {
  let n = 0;
  for (const q of QUERY_LIBRARY) {
    const existing = queryOne<{ id: number }>("SELECT id FROM queries WHERE text=?", q.text);
    if (existing) continue;
    insert("queries", {
      text: q.text,
      family: q.family,
      city: q.city,
      service: q.service,
      intent: q.intent,
      priority: q.priority,
      active: 1,
    });
    n++;
  }
  return n;
}

export interface SweepOptions {
  env: ProviderEnv;
  providerIds?: string[];
  /** Max queries per provider this sweep. */
  limit?: number;
  trigger?: string;
  /** Only these query families. */
  families?: string[];
  /** Prefer queries not tested in the last N days (rotation). */
  rotationDays?: number;
}

export interface SweepSummary {
  runIds: number[];
  providerResults: { provider: string; ok: number; inconclusive: number; total: number }[];
  rows: { query: string; platform: string; status: string; testType: string }[];
  errors: string[];
}

/**
 * Pick queries for a sweep. Prioritised (priority 1 first), then rotated so we
 * do not re-test the same queries every day: untested-in-N-days first, then
 * oldest-tested first.
 */
export function pickQueries(limit: number, families?: string[]): { id: number; text: string; family: string }[] {
  const familyFilter = families && families.length ? `AND family IN (${families.map(() => "?").join(",")})` : "";
  const params: unknown[] = families && families.length ? [...families] : [];
  const rows = query<{ id: number; text: string; family: string; last: string | null }>(
    `SELECT q.id, q.text, q.family,
            (SELECT MAX(ts) FROM visibility_results r WHERE r.query=q.text) AS last
       FROM queries q
      WHERE q.active=1 ${familyFilter}
      ORDER BY q.priority ASC, (last IS NULL) DESC, last ASC
      LIMIT ?`,
    ...params,
    limit,
  );
  return rows.map((r) => ({ id: r.id, text: r.text, family: r.family }));
}

export async function runSweep(opts: SweepOptions): Promise<SweepSummary> {
  const registry = providerRegistry(opts.env);
  const providers: Provider[] = opts.providerIds?.length
    ? registry.filter((p) => opts.providerIds!.includes(p.id))
    : registry.filter((p) => p.available); // by default only what actually works

  const limit = opts.limit ?? 20;
  const picks = pickQueries(limit, opts.families);
  const summary: SweepSummary = { runIds: [], providerResults: [], rows: [], errors: [] };

  for (const provider of providers) {
    const runId = insert("visibility_runs", {
      trigger: opts.trigger ?? "manual",
      provider: provider.id,
      test_type: provider.testType,
      queries_total: picks.length,
      queries_ok: 0,
      note: provider.available ? null : provider.unavailableReason ?? null,
    });
    summary.runIds.push(runId);

    let ok = 0;
    let inconclusive = 0;
    for (const pick of picks) {
      let res: ProviderResult;
      try {
        res = await provider.run(pick.text);
      } catch (e) {
        res = {
          platform: provider.id,
          testType: provider.testType,
          status: "inconclusive",
          rank: null,
          answer: null,
          citedUrls: [],
          competitors: [],
          confidence: "low",
          note: `Provider threw: ${(e as Error).message}`,
        };
        summary.errors.push(`${provider.id}: ${(e as Error).message}`);
      }
      if (res.status === "inconclusive") inconclusive++;
      else ok++;
      insert("visibility_results", {
        run_id: runId,
        query_id: pick.id,
        query: pick.text,
        platform: res.platform,
        test_type: res.testType,
        status: res.status,
        rank: res.rank,
        answer: res.answer ? res.answer.slice(0, 4000) : null,
        cited_urls: JSON.stringify(res.citedUrls),
        competitors: JSON.stringify(res.competitors),
        city: null,
        service: null,
        confidence: res.confidence,
        note: res.note,
      });
      summary.rows.push({ query: pick.text, platform: res.platform, status: res.status, testType: res.testType });
      await sleep(350); // be polite to the API
    }

    sqlRun("UPDATE visibility_runs SET queries_ok=?, note=COALESCE(note,'')||? WHERE id=?", ok, ` ok=${ok} inconclusive=${inconclusive}`, runId);
    summary.providerResults.push({ provider: provider.id, ok, inconclusive, total: picks.length });
    logActivity("GEO Research Agent", `Ran ${picks.length} ${provider.label} test(s): ${ok} conclusive, ${inconclusive} inconclusive.`, {
      level: ok ? "success" : "warning",
      evidence: `visibility_runs#${runId}`,
    });
  }

  return summary;
}

export interface VisibilityMetrics {
  window: { sinceDays: number; from: string; to: string };
  testType: string;
  platform: string | null;
  total: number;
  conclusive: number;
  inconclusive: number;
  recommended: number;
  mentioned: number;
  cited: number;
  absent: number;
  mentionRate: number;
  recommendationRate: number;
  citationRate: number;
  testSuccessRate: number;
  byPlatform: { platform: string; testType: string; total: number; conclusive: number; recommended: number; mentioned: number; cited: number; mentionRate: number }[];
  byService: { service: string; total: number; mentionRate: number }[];
  byCity: { city: string; total: number; mentionRate: number }[];
  shareOfVoice: { domain: string; appearances: number; share: number }[];
  trend: { date: string; mentionRate: number; recommendationRate: number; tests: number }[];
}

export function computeVisibilityMetrics(opts: { sinceDays?: number; platform?: string | null; testType?: string } = {}): VisibilityMetrics {
  const sinceDays = opts.sinceDays ?? 30;
  const from = new Date(Date.now() - sinceDays * 86400_000).toISOString();
  const to = nowIso();
  const platform = opts.platform ?? null;
  const testType = opts.testType ?? "conventional_proxy";

  const where: string[] = ["ts >= ?", "test_type = ?"];
  const params: unknown[] = [from, testType];
  if (platform) {
    where.push("platform = ?");
    params.push(platform);
  }
  const w = where.join(" AND ");

  const rows = query<{ status: string; platform: string; query: string; cited_urls: string; competitors: string; ts: string }>(
    `SELECT status, platform, query, cited_urls, competitors, ts FROM visibility_results WHERE ${w}`,
    ...params,
  );

  const total = rows.length;
  const conclusive = rows.filter((r) => r.status !== "inconclusive").length;
  const inconclusive = total - conclusive;
  const recommended = rows.filter((r) => r.status === "recommended").length;
  const mentioned = rows.filter((r) => r.status === "mentioned").length;
  const cited = rows.filter((r) => r.status === "cited").length;
  const absent = rows.filter((r) => r.status === "absent").length;
  const denom = conclusive || 1;

  const platformMap = new Map<string, { testType: string; total: number; conclusive: number; recommended: number; mentioned: number; cited: number }>();
  for (const r of rows) {
    const cur = platformMap.get(r.platform) ?? { testType, total: 0, conclusive: 0, recommended: 0, mentioned: 0, cited: 0 };
    cur.total++;
    if (r.status !== "inconclusive") cur.conclusive++;
    if (r.status === "recommended") cur.recommended++;
    if (r.status === "mentioned") cur.mentioned++;
    if (r.status === "cited") cur.cited++;
    platformMap.set(r.platform, cur);
  }

  const domainCounts = new Map<string, number>();
  for (const r of rows) {
    try {
      const comps = JSON.parse(r.competitors || "[]") as string[];
      for (const c of comps) domainCounts.set(c, (domainCounts.get(c) ?? 0) + 1);
    } catch {
      /* ignore */
    }
  }
  const totalCompetitorAppearances = [...domainCounts.values()].reduce((a, b) => a + b, 0) || 1;
  const shareOfVoice = [...domainCounts.entries()]
    .map(([domain, appearances]) => ({ domain, appearances, share: round1((appearances / totalCompetitorAppearances) * 100) }))
    .sort((a, b) => b.appearances - a.appearances)
    .slice(0, 15);

  const trendMap = new Map<string, { mention: number; rec: number; tests: number; conclusive: number }>();
  for (const r of rows) {
    const date = r.ts.slice(0, 10);
    const cur = trendMap.get(date) ?? { mention: 0, rec: 0, tests: 0, conclusive: 0 };
    cur.tests++;
    if (r.status !== "inconclusive") {
      cur.conclusive++;
      if (r.status === "mentioned" || r.status === "recommended" || r.status === "cited") cur.mention++;
      if (r.status === "recommended") cur.rec++;
    }
    trendMap.set(date, cur);
  }
  const trend = [...trendMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({
      date,
      mentionRate: v.conclusive ? round1((v.mention / v.conclusive) * 100) : 0,
      recommendationRate: v.conclusive ? round1((v.rec / v.conclusive) * 100) : 0,
      tests: v.tests,
    }));

  const serviceMetrics = groupRate(rows, (r) => serviceOf(r.query), "service") as { service: string; total: number; mentionRate: number }[];
  const cityMetrics = groupRate(rows, (r) => cityOf(r.query), "city") as { city: string; total: number; mentionRate: number }[];

  return {
    window: { sinceDays, from, to },
    testType,
    platform,
    total,
    conclusive,
    inconclusive,
    recommended,
    mentioned,
    cited,
    absent,
    mentionRate: pct(mentioned + recommended + cited, denom),
    recommendationRate: pct(recommended, denom),
    citationRate: pct(cited, denom),
    testSuccessRate: pct(conclusive, total),
    byPlatform: [...platformMap.entries()].map(([p, v]) => ({
      platform: p,
      testType: v.testType,
      total: v.total,
      conclusive: v.conclusive,
      recommended: v.recommended,
      mentioned: v.mentioned,
      cited: v.cited,
      mentionRate: pct(v.mentioned + v.recommended + v.cited, v.conclusive || 1),
    })),
    byService: serviceMetrics,
    byCity: cityMetrics,
    shareOfVoice,
    trend,
  };
}

function groupRate(
  rows: { status: string; query: string }[],
  keyFn: (r: { query: string }) => string,
  label: "service" | "city",
): { [k: string]: string | number; total: number; mentionRate: number }[] {
  const map = new Map<string, { total: number; conclusive: number; mention: number }>();
  for (const r of rows) {
    const k = keyFn(r);
    if (!k) continue;
    const cur = map.get(k) ?? { total: 0, conclusive: 0, mention: 0 };
    cur.total++;
    if (r.status !== "inconclusive") {
      cur.conclusive++;
      if (r.status !== "absent") cur.mention++;
    }
    map.set(k, cur);
  }
  return [...map.entries()]
    .map(([k, v]) => ({ [label]: k, total: v.total, mentionRate: pct(v.mention, v.conclusive || 1) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);
}

const CITIES_LOWER = ["laguna niguel", "dana point", "san clemente", "mission viejo", "aliso viejo", "laguna hills", "laguna beach", "ladera ranch", "rancho santa margarita", "irvine", "lake forest", "san juan capistrano", "newport beach", "coto de caza", "dove canyon", "foothill ranch", "laguna woods", "costa mesa", "huntington beach", "tustin", "orange"];

function cityOf(q: string): string {
  const lower = q.toLowerCase();
  return CITIES_LOWER.find((c) => lower.includes(c)) ?? "";
}

function serviceOf(q: string): string {
  const lower = q.toLowerCase();
  const map: [string, string][] = [
    ["slab leak", "slab-leak-detection"],
    ["leak detection", "leak-detection"],
    ["hidden water leak", "leak-detection"],
    ["repipe", "pex-repiping"],
    ["water heater", "water-heater-services"],
    ["drain", "drain-services"],
    ["sewer", "drain-services"],
    ["emergency", "emergency-plumbing"],
    ["plumbing repair", "plumbing-repair"],
    ["plumber", "general"],
  ];
  for (const [needle, svc] of map) if (lower.includes(needle)) return svc;
  return "";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export { unique };
