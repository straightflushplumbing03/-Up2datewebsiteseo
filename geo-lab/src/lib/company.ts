/**
 * Company knowledge base — the single source of truth for every business fact
 * the application may publish or measure against.
 *
 * Every value is sourced from the existing growth-engine knowledge base
 * (growth-engine/BUSINESS_PROFILE.md, APPROVED_CLAIMS.md, SERVICE_CATALOG.md,
 * SERVICE_AREAS.md) and the live site's JSON-LD. Nothing here is invented.
 *
 * Hard rule (see APPROVED_CLAIMS.md): identity, NAP, pricing, warranties,
 * licensing and certifications are LOCKED. Agents may not change them.
 */

export type Confidence = "high" | "medium" | "low" | "none";

export interface SourcedFact<T = string> {
  value: T;
  source: string;
  verified: string;
  confidence: Confidence;
}

export const COMPANY = {
  name: "Straight Flush Plumbing & Leak Detection",
  shortName: "Straight Flush",
  slogan: "Always A Safe Bet",
  website: "https://straightflushplumbingoc.com",
  founded: "2019",
  owner: "Lance Badgwell",
  model: "Owner-operated residential plumbing; the owner answers the phone",
  email: "lance@straightflushplumbingoc.com",
  phone: "(949) 374-6524",
  phoneE164: "+19493746524",
  address: "78 Cameray Heights, Laguna Niguel, CA 92677, US",
  city: "Laguna Niguel",
  region: "South Orange County, California",
  hours: [
    { days: "Mon–Fri", hours: "08:00–19:00" },
    { days: "Saturday", hours: "09:00–18:00" },
    { days: "Sunday", hours: "09:00–18:00 (24/7 for emergency calls)" },
  ],
} as const;

/** Locked identity fields — autonomous publishing may never modify these. */
export const LOCKED_FACTS = {
  name: COMPANY.name,
  phone: COMPANY.phone,
  phoneE164: COMPANY.phoneE164,
  email: COMPANY.email,
  address: COMPANY.address,
  website: COMPANY.website,
  founded: COMPANY.founded,
  slogan: COMPANY.slogan,
} as const;

/** Verified service offerings (a live page exists for each). */
export const SERVICES: { slug: string; label: string; page: string; core?: boolean }[] = [
  { slug: "leak-detection", label: "Leak Detection", page: "/services/leak-detection.html", core: true },
  { slug: "slab-leak-detection", label: "Slab Leak Detection", page: "/services/slab-leak-detection.html", core: true },
  { slug: "pex-repiping", label: "PEX Repiping", page: "/services/pex-repiping.html" },
  { slug: "water-heater-services", label: "Water Heater Services", page: "/services/water-heater-services.html" },
  { slug: "drain-services", label: "Drain Services", page: "/services/drain-services.html" },
  { slug: "plumbing-repair", label: "Plumbing Repair", page: "/services/plumbing-repair.html" },
  { slug: "emergency-plumbing", label: "Emergency Plumbing", page: "/services/emergency-plumbing.html" },
];

/** Detection methods actually used (APPROVED_CLAIMS.md). */
export const DETECTION_METHODS = ["acoustic", "electronic", "thermal imaging"] as const;

/** The 21 published service-area cities (SERVICE_AREAS.md), with tiers. */
export const CITIES: { name: string; slug: string; tier: 1 | 2 | 3; hq?: boolean }[] = [
  { name: "Laguna Niguel", slug: "laguna-niguel", tier: 1, hq: true },
  { name: "Dana Point", slug: "dana-point", tier: 1 },
  { name: "San Clemente", slug: "san-clemente", tier: 1 },
  { name: "Mission Viejo", slug: "mission-viejo", tier: 1 },
  { name: "Aliso Viejo", slug: "aliso-viejo", tier: 1 },
  { name: "Laguna Hills", slug: "laguna-hills", tier: 2 },
  { name: "Laguna Beach", slug: "laguna-beach", tier: 2 },
  { name: "Ladera Ranch", slug: "ladera-ranch", tier: 2 },
  { name: "Rancho Santa Margarita", slug: "rancho-santa-margarita", tier: 2 },
  { name: "Irvine", slug: "irvine", tier: 2 },
  { name: "Lake Forest", slug: "lake-forest", tier: 2 },
  { name: "San Juan Capistrano", slug: "san-juan-capistrano", tier: 2 },
  { name: "Newport Beach", slug: "newport-beach", tier: 2 },
  { name: "Coto de Caza", slug: "coto-de-caza", tier: 3 },
  { name: "Dove Canyon", slug: "dove-canyon", tier: 3 },
  { name: "Foothill Ranch", slug: "foothill-ranch", tier: 3 },
  { name: "Laguna Woods", slug: "laguna-woods", tier: 3 },
  { name: "Costa Mesa", slug: "costa-mesa", tier: 3 },
  { name: "Huntington Beach", slug: "huntington-beach", tier: 3 },
  { name: "Tustin", slug: "tustin", tier: 3 },
  { name: "Orange", slug: "orange", tier: 3 },
];

/** Approved / restricted / forbidden claim policy (APPROVED_CLAIMS.md). */
export const CLAIM_POLICY = {
  allowed: [
    "Owner-operated, Laguna Niguel based; owner Lance answers the phone himself.",
    "Diagnose-first process: locate the leak before opening concrete or drywall.",
    "Detection methods: acoustic, electronic, thermal imaging.",
    "Insurance-claim documentation support — no coverage promises.",
    "Licensed & Fully Insured (general trust badge; no number/carrier until owner-verified).",
  ],
  restricted: [
    "Any specific license number, bond amount, or insurance carrier.",
    "Warranty terms, guarantees, or 'lifetime' language.",
    "Published prices, price ranges, or 'free estimate' promises (except the owner-confirmed leak-detection range).",
    "Any review count or rating not matching the live Google/Yelp profiles.",
  ],
  ownerConfirmed: [
    { date: "2026-10-31", fact: "Leak detection costs $365–$525 for most homes.", source: "Owner (Lance)" },
    { date: "2026-10-31", fact: "Insurance typically reimburses leak-detection cost when a claim is filed.", source: "Owner (Lance)" },
    { date: "2026-10-23", fact: "Tankless water heater service (repair, descaling, tank-to-tankless conversion).", source: "Owner (Lance)" },
  ],
  forbidden: [
    "Superlatives ('best', '#1', 'top-rated', 'award-winning') not corroborated by a third party.",
    "Invented statistics, review counts, awards, certifications, affiliations or partnerships.",
    "Fabricated customers, testimonials, case studies, photos or results.",
    "Competitor disparagement or misleading comparisons.",
    "Guarantees of rankings, recommendations, or lead volume.",
  ],
} as const;

/** Known owned duplicate hosts to be consolidated (never linked as sameAs). */
export const DUPLICATE_HOSTS = [
  { host: "straight-flush-plumbing-7fb7cf71.base44.app", status: "live indexable duplicate", owner: true },
  { host: "straightflushplumb8.wixsite.com", status: "404 (gone)", owner: true },
  { host: "flush-pro-flow.base44.app", status: "404 (gone)", owner: true },
] as const;

/** Brand name matching (deliberately excludes bare "straight flush"). */
export const SF_NAME_PATTERNS = [
  /straight\s*flush\s*plumbing/i,
  /straightflushplumbing/i,
];

export function mentionsBrand(text: string): boolean {
  return SF_NAME_PATTERNS.some((re) => re.test(text));
}

/** Validate that a proposed content change does not touch a locked fact. */
export function detectLockedFactChange(before: string, after: string): string[] {
  const violations: string[] = [];
  for (const [key, value] of Object.entries(LOCKED_FACTS)) {
    const wasPresent = before.includes(value);
    const stillPresent = after.includes(value);
    if (wasPresent && !stillPresent) {
      violations.push(`Removes locked ${key} ("${value}")`);
    }
  }
  // Never allow new superlatives.
  const superlatives = /\b(best|#1|number one|top[- ]rated|award[- ]winning)\b/i;
  if (!superlatives.test(before) && superlatives.test(after)) {
    violations.push("Introduces an unsupported superlative claim");
  }
  return violations;
}
