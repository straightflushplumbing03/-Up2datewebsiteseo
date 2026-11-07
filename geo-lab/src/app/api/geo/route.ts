import { NextResponse } from "next/server";
import { currentUser, requireRole } from "@/lib/auth";
import { getDb, logActivity } from "@/lib/db";
import { crawlRepo } from "@/lib/engine/site";
import { scorePage } from "@/lib/engine/geo";
import { persistPages, persistScores } from "@/lib/engine/persist";
import { pageDetail } from "@/lib/queries";

export const maxDuration = 120;

/**
 * GEO Console API (spec §5). POST re-scores a page (or the whole site) and
 * returns the section-level five-layer diagnostics. GET returns stored scores.
 */
export async function POST(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { url?: string };
  const pages = crawlRepo();
  persistPages(pages);

  if (body.url) {
    const page = pages.find((p) => p.url === body.url || p.url.replace(/\/$/, "") === body.url!.replace(/\/$/, "") || p.path === body.url);
    if (!page) return NextResponse.json({ error: `Page not found: ${body.url}` }, { status: 404 });
    const score = scorePage(page.doc, page.url);
    persistScores([score]);
    logActivity("Content Intelligence Agent", `Re-scored ${page.url} on demand (${score.sectionScores.length} sections, overall ${score.overall}).`, {
      level: "success",
      evidence: `geo_scores page=${page.path}`,
    });
    return NextResponse.json({ ok: true, url: page.url, score });
  }

  const indexable = pages.filter((p) => p.indexable);
  const scores = indexable.map((p) => scorePage(p.doc, p.url));
  persistScores(scores);
  logActivity("SEO Technical Agent", `Re-scored all ${scores.length} indexable pages on demand.`, { level: "success" });
  return NextResponse.json({ ok: true, pages: scores.length, average: Math.round((scores.reduce((a, s) => a + s.overall, 0) / (scores.length || 1)) * 10) / 10 });
}

export async function GET(req: Request) {
  getDb();
  const user = await currentUser();
  try {
    requireRole(user, ["owner", "operator", "viewer"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url query parameter required" }, { status: 400 });
  const detail = pageDetail(url);
  if (!detail) return NextResponse.json({ error: "not scored yet" }, { status: 404 });
  return NextResponse.json(detail);
}
