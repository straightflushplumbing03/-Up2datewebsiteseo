import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT, SITE_DIR } from "../paths";
import { parseDocument, schemaTypes, headingSkips, type ParsedDoc } from "./html";
import { sha256 } from "../util";
import { COMPANY } from "../company";

/**
 * Website Intelligence Engine (spec §6).
 *
 * Two sources of truth, both real:
 *  1. The repository working tree — the committed `.html` files ARE the site.
 *     This is fast and offline, so the daily job can always run.
 *  2. The live site over HTTP — used for verification (a change is only
 *     "published" once the live URL serves the new bytes).
 *
 * The indexable page set is defined by `sitemap.xml`, exactly as the repo's
 * own validator asserts. Root-level stubs are `noindex` and are tracked but
 * excluded from the indexable set.
 */

export interface CrawledPage {
  url: string;
  path: string; // repo-relative
  livePath: string;
  doc: ParsedDoc;
  html: string;
  hash: string;
  inSitemap: boolean;
  indexable: boolean;
}

export interface SiteAudit {
  generatedAt: string;
  totalHtmlFiles: number;
  sitemapUrls: number;
  indexablePages: number;
  noindexPages: number;
  orphans: string[];
  brokenInternalLinks: { from: string; href: string }[];
  issues: AuditIssue[];
  contentGaps: ContentGap[];
}

export interface AuditIssue {
  severity: "critical" | "high" | "medium" | "low";
  code: string;
  url: string;
  message: string;
}

export interface ContentGap {
  kind: "city" | "service" | "intent" | "schema" | "faq";
  label: string;
  evidence: string;
  suggestion: string;
}

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "geo-lab",
  ".openhands",
  ".claude",
  ".codex",
  ".agents",
  "lost+found",
  "data",
]);

export function sitemapUrls(): string[] {
  const file = path.join(REPO_ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return [];
  const xml = fs.readFileSync(file, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/** Convert a live sitemap URL to a repo-relative file path. */
export function urlToRepoPath(url: string): string | null {
  let u = url.trim();
  try {
    const parsed = new URL(u);
    u = parsed.pathname;
  } catch {
    /* already a path */
  }
  if (u === "/" || u === "") return "index.html";
  u = u.replace(/^\//, "");
  if (u.endsWith("/")) return path.join(u, "index.html");
  if (u.endsWith(".html")) return u;
  // extensionless: prefer the .html twin at the same level
  if (fs.existsSync(path.join(REPO_ROOT, u + ".html"))) return u + ".html";
  if (fs.existsSync(path.join(REPO_ROOT, u, "index.html"))) return path.join(u, "index.html");
  return u + ".html";
}

export function repoPathToUrl(p: string): string {
  let rel = p.replace(/\\/g, "/");
  if (rel.endsWith("/index.html")) rel = rel.slice(0, -"index.html".length);
  else if (rel === "index.html") rel = "";
  return COMPANY.website.replace(/\/$/, "") + "/" + rel.replace(/^\//, "");
}

export function walkHtml(dir = REPO_ROOT): string[] {
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".well-known") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      out.push(...walkHtml(full));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

export function crawlRepo(): CrawledPage[] {
  const sm = new Set(sitemapUrls().map((u) => urlToRepoPath(u)).filter(Boolean) as string[]);
  const files = walkHtml();
  const pages: CrawledPage[] = [];
  for (const file of files) {
    const rel = path.relative(REPO_ROOT, file);
    const html = fs.readFileSync(file, "utf8");
    const url = repoPathToUrl(rel);
    const doc = parseDocument(html, url);
    const indexable = !/noindex/i.test(doc.robots || "");
    pages.push({
      url,
      path: rel,
      livePath: "/" + rel.replace(/\\/g, "/").replace(/index\.html$/, ""),
      doc,
      html,
      hash: sha256(html),
      inSitemap: sm.has(rel),
      indexable,
    });
  }
  return pages;
}

export function auditSite(pages: CrawledPage[]): SiteAudit {
  const issues: AuditIssue[] = [];
  const known = new Set(pages.map((p) => p.path));
  const urlSet = new Set(pages.map((p) => p.url));
  const brokenInternalLinks: { from: string; href: string }[] = [];

  const indexable = pages.filter((p) => p.indexable);
  const noindex = pages.filter((p) => !p.indexable);
  const orphans: string[] = [];

  // Broken internal links (relative .html targets that don't exist).
  for (const p of pages) {
    for (const l of p.doc.links) {
      if (!l.href) continue;
      let target = l.href;
      if (target.startsWith("http")) {
        try {
          const u = new URL(target);
          if (!u.hostname.includes("straightflushplumbingoc")) continue;
          target = u.pathname;
        } catch {
          continue;
        }
      }
      if (target.startsWith("#") || target.startsWith("mailto:") || target.startsWith("tel:")) continue;
      const repoRel = urlToRepoPath(target);
      if (repoRel && !known.has(repoRel) && !fs.existsSync(path.join(REPO_ROOT, repoRel))) {
        brokenInternalLinks.push({ from: p.path, href: l.href });
      }
    }
  }

  for (const p of indexable) {
    if (!p.inSitemap) {
      orphans.push(p.path);
      issues.push({ severity: "high", code: "orphan-page", url: p.url, message: "Indexable page missing from sitemap.xml." });
    }
    const h1n = p.doc.h1.length;
    if (h1n === 0) issues.push({ severity: "high", code: "missing-h1", url: p.url, message: "No H1 heading." });
    if (h1n > 1) issues.push({ severity: "medium", code: "multiple-h1", url: p.url, message: `${h1n} H1 headings.` });
    const skips = headingSkips(p.doc.headings);
    if (skips > 0) issues.push({ severity: "medium", code: "heading-skip", url: p.url, message: `${skips} heading level skip(s).` });
    if (!p.doc.metaDescription) issues.push({ severity: "medium", code: "missing-meta", url: p.url, message: "Missing meta description." });
    else if (p.doc.metaDescription.length > 165) issues.push({ severity: "low", code: "long-meta", url: p.url, message: `Meta description ${p.doc.metaDescription.length} chars (>165).` });
    if (!p.doc.canonical) issues.push({ severity: "medium", code: "missing-canonical", url: p.url, message: "No canonical URL." });
    const types = schemaTypes(p.doc.jsonld);
    if (types.length === 0) issues.push({ severity: "medium", code: "missing-schema", url: p.url, message: "No JSON-LD structured data." });
    if (p.doc.images.some((i) => !i.alt)) {
      issues.push({ severity: "low", code: "img-alt", url: p.url, message: `${p.doc.images.filter((i) => !i.alt).length} image(s) without alt text.` });
    }
    if (p.doc.sections.length === 1 && p.doc.sections[0].heading === "(no heading)") {
      issues.push({ severity: "low", code: "no-sections", url: p.url, message: "No heading-delimited sections to score." });
    }
  }

  if (brokenInternalLinks.length) {
    for (const b of brokenInternalLinks.slice(0, 50)) {
      issues.push({ severity: "high", code: "broken-link", url: b.from, message: `Broken internal link → ${b.href}` });
    }
  }

  // Content gaps: verified services with no city-specific page, and cities
  // whose page lacks a FAQ/schema (measured, not guessed).
  const contentGaps: ContentGap[] = [];
  const citySlugs = ["laguna-niguel", "dana-point", "san-clemente", "mission-viejo", "aliso-viejo"];
  for (const p of indexable) {
    const types = schemaTypes(p.doc.jsonld);
    if (p.path.startsWith("cities/") && !types.includes("FAQPage")) {
      const city = p.path.replace(/^cities\//, "").replace(/\.html$/, "");
      if (citySlugs.includes(city)) {
        contentGaps.push({
          kind: "faq",
          label: `${city} city page`,
          evidence: `${p.path} has no FAQPage schema.`,
          suggestion: "Add a city-specific FAQ section with matching FAQPage schema (verified facts only).",
        });
      }
    }
  }

  // City × core service coverage: count how many verified service pages exist
  // per city via filename conventions actually present in the repo.
  const files = pages.map((p) => p.path);
  for (const city of citySlugs) {
    const servicePagesForCity = files.filter((f) => f.includes(city) && f.startsWith("services/"));
    if (servicePagesForCity.length === 0) {
      contentGaps.push({
        kind: "city",
        label: `${city} service coverage`,
        evidence: `No service page filename references ${city}.`,
        suggestion: `Consider one genuinely useful service-area page for ${city} (no duplicate city pages).`,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalHtmlFiles: pages.length,
    sitemapUrls: sitemapUrls().length,
    indexablePages: indexable.length,
    noindexPages: noindex.length,
    orphans,
    brokenInternalLinks,
    issues,
    contentGaps,
  };
}

/** Live fetch with a real timeout; returns null on failure (never throws). */
export async function fetchLive(url: string, timeoutMs = 12000): Promise<{ status: number; body: string; headers: Record<string, string> } | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "SFPL-GEO-Lab/1.0 (+https://straightflushplumbingoc.com)" },
    });
    const body = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => (headers[k] = v));
    return { status: res.status, body, headers };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export { SITE_DIR };
