/**
 * Test suite (spec §20 Phase 11). Runs against the real modules and a real
 * (temporary) SQLite database — no mocks. Each test asserts behaviour that has
 * broken before, or that guards a policy the lab must never violate.
 *
 *   npm test
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

// Point the whole process at a throwaway database before any module loads it.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "geolab-test-"));
process.env.GEO_LAB_DB = path.join(tmpDir, "test.db");

const results: { name: string; ok: boolean; detail: string }[] = [];
let current = "";

async function test(name: string, fn: () => void | Promise<void>) {
  current = name;
  try {
    await fn();
    results.push({ name, ok: true, detail: "" });
  } catch (e) {
    results.push({ name, ok: false, detail: (e as Error).message });
  }
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}
function eq(actual: unknown, expected: unknown, msg: string) {
  if (actual !== expected) throw new Error(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

async function main() {
  const { getDb, queryOne, logActivity, audit, insert } = await import("../src/lib/db");
  const { COMPANY, CITIES, SERVICES, mentionsBrand, detectLockedFactChange, CLAIM_POLICY } = await import("../src/lib/company");
  const { QUERY_LIBRARY, queryFamilies } = await import("../src/lib/engine/queries");
  const { parseDocument, stripNonContent, headingSkips } = await import("../src/lib/engine/html");
  const { scoreSection, scorePage, LAYERS, layerWeights } = await import("../src/lib/engine/geo");
  const { crawlRepo, auditSite, sitemapUrls } = await import("../src/lib/engine/site");
  const { siteEntityFacts } = await import("../src/lib/engine/entity");
  const { computeVisibilityMetrics, pickQueries, seedQueries } = await import("../src/lib/engine/visibility");
  const { classifyStatus } = await import("../src/lib/engine/providers");
  const { validateChange, generateSafeLinkFixes, listPublications } = await import("../src/lib/engine/publishing");
  const { seedCanonicalExperiments, listExperiments } = await import("../src/lib/engine/experiment");
  const { generateReport, saveReport, listReports, costEstimate } = await import("../src/lib/reporting");
  const { deriveOpportunities, listOpportunities } = await import("../src/lib/engine/optimize");
  const { listIntegrations, seedIntegrations } = await import("../src/lib/integrations");

  getDb(); // applies the schema idempotently on first connection

  // ── Database ────────────────────────────────────────────────────────────
  await test("db: schema initialises and audit + activity persist", () => {
    audit("test", "unit", "target", "detail");
    const a = queryOne<{ c: number }>("SELECT COUNT(*) c FROM audit_log");
    assert(a && a.c >= 1, "audit row not written");
    logActivity("Test Agent", "hello", { level: "info" });
    const act = queryOne<{ c: number }>("SELECT COUNT(*) c FROM activity");
    assert(act && act.c >= 1, "activity row not written");
  });

  await test("db: logActivity drops a run_id that is not an agent_run (FK regression)", () => {
    // A visibility run id is NOT an agent_runs id. Before the guard this threw
    // "FOREIGN KEY constraint failed" and aborted the whole sweep.
    const visRun = insert("visibility_runs", { trigger: "test", provider: "x", test_type: "ai_platform", queries_total: 1 });
    logActivity("Test Agent", "sweep done", { evidence: `visibility_runs#${visRun}`, runId: visRun });
    const row = queryOne<{ run_id: number | null; evidence: string }>("SELECT run_id, evidence FROM activity ORDER BY id DESC LIMIT 1");
    assert(row, "activity not written");
    eq(row.run_id, null, "foreign run id should have been dropped");
    eq(row.evidence, `visibility_runs#${visRun}`, "evidence should preserve the real run reference");
  });

  await test("auth: password hashing verifies and rejects, and login locks after repeated failures", async () => {
    const { hashPassword, verifyPassword, createUser, login, loginLockRemainingMs, logout } = await import("../src/lib/auth");
    const h = hashPassword("correct horse battery staple");
    assert(verifyPassword("correct horse battery staple", h), "correct password must verify");
    assert(!verifyPassword("wrong", h), "wrong password must not verify");
    assert(h.startsWith("scrypt$"), "hash must record its scheme");
    assert(!h.includes("correct horse"), "plaintext must not appear in the hash");

    const email = "locktest@example.com";
    createUser(email, "Lock Test", "owner", "right-password");
    for (let i = 0; i < 8; i++) eq(login(email, "wrong-password"), null, `attempt ${i + 1} must fail`);
    assert(loginLockRemainingMs(email) > 0, "the account must be locked after 8 failures");
    eq(login(email, "right-password"), null, "a locked account must refuse even the correct password");
    // A successful login (after the lock is cleared) resets the counter.
    const { queryOne: q1, run: sqlRun } = await import("../src/lib/db");
    void q1;
    sqlRun("DELETE FROM schema_meta WHERE key=?", `login_fail:${email}`);
    const ok = login(email, "right-password");
    assert(ok, "login must succeed once unlocked");
    eq(loginLockRemainingMs(email), 0, "a successful login clears the failure counter");
    logout(ok!.token);
  });

  // ── Company knowledge base ──────────────────────────────────────────────
  await test("company: identity facts are present and internally consistent", () => {
    eq(COMPANY.name, "Straight Flush Plumbing & Leak Detection", "name");
    eq(COMPANY.city, "Laguna Niguel", "city");
    assert(COMPANY.phone.includes("949"), "phone");
    assert(COMPANY.website.startsWith("https://"), "website must be https");
    assert(CITIES.some((c) => c.hq), "one city must be flagged as HQ");
    assert(SERVICES.length >= 7, `expected the verified service catalogue, got ${SERVICES.length}`);
    const slugs = new Set(SERVICES.map((x) => x.slug));
    assert(slugs.has("leak-detection") && slugs.has("slab-leak-detection"), "core services missing");
  });

  await test("company: brand matching excludes the bare phrase 'straight flush'", () => {
    assert(mentionsBrand("Straight Flush Plumbing & Leak Detection is great"), "full name should match");
    assert(mentionsBrand("straightflushplumbingoc.com"), "domain should match");
    assert(!mentionsBrand("straight flush"), "bare phrase must NOT match (a poker result is not the brand)");
  });

  await test("company: locked-fact change detection fires on real identity values", () => {
    const changed = detectLockedFactChange("call (949) 374-6524 today", "call (949) 555-0000 today");
    assert(changed.length > 0, "a changed phone number must be detected");
    eq(detectLockedFactChange("call (949) 374-6524", "call (949) 374-6524").length, 0, "no change should be reported");
  });

  await test("company: claim policy forbids superlatives and invented proof", () => {
    assert(CLAIM_POLICY.forbidden.length > 0, "forbidden list must be defined");
    const joined = CLAIM_POLICY.forbidden.join(" ").toLowerCase();
    assert(joined.includes("review") || joined.includes("testimonial"), "reviews/testimonials must be forbidden");
  });

  // ── Query library ───────────────────────────────────────────────────────
  await test("queries: library meets the 150-query minimum with unique text", () => {
    assert(QUERY_LIBRARY.length >= 150, `expected >=150 queries, got ${QUERY_LIBRARY.length}`);
    const texts = QUERY_LIBRARY.map((q) => q.text.toLowerCase());
    eq(new Set(texts).size, texts.length, "query text must be unique");
  });

  await test("queries: every query has a valid intent, priority and family", () => {
    const intents = new Set(["discovery", "comparison", "recommendation", "cost", "diagnostic", "howto", "emergency", "company"]);
    for (const q of QUERY_LIBRARY) {
      assert(intents.has(q.intent), `bad intent "${q.intent}" on "${q.text}"`);
      assert([1, 2, 3].includes(q.priority), `bad priority on "${q.text}"`);
      assert(q.family.trim().length > 0, `empty family on "${q.text}"`);
    }
    assert(queryFamilies().length >= 10, "expected a broad set of families");
  });

  await test("queries: all published cities appear, and no service is invented", () => {
    const verified = new Set(SERVICES.map((s) => s.slug));
    for (const c of CITIES) {
      assert(QUERY_LIBRARY.some((q) => q.city === c.name), `no query for city ${c.name}`);
    }
    for (const q of QUERY_LIBRARY) {
      if (q.service) assert(verified.has(q.service), `query references unverified service "${q.service}"`);
    }
  });

  await test("queries: detection-method and AI-recommendation phrasings are covered", () => {
    const all = QUERY_LIBRARY.map((q) => q.text.toLowerCase()).join("\n");
    for (const kw of ["infrared", "thermal", "acoustic", "electronic", "recommended by ai"]) {
      assert(all.includes(kw), `query library is missing coverage for "${kw}"`);
    }
  });

  // ── HTML parsing / extractability ───────────────────────────────────────
  await test("html: scripts and styles are stripped before structure parsing (regression)", () => {
    const html = `<html><head><title>T</title><style>a{}</style></head><body>
      <script>var x = '<a href="/not-a-real-link">nope</a>';</script>
      <h1>Real heading</h1><p>Real paragraph with enough words to be meaningful for scoring purposes here.</p>
      <a href="/services/leak-detection.html">Real link</a></body></html>`;
    const stripped = stripNonContent(html);
    assert(!stripped.includes("not-a-real-link"), "script contents must be removed");
    assert(!stripped.includes("a{}"), "style contents must be removed");
    const doc = parseDocument(html, "https://example.com/");
    const hrefs = doc.links.map((l) => l.href);
    assert(!hrefs.some((h) => h.includes("not-a-real-link")), "a link inside <script> must not be parsed as real");
    assert(hrefs.some((h) => h.includes("/services/leak-detection.html")), "a real link must be parsed");
  });

  await test("html: headings, paragraphs and JSON-LD blocks are extracted", () => {
    const html = `<html><head><script type="application/ld+json">{"@type":"Plumber","name":"X"}</script></head>
      <body><h1>One</h1><h2>Two</h2><p>${"word ".repeat(40)}</p></body></html>`;
    const doc = parseDocument(html, "https://example.com/");
    assert(doc.headings.some((h) => h.level === 1 && h.text === "One"), "h1 not extracted");
    assert(doc.headings.some((h) => h.level === 2 && h.text === "Two"), "h2 not extracted");
    eq(doc.jsonld.length, 1, "JSON-LD block not extracted");
    assert(doc.wordCount > 30, "words not counted");
  });

  await test("html: heading-level skips are detected", () => {
    eq(headingSkips([{ level: 1, text: "a", index: 0 }, { level: 2, text: "b", index: 1 }]), 0, "no skip");
    assert(headingSkips([{ level: 1, text: "a", index: 0 }, { level: 3, text: "b", index: 1 }]) > 0, "h1->h3 is a skip");
  });

  // ── GEO engine ──────────────────────────────────────────────────────────
  await test("geo: five layers are defined with weights that sum to 1", () => {
    eq(LAYERS.length, 5, "expected five layers");
    const w = layerWeights();
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    assert(Math.abs(total - 1) < 1e-6, `layer weights must sum to 1, got ${total}`);
  });

  await test("geo: section and page scores are bounded 0-100 and explain themselves", () => {
    const doc = parseDocument(
      `<html><body><h2>Slab leak detection in Laguna Niguel</h2>
       <p>${"A hidden water leak under a concrete slab in Laguna Niguel can be located with acoustic and electronic leak detection. ".repeat(4)}</p>
       <h3>How we find the leak</h3><ul><li>Acoustic listening</li><li>Electronic tracing</li></ul></body></html>`,
      "https://straightflushplumbingoc.com/slab-leak-detection-laguna-niguel.html",
    );
    const score = scorePage(doc, "https://straightflushplumbingoc.com/slab-leak-detection-laguna-niguel.html");
    assert(score.sectionScores.length >= 1, "expected at least one scored section");
    for (const s of score.sectionScores) {
      eq(s.layers.length, 5, "a section must carry all five layer scores");
      for (const l of s.layers) {
        assert(l.score >= 0 && l.score <= 100, `${l.key} out of range: ${l.score}`);
        assert(l.factors.length > 0, `layer ${l.key} must explain itself with factors`);
      }
      assert(s.overall >= 0 && s.overall <= 100, `overall out of range: ${s.overall}`);
      assert(typeof s.heading === "string", "a section must carry its heading as evidence");
    }
    assert(score.overall >= 0 && score.overall <= 100, "page overall out of range");
  });

  await test("geo: a substantial, localised section outscores a thin one", () => {
    const ctx = {
      doc: parseDocument("<html><body></body></html>"),
      pageUrl: "https://straightflushplumbingoc.com/x.html",
      pageKeywords: ["slab leak detection", "laguna niguel"],
      queries: ["slab leak detection Laguna Niguel"],
    };
    const thin = scoreSection(
      { ordinal: 1, level: 2, heading: "", anchor: null, text: "Plumbing.", firstParagraph: "Plumbing.", listItems: 0, tables: 0, paragraphs: 1, questions: 0, hasDirectAnswer: false, wordCount: 1, duplicateOf: null },
      ctx,
    );
    const rich = scoreSection(
      {
        ordinal: 2,
        level: 2,
        heading: "How slab leak detection works in Laguna Niguel",
        anchor: null,
        text: "Acoustic and electronic leak detection locates a hidden water leak under a concrete slab without unnecessary demolition. We explain the process, the equipment, and what a homeowner in Laguna Niguel should expect. ".repeat(3),
        firstParagraph: "Acoustic and electronic leak detection locates a hidden water leak under a concrete slab without unnecessary demolition.",
        listItems: 3,
        tables: 0,
        paragraphs: 4,
        questions: 1,
        hasDirectAnswer: true,
        wordCount: 90,
        duplicateOf: null,
      },
      ctx,
    );
    assert(rich.overall > thin.overall, `rich section (${rich.overall}) should beat thin (${thin.overall})`);
  });

  // ── Website intelligence ────────────────────────────────────────────────
  await test("site: crawler finds the real site pages and marks indexability", () => {
    const pages = crawlRepo();
    assert(pages.length >= 100, `expected the real site (>=100 pages), got ${pages.length}`);
    assert(pages.filter((p) => p.indexable).length > 0, "expected some indexable pages");
  });

  await test("site: audit finds no broken internal links and the sitemap matches the indexable set", () => {
    const pages = crawlRepo();
    const audit = auditSite(pages);
    eq(audit.brokenInternalLinks.length, 0, `broken internal links: ${audit.brokenInternalLinks.slice(0, 5).map((b) => b.href).join(", ")}`);
    const indexableUrls = new Set(pages.filter((p) => p.indexable).map((p) => p.url));
    const sitemapOnly = sitemapUrls().filter((u) => !indexableUrls.has(u));
    eq(sitemapOnly.length, 0, `sitemap URLs with no indexable page: ${sitemapOnly.slice(0, 5).join(", ")}`);
    eq(audit.sitemapUrls, sitemapUrls().length, "audit sitemap count must equal the parsed sitemap");
  });

  await test("site: re-persisting a page drops sections that no longer exist (no orphans)", async () => {
    const { persistPages } = await import("../src/lib/engine/persist");
    const { parseDocument } = await import("../src/lib/engine/html");
    const { insert: ins, queryOne: qo } = await import("../src/lib/db");
    const url = "https://straightflushplumbingoc.com/.persist-probe.html";
    const mk = (html: string) => ({
      url,
      path: "geo-lab/.persist-probe.html",
      doc: parseDocument(html, url),
      indexable: true,
      inSitemap: false,
      hash: "h",
    });
    const four = `<html><body><h2>One</h2><p>${"a ".repeat(60)}</p><h2>Two</h2><p>${"b ".repeat(60)}</p><h2>Three</h2><p>${"c ".repeat(60)}</p><h2>Four</h2><p>${"d ".repeat(60)}</p></body></html>`;
    persistPages([mk(four) as never]);
    const pageId = qo<{ id: number }>("SELECT id FROM pages WHERE url=?", url)!.id;
    const before = qo<{ c: number }>("SELECT COUNT(*) c FROM sections WHERE page_id=?", pageId)!.c;
    assert(before >= 4, `expected >=4 sections, got ${before}`);

    const two = `<html><body><h2>One</h2><p>${"a ".repeat(60)}</p><h2>Two</h2><p>${"b ".repeat(60)}</p></body></html>`;
    persistPages([mk(two) as never]);
    const after = qo<{ c: number }>("SELECT COUNT(*) c FROM sections WHERE page_id=?", pageId)!.c;
    assert(after < before, `removed sections must be deleted (was ${before}, now ${after})`);
    void ins;
  });

  // ── Entity intelligence ─────────────────────────────────────────────────
  await test("entity: NAP facts match the knowledge base after phone normalisation (regression)", () => {
    const facts = siteEntityFacts();
    assert(facts.length > 0, "expected entity facts from index.html JSON-LD");
    const phone = facts.find((f) => f.field === "telephone");
    assert(phone, "telephone fact missing");
    assert(phone.matches, `E.164 vs display phone must be treated as equal: ${phone.note}`);
    const name = facts.find((f) => f.field === "name");
    assert(name && name.matches, "business name must match");
    const mismatches = facts.filter((f) => !f.matches);
    eq(mismatches.length, 0, `unexpected entity discrepancies: ${mismatches.map((m) => m.field).join(", ")}`);
  });

  await test("entity: dashboard consistency reflects the latest check, not all history", async () => {
    const { runEntityCheck } = await import("../src/lib/engine/entity");
    const { dashboardSummary } = await import("../src/lib/queries");
    await runEntityCheck({ live: false });
    const d = dashboardSummary();
    const latest = d.entityConsistency;
    assert(latest !== null && latest > 90, `latest-check consistency should be high, got ${latest}`);
    // And it must not equal the all-history sum when history contains mismatches.
    const all = queryOne<{ matches: number; total: number }>("SELECT SUM(matches) matches, COUNT(*) total FROM entity_facts")!;
    const allRate = all.matches / all.total;
    assert(allRate * 100 <= latest + 1e-6, "the all-history rate must not exceed the latest-check rate");
  });

  // ── Visibility measurement ──────────────────────────────────────────────
  await test("visibility: status detection distinguishes cited / mentioned / recommended / absent", () => {
    const brand = "Straight Flush Plumbing & Leak Detection";
    eq(classifyStatus("I recommend " + brand + " for slab leaks.", [], "slab leak"), "recommended", "explicit recommendation");
    eq(classifyStatus("You could try " + brand + ".", [], "slab leak"), "mentioned", "a mention is not a recommendation");
    eq(classifyStatus("See the guide.", ["https://straightflushplumbingoc.com/x"], "slab leak"), "cited", "a citation is not a mention");
    eq(classifyStatus("I would call Efficient Plumbing.", ["https://efficientplumbing.com/x"], "slab leak"), "absent", "a competitor citation is absent for us");
  });

  await test("visibility: metrics never mix test types and report inconclusive separately", () => {
    const m = computeVisibilityMetrics({ sinceDays: 3650 });
    eq(m.conclusive + m.inconclusive, m.total, "conclusive + inconclusive must equal total");
    const types = new Set(m.byPlatform.map((p) => p.testType));
    assert(types.size <= 1, "a metrics view must be for a single test type");
  });

  await test("visibility: query picking respects family filters and returns no duplicates", () => {
    seedQueries(); // the query table must exist before picking
    const picks = pickQueries(10, ["recommendation"]);
    assert(picks.length > 0, "expected recommendation queries");
    eq(new Set(picks.map((p) => p.id)).size, picks.length, "duplicate query ids returned");
    assert(picks.every((p) => p.family === "recommendation"), "family filter leaked");
  });

  // ── Publishing (autonomous, with policy enforcement) ────────────────────
  await test("publishing: a change to a locked fact is rejected", () => {
    const before = `<html><body><p>Call (949) 374-6524</p></body></html>`;
    const after = `<html><body><p>Call (949) 555-0000</p></body></html>`;
    const v = validateChange({ url: "https://straightflushplumbingoc.com/contact.html", repoPath: "contact.html", changeType: "meta-description-fix", summary: "t", newContent: after });
    assert(!v.ok, "a phone-number change must fail validation");
    assert(v.checks.some((c) => !c.ok && /locked/i.test(c.name)), "the failure must name the locked-fact check");
  });

  await test("publishing: an injected external script is rejected", () => {
    const before = `<html><body><h1>Title</h1><p>${"word ".repeat(60)}</p></body></html>`;
    const after = before.replace("</body>", `<script src="https://evil.example/x.js"></script></body>`);
    const v = validateChange({ url: "https://straightflushplumbingoc.com/about.html", repoPath: "about.html", changeType: "meta-description-fix", summary: "t", newContent: after });
    assert(!v.ok, "an injected external script must be rejected");
  });

  await test("publishing: safe-fix generator only proposes link repairs", () => {
    const fixes = generateSafeLinkFixes();
    assert(Array.isArray(fixes), "generator must return an array");
    for (const f of fixes) {
      assert(f.changeType === "broken-internal-link-fix" || f.changeType === "internal-link-improve", `unexpected change type ${f.changeType}`);
    }
    assert(Array.isArray(listPublications(10)), "publication history must be queryable");
  });

  await test("publishing: a snapshot restores the previous version on rollback", async () => {
    const fsx = await import("node:fs");
    const px = await import("node:path");
    const { insert: ins, queryOne: qo } = await import("../src/lib/db");
    const { SNAPSHOT_DIR } = await import("../src/lib/paths");
    const { rollback } = await import("../src/lib/engine/publishing");
    const { REPO_ROOT } = await import("../src/lib/paths");

    // Use a scratch file inside the repo root so rollback's path resolution is
    // exercised exactly as it is in production, then remove it.
    const repoPath = "geo-lab/.rollback-probe.html";
    const target = px.default.join(REPO_ROOT, repoPath);
    fsx.default.writeFileSync(target, "NEW CONTENT");
    const url = "https://straightflushplumbingoc.com/.rollback-probe.html";
    const pubId = ins("publications", { url, change_type: "meta-description-fix", summary: "probe", status: "published" });
    const snapDir = px.default.join(SNAPSHOT_DIR, "probe-" + Date.now());
    fsx.default.mkdirSync(snapDir, { recursive: true });
    fsx.default.writeFileSync(px.default.join(snapDir, ".rollback-probe.html"), "OLD CONTENT");
    fsx.default.writeFileSync(
      px.default.join(snapDir, "meta.json"),
      JSON.stringify({ url, repoPath, ts: new Date().toISOString(), changeType: "meta-description-fix" }),
    );

    const r = rollback(pubId, "test");
    assert(r.ok, `rollback should succeed: ${r.message}`);
    eq(fsx.default.readFileSync(target, "utf8"), "OLD CONTENT", "the previous version must be restored");
    eq(qo<{ status: string }>("SELECT status FROM publications WHERE id=?", pubId)?.status, "rolled_back", "publication must be marked rolled_back");

    fsx.default.rmSync(target, { force: true });
    fsx.default.rmSync(snapDir, { recursive: true, force: true });
  });

  // ── Experiments ─────────────────────────────────────────────────────────
  await test("experiments: canonical experiments seed with a hypothesis and methodology", () => {
    seedCanonicalExperiments();
    const exps = listExperiments();
    assert(exps.length >= 6, `expected the canonical experiment set, got ${exps.length}`);
    for (const e of exps) {
      assert(String(e.hypothesis).length > 10, `experiment ${e.id} has no hypothesis`);
      assert(String(e.methodology).length > 10, `experiment ${e.id} has no methodology`);
    }
  });

  // ── Reporting ───────────────────────────────────────────────────────────
  await test("reporting: daily report generates, persists and states its limits", () => {
    const r = generateReport("daily");
    assert(r.body.includes("Daily report"), "report body missing title");
    assert(/UNMEASURED|not measured|limitation|inconclusive|no provider/i.test(r.body), "report must disclose what is not measured");
    const id = saveReport("daily");
    assert(id > 0, "report was not persisted");
    const stored = listReports("daily").find((x) => Number(x.id) === id);
    assert(stored, "persisted report not found in the history");
    // Regenerating the same day must update in place, not create a duplicate.
    eq(saveReport("daily"), id, "same-day report must be idempotent");
  });

  await test("reporting: cost model reports only non-negative real usage", () => {
    const c = costEstimate();
    assert(c.total >= 0, "total must be non-negative");
    assert(c.rows.length > 0, "expected at least one cost row");
    for (const r of c.rows) assert(r.estUsd >= 0, `negative cost for ${r.provider}`);
  });

  // ── Optimization engine ─────────────────────────────────────────────────
  await test("optimization: opportunities are evidence-based and deduplicated", () => {
    const pages = crawlRepo();
    const audit = auditSite(pages);
    const scores = pages.filter((p) => p.indexable).map((p) => scorePage(p.doc, p.url));
    const metrics = computeVisibilityMetrics({ sinceDays: 3650 });
    deriveOpportunities(audit, scores, metrics);
    const again = deriveOpportunities(audit, scores, metrics);
    eq(again, 0, "re-deriving the same evidence must not create duplicates");
    const open = listOpportunities("open");
    for (const o of open) {
      assert(String(o.evidence).length > 0, `opportunity ${o.id} has no evidence`);
      assert(String(o.proposed).length > 0, `opportunity ${o.id} has no proposed solution`);
      assert(String(o.problem).length > 0, `opportunity ${o.id} has no problem statement`);
    }
  });

  // ── Integrations ────────────────────────────────────────────────────────
  await test("integrations: every integration reports a truthful, explained status", async () => {
    const { providerEnvFromProcess } = await import("../src/lib/agents/orchestrator");
    seedIntegrations(providerEnvFromProcess());
    const list = listIntegrations();
    assert(list.length > 0, "expected registered integrations");
    const valid = new Set(["connected", "disconnected", "needs_auth", "rate_limited", "error", "not_testable"]);
    for (const i of list) {
      assert(valid.has(String(i.status)), `unknown status "${i.status}" for ${i.label}`);
      assert(String(i.detail).length > 0, `integration ${i.label} must explain its status`);
    }
  });

  // ── Distribution safety ─────────────────────────────────────────────────
  // The lab's SQLite file holds the owner's scrypt password hash and live
  // session tokens, so it must never be committed. Two real traps: (1) the
  // file was named data/*.db but .gitignore only excluded *.db, and (2) this
  // repository is public, so a stray `git add -A` would publish the hash.
  await test("distribution: every declared npm script points at a file that exists", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    for (const [name, cmd] of Object.entries(pkg.scripts)) {
      // Only the tsx-driven scripts name a repo file we can resolve.
      const m = cmd.match(/(?:^|\s)((?:scripts|tests)\/[\w./-]+\.ts)\b/);
      if (!m) continue;
      const target = path.join(__dirname, "..", m[1]);
      assert(fs.existsSync(target), `npm run ${name} -> missing file ${m[1]}`);
    }
  });

  await test("distribution: the database file and its sidecars are gitignored", () => {
    const ignore = fs.readFileSync(path.join(__dirname, "..", ".gitignore"), "utf8");
    const patterns = ignore.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    const covered = (name: string) =>
      patterns.some((p) => {
        const rx = new RegExp("^" + p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
        return rx.test(name);
      });
    for (const f of ["data/geo-lab.db", "data/geo-lab.db-wal", "data/geo-lab.db-shm", "data/geo-lab.db-journal"]) {
      assert(covered(f), `.gitignore must exclude ${f} (it holds password hashes and session tokens)`);
    }
  });

  await test("distribution: the live database is not tracked by git", async () => {
    // This process redirects GEO_LAB_DB at a temp dir, so resolve the file the
    // lab would really use (unset env var) rather than the test's own DB.
    const { REPO_ROOT } = await import("../src/lib/paths");
    const rel = "geo-lab/data/geo-lab.db";
    let tracked = "";
    try {
      tracked = execFileSync("git", ["ls-files", "--error-unmatch", rel], {
        cwd: REPO_ROOT,
        stdio: ["ignore", "pipe", "ignore"],
      }).toString().trim();
    } catch {
      tracked = ""; // git exits non-zero when the path is untracked — that is the pass case
    }
    assert(!tracked, `${rel} is committed to git — it contains the owner password hash and session tokens`);
  });

  // ── Site discovery ──────────────────────────────────────────────────────
  // A deployed lab sits next to a checkout of the website, not inside it. If
  // the site directory is wrong the crawler would happily walk the lab's own
  // parent directory and score unrelated files, so crawlRepo must refuse
  // instead of reporting nonsense. Verified by running it in a child process
  // with GEO_LAB_SITE_DIR pointed at an empty directory.
  await test("site: refuses to crawl a site directory that has no index.html", () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), "geolab-nosite-"));
    const script =
      "import { crawlRepo } from './src/lib/engine/site';" +
      "try { crawlRepo(); console.log('NO_THROW'); }" +
      "catch (e) { console.log('THREW:' + String((e as Error).message)); }";
    const out = execFileSync("npx", ["--yes", "tsx", "-e", script], {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, GEO_LAB_SITE_DIR: empty, GEO_LAB_DB: path.join(empty, "t.db") },
      encoding: "utf8",
    });
    fs.rmSync(empty, { recursive: true, force: true });
    assert(out.includes("THREW"), `crawlRepo scored an empty site dir instead of refusing: ${out.trim()}`);
    assert(out.includes("GEO_LAB_SITE_DIR"), `the refusal must name the variable to fix: ${out.trim()}`);
  });

  // ── Report ──────────────────────────────────────────────────────────────
  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  console.log(`\nGEO Lab test suite — ${pass}/${results.length} passed\n`);
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `\n        ${r.detail}`}`);
  }
  console.log("");
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(`Suite crashed in "${current}":`, e);
  process.exit(1);
});
