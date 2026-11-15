import { insert, query } from "../db";
import { CITIES } from "../company";
import { QUERY_LIBRARY } from "./queries";
import { crawlRepo } from "./site";
import { schemaTypes } from "./html";
import { createOpportunity } from "./optimize";
import { round1 } from "../util";

/**
 * Geographic opportunity intelligence.
 *
 * Every figure comes from a file in the repository, a stored GEO score, or a
 * stored visibility row. A city with no conclusive test has mentionRate null.
 * That is unmeasured, not invisible. Priority is the owner's declared focus
 * plus measured gaps. It is not search volume.
 */

export type CityFocus = "primary" | "secondary" | "extended";

/** Owner-declared focus. Tiers in company.ts stay as published; this does not rewrite them. */
const FOCUS: Record<string, CityFocus> = {
  "Laguna Niguel": "primary",
  "Dana Point": "primary",
  "San Clemente": "primary",
  "Ladera Ranch": "primary",
  "Laguna Hills": "primary",
  "Mission Viejo": "secondary",
  "Aliso Viejo": "secondary",
  "Lake Forest": "secondary",
  "Rancho Santa Margarita": "secondary",
  "Dove Canyon": "secondary",
  "Coto de Caza": "secondary",
};

const SERVICE_PAGES: { label: string; file: (slug: string) => string }[] = [
  { label: "leak detection", file: (slug) => `services/leak-detection-${slug}.html` },
  { label: "slab leak detection", file: (slug) => `services/slab-leak-detection-${slug}.html` },
  { label: "PEX repiping", file: (slug) => `services/pex-repiping-${slug}.html` },
  { label: "water heater", file: (slug) => `services/water-heater-repair-${slug}.html` },
];

export interface CityRecommendation {
  problem: string;
  why: string;
  action: string;
  benefit: string;
  approval: "requires_approval";
}

export interface CityIntel {
  name: string;
  slug: string;
  tier: 1 | 2 | 3;
  focus: CityFocus;
  pageUrl: string | null;
  indexable: boolean | null;
  wordCount: number | null;
  hasFaqSchema: boolean | null;
  geoOverall: number | null;
  priorityQueryCount: number;
  testedPriorityQueries: number;
  untestedPriorityQueries: string[];
  conclusiveTests: number;
  mentionRate: number | null;
  competitorDomains: string[];
  servicePages: { label: string; path: string | null }[];
  missingServices: string[];
  gaps: string[];
  priority: number;
  recommendation: CityRecommendation;
}

interface VisBucket {
  conclusive: number;
  mentions: number;
  tested: Set<string>;
  competitors: Map<string, number>;
}

export function analyzeGeography(): CityIntel[] {
  const pages = crawlRepo();
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const scores = latestScores();
  const visibility = visibilityByCity();

  const rows = CITIES.map((city) => {
    const focus = FOCUS[city.name] ?? "extended";
    const path = `cities/${city.slug}.html`;
    const page = byPath.get(path);
    const score = scores.get(path) ?? null;
    const vis = visibility.get(city.name.toLowerCase());
    const priorityQueries = QUERY_LIBRARY.filter((q) => q.city === city.name && q.priority === 1);
    const testedPriority = priorityQueries.filter((q) => vis?.tested.has(q.text.toLowerCase()));
    const untested = priorityQueries.filter((q) => !vis?.tested.has(q.text.toLowerCase())).map((q) => q.text);
    const servicePages = SERVICE_PAGES.map((s) => {
      const file = s.file(city.slug);
      return { label: s.label, path: byPath.has(file) ? file : null };
    });
    const missingServices = servicePages.filter((s) => !s.path).map((s) => s.label);
    const conclusive = vis?.conclusive ?? 0;
    const mentionRate = vis && vis.conclusive > 0 ? round1((vis.mentions / vis.conclusive) * 100) : null;
    const competitorDomains = vis
      ? [...vis.competitors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d]) => d)
      : [];

    const gaps: string[] = [];
    let priority = focus === "primary" ? 50 : focus === "secondary" ? 35 : 10;
    if (!page) {
      priority += 40;
      gaps.push(`No ${path} file in the repository.`);
    } else {
      if (!page.indexable) {
        priority += 30;
        gaps.push(`${path} is not indexable.`);
      }
      if (score != null && score < 55) {
        priority += 15;
        gaps.push(`Latest stored GEO diagnostic for this page is ${score}/100.`);
      }
      if (!schemaTypes(page.doc.jsonld).includes("FAQPage")) {
        priority += 8;
        gaps.push(`${path} has no FAQPage schema.`);
      }
    }
    if (missingServices.length) {
      priority += focus === "primary" ? 12 : 6;
      gaps.push(`No city-specific service file for: ${missingServices.join(", ")}.`);
    }
    if (conclusive >= 3 && mentionRate === 0) {
      priority += 20;
      gaps.push(`${conclusive} conclusive tests for this city did not mention the company.`);
    }
    if (priorityQueries.length > 0 && testedPriority.length === 0) {
      priority += 5;
      gaps.push(`${priorityQueries.length} priority-1 queries for this city have never been measured.`);
    }

    return {
      name: city.name,
      slug: city.slug,
      tier: city.tier,
      focus,
      pageUrl: page ? page.url : null,
      indexable: page ? page.indexable : null,
      wordCount: page ? page.doc.wordCount : null,
      hasFaqSchema: page ? schemaTypes(page.doc.jsonld).includes("FAQPage") : null,
      geoOverall: score,
      priorityQueryCount: priorityQueries.length,
      testedPriorityQueries: testedPriority.length,
      untestedPriorityQueries: untested.slice(0, 8),
      conclusiveTests: conclusive,
      mentionRate,
      competitorDomains,
      servicePages,
      missingServices,
      gaps,
      priority,
      recommendation: recommendationFor(city.name, path, page != null, missingServices, conclusive, mentionRate, untested.length, score),
    } satisfies CityIntel;
  });

  return rows.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
}

function recommendationFor(
  name: string,
  path: string,
  hasPage: boolean,
  missingServices: string[],
  conclusive: number,
  mentionRate: number | null,
  untested: number,
  score: number | null,
): CityRecommendation {
  if (!hasPage) {
    return {
      problem: `${name} is a verified service-area city and ${path} is not in the repository.`,
      why: "AI and local search need a page that states the city, the service, and a way to call. A missing page cannot be cited.",
      action: `Write one city page from verified facts only. Do not copy another city and swap the name.`,
      benefit: "Gives both Google and AI systems a real page to retrieve for this city. It does not promise rankings or calls.",
      approval: "requires_approval",
    };
  }
  if (missingServices.includes("leak detection") || missingServices.includes("slab leak detection")) {
    return {
      problem: `${name} has a city page, and no city-specific file for: ${missingServices.join(", ")}.`,
      why: "Leak detection, slab leaks, repipes, and water heaters are the jobs that turn into calls. A general city page does not answer a service-plus-city query on its own.",
      action: `Add a service page only where you can write something true about ${name}. Do not clone an existing city page.`,
      benefit: "Makes the service retrievable for that city. Publishing still goes through a pull request.",
      approval: "requires_approval",
    };
  }
  if (conclusive >= 3 && mentionRate === 0) {
    return {
      problem: `${conclusive} conclusive tests for ${name} did not mention Straight Flush.`,
      why: "This is a measured gap, not a guess. The page exists, and the tested answers still named someone else or no one.",
      action: "Read the stored answers, then strengthen the city page with a direct answer and a FAQ built from verified facts.",
      benefit: "The next sweep can show whether mentions move. One edit is not proof that they will.",
      approval: "requires_approval",
    };
  }
  if (score != null && score < 55) {
    return {
      problem: `The stored GEO diagnostic for ${name} is ${score}/100.`,
      why: "That score is an internal check of whether a section is easy to retrieve and quote. It is not a Google rank.",
      action: "Open the weakest section and add a direct answer that names the service and the city, using facts already on the site.",
      benefit: "Improves the chance the section is usable in an AI answer. It is not a ranking guarantee.",
      approval: "requires_approval",
    };
  }
  if (untested > 0) {
    return {
      problem: `${untested} priority-1 ${name} queries have never been measured.`,
      why: "Until a real provider answers them, visibility for this city is unknown. Unknown is not the same as invisible.",
      action: "Run a visibility sweep after a provider key is set. Do not treat an empty chart as a zero.",
      benefit: "Replaces a blank with a stored answer you can compare next week.",
      approval: "requires_approval",
    };
  }
  return {
    problem: `${name} has a city page and no measured coverage gap in this review.`,
    why: "The files that should exist are present. Visibility still depends on stored tests, which may be thin.",
    action: "Keep the page accurate. Do not add a second page for the same city.",
    benefit: "Avoids duplicate city pages, which split the signal the site already has.",
    approval: "requires_approval",
  };
}

function latestScores(): Map<string, number> {
  const rows = query<{ path: string; overall: number }>(
    `SELECT p.path, g.overall
       FROM geo_scores g
       JOIN pages p ON p.id = g.page_id
       JOIN (SELECT page_id, MAX(id) mid FROM geo_scores WHERE section_id IS NULL GROUP BY page_id) t
         ON t.mid = g.id`,
  );
  return new Map(rows.map((r) => [r.path, round1(Number(r.overall))]));
}

function visibilityByCity(): Map<string, VisBucket> {
  const rows = query<{ city: string | null; status: string; query: string; competitors: string | null }>(
    `SELECT COALESCE(vr.city, q.city) AS city, vr.status, vr.query, vr.competitors
       FROM visibility_results vr
       LEFT JOIN queries q ON q.id = vr.query_id`,
  );
  const map = new Map<string, VisBucket>();
  for (const row of rows) {
    if (!row.city) continue;
    const key = row.city.toLowerCase();
    let bucket = map.get(key);
    if (!bucket) {
      bucket = { conclusive: 0, mentions: 0, tested: new Set(), competitors: new Map() };
      map.set(key, bucket);
    }
    if (row.status === "inconclusive") continue;
    bucket.conclusive += 1;
    bucket.tested.add(row.query.toLowerCase());
    if (row.status === "mentioned" || row.status === "recommended" || row.status === "cited") bucket.mentions += 1;
    if (row.status === "absent" && row.competitors) {
      let domains: unknown = [];
      try {
        domains = JSON.parse(row.competitors);
      } catch {
        domains = [];
      }
      if (Array.isArray(domains)) {
        for (const d of domains) {
          if (typeof d !== "string" || !d) continue;
          bucket.competitors.set(d, (bucket.competitors.get(d) ?? 0) + 1);
        }
      }
    }
  }
  return map;
}

export function saveCoverage(rows: CityIntel[]): number {
  for (const r of rows) {
    insert("geo_coverage_snapshots", {
      city: r.name,
      slug: r.slug,
      focus: r.focus,
      page_url: r.pageUrl,
      indexable: r.indexable == null ? null : r.indexable ? 1 : 0,
      geo_overall: r.geoOverall,
      conclusive_tests: r.conclusiveTests,
      mention_rate: r.mentionRate,
      gap_count: r.gaps.length,
      priority: r.priority,
      detail: JSON.stringify(r),
    });
  }
  return rows.length;
}

export function latestCoverage(): CityIntel[] {
  const rows = query<{ detail: string }>(
    `SELECT g.detail FROM geo_coverage_snapshots g
      JOIN (SELECT slug, MAX(id) mid FROM geo_coverage_snapshots GROUP BY slug) t ON t.mid = g.id`,
  );
  return rows
    .map((r) => JSON.parse(r.detail) as CityIntel)
    .sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
}

export function coverageHistory(slug: string, limit = 30): { ts: string; geoOverall: number | null; mentionRate: number | null; conclusiveTests: number; gapCount: number }[] {
  return query<{ ts: string; geo_overall: number | null; mention_rate: number | null; conclusive_tests: number; gap_count: number }>(
    `SELECT ts, geo_overall, mention_rate, conclusive_tests, gap_count
       FROM geo_coverage_snapshots WHERE slug=? ORDER BY id DESC LIMIT ?`,
    slug,
    limit,
  ).map((r) => ({
    ts: r.ts,
    geoOverall: r.geo_overall == null ? null : Number(r.geo_overall),
    mentionRate: r.mention_rate == null ? null : Number(r.mention_rate),
    conclusiveTests: Number(r.conclusive_tests ?? 0),
    gapCount: Number(r.gap_count ?? 0),
  }));
}

/** One open opportunity per city that has a real gap. Content changes stay behind approval. */
export function recordGeographicOpportunities(rows: CityIntel[]): number {
  let created = 0;
  for (const city of rows) {
    if (!city.gaps.length) continue;
    const signature = city.missingServices.slice().sort().join("|") || city.gaps[0];
    const id = createOpportunity({
      title: `${city.name}: ${city.missingServices.length ? "service-page gap" : "coverage gap"}`,
      problem: city.recommendation.problem,
      why: city.recommendation.why,
      evidence: city.gaps.join(" "),
      url: city.pageUrl,
      section: null,
      geoLayer: "System Memory Readiness",
      expectedBenefit: city.recommendation.benefit,
      difficulty: city.missingServices.length ? "medium" : "low",
      impact: city.focus === "primary" ? 4 : 3,
      effort: city.missingServices.length ? 3 : 2,
      proposed: city.recommendation.action,
      approval: "requires_approval",
      dedupeKey: `geo-coverage:${city.slug}:${signature}`,
    });
    if (id !== null) created += 1;
  }
  return created;
}
