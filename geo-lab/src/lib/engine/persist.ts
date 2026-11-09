import { insert, query, queryOne, run as sqlRun, upsert } from "../db";
import { shortHash } from "../util";
import type { CrawledPage } from "./site";
import { schemaTypes, headingSkips } from "./html";
import type { PageScore } from "./geo";

/**
 * Persists crawled pages, their sections and their GEO scores so every number
 * the console shows is read back from a stored row (spec §5: historical
 * comparisons). Idempotent per URL: re-crawling updates in place.
 */

export function persistPages(pages: CrawledPage[]): number {
  let n = 0;
  for (const p of pages) {
    const types = schemaTypes(p.doc.jsonld);
    const id = upsert(
      "pages",
      {
        url: p.url,
        path: p.path,
        title: p.doc.title,
        meta_desc: p.doc.metaDescription,
        canonical: p.doc.canonical,
        robots_meta: p.doc.robots,
        indexable: p.indexable ? 1 : 0,
        http_status: 200,
        word_count: p.doc.wordCount,
        jsonld_blocks: p.doc.jsonld.length,
        schema_types: JSON.stringify(types),
        h1_count: p.doc.h1.length,
        heading_skips: headingSkips(p.doc.headings),
        in_sitemap: p.inSitemap ? 1 : 0,
        internal_links: p.doc.links.filter((l) => l.href.startsWith("http") || l.href.startsWith("/") || l.href.startsWith("..")).length,
        updated_at: new Date().toISOString(),
      },
      ["url"],
    );
    n++;

    // Snapshot only when the content hash changes.
    const last = queryOne<{ content_hash: string }>("SELECT content_hash FROM page_snapshots WHERE page_id=? ORDER BY id DESC LIMIT 1", id);
    if (!last || last.content_hash !== p.hash) {
      insert("page_snapshots", { page_id: id, content_hash: p.hash, note: "crawl" });
    }

    for (const s of p.doc.sections) {
      const h = shortHash(s.heading + "|" + s.text);
      upsert(
        "sections",
        {
          page_id: id,
          ordinal: s.ordinal,
          heading: s.heading,
          level: s.level,
          anchor: s.anchor,
          text: s.text.slice(0, 8000),
          word_count: s.wordCount,
          content_hash: h,
          updated_at: new Date().toISOString(),
        },
        ["page_id", "ordinal"],
      );
    }

    // Drop sections that no longer exist on the page. Without this, a removed
    // section stays in the table with its old text, so it is still counted in
    // "sections scored" and still consumes a geo_scores row — inflating the
    // dashboard totals with content that is no longer on the site.
    const keep = p.doc.sections.map((s) => s.ordinal);
    if (keep.length) {
      const placeholders = keep.map(() => "?").join(",");
      sqlRun(`DELETE FROM sections WHERE page_id=? AND ordinal NOT IN (${placeholders})`, id, ...keep);
    } else {
      sqlRun("DELETE FROM sections WHERE page_id=?", id);
    }
  }
  return n;
}

export function persistScores(scores: PageScore[], runId?: number): number {
  let n = 0;
  for (const ps of scores) {
    const page = queryOne<{ id: number }>("SELECT id FROM pages WHERE url=?", ps.url);
    if (!page) continue;
    const sectionRows = query<{ id: number; ordinal: number }>("SELECT id, ordinal FROM sections WHERE page_id=?", page.id);
    const byOrdinal = new Map(sectionRows.map((r) => [r.ordinal, r.id]));

    // Page-level roll-up row (section_id null).
    insert("geo_scores", {
      page_id: page.id,
      section_id: null,
      retrieval_probability: ps.layers.retrieval,
      extractability: ps.layers.extractability,
      entity_reinforcement: ps.layers.entity,
      structural_authority: ps.layers.authority,
      system_memory: ps.layers.memory,
      overall: ps.overall,
      detail: JSON.stringify({ notes: ps.notes, weaknesses: ps.weaknesses.slice(0, 6) }),
      run_id: runId ?? null,
    });
    n++;

    for (const ss of ps.sectionScores) {
      const layer = (k: string) => ss.layers.find((l) => l.key === k)?.score ?? 0;
      insert("geo_scores", {
        page_id: page.id,
        section_id: byOrdinal.get(ss.sectionOrdinal) ?? null,
        retrieval_probability: layer("retrieval"),
        extractability: layer("extractability"),
        entity_reinforcement: layer("entity"),
        structural_authority: layer("authority"),
        system_memory: layer("memory"),
        overall: ss.overall,
        detail: JSON.stringify({
          heading: ss.heading,
          weaknesses: ss.weaknesses,
          improvements: ss.improvements,
          factors: ss.layers.map((l) => ({ key: l.key, label: l.label, score: l.score, factors: l.factors })),
        }),
        run_id: runId ?? null,
      });
      n++;
    }
  }
  return n;
}

export function pageScoresForUrls(urls: string[], runId?: number): PageScore[] {
  void urls;
  void runId;
  return [];
}

export function latestPageScore(url: string) {
  const page = queryOne<{ id: number }>("SELECT id FROM pages WHERE url=?", url);
  if (!page) return null;
  return queryOne<Record<string, unknown>>(
    "SELECT * FROM geo_scores WHERE page_id=? AND section_id IS NULL ORDER BY id DESC LIMIT 1",
    page.id,
  );
}

export function sectionScoreHistory(pageId: number, sectionId: number, limit = 10) {
  return query<Record<string, unknown>>(
    "SELECT ts, overall, retrieval_probability, extractability, entity_reinforcement, structural_authority, system_memory FROM geo_scores WHERE page_id=? AND section_id=? ORDER BY id DESC LIMIT ?",
    pageId,
    sectionId,
    limit,
  );
}

export { sqlRun };
