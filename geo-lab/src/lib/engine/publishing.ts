import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { insert, query, queryOne, run as sqlRun, logActivity, audit } from "../db";
import { REPO_ROOT, SNAPSHOT_DIR, ensureDirs } from "../paths";
import { sha256, shortHash } from "../util";
import { detectLockedFactChange } from "../company";
import { parseDocument, headingSkips, schemaTypes } from "./html";
import { crawlRepo, auditSite, fetchLive } from "./site";

/**
 * Autonomous publishing engine (spec §11).
 *
 * The owner authorises autonomous publishing of *routine* SEO/GEO
 * improvements. This engine enforces the boundaries mechanically:
 *
 *  1. A change is only accepted if it is a routine type (see ROUTINE_TYPES).
 *  2. Locked facts (identity, NAP, pricing, warranties, licensing) can never
 *     be removed or altered — `detectLockedFactChange` blocks it.
 *  3. Forbidden claims (superlatives, invented stats) are rejected.
 *  4. The previous version is snapshotted before any write.
 *  5. Validation runs: HTML parses, headings valid, internal links resolve,
 *     schema still present, sitemap invariant holds.
 *  6. The change is committed to a NEW BRANCH and opened as a PR — never
 *     pushed to main, never merged (owner review is the merge gate).
 *  7. After the PR the live URL is re-checked; a failed verification is
 *     recorded so the change can be rolled back.
 */

export type RoutineChangeType =
  | "broken-internal-link-fix"
  | "meta-description-fix"
  | "heading-fix"
  | "schema-add"
  | "faq-add"
  | "internal-link-improve"
  | "alt-text-fix"
  | "content-section-improve"
  | "sitemap-refresh";

/** Change types autonomous publishing may perform without owner approval. */
export const ROUTINE_TYPES: RoutineChangeType[] = [
  "broken-internal-link-fix",
  "meta-description-fix",
  "heading-fix",
  "schema-add",
  "faq-add",
  "internal-link-improve",
  "alt-text-fix",
  "content-section-improve",
  "sitemap-refresh",
];

/** Change types that ALWAYS require explicit owner authorisation (Level 3). */
export const OWNER_ONLY_TYPES = [
  "identity",
  "nap",
  "pricing",
  "warranty",
  "licensing",
  "certification",
  "review",
  "testimonial",
  "legal",
  "new-service",
];

export interface ProposedChange {
  url: string;
  repoPath: string;
  changeType: RoutineChangeType;
  summary: string;
  newContent: string;
  /** Evidence pointer for the activity log. */
  evidence?: string;
  opportunityId?: number;
}

export interface ValidationResult {
  ok: boolean;
  checks: { name: string; ok: boolean; detail: string }[];
}

export function validateChange(change: ProposedChange): ValidationResult {
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  const file = path.join(REPO_ROOT, change.repoPath);

  const push = (name: string, ok: boolean, detail: string) => checks.push({ name, ok, detail });

  push("change-type-allowed", ROUTINE_TYPES.includes(change.changeType), `type=${change.changeType}`);

  if (!fs.existsSync(file)) {
    push("file-exists", false, `${change.repoPath} not found`);
    return { ok: false, checks };
  }
  const before = fs.readFileSync(file, "utf8");
  const after = change.newContent;

  // Locked facts must survive untouched.
  const locked = detectLockedFactChange(before, after);
  push("locked-facts-intact", locked.length === 0, locked.length ? locked.join("; ") : "no locked fact changed");

  // Forbidden claims.
  const forbidden = /\b(#1|number one|award[- ]winning|best plumber in the world|guaranteed (rankings|leads|results))\b/i.test(after);
  push("no-forbidden-claims", !forbidden, forbidden ? "introduces a forbidden claim" : "clean");

  // Must still parse and keep structure.
  const doc = parseDocument(after, change.url);
  push("html-parses", doc.headings.length > 0 || doc.wordCount > 0, `${doc.sections.length} section(s)`);
  push("heading-hierarchy", headingSkips(doc.headings) === 0, `${headingSkips(doc.headings)} skip(s)`);
  const beforeTypes = schemaTypes(parseDocument(before).jsonld);
  const afterTypes = schemaTypes(doc.jsonld);
  const lostSchema = beforeTypes.filter((t) => !afterTypes.includes(t));
  push("schema-preserved", lostSchema.length === 0, lostSchema.length ? `lost: ${lostSchema.join(",")}` : `types: ${afterTypes.join(",") || "none"}`);

  // Canonical must be preserved if present.
  const bCanon = parseDocument(before).canonical;
  push("canonical-preserved", !bCanon || doc.canonical === bCanon, `canonical=${doc.canonical ?? "none"}`);

  // Internal links must resolve (best-effort, local paths only).
  const known = new Set(crawlRepo().map((p) => p.path));
  const broken = doc.links
    .map((l) => l.href)
    .filter((h) => h && !/^(https?:|mailto:|tel:|#)/.test(h))
    .filter((h) => {
      const rel = h.replace(/^\//, "").replace(/#.*$/, "");
      if (!rel) return false;
      return !known.has(rel) && !fs.existsSync(path.join(REPO_ROOT, rel));
    });
  push("internal-links-resolve", broken.length === 0, broken.length ? `broken: ${broken.slice(0, 5).join(", ")}` : "all resolve");

  return { ok: checks.every((c) => c.ok), checks };
}

function git(args: string[], cwd = REPO_ROOT): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function ghApi(method: string, endpoint: string, body?: unknown): unknown {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set — cannot open a PR.");
  const args = ["api", "-X", method, endpoint, "-H", "Accept: application/vnd.github+json"];
  if (body) args.push("--input", "-");
  const out = execFileSync("gh", args, {
    encoding: "utf8",
    input: body ? JSON.stringify(body) : undefined,
    env: { ...process.env, GH_TOKEN: token },
  });
  return out ? JSON.parse(out) : null;
}

export interface PublishResult {
  ok: boolean;
  publicationId: number;
  branch?: string;
  commitSha?: string;
  prNumber?: number;
  prUrl?: string;
  validation: ValidationResult;
  message: string;
}

/**
 * Publish a validated change: snapshot, branch, commit, push, PR.
 * Never touches main and never merges.
 */
export function publishChange(change: ProposedChange, actor = "publishing-agent"): PublishResult {
  ensureDirs();
  const validation = validateChange(change);
  const file = path.join(REPO_ROOT, change.repoPath);
  const before = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

  const publicationId = insert("publications", {
    url: change.url,
    change_type: change.changeType,
    summary: change.summary,
    before_hash: sha256(before),
    after_hash: sha256(change.newContent),
    validations: JSON.stringify(validation.checks),
    status: "pending",
  });

  if (!validation.ok) {
    sqlRun("UPDATE publications SET status='failed' WHERE id=?", publicationId);
    logActivity("Publishing Agent", `Rejected change to ${change.repoPath}: validation failed.`, {
      level: "error",
      evidence: validation.checks.filter((c) => !c.ok).map((c) => c.name).join(","),
    });
    return { ok: false, publicationId, validation, message: "Validation failed — change not published." };
  }

  // Snapshot the previous version (restorable).
  const snapDir = path.join(SNAPSHOT_DIR, shortHash(change.repoPath + Date.now()));
  fs.mkdirSync(snapDir, { recursive: true });
  fs.writeFileSync(path.join(snapDir, path.basename(change.repoPath)), before);
  fs.writeFileSync(
    path.join(snapDir, "meta.json"),
    JSON.stringify({ url: change.url, repoPath: change.repoPath, ts: new Date().toISOString(), changeType: change.changeType }, null, 2),
  );

  const branch = `intelligence-hq/site-${new Date().toISOString().slice(0, 10)}-${change.changeType}-${shortHash(change.repoPath).slice(0, 6)}`;

  try {
    // Start from an up-to-date main.
    git(["fetch", "origin", "main"]);
    const baseSha = git(["rev-parse", "origin/main"]);
    // Create the branch from origin/main without disturbing the working tree.
    try {
      git(["branch", "-D", branch]);
    } catch {
      /* branch may not exist */
    }
    git(["checkout", "-b", branch, baseSha]);

    fs.writeFileSync(file, change.newContent);
    git(["add", change.repoPath]);
    const commitMsg = `${change.summary}\n\nAutonomous routine GEO/SEO improvement (${change.changeType}).\nEvidence: ${change.evidence ?? "geo-lab optimization engine"}\nCo-authored-by: openhands <openhands@all-hands.dev>`;
    git(["commit", "-m", commitMsg]);
    const commitSha = git(["rev-parse", "HEAD"]);
    git(["push", "-u", "origin", branch]);
    // Return the working tree to main so the checkout stays clean.
    git(["checkout", "main"]);

    const repo = repoSlug();
    const pr = ghApi("POST", `/repos/${repo}/pulls`, {
      title: change.summary,
      head: branch,
      base: "main",
      body: buildPrBody(change, validation),
      maintainer_can_modify: true,
    }) as { number: number; html_url: string } | null;

    sqlRun(
      "UPDATE publications SET status='published', branch=?, commit_sha=?, pr_number=?, pr_url=?, diff_stat=? WHERE id=?",
      branch,
      commitSha,
      pr?.number ?? null,
      pr?.html_url ?? null,
      `+${change.newContent.length - before.length} chars`,
      publicationId,
    );
    audit(actor, "publish", change.repoPath, `${branch} @ ${commitSha.slice(0, 8)}`);
    logActivity("Publishing Agent", `Published routine change to ${change.repoPath} (${change.changeType}) on ${branch}.`, {
      level: "success",
      evidence: pr?.html_url ?? commitSha,
    });

    return {
      ok: true,
      publicationId,
      branch,
      commitSha,
      prNumber: pr?.number,
      prUrl: pr?.html_url,
      validation,
      message: `Published on branch ${branch}; PR ${pr?.number ?? "(pending)"}.`,
    };
  } catch (e) {
    try {
      git(["checkout", "main"]);
    } catch {
      /* ignore */
    }
    const msg = (e as Error).message;
    sqlRun("UPDATE publications SET status='failed' WHERE id=?", publicationId);
    logActivity("Publishing Agent", `Publish failed for ${change.repoPath}: ${msg}`, { level: "error", evidence: branch });
    return { ok: false, publicationId, branch, validation, message: msg };
  }
}

function repoSlug(): string {
  try {
    const url = git(["remote", "get-url", "origin"]);
    const m = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
    return m ? m[1] : "straightflushplumbing03/-Up2datewebsiteseo";
  } catch {
    return "straightflushplumbing03/-Up2datewebsiteseo";
  }
}

function buildPrBody(change: ProposedChange, validation: ValidationResult): string {
  return `## ${change.summary}

**Change type:** \`${change.changeType}\` (routine, autonomous)
**Target:** ${change.url}
**Evidence:** ${change.evidence ?? "geo-lab optimization engine"}

### Validations (all must pass)
${validation.checks.map((c) => `- ${c.ok ? "✅" : "❌"} **${c.name}** — ${c.detail}`).join("\n")}

### Boundaries
- No locked identity/NAP/pricing/warranty/licensing fact was changed.
- No unsupported superlative or invented claim was introduced.
- Change is on a branch; **main is untouched and this PR is not merged by the agent.**

*This PR was opened by the GEO Intelligence Lab (OpenHands agent) on behalf of the owner.*`;
}

/** Verify the live URL after a PR is merged/deployed. */
export async function verifyLive(url: string): Promise<{ ok: boolean; status: number | null; note: string }> {
  const res = await fetchLive(url);
  if (!res) return { ok: false, status: null, note: "Live URL did not respond." };
  const ok = res.status === 200;
  return { ok, status: res.status, note: ok ? "Live URL returns 200." : `Live URL returned HTTP ${res.status}.` };
}

/** Roll back a publication by reverting its file to the snapshot. */
export function rollback(publicationId: number, actor = "publishing-agent"): { ok: boolean; message: string } {
  const pub = queryOne<{ id: number; url: string; branch: string | null; status: string }>(
    "SELECT id, url, branch, status FROM publications WHERE id=?",
    publicationId,
  );
  if (!pub) return { ok: false, message: "Publication not found." };

  // Restore from the most recent snapshot for this URL.
  const snaps = fs.existsSync(SNAPSHOT_DIR) ? fs.readdirSync(SNAPSHOT_DIR).sort().reverse() : [];
  let restored: string | null = null;
  for (const s of snaps) {
    const metaFile = path.join(SNAPSHOT_DIR, s, "meta.json");
    if (!fs.existsSync(metaFile)) continue;
    const meta = JSON.parse(fs.readFileSync(metaFile, "utf8")) as { url: string; repoPath: string };
    if (meta.url !== pub.url) continue;
    const snapFile = path.join(SNAPSHOT_DIR, s, path.basename(meta.repoPath));
    if (!fs.existsSync(snapFile)) continue;
    fs.writeFileSync(path.join(REPO_ROOT, meta.repoPath), fs.readFileSync(snapFile, "utf8"));
    restored = meta.repoPath;
    break;
  }
  if (!restored) return { ok: false, message: "No snapshot available to restore." };

  sqlRun("UPDATE publications SET status='rolled_back' WHERE id=?", publicationId);
  audit(actor, "rollback", restored, `publication #${publicationId}`);
  logActivity("Publishing Agent", `Rolled back publication #${publicationId} (${restored}).`, {
    level: "warning",
    evidence: `publications#${publicationId}`,
  });
  return { ok: true, message: `Restored ${restored} from snapshot.` };
}

export function listPublications(limit = 50) {
  return query<Record<string, unknown>>("SELECT * FROM publications ORDER BY id DESC LIMIT ?", limit);
}

/**
 * Deterministic, policy-safe autonomous improvements. These are the changes
 * the engine may make without an LLM: fixing broken internal links. Each is
 * derived from the live site audit, not from guesswork.
 */
export function generateSafeLinkFixes(): ProposedChange[] {
  const pages = crawlRepo();
  const audit = auditSite(pages);
  const changes: ProposedChange[] = [];
  const byFile = new Map<string, { href: string }[]>();
  for (const b of audit.brokenInternalLinks) {
    const arr = byFile.get(b.from) ?? [];
    arr.push({ href: b.href });
    byFile.set(b.from, arr);
  }
  const known = new Set(pages.map((p) => p.path));
  for (const [from, links] of byFile) {
    const file = path.join(REPO_ROOT, from);
    let html = fs.readFileSync(file, "utf8");
    let changed = false;
    for (const l of links) {
      // Repoint to the sibling index page if one exists, else drop the anchor.
      const target = l.href.replace(/^\//, "").replace(/\/$/, "");
      const candidates = [`${target}.html`, path.join(target, "index.html"), target];
      const hit = candidates.find((c) => known.has(c));
      if (hit) {
        html = html.replace(new RegExp(`href=["']${escapeRe(l.href)}["']`, "g"), `href="${hit}"`);
      } else {
        html = html.replace(new RegExp(`<a\\b[^>]*href=["']${escapeRe(l.href)}["'][^>]*>([\\s\\S]*?)</a>`, "g"), "$1");
      }
      changed = true;
    }
    if (changed) {
      changes.push({
        url: pages.find((p) => p.path === from)?.url ?? from,
        repoPath: from,
        changeType: "broken-internal-link-fix",
        summary: `Fix ${links.length} broken internal link(s) on ${from}`,
        newContent: html,
        evidence: `site audit broken-link report for ${from}`,
      });
    }
  }
  return changes;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Run the publishing agent: publish queued safe fixes (bounded). */
export async function runPublishingAgent(maxChanges = 3): Promise<{ published: number; results: PublishResult[] }> {
  const changes = generateSafeLinkFixes().slice(0, maxChanges);
  const results: PublishResult[] = [];
  for (const c of changes) {
    results.push(publishChange(c));
  }
  if (!changes.length) {
    logActivity("Publishing Agent", "No routine improvement passed the autonomous-publishing gates this run.", { level: "info" });
  }
  return { published: results.filter((r) => r.ok).length, results };
}
