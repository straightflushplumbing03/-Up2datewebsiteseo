import { CITIES, SERVICES } from "../company";

/**
 * Standardized query library (Section 4 of the spec).
 *
 * Generated deterministically from the *verified* service catalogue and the
 * 21 published service-area cities, using the query families in
 * growth-engine/KEYWORD_UNIVERSE.md. Services that have no verified page are
 * NOT included as if they were offered (see SERVICE_CATALOG.md).
 *
 * The library is a plain data structure so it can be (a) inserted into the
 * `queries` table, (b) used by the AI-visibility runner, and (c) used by the
 * GEO engine to measure how well a page covers real query language.
 */

export type QueryIntent =
  | "discovery"
  | "comparison"
  | "recommendation"
  | "cost"
  | "diagnostic"
  | "howto"
  | "emergency"
  | "company";

export interface QueryDef {
  text: string;
  family: string;
  city: string | null;
  service: string | null;
  intent: QueryIntent;
  /** 1 = highest commercial value / always tested, 3 = long tail. */
  priority: 1 | 2 | 3;
}

/** Service slugs that have a verified page (SERVICE_CATALOG.md). */
const VERIFIED_SERVICES = SERVICES.map((s) => s.slug);

const TIER1 = CITIES.filter((c) => c.tier === 1).map((c) => c.name);
const TIER2 = CITIES.filter((c) => c.tier === 2).map((c) => c.name);
const ALL_CITIES = CITIES.map((c) => c.name);

const SERVICE_LABEL: Record<string, string> = {
  "leak-detection": "leak detection",
  "slab-leak-detection": "slab leak detection",
  "pex-repiping": "PEX repiping",
  "water-heater-services": "water heater repair",
  "drain-services": "drain cleaning",
  "plumbing-repair": "plumbing repair",
  "emergency-plumbing": "emergency plumbing",
};

function q(
  text: string,
  family: string,
  intent: QueryIntent,
  priority: 1 | 2 | 3,
  city: string | null = null,
  service: string | null = null,
): QueryDef {
  return { text, family, city, service, intent, priority };
}

export function buildQueryLibrary(): QueryDef[] {
  const out: QueryDef[] = [];
  const seen = new Set<string>();
  const add = (d: QueryDef) => {
    const key = d.text.trim().toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(d);
  };

  // 1. General plumbing discovery (service × city).
  for (const city of ALL_CITIES) {
    const p = TIER1.includes(city) ? 1 : TIER2.includes(city) ? 2 : 3;
    add(q(`plumber in ${city}`, "general", "discovery", p as 1 | 2 | 3, city));
    add(q(`plumber near ${city} CA`, "general", "discovery", p as 1 | 2 | 3, city));
  }

  // 2. Service-specific discovery (verified services × tier-1/2 cities).
  for (const svc of VERIFIED_SERVICES) {
    const label = SERVICE_LABEL[svc] ?? svc.replace(/-/g, " ");
    for (const city of [...TIER1, ...TIER2]) {
      const p = TIER1.includes(city) ? 1 : 2;
      add(q(`${label} in ${city}`, svc, "discovery", p as 1 | 2 | 3, city, svc));
    }
  }

  // 3. Recommendation / comparison intents (tier-1 focus).
  for (const city of TIER1) {
    add(q(`best plumber in ${city}`, "recommendation", "recommendation", 1, city));
    add(q(`best slab leak detection company in ${city}`, "recommendation", "recommendation", 1, city, "slab-leak-detection"));
    add(q(`who can find a hidden water leak in ${city}`, "recommendation", "recommendation", 1, city, "leak-detection"));
    add(q(`which plumbing companies are recommended by AI assistants in ${city}`, "recommendation", "recommendation", 1, city));
  }

  // 4. Emergency (business hours state 24/7 emergency calls).
  for (const city of TIER1) {
    add(q(`emergency plumber in ${city}`, "emergency", "emergency", 1, city, "emergency-plumbing"));
    add(q(`24 hour plumber in ${city}`, "emergency", "emergency", 2, city, "emergency-plumbing"));
  }
  add(q("emergency plumber near me Orange County", "emergency", "emergency", 1, null, "emergency-plumbing"));
  add(q("burst pipe plumber near me", "emergency", "emergency", 2, null, "emergency-plumbing"));
  add(q("water leaking inside house", "emergency", "diagnostic", 2, null, "leak-detection"));

  // 5. Leak detection + slab leaks (core specialty).
  const leakFamilies: [string, QueryIntent, string][] = [
    ["leak detection near me", "discovery", "leak-detection"],
    ["electronic leak detection Orange County", "discovery", "leak-detection"],
    ["acoustic leak detection Orange County", "discovery", "leak-detection"],
    ["hidden water leak detection Orange County", "discovery", "leak-detection"],
    ["water leak behind wall", "diagnostic", "leak-detection"],
    ["unexplained high water bill", "diagnostic", "leak-detection"],
    ["how to find a hidden plumbing leak", "howto", "leak-detection"],
    ["slab leak detection near me", "discovery", "slab-leak-detection"],
    ["slab leak specialist Orange County", "discovery", "slab-leak-detection"],
    ["water leaking under concrete slab", "diagnostic", "slab-leak-detection"],
    ["hot water line leaking under slab", "diagnostic", "slab-leak-detection"],
    ["slab leak reroute versus repair", "comparison", "slab-leak-detection"],
    ["cost to repair a slab leak", "cost", "slab-leak-detection"],
    ["signs of a slab leak in a California home", "diagnostic", "slab-leak-detection"],
    ["who can repair a copper pipe underneath a concrete slab", "recommendation", "slab-leak-detection"],
    ["which local plumbers specialize in acoustic leak detection", "recommendation", "leak-detection"],
  ];
  for (const [text, intent, svc] of leakFamilies) add(q(text, svc, intent, 1, null, svc));

  // 6. Water lines & repipes.
  const pipeFamilies: [string, QueryIntent, string][] = [
    ["main water line repair near me", "discovery", "plumbing-repair"],
    ["water service line replacement", "discovery", "plumbing-repair"],
    ["PEX repipe Orange County", "discovery", "pex-repiping"],
    ["whole house repipe South Orange County", "discovery", "pex-repiping"],
    ["copper pipe leak repair", "discovery", "plumbing-repair"],
    ["pinhole leak in copper pipe", "diagnostic", "plumbing-repair"],
    ["water line reroute", "discovery", "plumbing-repair"],
    ["main water line replacement near Dana Point", "recommendation", "plumbing-repair"],
  ];
  for (const [text, intent, svc] of pipeFamilies) add(q(text, svc, intent, 1, null, svc));
  for (const city of TIER1) {
    add(q(`whole house repipe ${city}`, "repiping", "discovery", 1, city, "pex-repiping"));
    add(q(`who should I call for a whole-house repipe in ${city}`, "repiping", "recommendation", 1, city, "pex-repiping"));
  }

  // 7. Drain & sewer.
  for (const city of [...TIER1, ...TIER2.slice(0, 3)]) {
    add(q(`drain cleaning ${city}`, "drain", "discovery", TIER1.includes(city) ? 1 : 2, city, "drain-services"));
  }
  add(q("sewer line backup plumber", "drain", "diagnostic", 2, null, "drain-services"));
  add(q("sewer camera inspection Orange County", "drain", "discovery", 2, null, "drain-services"));
  add(q("recurring drain clog plumber", "drain", "diagnostic", 3, null, "drain-services"));

  // 8. Water heaters.
  for (const city of TIER1) {
    add(q(`water heater repair ${city}`, "water-heater", "discovery", 1, city, "water-heater-services"));
    add(q(`water heater installation ${city}`, "water-heater", "discovery", 2, city, "water-heater-services"));
  }
  add(q("tankless water heater service Orange County", "water-heater", "discovery", 2, null, "water-heater-services"));

  // 9. County-wide / regional (no city).
  const regional: [string, QueryIntent, string | null][] = [
    ["leak detection Orange County", "discovery", "leak-detection"],
    ["slab leak specialist Orange County", "discovery", "slab-leak-detection"],
    ["who specializes in electronic leak detection in Orange County", "recommendation", "leak-detection"],
    ["best plumbing company in Aliso Viejo", "recommendation", null],
    ["plumbing companies recommended by AI assistants in South Orange County", "recommendation", null],
    ["residential plumber South Orange County", "discovery", null],
    ["licensed plumber near me Laguna Niguel", "discovery", null],
    ["trusted plumber in South Orange County", "recommendation", null],
    ["local plumbing company Laguna Niguel", "discovery", null],
  ];
  for (const [text, intent, svc] of regional) add(q(text, "regional", intent, 1, null, svc));

  // 10. Cost / decision intents.
  const costIntents: [string, string][] = [
    ["how much does slab leak repair cost", "slab-leak-detection"],
    ["how much does leak detection cost", "leak-detection"],
    ["should I repair or reroute a slab leak", "slab-leak-detection"],
    ["is leak detection worth the cost", "leak-detection"],
    ["does insurance cover slab leak repair", "slab-leak-detection"],
    ["how long does slab leak repair take", "slab-leak-detection"],
  ];
  for (const [text, svc] of costIntents) add(q(text, "cost", "cost", 2, null, svc));

  // 11. Company-specific discovery (brand).
  const companyQueries: [string, QueryIntent][] = [
    ["Straight Flush Plumbing & Leak Detection", "company"],
    ["Straight Flush Plumbing Laguna Niguel reviews", "company"],
    ["is Straight Flush Plumbing licensed and insured", "company"],
    ["Straight Flush Plumbing phone number", "company"],
    ["Straight Flush Plumbing services", "company"],
    ["Straight Flush Plumbing service area", "company"],
    ["who owns Straight Flush Plumbing", "company"],
    ["Straight Flush Plumbing slab leak detection", "company"],
  ];
  for (const [text, intent] of companyQueries) add(q(text, "company", intent, 1));

  // 12. Geographic service searches across all cities (broad coverage).
  for (const city of ALL_CITIES) {
    add(
      q(
        `water leak detection ${city}`,
        "geographic",
        "discovery",
        TIER1.includes(city) ? 1 : TIER2.includes(city) ? 2 : 3,
        city,
        "leak-detection",
      ),
    );
    add(
      q(
        `slab leak repair ${city}`,
        "geographic",
        "discovery",
        TIER1.includes(city) ? 1 : TIER2.includes(city) ? 2 : 3,
        city,
        "slab-leak-detection",
      ),
    );
  }

  // 13. Detection methods — the company's core specialisation. Infrared and
  // thermal imaging are verified methods (DETECTION_METHODS), so they belong in
  // the library even though the phrase does not appear in a service label.
  const methods: [string, QueryIntent][] = [
    ["infrared leak detection Orange County", "discovery"],
    ["thermal imaging leak detection near me", "discovery"],
    ["non-invasive leak detection plumber", "discovery"],
    ["leak detection camera inspection Orange County", "discovery"],
    ["how does acoustic leak detection work", "howto"],
    ["how does electronic leak detection work", "howto"],
    ["infrared versus acoustic leak detection", "comparison"],
    ["does thermal imaging find hidden water leaks", "diagnostic"],
    ["can a leak be found without breaking concrete", "diagnostic"],
    ["best leak detection method for a slab leak", "comparison"],
  ];
  for (const [text, intent] of methods) add(q(text, "leak-detection", intent, 2, null, "leak-detection"));

  // 14. AI-platform discovery phrasings. These test whether assistants name a
  // business at all, which is the surface this whole system exists to measure.
  const aiPhrasings: [string, QueryIntent][] = [
    ["which plumber does ChatGPT recommend in South Orange County", "recommendation"],
    ["which plumbing company does AI recommend in Laguna Niguel", "recommendation"],
    ["plumbers recommended by AI assistants in Orange County", "recommendation"],
    ["best plumber according to AI in Mission Viejo", "recommendation"],
    ["most trusted leak detection company in South Orange County", "recommendation"],
    ["top rated slab leak company in Orange County", "recommendation"],
    ["highly reviewed plumber in Laguna Niguel", "recommendation"],
    ["reputable plumber for a slab leak in Aliso Viejo", "recommendation"],
  ];
  for (const [text, intent] of aiPhrasings) add(q(text, "recommendation", intent, 1));

  return out;
}

export const QUERY_LIBRARY = buildQueryLibrary();

/** Families present, for the AI Visibility filter UI. */
export function queryFamilies(): string[] {
  return [...new Set(QUERY_LIBRARY.map((q) => q.family))].sort();
}
