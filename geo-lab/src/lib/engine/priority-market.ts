import fs from "node:fs";
import path from "node:path";
import { insert, query, queryOne, run as sqlRun } from "../db";
import { SITE_DIR } from "../paths";
import { parseDocument } from "./html";
import { createOpportunity } from "./optimize";

/**
 * Priority market: Laguna Niguel first, then the other primary cities.
 *
 * Prompts are the tests we run. Rank, mentions, and competitor names come only
 * from stored visibility rows. A missing row is unmeasured. Schema and
 * llms.txt checks are file reads, not rankings.
 */

export const PRIORITY_CITY = "Laguna Niguel";

/** Names from the 2026-10-09 baseline. Counted only when they appear in a stored answer. */
export const COMPETITOR_WATCHLIST: { name: string; source: string }[] = [
  { name: "Efficient Plumbing", source: "Owner-named. Confirmed on https://efficientplumbing.com/contact/ (2026-11-15)." },
  { name: "American Leak Detection", source: "Owner-named. Local page: American Leak Detection of Orange County, Anaheim. https://www.americanleakdetection.com/orange-county/ (2026-11-15)." },
  { name: "Leak Star", source: "Discovered in stored Laguna Niguel results. Name from https://leakstar.com/index.html (2026-11-15)." },
  { name: "Evans Leak Detection", source: "Discovered in stored Laguna Niguel results. Name from https://www.evansleakdetection.com/ (2026-11-15)." },
  { name: "Barker and Sons", source: "Discovered in stored Laguna Niguel results. Name from their Laguna Niguel page (2026-11-15)." },
  { name: "Roto-Rooter", source: "Discovered as rotorooter.com in stored Laguna Niguel results. Franchise address not verified." },
  { name: "Mr. Rooter", source: "growth-engine/reports/baseline/2026-10-09-baseline.md" },
  { name: "Roto-Rooter", source: "growth-engine/reports/baseline/2026-10-09-baseline.md" },
  { name: "Rooter Hero", source: "growth-engine/reports/baseline/2026-10-09-baseline.md" },
  { name: "Scott English", source: "growth-engine/reports/baseline/2026-10-09-baseline.md" },
  { name: "Cal's Choice", source: "growth-engine/reports/baseline/2026-10-09-baseline.md" },
];

export interface PriorityPrompt {
  text: string;
  city: string;
  service: string | null;
  intent: string;
  /** Why this wording exists. Shown in the UI so a near-me prompt is not mistaken for GPS. */
  note: string;
}

const PRIMARY = ["Laguna Niguel", "Dana Point", "San Clemente", "Ladera Ranch", "Laguna Hills"];

export function priorityPrompts(): PriorityPrompt[] {
  const prompts: PriorityPrompt[] = [];
  for (const city of PRIMARY) {
    const first = city === PRIORITY_CITY;
    prompts.push(
      {
        text: `best plumber in ${city}`,
        city,
        service: null,
        intent: "recommendation",
        note: first
          ? "First prompt for the priority city. A recommendation is stored only when a provider returns one."
          : "Same prompt shape as Laguna Niguel, run after that city.",
      },
      {
        text: `leak detection ${city}`,
        city,
        service: "leak-detection",
        intent: "discovery",
        note: "Core service query. Not a rank claim.",
      },
      {
        text: `emergency plumber near me in ${city}, CA`,
        city,
        service: "emergency-plumbing",
        intent: "emergency",
        note: "The city is written into the prompt because an API call has no phone location. This is not a GPS near-me test.",
      },
    );
    if (first) {
      prompts.push(
        {
          text: `slab leak detection in ${city}`,
          city,
          service: "slab-leak-detection",
          intent: "discovery",
          note: "Specialty query for the headquarters city.",
        },
        {
          text: `who should I call for a hidden water leak in ${city}`,
          city,
          service: "leak-detection",
          intent: "recommendation",
          note: "Recommendation wording. Mention, recommendation, and citation are stored as separate fields.",
        },
        {
          text: `plumber in ${city} CA`,
          city,
          service: null,
          intent: "discovery",
          note: "Plain discovery query with the state, so it is not confused with a same-named city elsewhere.",
        },
      );
    }
  }
  return prompts;
}

/** Insert the pack and force priority 0 so sweeps run Laguna Niguel first. */
export function seedPriorityPrompts(): number {
  let inserted = 0;
  for (const prompt of priorityPrompts()) {
    const existing = queryOne<{ id: number }>("SELECT id FROM queries WHERE text=?", prompt.text);
    if (existing) {
      sqlRun("UPDATE queries SET priority=0, city=?, service=?, intent=? WHERE id=?", prompt.city, prompt.service, prompt.intent, existing.id);
      continue;
    }
    insert("queries", {
      text: prompt.text,
      family: "priority-market",
      city: prompt.city,
      service: prompt.service,
      intent: prompt.intent,
      priority: 0,
      active: 1,
    });
    inserted += 1;
  }
  return inserted;
}

export interface RankPoint {
  ts: string;
  platform: string;
  testType: string;
  query: string;
  status: string;
  rank: number | null;
  competitors: string[];
}

export interface SchemaCheck {
  id: string;
  ok: boolean;
  evidence: string;
  action: string | null;
}

export interface PriorityReview {
  city: string;
  generatedAt: string;
  prompts: PriorityPrompt[];
  checks: SchemaCheck[];
  actions: { problem: string; why: string; action: string; benefit: string; approval: "requires_approval" }[];
  conclusiveTests: number;
  mentionRate: number | null;
  recommendationRate: number | null;
  citationRate: number | null;
  history: RankPoint[];
  watchlist: { name: string; source: string; appearances: number | null }[];
  inPlace: string[];
}

export function reviewPriorityCity(city = PRIORITY_CITY): PriorityReview {
  const prompts = priorityPrompts().filter((p) => p.city === city);
  const checks = schemaChecks(city);
  const stats = storedRates(city);
  const history = storedRankHistory(city);
  const watchlist = watchlistAppearances(city);
  const inPlace = checks.filter((c) => c.ok).map((c) => c.evidence);
  const actions = checks
    .filter((c) => !c.ok && c.action)
    .map((c) => ({
      problem: c.evidence,
      why: "Models that only read this page cannot see a fact that is missing from its schema or copy.",
      action: c.action as string,
      benefit: "Makes the fact citable. It does not move a rank by itself, and no rank change is claimed here.",
      approval: "requires_approval" as const,
    }));
  if (stats.conclusive === 0) {
    actions.unshift({
      problem: `No conclusive AI or search test is stored for ${city}.`,
      why: "Without a stored answer, mention rate, recommendation rate, citation rate, and rank are unknown.",
      action: "Run a visibility sweep after a provider key is set. Read the stored rows before changing copy.",
      benefit: "Replaces a blank with evidence you can compare on the next run.",
      approval: "requires_approval",
    });
  }
  return {
    city,
    generatedAt: new Date().toISOString(),
    prompts,
    checks,
    actions,
    conclusiveTests: stats.conclusive,
    mentionRate: stats.mentionRate,
    recommendationRate: stats.recommendationRate,
    citationRate: stats.citationRate,
    history,
    watchlist,
    inPlace,
  };
}

export function savePriorityReview(review: PriorityReview): void {
  insert("priority_reviews", {
    city: review.city,
    checks: JSON.stringify(review.checks),
    conclusive_tests: review.conclusiveTests,
    mention_rate: review.mentionRate,
    recommendation_rate: review.recommendationRate,
    detail: JSON.stringify({ citationRate: review.citationRate, inPlace: review.inPlace, actions: review.actions.length }),
  });
}

export function recordPriorityActions(review: PriorityReview): number {
  let created = 0;
  for (const action of review.actions) {
    const id = createOpportunity({
      title: `${review.city}: ${action.problem.slice(0, 80)}`,
      problem: action.problem,
      why: action.why,
      evidence: `priority-market review ${review.generatedAt}`,
      url: `https://straightflushplumbingoc.com/cities/${review.city.toLowerCase().replace(/ /g, "-")}.html`,
      section: null,
      geoLayer: "System Memory Readiness",
      expectedBenefit: action.benefit,
      difficulty: "medium",
      impact: 5,
      effort: 2,
      proposed: action.action,
      approval: "requires_approval",
      dedupeKey: `priority:${review.city}:${action.problem.slice(0, 120)}`,
    });
    if (id !== null) created += 1;
  }
  return created;
}

export function storedRankHistory(city: string): RankPoint[] {
  const rows = query<{ ts: string; platform: string; test_type: string; query: string; status: string; rank: number | null; competitors: string | null }>(
    `SELECT ts, platform, test_type, query, status, rank, competitors
       FROM visibility_results
      WHERE lower(city)=lower(?) OR lower(query) LIKE ?
      ORDER BY id DESC LIMIT 40`,
    city,
    `%${city.toLowerCase()}%`,
  );
  return rows.map((r) => ({
    ts: r.ts,
    platform: r.platform,
    testType: r.test_type,
    query: r.query,
    status: r.status,
    rank: r.rank == null ? null : Number(r.rank),
    competitors: parseList(r.competitors),
  }));
}

function storedRates(city: string): { conclusive: number; mentionRate: number | null; recommendationRate: number | null; citationRate: number | null } {
  const rows = query<{ status: string }>(
    `SELECT status FROM visibility_results WHERE lower(city)=lower(?) OR lower(query) LIKE ?`,
    city,
    `%${city.toLowerCase()}%`,
  );
  const conclusive = rows.filter((r) => r.status !== "inconclusive");
  if (!conclusive.length) return { conclusive: 0, mentionRate: null, recommendationRate: null, citationRate: null };
  const rate = (pred: (s: string) => boolean) => Math.round((conclusive.filter((r) => pred(r.status)).length / conclusive.length) * 1000) / 10;
  return {
    conclusive: conclusive.length,
    mentionRate: rate((s) => s === "mentioned" || s === "recommended" || s === "cited"),
    recommendationRate: rate((s) => s === "recommended"),
    citationRate: rate((s) => s === "cited"),
  };
}

function watchlistAppearances(city: string): { name: string; source: string; appearances: number | null }[] {
  const answers = query<{ answer: string | null }>(
    `SELECT answer FROM visibility_results
      WHERE answer IS NOT NULL AND (lower(city)=lower(?) OR lower(query) LIKE ?)`,
    city,
    `%${city.toLowerCase()}%`,
  );
  if (!answers.length) {
    return COMPETITOR_WATCHLIST.map((c) => ({ ...c, appearances: null }));
  }
  return COMPETITOR_WATCHLIST.map((c) => ({
    ...c,
    appearances: answers.filter((a) => (a.answer ?? "").toLowerCase().includes(c.name.toLowerCase())).length,
  }));
}

function schemaChecks(city: string): SchemaCheck[] {
  const slug = city.toLowerCase().replace(/ /g, "-");
  const cityFile = path.join(SITE_DIR, "cities", `${slug}.html`);
  const homeFile = path.join(SITE_DIR, "index.html");
  const llmsFile = path.join(SITE_DIR, "llms.txt");
  const checks: SchemaCheck[] = [];

  if (!fs.existsSync(cityFile)) {
    checks.push({
      id: "city-page",
      ok: false,
      evidence: `cities/${slug}.html is not in the repository.`,
      action: `Write the ${city} page from verified facts. Do not clone another city.`,
    });
    return checks;
  }

  const cityDoc = parseDocument(fs.readFileSync(cityFile, "utf8"));
  const cityNodes = jsonldNodes(cityDoc.jsonld);
  const plumber = cityNodes.find((n) => nodeType(n) === "Plumber");
  const homeNodes = fs.existsSync(homeFile) ? jsonldNodes(parseDocument(fs.readFileSync(homeFile, "utf8")).jsonld) : [];
  const homePlumber = homeNodes.find((n) => nodeType(n) === "Plumber");
  const faq = cityNodes.some((n) => nodeType(n) === "FAQPage");
  const text = cityDoc.text;

  checks.push({
    id: "plumber-type",
    ok: Boolean(plumber),
    evidence: plumber ? "City page JSON-LD includes a Plumber node." : "City page JSON-LD has no Plumber node.",
    action: plumber ? null : "Add a Plumber node using the locked name, phone, and address.",
  });

  const addressInNode = Boolean(plumber && (plumber.address || plumber.streetAddress));
  checks.push({
    id: "plumber-address",
    ok: addressInNode,
    evidence: addressInNode
      ? "The city page Plumber node includes an address."
      : "The city page Plumber node has no address. The visible page and the homepage node do.",
    action: addressInNode ? null : "Copy the locked NAP address onto the city page Plumber node so a model that only reads that page sees it.",
  });

  const sameAs = [...(asArray(plumber?.sameAs)), ...(asArray(homePlumber?.sameAs))];
  checks.push({
    id: "sameAs",
    ok: sameAs.length > 0,
    evidence: sameAs.length
      ? `sameAs is present (${sameAs.length} link(s), homepage or city node).`
      : "No sameAs links on the Plumber node. Directory URLs already listed in llms.txt are not in the schema.",
    action: sameAs.length ? null : "Add the Google, Yelp, and Yellow Pages URLs already published in llms.txt to sameAs. Do not invent profiles.",
  });

  checks.push({
    id: "faq",
    ok: faq,
    evidence: faq ? "City page has FAQPage schema." : "City page has no FAQPage schema.",
    action: faq ? null : "Add a FAQ whose questions are real customer questions and whose answers use verified facts, with matching FAQPage schema.",
  });

  const rating = cityNodes.some((n) => "aggregateRating" in n) || homeNodes.some((n) => "aggregateRating" in n);
  checks.push({
    id: "no-self-rating",
    ok: !rating,
    evidence: rating
      ? "aggregateRating is present in JSON-LD. Self-serving review markup is a policy risk."
      : "No aggregateRating in the homepage or city JSON-LD. Review stars stay on Google and Yelp, not in our schema.",
    action: rating ? "Remove self-serving aggregateRating / review markup. Do not add it back." : null,
  });

  const llms = fs.existsSync(llmsFile) ? fs.readFileSync(llmsFile, "utf8") : "";
  checks.push({
    id: "llms",
    ok: llms.includes(city) && llms.includes("949") && llms.includes("Straight Flush"),
    evidence: llms
      ? llms.includes(city)
        ? "llms.txt names the city, the business, and the phone."
        : "llms.txt exists but does not name this city."
      : "llms.txt is missing.",
    action: llms.includes(city) ? null : "Add this city to llms.txt using the same locked NAP. Do not add unverified claims.",
  });

  const localFact = /Moulton Niguel Water District/i.test(text);
  checks.push({
    id: "local-fact",
    ok: city !== PRIORITY_CITY || localFact,
    evidence: localFact
      ? "The city page names Moulton Niguel Water District and links to mnwd.com."
      : city === PRIORITY_CITY
        ? "The Laguna Niguel page does not name the water district."
        : "Local-fact check is required first for Laguna Niguel. Other cities are not failed for lacking that district.",
    action: city === PRIORITY_CITY && !localFact ? "Add one sourced local fact (water district, with the district's own URL). Do not invent statistics." : null,
  });

  return checks;
}

function jsonldNodes(blocks: string[]): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block) as unknown;
      collect(parsed, nodes);
    } catch {
      /* a broken block is reported by the technical audit, not here */
    }
  }
  return nodes;
}

function collect(value: unknown, into: Record<string, unknown>[]): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collect(item, into);
    return;
  }
  const node = value as Record<string, unknown>;
  if ("@type" in node) into.push(node);
  if (Array.isArray(node["@graph"])) collect(node["@graph"], into);
}

function nodeType(node: Record<string, unknown>): string {
  const t = node["@type"];
  return Array.isArray(t) ? String(t[0]) : String(t ?? "");
}

function asArray(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string") as string[];
  return [];
}

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((v) => typeof v === "string") as string[] : [];
  } catch {
    return [];
  }
}
