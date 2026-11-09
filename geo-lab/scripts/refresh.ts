import { getDb } from "../src/lib/db";
import { DB_PATH } from "../src/lib/paths";
import { crawlRepo, auditSite } from "../src/lib/engine/site";
import { scorePage } from "../src/lib/engine/geo";
import { persistPages, persistScores } from "../src/lib/engine/persist";
import { computeVisibilityMetrics } from "../src/lib/engine/visibility";
import { deriveOpportunities } from "../src/lib/engine/optimize";
import { logActivity } from "../src/lib/db";

/**
 * Re-crawl the site, re-score every indexable page and refresh the derived
 * opportunity list — without running the agents. This is the cheap "did the
 * site change?" pass, safe to run often.
 */
getDb();

const pages = crawlRepo();
persistPages(pages);
const indexable = pages.filter((p) => p.indexable);
const scores = indexable.map((p) => scorePage(p.doc, p.url));
persistScores(scores);

const audit = auditSite(pages);
const metrics = computeVisibilityMetrics({ sinceDays: 90 });
const created = deriveOpportunities(audit, scores, metrics);

const sections = scores.reduce((a, s) => a + s.sectionScores.length, 0);
const avg = Math.round((scores.reduce((a, s) => a + s.overall, 0) / (scores.length || 1)) * 10) / 10;

console.log(`GEO Lab — refresh (${DB_PATH})`);
console.log(`  pages: ${pages.length} (${indexable.length} indexable)`);
console.log(`  sections scored: ${sections}`);
console.log(`  audit issues: ${audit.issues.length}, broken internal links: ${audit.brokenInternalLinks.length}`);
console.log(`  new opportunities: +${created}`);
console.log(`  average page GEO score: ${avg}`);

logActivity("SEO Technical Agent", "Refresh complete: site re-crawled and re-scored.", {
  level: "info",
  evidence: `${pages.length} pages, ${sections} sections`,
});
console.log("done.");
