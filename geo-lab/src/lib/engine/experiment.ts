import { insert, query, queryOne, run as sqlRun } from "../db";
import { round1 } from "../util";

/**
 * GEO Experiment Lab (spec §8).
 *
 * A controlled experiment: hypothesis, target, baseline, fixed query wording,
 * test window, result, limitations, conclusion. Nothing here claims causation —
 * every experiment carries an explicit limitations field, and the evaluator
 * only reports *observed deltas* between comparable windows.
 */

export interface ExperimentInput {
  code: string;
  hypothesis: string;
  targetUrl?: string;
  targetSection?: string;
  baseline?: string;
  variables?: string;
  methodology?: string;
  startDate?: string;
  followupDates?: string[];
  evidence?: string;
}

export function createExperiment(x: ExperimentInput): number {
  const existing = queryOne<{ id: number }>("SELECT id FROM experiments WHERE code=?", x.code);
  if (existing) return existing.id;
  return insert("experiments", {
    code: x.code,
    hypothesis: x.hypothesis,
    target_url: x.targetUrl ?? null,
    target_section: x.targetSection ?? null,
    baseline: x.baseline ?? null,
    variables: x.variables ?? null,
    methodology: x.methodology ?? null,
    start_date: x.startDate ?? new Date().toISOString().slice(0, 10),
    followup_dates: JSON.stringify(x.followupDates ?? []),
    evidence: x.evidence ?? null,
    status: "planned",
  });
}

export function listExperiments() {
  return query<Record<string, unknown>>("SELECT * FROM experiments ORDER BY id DESC");
}

export function getExperiment(code: string) {
  return queryOne<Record<string, unknown>>("SELECT * FROM experiments WHERE code=?", code);
}

export function recordMeasurement(experimentId: number, metric: string, value: number, note?: string): void {
  insert("experiment_measurements", { experiment_id: experimentId, metric, value, note: note ?? null });
}

export function setResult(code: string, result: string, conclusion: string, limitations: string, confidence: string): void {
  sqlRun(
    "UPDATE experiments SET result=?, conclusion=?, limitations=?, confidence=?, status='complete' WHERE code=?",
    result,
    conclusion,
    limitations,
    confidence,
    code,
  );
}

/**
 * Evaluate an experiment from stored visibility rows: compare the mean
 * mention rate in a window before `startDate` with the window after it.
 * Returns an honest delta with the sample sizes; it does not assert causation.
 */
export function evaluateVisibilityExperiment(code: string, windowDays = 14) {
  const exp = getExperiment(code);
  if (!exp) return null;
  const start = String(exp.start_date ?? new Date().toISOString().slice(0, 10));
  const startMs = new Date(start + "T00:00:00Z").getTime();
  const beforeFrom = new Date(startMs - windowDays * 86400_000).toISOString();
  const beforeTo = new Date(startMs).toISOString();
  const afterFrom = beforeTo;
  const afterTo = new Date(startMs + windowDays * 86400_000).toISOString();

  const rate = (from: string, to: string) => {
    const rows = query<{ status: string }>(
      "SELECT status FROM visibility_results WHERE ts >= ? AND ts < ? AND test_type='conventional_proxy'",
      from,
      to,
    );
    const conclusive = rows.filter((r) => r.status !== "inconclusive");
    const mention = conclusive.filter((r) => r.status !== "absent");
    return {
      tests: rows.length,
      conclusive: conclusive.length,
      mention: mention.length,
      mentionRate: conclusive.length ? round1((mention.length / conclusive.length) * 100) : 0,
    };
  };

  const before = rate(beforeFrom, beforeTo);
  const after = rate(afterFrom, afterTo);
  const sufficient = before.conclusive >= 5 && after.conclusive >= 5;

  return {
    code,
    hypothesis: exp.hypothesis,
    windowDays,
    before,
    after,
    delta: round1(after.mentionRate - before.mentionRate),
    sufficientSample: sufficient,
    limitations: sufficient
      ? "Observational comparison; AI answers vary run to run and other changes may be concurrent. Not proof of causation."
      : "Sample too small for a reliable comparison — treat the delta as indicative only.",
  };
}

/** Seed the six experiments named in the master spec (§8 A–F). */
export function seedCanonicalExperiments(): number {
  const seeds: ExperimentInput[] = [
    {
      code: "exp-a-direct-answers",
      hypothesis: "Concise question-and-answer sections improve AI citation frequency.",
      targetUrl: "/services/slab-leak-detection.html",
      targetSection: "FAQ",
      baseline: "Baseline mention rate from the 14 days before the change.",
      variables: "Presence of a direct 1–2 sentence answer under each question heading.",
      methodology: "Add direct answers to a fixed set of FAQ questions; compare mention rate on the same query wording before/after.",
      evidence: "spec §8 A",
    },
    {
      code: "exp-b-geo-entity",
      hypothesis: "Stronger geographic entity reinforcement improves local recommendations.",
      targetUrl: "/cities/laguna-niguel.html",
      variables: "Explicit city naming in the opening sentence and areaServed schema.",
      methodology: "Strengthen city entity signals on one page; compare city-level mention rate before/after.",
      evidence: "spec §8 B",
    },
    {
      code: "exp-c-case-studies",
      hypothesis: "Original plumbing project case studies improve business recognition.",
      targetUrl: "/case-studies/",
      variables: "Presence of first-party project documentation.",
      methodology: "Publish real, owner-verified case studies; track brand-query mention rate.",
      evidence: "spec §8 C",
    },
    {
      code: "exp-d-headings",
      hypothesis: "Improved heading hierarchy improves content extraction.",
      targetUrl: "/academy/acoustic-leak-detection-explained.html",
      variables: "Heading level correctness and descriptive headings.",
      methodology: "Fix heading skips; re-score extractability and track citation.",
      evidence: "spec §8 D",
    },
    {
      code: "exp-e-schema",
      hypothesis: "Relevant structured data improves machine interpretation.",
      targetUrl: "/services/leak-detection.html",
      variables: "Presence/accuracy of Service + FAQPage JSON-LD.",
      methodology: "Add accurate schema; verify with a validator and track entity accuracy.",
      evidence: "spec §8 E",
    },
    {
      code: "exp-f-internal-links",
      hypothesis: "Improved internal links strengthen service and location associations.",
      targetUrl: "/service-areas.html",
      variables: "Density and relevance of internal links to service and city pages.",
      methodology: "Improve internal linking; measure crawl depth and association coverage.",
      evidence: "spec §8 F",
    },
  ];
  let n = 0;
  for (const s of seeds) {
    const before = queryOne<{ id: number }>("SELECT id FROM experiments WHERE code=?", s.code);
    createExperiment(s);
    if (!before) n++;
  }
  return n;
}
