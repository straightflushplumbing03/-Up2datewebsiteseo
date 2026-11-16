import fs from "node:fs";
import { insert, query, queryOne, run as sqlRun } from "../db";
import { geDataFile } from "../paths";
import { baseDomain } from "../util";

/**
 * Laguna Niguel competitor watchlist.
 *
 * Owner-named businesses are stored only after their own site confirmed the
 * name and address. Discovered domains are counted from stored search results
 * in growth-engine/data/ai_visibility_history.jsonl. A domain is not given a
 * display name unless that name was read off its site during this pass.
 */

export type CompetitorOrigin = "owner_named" | "discovered" | "owner_named_and_discovered";

export interface OwnerNamedCompetitor {
  domain: string;
  name: string;
  homeCity: string;
  /** Public address from the business's own site. Null when the office is not in the city. */
  address: string;
  phone: string;
  serves: string;
  sourceUrl: string;
  verifiedOn: string;
  note: string;
}

/** Confirmed from the businesses' own pages on 2026-11-15. */
export const OWNER_NAMED_COMPETITORS: OwnerNamedCompetitor[] = [
  {
    domain: "efficientplumbing.com",
    name: "Efficient Plumbing",
    homeCity: "Laguna Niguel",
    address: "30025 Alicia Pkwy Unit 560, Laguna Niguel, CA 92677",
    phone: "949-291-4171",
    serves: "Laguna Niguel (address on their contact page)",
    sourceUrl: "https://efficientplumbing.com/contact/",
    verifiedOn: "2026-11-15",
    note: "Owner-named. Their contact page uses Efficient Plumbing. The homepage H1 also says Efficient Plumbing & Water Leak Detection. Same address and phone.",
  },
  {
    domain: "americanleakdetection.com",
    name: "American Leak Detection of Orange County",
    homeCity: "Anaheim",
    address: "910 E. Orangefair Ln., Anaheim, CA 92801",
    phone: "(714) 581-9122",
    serves: "Their Orange County page lists Laguna Niguel. The published office is in Anaheim, not Laguna Niguel.",
    sourceUrl: "https://www.americanleakdetection.com/orange-county/",
    verifiedOn: "2026-11-15",
    note: "Owner said American Leak Detection. The local page's LocalBusiness name is American Leak Detection of Orange County.",
  },
];

/** Display names read from the company's own site on 2026-11-15. Others stay domain-only. */
const VERIFIED_DISCOVERED_NAMES: Record<string, { name: string; note: string }> = {
  "leakstar.com": {
    name: "Leak Star",
    note: "Their site says Leak Star Advanced Leak Detection and that clients in Laguna Niguel use them. Street address not verified this run. https://leakstar.com/index.html",
  },
  "evansleakdetection.com": {
    name: "Evans Leak Detection",
    note: "Site title Evans Leak Detection & Slab Leak Repair. The service-area list includes Laguna Niguel. Street address not verified this run. https://www.evansleakdetection.com/",
  },
  "barkerandsonsplumbing.com": {
    name: "Barker and Sons",
    note: "Their Laguna Niguel page uses Barker and Sons. Office address not verified this run. https://www.barkerandsonsplumbing.com/city/laguna-niguel-ca-plumber/",
  },
  "rotorooter.com": {
    name: "Roto-Rooter",
    note: "Official brand domain. A Laguna Niguel franchise address was not verified this run.",
  },
};

const SKIP = new Set([
  "yelp.com",
  "m.yelp.com",
  "angi.com",
  "homeadvisor.com",
  "thumbtack.com",
  "facebook.com",
  "instagram.com",
  "mapquest.com",
  "porch.com",
  "yellowpages.com",
  "bbb.org",
  "reddit.com",
  "youtube.com",
  "m.youtube.com",
  "nextdoor.com",
  "flickr.com",
  "vertexaisearch.cloud.google.com",
  "straightflushplumbingoc.com",
]);

/** Ignore one-off domains. 25 is the count in the stored Laguna Niguel file, not a rank. */
export const DISCOVERY_MIN_APPEARANCES = 25;

export interface TrackedCompetitor {
  domain: string;
  name: string | null;
  homeCity: string | null;
  origin: CompetitorOrigin;
  notes: string;
  appearances: number | null;
}

export function seedTrackedCompetitors(): { ownerNamed: number; discovered: number } {
  let ownerNamed = 0;
  for (const c of OWNER_NAMED_COMPETITORS) {
    upsertTracked({
      domain: c.domain,
      name: c.name,
      homeCity: c.homeCity,
      origin: "owner_named",
      notes: `${c.note} Address: ${c.address}. Phone: ${c.phone}. ${c.serves} Source: ${c.sourceUrl} (${c.verifiedOn}).`,
      appearances: null,
    });
    ownerNamed += 1;
  }

  const counts = lagunaNiguelDomainCounts();
  let discovered = 0;
  for (const [domain, appearances] of counts) {
    if (appearances < DISCOVERY_MIN_APPEARANCES || SKIP.has(domain)) continue;
    const owner = OWNER_NAMED_COMPETITORS.find((c) => c.domain === domain);
    const verified = VERIFIED_DISCOVERED_NAMES[domain];
    const existing = queryOne<{ origin: string | null; notes: string | null }>("SELECT origin, notes FROM competitors WHERE domain=?", domain);
    const origin: CompetitorOrigin = owner || existing?.origin === "owner_named" || existing?.origin === "owner_named_and_discovered"
      ? "owner_named_and_discovered"
      : "discovered";
    const seen = `Appeared ${appearances} times in stored Laguna Niguel plumbing and leak-detection results (growth-engine/data/ai_visibility_history.jsonl). This is a stored-result count, not a live rank.`;
    upsertTracked({
      domain,
      name: owner?.name ?? verified?.name ?? null,
      homeCity: owner?.homeCity ?? null,
      origin,
      notes: [owner ? existing?.notes ?? "" : "", verified?.note ?? (owner ? "" : "Business name was not verified this run."), seen].filter(Boolean).join(" "),
      appearances,
    });
    if (!owner) discovered += 1;
  }
  return { ownerNamed, discovered };
}

export function listTrackedCompetitors(): TrackedCompetitor[] {
  const rows = query<{ domain: string; name: string | null; home_city: string | null; origin: CompetitorOrigin; notes: string | null; evidence: string | null }>(
    "SELECT domain, name, home_city, origin, notes, evidence FROM competitors WHERE origin IS NOT NULL",
  );
  return rows
    .map((r) => ({
      domain: r.domain,
      name: r.name,
      homeCity: r.home_city,
      origin: r.origin,
      notes: r.notes ?? "",
      appearances: appearancesOf(r.evidence),
    }))
    .sort((a, b) => {
      const ao = a.origin.startsWith("owner") ? 0 : 1;
      const bo = b.origin.startsWith("owner") ? 0 : 1;
      return ao - bo || (b.appearances ?? -1) - (a.appearances ?? -1);
    });
}

function lagunaNiguelDomainCounts(): Map<string, number> {
  const file = geDataFile("ai_visibility_history.jsonl");
  const counts = new Map<string, number>();
  if (!fs.existsSync(file)) return counts;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let row: { city?: string; query?: string; top_results?: string[] };
    try {
      row = JSON.parse(line) as { city?: string; query?: string; top_results?: string[] };
    } catch {
      continue;
    }
    const city = (row.city ?? "").toLowerCase();
    const q = (row.query ?? "").toLowerCase();
    if (!city.includes("laguna niguel") && !q.includes("laguna niguel")) continue;
    if (!/(plumb|leak|repipe|water heater|drain)/.test(q)) continue;
    for (const raw of row.top_results ?? []) {
      const host = raw.toLowerCase().replace(/^www\./, "");
      if (!host || SKIP.has(host) || host.endsWith(".google.com") || host === "google.com") continue;
      const domain = baseDomain(host);
      if (!domain || SKIP.has(domain) || domain === "google.com") continue;
      counts.set(domain, (counts.get(domain) ?? 0) + 1);
    }
  }
  return counts;
}

function upsertTracked(row: TrackedCompetitor): void {
  const evidence = JSON.stringify({ appearances: row.appearances, source: "ai_visibility_history.jsonl" });
  const existing = queryOne<{ id: number }>("SELECT id FROM competitors WHERE domain=?", row.domain);
  if (existing) {
    sqlRun(
      "UPDATE competitors SET name=COALESCE(?, name), home_city=COALESCE(?, home_city), origin=?, notes=?, evidence=? WHERE id=?",
      row.name,
      row.homeCity,
      row.origin,
      row.notes,
      evidence,
      existing.id,
    );
    return;
  }
  insert("competitors", {
    domain: row.domain,
    name: row.name,
    tier: row.origin.startsWith("owner") ? "owner_named" : "discovered",
    home_city: row.homeCity,
    notes: row.notes,
    origin: row.origin,
    evidence,
  });
}

function appearancesOf(evidence: string | null): number | null {
  if (!evidence) return null;
  try {
    const parsed = JSON.parse(evidence) as { appearances?: number | null };
    return parsed.appearances == null ? null : Number(parsed.appearances);
  } catch {
    return null;
  }
}
