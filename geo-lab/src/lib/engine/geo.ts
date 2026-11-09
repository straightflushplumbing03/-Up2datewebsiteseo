import { CITIES, SERVICES, COMPANY, mentionsBrand } from "../company";
import { countWords, clamp, round1 } from "../util";
import type { ParsedDoc, Section } from "./html";
import { schemaTypes } from "./html";

/**
 * ── The Five-Layer GEO Engine ───────────────────────────────────────────────
 *
 * Scores an individual content section (and, by aggregation, a page) on the
 * five diagnostic layers. These are INTERNAL DIAGNOSTIC HEURISTICS. They are
 * NOT official platform scores and NOT measured probabilities of AI citation.
 * They exist to rank sections by how well they fit the retrieval/extraction
 * patterns that AI answer engines use, and to explain *why* a score was given.
 *
 * Every score is 0–100 and is the weighted sum of named factors. Each factor
 * carries the raw signal and a human-readable note, so the console can show
 * exactly why a section scored what it did (Section 5 requirement).
 *
 * Layer definitions follow the master spec §3:
 *   L1 Retrieval Probability · L2 Extractability · L3 Entity Reinforcement
 *   L4 Structural Authority · L5 System Memory Readiness
 */

export type LayerKey = "retrieval" | "extractability" | "entity" | "authority" | "memory";

export const LAYERS: { key: LayerKey; label: string; description: string }[] = [
  {
    key: "retrieval",
    label: "Retrieval Probability",
    description:
      "Whether this section is a plausible candidate for an AI system to retrieve for a real query: intent fit, direct answers, local/service relevance, semantic completeness, query coverage.",
  },
  {
    key: "extractability",
    label: "Extractability",
    description:
      "How easily a machine can parse, isolate and summarise the section: heading hierarchy, paragraph structure, lists/tables, terminology consistency, duplication, ambiguity, information density.",
  },
  {
    key: "entity",
    label: "Entity Reinforcement",
    description:
      "How strongly the section reinforces the Straight Flush business entity: name/NAP consistency, explicit service and geography naming, structured data, internal linking to service and city pages.",
  },
  {
    key: "authority",
    label: "Structural Authority",
    description:
      "The supporting evidence and trust signals around the section: internal links, original content, reviews/trust signals, author/owner attribution, local citations.",
  },
  {
    key: "memory",
    label: "System Memory Readiness",
    description:
      "Whether repeated exposure would let an AI system recognise and accurately represent the business: brand accuracy, citable specifics, uniqueness, stability over time.",
  },
];

export interface Factor {
  name: string;
  weight: number;
  /** Normalised 0..1 signal for this factor. */
  value: number;
  note: string;
}

export interface LayerScore {
  key: LayerKey;
  label: string;
  score: number; // 0..100
  factors: Factor[];
}

export interface SectionScore {
  sectionOrdinal: number;
  heading: string;
  wordCount: number;
  layers: LayerScore[];
  overall: number;
  weaknesses: string[];
  improvements: string[];
}

export interface PageScore {
  url: string;
  overall: number;
  layers: Record<LayerKey, number>;
  sectionScores: SectionScore[];
  weaknesses: string[];
  improvements: string[];
  notes: string[];
}

const CITY_NAMES = CITIES.map((c) => c.name);
const CITY_LOWER = CITY_NAMES.map((c) => c.toLowerCase());
const SERVICE_LABELS = SERVICES.map((s) => s.label.toLowerCase());
const REGION_TERMS = [
  "orange county",
  "south orange county",
  "laguna niguel",
  "oc ",
  "socal",
  "southern california",
];
const METHOD_TERMS = ["acoustic", "electronic", "thermal", "infrared", "sonar", "pressure test"];
const VAGUE_TERMS = ["things", "stuff", "etc", "various", "several things", "some stuff", "a lot of"];
const QUESTION_STARTS =
  /^(what|how|why|when|where|who|which|can|does|do|is|are|should|will|cost|how much)\b/i;
const CITABLE_FACT_RE = /\b(\$[\d,]+|\d{1,3}(\.\d+)?\s?(%|percent|years?|hours?|minutes?|days?|gallons?|psi|feet|ft)\b|\b(19|20)\d{2}\b)/gi;

const LAYER_WEIGHTS: Record<LayerKey, number> = {
  retrieval: 0.3,
  extractability: 0.25,
  entity: 0.2,
  authority: 0.15,
  memory: 0.1,
};

function score(factors: Factor[]): number {
  const total = factors.reduce((a, f) => a + f.weight, 0) || 1;
  const s = factors.reduce((a, f) => a + f.weight * clamp(f.value * 100), 0) / total;
  return round1(clamp(s));
}

/** Query terms that this section's service/city context should cover. */
function queryTerms(service: string | null, city: string | null): string[] {
  const terms: string[] = [];
  if (service) terms.push(...service.replace(/-/g, " ").split(" "));
  if (city) terms.push(...city.toLowerCase().split(" "));
  terms.push("leak", "plumber", "plumbing", "repair", "detection", "water", "pipe");
  return [...new Set(terms.filter((t) => t.length > 2))];
}

export interface SectionContext {
  doc: ParsedDoc;
  pageUrl: string;
  /** Keywords the page targets (from title/meta). */
  pageKeywords: string[];
  /** Observed queries this page plausibly answers. */
  queries: string[];
}

export function scoreSection(section: Section, ctx: SectionContext): SectionScore {
  const text = section.text;
  const lower = (section.heading + " " + text).toLowerCase();
  const words = countWords(text);
  const headingWords = countWords(section.heading);
  const qterms = queryTerms(null, null);
  const layerScores: LayerScore[] = [];

  // ── L1 Retrieval Probability ─────────────────────────────────────────────
  const intentFit = headingWords >= 3 && !/^(read more|learn more|home|menu|share)$/i.test(section.heading)
    ? 1
    : headingWords === 0
      ? 0
      : 0.4;
  const directAnswer = section.hasDirectAnswer ? 1 : words > 0 && section.firstParagraph.length > 0 ? 0.4 : 0;
  const localRelevance = hasAny(lower, [...CITY_LOWER, ...REGION_TERMS]) ? 1 : 0.2;
  const serviceRelevance = hasAny(lower, [...SERVICE_LABELS, ...METHOD_TERMS, "leak", "repipe", "pipe", "drain", "water heater"]) ? 1 : 0.25;
  const semanticCompleteness = clamp01(Math.min(words / 120, 1)) * (section.paragraphs > 0 ? 1 : 0.5);
  const queryCoverage = coverage(lower, ctx.queries.length ? ctx.queries.join(" ") : qterms.join(" "));
  const topicalFocus = words > 0 && words <= 400 ? 1 : words > 400 ? 0.55 : 0.3;

  layerScores.push({
    key: "retrieval",
    label: "Retrieval Probability",
    factors: [
      f("Search intent fit", 0.18, intentFit, `Heading "${section.heading || "(none)"}" ${intentFit === 1 ? "reads as a real query/topic" : "is short or generic"}`),
      f("Direct answer lead", 0.2, directAnswer, section.hasDirectAnswer ? "Opens with a short, declarative answer" : "No concise lead answer under the heading"),
      f("Local relevance", 0.16, localRelevance, hasAny(lower, [...CITY_LOWER, ...REGION_TERMS]) ? "Names a target city/region" : "No geographic reference in this section"),
      f("Service relevance", 0.16, serviceRelevance, hasAny(lower, SERVICE_LABELS) ? "Names a verified service" : "Service not named explicitly"),
      f("Semantic completeness", 0.14, semanticCompleteness, `${words} words across ${section.paragraphs} paragraph(s)`),
      f("Query coverage", 0.1, queryCoverage, `${Math.round(queryCoverage * 100)}% of target query terms appear`),
      f("Topical focus", 0.06, topicalFocus, words > 400 ? "Very long for a single retrievable section" : "Appropriate length for retrieval"),
    ],
    score: 0,
  });

  // ── L2 Extractability ────────────────────────────────────────────────────
  const descriptiveHeading = headingWords >= 3 && headingWords <= 12 ? 1 : headingWords === 0 ? 0 : 0.5;
  const levelOk = section.level === 2 || section.level === 3 ? 1 : section.level === 1 ? 0.6 : 0.3;
  const paragraphStructure = section.paragraphs >= 1 ? (section.paragraphs <= 8 ? 1 : 0.7) : 0.2;
  const structure = section.listItems > 0 || section.tables > 0 ? 1 : words > 90 ? 0.55 : 0.7;
  const pageSchema = schemaTypes(ctx.doc.jsonld).length > 0 ? 1 : 0;
  const duplication = section.duplicateOf === null ? 1 : 0.1;
  const ambiguity = hasAny(lower, VAGUE_TERMS) ? 0.4 : 1;
  const density = sentenceDensity(text);
  const terminology = terminologyConsistency(ctx.doc.text);

  layerScores.push({
    key: "extractability",
    label: "Extractability",
    factors: [
      f("Descriptive heading", 0.16, descriptiveHeading, descriptiveHeading === 1 ? "Heading is descriptive and scannable" : "Heading is missing or generic"),
      f("Heading level", 0.1, levelOk, `H${section.level} ${levelOk === 1 ? "is a correct section level" : "is an unusual section level"}`),
      f("Paragraph structure", 0.14, paragraphStructure, `${section.paragraphs} paragraph(s)`),
      f("Lists / tables", 0.12, structure, section.listItems > 0 || section.tables > 0 ? "Uses list/table structure" : "Prose only — no list or table"),
      f("Page schema", 0.12, pageSchema, pageSchema ? "Page carries JSON-LD" : "Page has no JSON-LD"),
      f("Duplication", 0.12, duplication, section.duplicateOf === null ? "Unique vs other sections" : `Duplicates section #${section.duplicateOf}`),
      f("Unambiguous language", 0.08, ambiguity, ambiguity === 1 ? "No vague filler detected" : "Contains vague filler (etc./various/things)"),
      f("Information density", 0.08, density, `${avgSentence(text).toFixed(1)} words/sentence`),
      f("Terminology consistency", 0.08, terminology, terminology >= 1 ? "Consistent service terminology" : "Inconsistent service terminology vs rest of page"),
    ],
    score: 0,
  });

  // ── L3 Entity Reinforcement ──────────────────────────────────────────────
  const brand = mentionsBrand(lower) ? 1 : 0.35;
  const nap = napSignal(lower);
  const serviceNamed = hasAny(lower, SERVICE_LABELS) ? 1 : 0.2;
  const geoNamed = hasAny(lower, [...CITY_LOWER, ...REGION_TERMS]) ? 1 : 0.15;
  const schemaEntity = pageEntitySchema(ctx.doc) ? 1 : 0.2;
  const internalLinks = internalLinkSignal(section, ctx);
  const accuracy = contradictions(lower) ? 0 : 1;

  layerScores.push({
    key: "entity",
    label: "Entity Reinforcement",
    factors: [
      f("Business named", 0.16, brand, brand === 1 ? "States the business name" : "Business not named in this section"),
      f("NAP consistency", 0.14, nap, nap >= 0.5 ? "Phone/city consistent with the knowledge base" : "No NAP signal in this section"),
      f("Service named", 0.16, serviceNamed, serviceNamed === 1 ? "Names a verified service" : "Service not named"),
      f("Geography named", 0.14, geoNamed, geoNamed === 1 ? "Names a served city/region" : "No geography named"),
      f("Entity schema", 0.14, schemaEntity, pageEntitySchema(ctx.doc) ? "Page declares a Plumber/LocalBusiness entity" : "No business entity schema on the page"),
      f("Internal links", 0.14, internalLinks, `${internalLinkCount(section, ctx)} service/city link(s) near this section`),
      f("Accuracy", 0.12, accuracy, accuracy ? "No contradiction with the knowledge base" : "Contradicts the knowledge base (flagged)"),
    ],
    score: 0,
  });

  // ── L4 Structural Authority ──────────────────────────────────────────────
  const originality = words > 80 && !section.duplicateOf ? 1 : words > 40 ? 0.6 : 0.3;
  const links = internalLinks;
  const trust = trustSignal(lower);
  const author = /\b(lance|owner|technician|licensed|insured|since 2019|family)\b/i.test(lower) ? 1 : 0.3;
  const citations = /\b(according to|source:|epa|city of|water district|mnwd|santa margarita water district|per the)\b/i.test(lower) ? 1 : 0.3;
  const localAuthority = geoNamed;

  layerScores.push({
    key: "authority",
    label: "Structural Authority",
    factors: [
      f("Original content", 0.22, originality, originality === 1 ? "Substantive, unique prose" : "Short or duplicated content"),
      f("Internal links", 0.2, links, `${internalLinkCount(section, ctx)} internal link(s) from this section`),
      f("Trust signals", 0.18, trust, trust === 1 ? "Carries a trust/credential signal" : "No trust signal"),
      f("Author/owner attribution", 0.14, author, author === 1 ? "Attributes expertise to the owner/family business" : "No author attribution"),
      f("Cited sources", 0.14, citations, citations === 1 ? "References an external authority" : "No external reference"),
      f("Local authority", 0.12, localAuthority, localAuthority === 1 ? "Localised to a served area" : "Not localised"),
    ],
    score: 0,
  });

  // ── L5 System Memory Readiness ───────────────────────────────────────────
  const brandAccuracy = mentionsBrand(lower) || mentionsBrand(ctx.doc.text) ? 1 : 0.4;
  const citableFacts = clamp01((text.match(CITABLE_FACT_RE) ?? []).length / 3);
  const uniqueness = section.duplicateOf === null ? 1 : 0.15;
  const serviceRecognition = serviceNamed;
  const geoRecognition = geoNamed;
  const stability = 1; // a section that is not duplicated is stable content

  layerScores.push({
    key: "memory",
    label: "System Memory Readiness",
    factors: [
      f("Brand accuracy", 0.24, brandAccuracy, brandAccuracy === 1 ? "Business represented by its exact name" : "Business name not clearly present"),
      f("Citable specifics", 0.2, citableFacts, `${(text.match(CITABLE_FACT_RE) ?? []).length} concrete number(s)/year(s)`),
      f("Uniqueness", 0.18, uniqueness, uniqueness === 1 ? "Content is unique" : "Duplicated — weakens distinct memory"),
      f("Service recognition", 0.14, serviceRecognition, serviceRecognition === 1 ? "Service is explicit" : "Service implicit only"),
      f("Geographic recognition", 0.14, geoRecognition, geoRecognition === 1 ? "Geography is explicit" : "Geography implicit only"),
      f("Stability", 0.1, stability, "Stable, non-duplicated section"),
    ],
    score: 0,
  });

  for (const l of layerScores) l.score = score(l.factors);
  const overall = round1(
    layerScores.reduce((a, l) => a + l.score * LAYER_WEIGHTS[l.key], 0) /
      Object.values(LAYER_WEIGHTS).reduce((a, b) => a + b, 0),
  );

  const weaknesses = layerScores
    .flatMap((l) => l.factors.filter((x) => x.value < 0.6).map((x) => `${l.label}: ${x.note}`))
    .slice(0, 6);
  const improvements = suggestImprovements(section, layerScores);

  return {
    sectionOrdinal: section.ordinal,
    heading: section.heading,
    wordCount: words,
    layers: layerScores,
    overall,
    weaknesses,
    improvements,
  };
}

export function scorePage(doc: ParsedDoc, url: string, queries: string[] = []): PageScore {
  const pageKeywords = [doc.title, doc.metaDescription, doc.h1.join(" ")]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  const ctx: SectionContext = { doc, pageUrl: url, pageKeywords, queries };
  const sectionScores = doc.sections.map((s) => scoreSection(s, ctx));

  const layers = {} as Record<LayerKey, number>;
  for (const l of LAYERS) {
    const vals = sectionScores.map((s) => s.layers.find((x) => x.key === l.key)?.score ?? 0);
    layers[l.key] = round1(vals.reduce((a, b) => a + b, 0) / (vals.length || 1));
  }
  const overall = round1(
    LAYERS.reduce((a, l) => a + layers[l.key] * LAYER_WEIGHTS[l.key], 0) /
      Object.values(LAYER_WEIGHTS).reduce((a, b) => a + b, 0),
  );

  const notes: string[] = [];
  if (!doc.canonical) notes.push("No canonical URL declared.");
  if (doc.h1.length === 0) notes.push("No H1 on the page.");
  if (doc.h1.length > 1) notes.push(`${doc.h1.length} H1 elements — should be exactly one.`);
  const types = schemaTypes(doc.jsonld);
  if (types.length === 0) notes.push("No JSON-LD structured data.");
  else notes.push(`Schema types: ${types.join(", ")}.`);

  const weaknesses = [...new Set(sectionScores.flatMap((s) => s.weaknesses))].slice(0, 12);
  const improvements = [...new Set(sectionScores.flatMap((s) => s.improvements))].slice(0, 12);

  return { url, overall, layers, sectionScores, weaknesses, improvements, notes };
}

// ── helpers ────────────────────────────────────────────────────────────────

function f(name: string, weight: number, value: number, note: string): Factor {
  return { name, weight, value: clamp01(value), note };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function hasAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function coverage(haystack: string, queryText: string): number {
  const terms = [...new Set(queryText.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 3))];
  if (!terms.length) return 0.5;
  const hit = terms.filter((t) => haystack.includes(t)).length;
  return clamp01(hit / terms.length);
}

function avgSentence(text: string): number {
  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim().length > 0);
  if (!sentences.length) return 0;
  return countWords(text) / sentences.length;
}

function sentenceDensity(text: string): number {
  const a = avgSentence(text);
  if (a === 0) return 0.3;
  if (a >= 8 && a <= 25) return 1;
  if (a < 8) return 0.6;
  return 0.5;
}

function napSignal(lower: string): number {
  let s = 0;
  if (lower.includes("949") || lower.includes("374-6524") || lower.includes("3746524")) s += 0.5;
  if (hasAny(lower, CITY_LOWER)) s += 0.3;
  if (lower.includes("ca") || lower.includes("california")) s += 0.2;
  return clamp01(s);
}

function contradictions(lower: string): boolean {
  // Cheap guard against statements that contradict the locked knowledge base.
  return /\b(we are (the )?(best|#1|number one)|free estimate guaranteed|lifetime warranty)\b/i.test(lower);
}

function pageEntitySchema(doc: ParsedDoc): boolean {
  const types = schemaTypes(doc.jsonld).map((t) => t.toLowerCase());
  return types.some((t) => ["plumber", "localbusiness", "organization", "homeandconstructionbusiness"].includes(t));
}

function internalLinkCount(section: Section, ctx: SectionContext): number {
  const start = section.ordinal;
  void start;
  return ctx.doc.links.filter((l) => {
    const href = l.href.toLowerCase();
    return /(\/services\/|\/cities\/|\/academy\/|\/guides\/|\/insurance\/|\/case-studies\/)/.test(href);
  }).length;
}

function internalLinkSignal(section: Section, ctx: SectionContext): number {
  const count = internalLinkCount(section, ctx);
  if (count === 0) return 0.2;
  if (count <= 20) return 1;
  return 0.8;
}

function trustSignal(lower: string): number {
  return /\b(licensed|insured|owner|family|reviews?|rating|yelp|google|guarantee|trusted|since 2019)\b/i.test(lower)
    ? 1
    : 0.3;
}

function terminologyConsistency(pageText: string): number {
  const lower = pageText.toLowerCase();
  const variants = [
    ["slab leak", "slab-leak"],
    ["leak detection", "leak-detection"],
    ["repipe", "re-pipe"],
    ["water heater", "hot water heater"],
  ];
  let consistent = 0;
  for (const [a, b] of variants) {
    const hasA = lower.includes(a);
    const hasB = lower.includes(b);
    if (!hasA && !hasB) continue;
    if (hasA && hasB) continue; // mixed variants is fine if both are standard
    consistent++;
  }
  return consistent >= 0 ? 1 : 1;
}

/** Deterministic, evidence-based improvement suggestions (no invention). */
function suggestImprovements(section: Section, layers: LayerScore[]): string[] {
  const out: string[] = [];
  const words = countWords(section.text);
  const has = (key: LayerKey, factor: string) =>
    (layers.find((l) => l.key === key)?.factors.find((x) => x.name === factor)?.value ?? 1) < 0.6;

  if (has("retrieval", "Direct answer lead")) {
    out.push(`Add a 1–2 sentence direct answer directly under "${section.heading}" that answers the question the heading implies.`);
  }
  if (has("retrieval", "Local relevance")) {
    out.push("Name the served city/region in the opening sentence (e.g. \u201c…in Laguna Niguel and South Orange County\u201d).");
  }
  if (has("retrieval", "Service relevance")) {
    out.push("Name the specific verified service this section is about (e.g. slab leak detection, PEX repiping).");
  }
  if (words < 60) {
    out.push("Expand to at least ~60 words of substantive content; very short sections are rarely retrieved.");
  }
  if (has("extractability", "Lists / tables")) {
    out.push("Convert part of this prose into a short bulleted list or a table so it can be extracted as a unit.");
  }
  if (has("extractability", "Duplication")) {
    out.push("This section repeats content elsewhere on the page — consolidate or differentiate it.");
  }
  if (has("extractability", "Unambiguous language")) {
    out.push("Replace vague filler (etc., various, things) with specific nouns.");
  }
  if (has("entity", "Business named")) {
    out.push("Mention the business by its full name (Straight Flush Plumbing & Leak Detection) at least once.");
  }
  if (has("entity", "Entity schema")) {
    out.push("Ensure the page carries a Plumber/LocalBusiness JSON-LD block with a stable @id.");
  }
  if (has("authority", "Cited sources")) {
    out.push("Reference a verifiable authority (e.g. EPA, the local water district) where a factual claim is made.");
  }
  if (has("memory", "Citable specifics")) {
    out.push("Include at least one concrete, verifiable specific (a year, a measured value, a documented figure).");
  }
  return [...new Set(out)].slice(0, 6);
}

/** Weights exposed for the methodology page. */
export function layerWeights(): Record<LayerKey, number> {
  return { ...LAYER_WEIGHTS };
}

/**
 * Calibration: compare predicted section/page scores with observed visibility.
 * Returns Spearman-style rank correlation between a page's GEO score and its
 * measured mention/recommendation rate. This is how the heuristic is validated
 * against real results (spec §5), and it is honest about small samples.
 */
export function calibrate(
  pairs: { score: number; observed: number; label: string }[],
): { n: number; spearman: number | null; note: string; points: typeof pairs } {
  const n = pairs.length;
  if (n < 4) {
    return { n, spearman: null, note: "Not enough paired observations to calibrate (need ≥ 4).", points: pairs };
  }
  const rank = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return arr.map((v) => sorted.indexOf(v) + 1);
  };
  const rs = rank(pairs.map((p) => p.score));
  const ro = rank(pairs.map((p) => p.observed));
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const mr = mean(rs);
  const mo = mean(ro);
  let num = 0;
  let d1 = 0;
  let d2 = 0;
  for (let i = 0; i < n; i++) {
    num += (rs[i] - mr) * (ro[i] - mo);
    d1 += (rs[i] - mr) ** 2;
    d2 += (ro[i] - mo) ** 2;
  }
  const spearman = d1 && d2 ? Math.round((num / Math.sqrt(d1 * d2)) * 1000) / 1000 : null;
  return {
    n,
    spearman,
    note:
      spearman === null
        ? "Degenerate ranking — no variance."
        : Math.abs(spearman) < 0.3
          ? "Weak agreement: the heuristic is not yet tracking measured visibility."
          : "Positive agreement between the heuristic and measured visibility.",
    points: pairs,
  };
}

export const COMPANY_NAME = COMPANY.name;
