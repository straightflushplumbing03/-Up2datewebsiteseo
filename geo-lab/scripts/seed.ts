import { getDb, queryOne } from "../src/lib/db";
import { ensureOwnerAccount } from "../src/lib/auth";
import { seedQueries, computeVisibilityMetrics } from "../src/lib/engine/visibility";
import { seedIntegrations } from "../src/lib/integrations";
import { seedCanonicalExperiments } from "../src/lib/engine/experiment";
import { ingestEntityHistory } from "../src/lib/engine/entity";
import { ingestCompetitorObservations, recordFromVisibility } from "../src/lib/engine/competitor";
import { ingestCitationActions, deriveOpportunities } from "../src/lib/engine/optimize";
import { crawlRepo, auditSite } from "../src/lib/engine/site";
import { scorePage } from "../src/lib/engine/geo";
import { persistPages, persistScores } from "../src/lib/engine/persist";
import { providerEnvFromProcess } from "../src/lib/agents/orchestrator";
import { logActivity } from "../src/lib/db";

/**
 * Idempotent bootstrap: create the schema, the owner account, the query
 * library, the integration registry, the canonical experiments, ingest the
 * existing growth-engine observations, and run the first (offline) crawl +
 * GEO scoring so the dashboard has real data immediately.
 */
function main() {
  console.log("GEO Lab — seed");
  getDb();

  const owner = ensureOwnerAccount();
  console.log(owner.created ? `  owner account created: ${owner.email}${owner.passwordFile ? ` (password file: ${owner.passwordFile})` : ""}` : "  owner account already exists");

  const q = seedQueries();
  console.log(`  query library: +${q} new (total ${queryOne<{ c: number }>("SELECT COUNT(*) c FROM queries")?.c})`);

  seedIntegrations(providerEnvFromProcess());
  console.log("  integrations registry updated");

  const ex = seedCanonicalExperiments();
  console.log(`  canonical experiments: +${ex}`);

  const eh = ingestEntityHistory();
  const co = ingestCompetitorObservations();
  const cr = recordFromVisibility();
  const ca = ingestCitationActions();
  console.log(`  ingested: entity history +${eh}, competitor observations +${co}, from-visibility +${cr}, citation actions +${ca}`);

  const pages = crawlRepo();
  persistPages(pages);
  const indexable = pages.filter((p) => p.indexable);
  const scores = indexable.map((p) => scorePage(p.doc, p.url));
  persistScores(scores);
  const audit = auditSite(pages);
  const metrics = computeVisibilityMetrics({ sinceDays: 90 });
  const created = deriveOpportunities(audit, scores, metrics);
  console.log(`  crawl: ${pages.length} pages (${indexable.length} indexable), ${scores.reduce((a, s) => a + s.sectionScores.length, 0)} sections scored`);
  console.log(`  audit: ${audit.issues.length} issues, ${audit.brokenInternalLinks.length} broken internal links`);
  console.log(`  opportunities: +${created}`);

  logActivity("Chief Intelligence Orchestrator", "Seed complete: schema, owner, query library, integrations, experiments and first crawl.", {
    level: "success",
    evidence: `${pages.length} pages`,
  });

  const avg = Math.round((scores.reduce((a, s) => a + s.overall, 0) / (scores.length || 1)) * 10) / 10;
  console.log(`  average page GEO score: ${avg}`);
  console.log("done.");
}

main();
