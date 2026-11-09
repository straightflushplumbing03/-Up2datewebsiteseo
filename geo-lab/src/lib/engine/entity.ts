import { insert, query, queryOne } from "../db";
import { COMPANY, LOCKED_FACTS, DUPLICATE_HOSTS, CITIES, SERVICES } from "../company";
import { parseDocument, schemaTypes } from "./html";
import { fetchLive, crawlRepo } from "./site";
import { baseDomain, domainOf, readJsonl, unique } from "../util";
import { geDataFile } from "../paths";

/**
 * Entity Intelligence Engine (spec §3 Layer 3, §7).
 *
 * Checks whether the business is represented consistently and correctly:
 *  - NAP consistency across the site's JSON-LD vs the locked knowledge base.
 *  - Owned duplicate hosts that still resolve (a consolidation risk).
 *  - Service/geography coverage declared in schema.
 *
 * It never fabricates listings or external mentions, and it never edits an
 * external property (that is owner-only, Level 3).
 */

export interface EntityFactRow {
  source: string;
  field: string;
  value: string | null;
  expected: string;
  matches: boolean;
  note?: string;
}

export interface EntityGraph {
  nodes: { id: string; type: string; label: string }[];
  edges: { from: string; to: string; relation: string }[];
}

export interface EntityCheckRow {
  host: string;
  url: string;
  verdict: string;
  httpStatus: number | null;
  canonical: string | null;
  robots: string | null;
  title: string | null;
  owned: boolean;
  discrepancy: string | null;
}

export interface EntityReport {
  generatedAt: string;
  consistencyScore: number;
  facts: EntityFactRow[];
  checks: EntityCheckRow[];
  graph: EntityGraph;
  discrepancies: string[];
}

/** Compare the site's own JSON-LD against the locked knowledge base. */
export function siteEntityFacts(): EntityFactRow[] {
  const pages = crawlRepo();
  const home = pages.find((p) => p.path === "index.html");
  const facts: EntityFactRow[] = [];
  if (!home) return facts;

  const blobs = home.doc.jsonld.map((b) => {
    try {
      return JSON.parse(b) as Record<string, unknown>;
    } catch {
      return null;
    }
  });
  const findNode = (type: string): Record<string, unknown> | null => {
    for (const b of blobs) {
      if (!b) continue;
      const arr = Array.isArray(b["@graph"]) ? (b["@graph"] as Record<string, unknown>[]) : [b];
      for (const n of arr) {
        const t = n["@type"];
        const types = Array.isArray(t) ? t : [t];
        if (types.some((x) => String(x).toLowerCase() === type.toLowerCase())) return n;
      }
    }
    return null;
  };

  const plumber = findNode("Plumber") ?? findNode("LocalBusiness") ?? findNode("Organization");
  const addr = (plumber?.address as Record<string, unknown> | undefined) ?? {};

  const check = (field: string, actual: string | null, expected: string, source = "index.html JSON-LD", opts: { equivalent?: (a: string, b: string) => boolean } = {}) => {
    const equivalent = opts.equivalent ? actual !== null && opts.equivalent(actual, expected) : false;
    const matches = actual === expected || equivalent;
    facts.push({
      source,
      field,
      value: actual,
      expected,
      matches,
      note: matches
        ? equivalent
          ? `Site says "${actual}" — same value as the knowledge base "${expected}" in a different format.`
          : undefined
        : `Site says "${actual ?? "(absent)"}" — knowledge base expects "${expected}".`,
    });
  };

  // A phone number written in E.164 (+1-949-374-6524) and the display form
  // ((949) 374-6524) are the same number. Comparing digits avoids raising a
  // cosmetic difference as a real entity discrepancy.
  const samePhone = (a: string, b: string) => a.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "") === b.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");

  check("name", (plumber?.name as string) ?? null, COMPANY.name);
  check("telephone", (plumber?.telephone as string) ?? null, COMPANY.phone, "index.html JSON-LD", { equivalent: samePhone });
  check("url", ((plumber?.url as string) ?? "").replace(/\/$/, "") || null, COMPANY.website);
  check("streetAddress", (addr.streetAddress as string) ?? null, COMPANY.address.split(",")[0]);
  check("addressLocality", (addr.addressLocality as string) ?? null, COMPANY.city);
  check("postalCode", (addr.postalCode as string) ?? null, "92677");

  // areaServed coverage
  const areaServed = plumber?.areaServed;
  // The site state-qualifies its cities ("Laguna Niguel, CA", PR #134) so AI
  // engines don't confuse them with same-named places elsewhere. Compare on the
  // bare city name, or every city reads as missing and consistency collapses.
  const cityName = (n: string) => n.replace(/,\s*(CA|California)\s*$/i, "").trim();
  const declared = new Set<string>();
  if (Array.isArray(areaServed)) {
    for (const a of areaServed) {
      if (typeof a === "string") declared.add(cityName(a));
      else if (a && typeof a === "object" && "name" in a) declared.add(cityName(String((a as { name: unknown }).name)));
    }
  }
  for (const c of CITIES) {
    facts.push({
      source: "index.html JSON-LD areaServed",
      field: `areaServed:${c.slug}`,
      value: declared.has(c.name) ? c.name : null,
      expected: c.name,
      matches: declared.has(c.name),
    });
  }

  return facts;
}

export async function checkOwnedHosts(): Promise<EntityCheckRow[]> {
  const rows: EntityCheckRow[] = [];
  // The canonical site first.
  const canonical = await fetchLive(COMPANY.website + "/");
  const cdoc = canonical ? parseDocument(canonical.body, COMPANY.website + "/") : null;
  rows.push({
    host: domainOf(COMPANY.website),
    url: COMPANY.website + "/",
    verdict: canonical?.status === 200 ? "canonical" : "error",
    httpStatus: canonical?.status ?? null,
    canonical: cdoc?.canonical ?? null,
    robots: cdoc?.robots ?? null,
    title: cdoc?.title ?? null,
    owned: true,
    discrepancy: null,
  });

  for (const d of DUPLICATE_HOSTS) {
    const res = await fetchLive(`https://${d.host}/`);
    const doc = res ? parseDocument(res.body, `https://${d.host}/`) : null;
    const live = res?.status === 200;
    const indexable = live && !/noindex/i.test(doc?.robots || "");
    rows.push({
      host: d.host,
      url: `https://${d.host}/`,
      verdict: !res ? "unreachable" : live ? (indexable ? "live_duplicate" : "live_noindex") : "gone",
      httpStatus: res?.status ?? null,
      canonical: doc?.canonical ?? null,
      robots: doc?.robots ?? null,
      title: doc?.title ?? null,
      owned: true,
      discrepancy: indexable
        ? "Owned duplicate host is live and indexable — a consolidation risk (owner-only action; never add sameAs)."
        : null,
    });
  }
  return rows;
}

export function entityGraph(): EntityGraph {
  const nodes: EntityGraph["nodes"] = [];
  const edges: EntityGraph["edges"] = [];
  const bizId = "business";
  nodes.push({ id: bizId, type: "LocalBusiness", label: COMPANY.name });
  for (const s of SERVICES) {
    const id = `service:${s.slug}`;
    nodes.push({ id, type: "Service", label: s.label });
    edges.push({ from: bizId, to: id, relation: "offers" });
  }
  for (const c of CITIES) {
    const id = `city:${c.slug}`;
    nodes.push({ id, type: "City", label: c.name });
    edges.push({ from: bizId, to: id, relation: "serves" });
  }
  nodes.push({ id: "owner:lance", type: "Person", label: COMPANY.owner });
  edges.push({ from: bizId, to: "owner:lance", relation: "ownedBy" });
  nodes.push({ id: "method:acoustic", type: "Method", label: "Acoustic leak detection" });
  nodes.push({ id: "method:electronic", type: "Method", label: "Electronic leak detection" });
  nodes.push({ id: "method:thermal", type: "Method", label: "Thermal imaging" });
  for (const m of ["acoustic", "electronic", "thermal"]) {
    edges.push({ from: `service:leak-detection`, to: `method:${m}`, relation: "usesMethod" });
  }
  return { nodes, edges };
}

export async function runEntityCheck(opts: { live?: boolean } = {}): Promise<EntityReport> {
  const facts = siteEntityFacts();
  const checks = opts.live === false ? [] : await checkOwnedHosts();
  const discrepancies = unique([
    ...facts.filter((f) => !f.matches && f.value !== null).map((f) => `${f.field}: ${f.note ?? "mismatch"}`),
    ...checks.filter((c) => c.discrepancy).map((c) => `${c.host}: ${c.discrepancy}`),
  ]);

  const matched = facts.filter((f) => f.matches).length;
  const consistencyScore = Math.round((matched / (facts.length || 1)) * 1000) / 10;

  for (const c of checks) {
    insert("entity_checks", {
      host: c.host,
      url: c.url,
      verdict: c.verdict,
      http_status: c.httpStatus,
      canonical: c.canonical,
      robots: c.robots,
      title: c.title,
      is_owned: c.owned ? 1 : 0,
      discrepancy: c.discrepancy,
    });
  }
  for (const f of facts) {
    insert("entity_facts", {
      source: f.source,
      field: f.field,
      value: f.value,
      expected: f.expected,
      matches: f.matches ? 1 : 0,
      note: f.note ?? null,
    });
  }

  return { generatedAt: new Date().toISOString(), consistencyScore, facts, checks, graph: entityGraph(), discrepancies };
}

/** Ingest the growth-engine entity-consistency history (real observations). */
export function ingestEntityHistory(): number {
  const rows = readJsonl<{ ts: string; hosts?: { host: string; url: string; verdict: string; http_status: number; canonical: string | null; robots: string | null; title: string | null }[]; live_duplicates?: string[] }>(
    geDataFile("entity_consistency_history.jsonl"),
  );
  let n = 0;
  for (const r of rows) {
    for (const h of r.hosts ?? []) {
      const exists = queryOne<{ id: number }>("SELECT id FROM entity_checks WHERE ts=? AND host=?", r.ts, h.host);
      if (exists) continue;
      insert("entity_checks", {
        ts: r.ts,
        host: h.host,
        url: h.url,
        verdict: h.verdict,
        http_status: h.http_status,
        canonical: h.canonical,
        robots: h.robots,
        title: h.title,
        is_owned: 1,
        discrepancy: h.verdict === "live_duplicate" ? "live indexable duplicate" : null,
      });
      n++;
    }
  }
  return n;
}

export { LOCKED_FACTS, baseDomain };
