import { DatabaseSync } from "node:sqlite";
import { DB_PATH, ensureDirs } from "./paths";

/**
 * Persistence layer. Uses Node's built-in SQLite (node:sqlite) — zero native
 * dependencies, a single portable file. The schema is defined once here and
 * applied idempotently on first connection, so `migrate` is always safe.
 *
 * The database is the source of truth for every metric the dashboard shows.
 * Nothing is hardcoded: each number is derived from a row written by a real
 * measurement run (see src/lib/engine/*).
 */

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ── Users / auth ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner','operator','viewer')),
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  user_agent TEXT
);

-- ── Audit log (every mutating action, incl. autonomous ones) ───────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ts         TEXT NOT NULL DEFAULT (datetime('now')),
  actor      TEXT NOT NULL,
  action     TEXT NOT NULL,
  target     TEXT,
  detail     TEXT
);

-- ── Website intelligence ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  url           TEXT NOT NULL UNIQUE,
  path          TEXT NOT NULL,
  title         TEXT,
  meta_desc     TEXT,
  canonical     TEXT,
  robots_meta   TEXT,
  indexable     INTEGER NOT NULL DEFAULT 1,
  http_status   INTEGER,
  word_count    INTEGER,
  jsonld_blocks INTEGER DEFAULT 0,
  schema_types  TEXT,
  h1_count      INTEGER DEFAULT 0,
  heading_skips INTEGER DEFAULT 0,
  in_sitemap    INTEGER DEFAULT 0,
  internal_links INTEGER DEFAULT 0,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_snapshots (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id    INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  ts         TEXT NOT NULL DEFAULT (datetime('now')),
  content_hash TEXT NOT NULL,
  html_path  TEXT,
  note       TEXT
);

-- ── GEO section scoring (five layers) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id      INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  ordinal      INTEGER NOT NULL,
  heading      TEXT,
  level        INTEGER,
  anchor       TEXT,
  text         TEXT,
  word_count   INTEGER,
  content_hash TEXT,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (page_id, ordinal)
);

CREATE TABLE IF NOT EXISTS geo_scores (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  ts                    TEXT NOT NULL DEFAULT (datetime('now')),
  page_id               INTEGER REFERENCES pages(id) ON DELETE CASCADE,
  section_id            INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  retrieval_probability REAL NOT NULL,
  extractability        REAL NOT NULL,
  entity_reinforcement  REAL NOT NULL,
  structural_authority  REAL NOT NULL,
  system_memory         REAL NOT NULL,
  overall               REAL NOT NULL,
  detail                TEXT,
  run_id                INTEGER
);

-- ── AI visibility (the query library + results) ────────────────────────────
CREATE TABLE IF NOT EXISTS queries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  text        TEXT NOT NULL,
  family      TEXT NOT NULL,
  city        TEXT,
  service     TEXT,
  intent      TEXT NOT NULL DEFAULT 'discovery',
  priority    INTEGER NOT NULL DEFAULT 3,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (text)
);

CREATE TABLE IF NOT EXISTS visibility_runs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            TEXT NOT NULL DEFAULT (datetime('now')),
  trigger       TEXT NOT NULL DEFAULT 'manual',
  provider      TEXT NOT NULL,
  test_type     TEXT NOT NULL,
  queries_total INTEGER NOT NULL DEFAULT 0,
  queries_ok    INTEGER NOT NULL DEFAULT 0,
  note          TEXT
);

CREATE TABLE IF NOT EXISTS visibility_results (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id          INTEGER REFERENCES visibility_runs(id) ON DELETE CASCADE,
  ts              TEXT NOT NULL DEFAULT (datetime('now')),
  query_id        INTEGER REFERENCES queries(id),
  query           TEXT NOT NULL,
  platform        TEXT NOT NULL,
  test_type       TEXT NOT NULL,
  status          TEXT NOT NULL,   -- recommended | mentioned | cited | absent | inconclusive | incorrect
  rank            INTEGER,
  answer          TEXT,
  cited_urls      TEXT,
  competitors     TEXT,
  city            TEXT,
  service         TEXT,
  confidence      TEXT,
  note            TEXT
);

-- ── Competitors ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitors (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  domain     TEXT NOT NULL UNIQUE,
  name       TEXT,
  tier       TEXT,
  home_city  TEXT,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS competitor_observations (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ts             TEXT NOT NULL DEFAULT (datetime('now')),
  competitor_id  INTEGER REFERENCES competitors(id) ON DELETE CASCADE,
  domain         TEXT NOT NULL,
  platform       TEXT NOT NULL,
  query          TEXT,
  appeared       INTEGER NOT NULL DEFAULT 0,
  rank           INTEGER,
  observed_feature TEXT,
  confidence     TEXT,
  source         TEXT
);

-- ── Entity consistency ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entity_checks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            TEXT NOT NULL DEFAULT (datetime('now')),
  host          TEXT NOT NULL,
  url           TEXT,
  verdict       TEXT,
  http_status   INTEGER,
  canonical     TEXT,
  robots        TEXT,
  title         TEXT,
  is_owned      INTEGER DEFAULT 0,
  discrepancy   TEXT
);

CREATE TABLE IF NOT EXISTS entity_facts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT NOT NULL DEFAULT (datetime('now')),
  source      TEXT NOT NULL,
  field       TEXT NOT NULL,
  value       TEXT,
  expected    TEXT,
  matches     INTEGER,
  note        TEXT
);

-- ── Experiments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,
  hypothesis    TEXT NOT NULL,
  target_url    TEXT,
  target_section TEXT,
  baseline      TEXT,
  variables     TEXT,
  methodology   TEXT,
  start_date    TEXT,
  followup_dates TEXT,
  result        TEXT,
  limitations   TEXT,
  conclusion    TEXT,
  evidence      TEXT,
  status        TEXT NOT NULL DEFAULT 'planned',
  confidence    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS experiment_measurements (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  ts            TEXT NOT NULL DEFAULT (datetime('now')),
  metric        TEXT NOT NULL,
  value         REAL,
  note          TEXT
);

-- ── Optimization opportunities ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunities (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            TEXT NOT NULL DEFAULT (datetime('now')),
  title         TEXT NOT NULL,
  problem       TEXT NOT NULL,
  evidence      TEXT,
  url           TEXT,
  section       TEXT,
  geo_layer     TEXT,
  expected_benefit TEXT,
  difficulty    TEXT,
  impact        INTEGER,
  effort        INTEGER,
  priority      REAL,
  proposed      TEXT,
  status        TEXT NOT NULL DEFAULT 'open',   -- open | in_progress | done | dismissed
  implemented_at TEXT,
  result        TEXT,
  dedupe_key    TEXT UNIQUE
);

-- ── Agent activity + runs ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  agent       TEXT NOT NULL,
  orchestrator TEXT,
  trigger     TEXT NOT NULL DEFAULT 'manual',
  status      TEXT NOT NULL DEFAULT 'running',  -- running | ok | failed | partial
  summary     TEXT,
  detail      TEXT,
  error       TEXT,
  duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS activity (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       TEXT NOT NULL DEFAULT (datetime('now')),
  agent    TEXT NOT NULL,
  level    TEXT NOT NULL DEFAULT 'info',   -- info | success | warning | error
  message  TEXT NOT NULL,
  evidence TEXT,
  run_id   INTEGER REFERENCES agent_runs(id) ON DELETE SET NULL
);

-- ── Publishing history + rollback ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           TEXT NOT NULL DEFAULT (datetime('now')),
  url          TEXT NOT NULL,
  change_type  TEXT NOT NULL,
  summary      TEXT NOT NULL,
  branch       TEXT,
  commit_sha   TEXT,
  pr_number    INTEGER,
  pr_url       TEXT,
  diff_stat    TEXT,
  before_hash  TEXT,
  after_hash   TEXT,
  validations  TEXT,
  status       TEXT NOT NULL DEFAULT 'pending', -- pending | published | verified | failed | rolled_back
  verified_at  TEXT,
  rollback_of  INTEGER REFERENCES publications(id),
  result       TEXT
);

-- ── Integrations ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  provider      TEXT NOT NULL UNIQUE,
  label         TEXT NOT NULL,
  category      TEXT NOT NULL,
  status        TEXT NOT NULL,   -- connected | disconnected | needs_auth | error | rate_limited | not_testable
  last_sync     TEXT,
  last_error    TEXT,
  detail        TEXT,
  required_env  TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Reports ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ts         TEXT NOT NULL DEFAULT (datetime('now')),
  period     TEXT NOT NULL,     -- daily | weekly | monthly
  report_date TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  source_run INTEGER REFERENCES agent_runs(id) ON DELETE SET NULL,
  UNIQUE (period, report_date)
);

-- ── Notifications (spec §16) ───────────────────────────────────────────────
-- One row per attempted delivery. A channel with no provider configured is
-- recorded as skipped, never as sent, so the log can never imply an email
-- went out when none did.
CREATE TABLE IF NOT EXISTS notifications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT NOT NULL DEFAULT (datetime('now')),
  kind        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  channel     TEXT NOT NULL,
  status      TEXT NOT NULL,
  detail      TEXT
);

-- ── External API access (HQ integration) ───────────────────────────────────
-- Scoped, read-only API keys for server-to-server consumers. The secret is
-- never stored: only a SHA-256 hash plus a short prefix used for lookup, so a
-- database leak does not yield usable credentials.
CREATE TABLE IF NOT EXISTS api_keys (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            TEXT NOT NULL DEFAULT (datetime('now')),
  name          TEXT NOT NULL,
  prefix        TEXT NOT NULL UNIQUE,
  key_hash      TEXT NOT NULL,
  scopes        TEXT NOT NULL,
  last_used_at  TEXT,
  last_used_ip  TEXT,
  request_count INTEGER NOT NULL DEFAULT 0,
  revoked_at    TEXT,
  expires_at    TEXT
);

-- Every external API call, for audit and for rate limiting. Rate limiting reads
-- this table rather than keeping in-process counters, so the limit survives a
-- restart and holds across processes.
CREATE TABLE IF NOT EXISTS api_requests (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      TEXT NOT NULL DEFAULT (datetime('now')),
  key_id  INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
  method  TEXT NOT NULL,
  path    TEXT NOT NULL,
  status  INTEGER NOT NULL,
  ms      INTEGER,
  ip      TEXT,
  note    TEXT
);

-- Approved job submissions from Headquarters (spec Phase 6). A job that needs
-- approval lands in 'pending_approval' and is never executed until an owner
-- approves it; the endpoint cannot be used to change production directly.
CREATE TABLE IF NOT EXISTS api_jobs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT NOT NULL DEFAULT (datetime('now')),
  job_id      TEXT NOT NULL UNIQUE,
  kind        TEXT NOT NULL,
  params      TEXT,
  status      TEXT NOT NULL,
  requested_by TEXT,
  approved_by TEXT,
  approved_at TEXT,
  result      TEXT,
  error       TEXT,
  finished_at TEXT
);

-- ── Costs ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cost_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT NOT NULL DEFAULT (datetime('now')),
  provider    TEXT NOT NULL,
  category    TEXT NOT NULL,
  units       REAL NOT NULL DEFAULT 0,
  unit_label  TEXT,
  est_usd     REAL NOT NULL DEFAULT 0,
  note        TEXT
);

-- ── Tasks (orchestrator queue) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT NOT NULL DEFAULT (datetime('now')),
  title       TEXT NOT NULL,
  agent       TEXT NOT NULL,
  priority    REAL NOT NULL DEFAULT 3,
  status      TEXT NOT NULL DEFAULT 'queued',  -- queued | running | done | failed | blocked
  payload     TEXT,
  result      TEXT,
  run_id      INTEGER REFERENCES agent_runs(id) ON DELETE SET NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Research library ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_notes (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       TEXT NOT NULL DEFAULT (datetime('now')),
  topic    TEXT NOT NULL,
  title    TEXT NOT NULL,
  body     TEXT NOT NULL,
  source   TEXT,
  tags     TEXT
);

-- ── Citation-gap actions (ingested from growth-engine) ─────────────────────
CREATE TABLE IF NOT EXISTS citation_actions (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,
  domain                    TEXT NOT NULL UNIQUE,
  times_cited_when_we_lost  INTEGER NOT NULL DEFAULT 0,
  action                    TEXT,
  status                    TEXT NOT NULL DEFAULT 'todo',
  engines                   TEXT,
  example_urls              TEXT,
  updated_at                TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Technical health history ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS technical_health_history (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  ts     TEXT NOT NULL DEFAULT (datetime('now')),
  checks TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vis_query   ON visibility_results(query);
CREATE INDEX IF NOT EXISTS idx_vis_ts      ON visibility_results(ts);
CREATE INDEX IF NOT EXISTS idx_vis_plat    ON visibility_results(platform, status);
CREATE INDEX IF NOT EXISTS idx_activity_ts ON activity(ts);
CREATE INDEX IF NOT EXISTS idx_geo_page    ON geo_scores(page_id, ts);
CREATE INDEX IF NOT EXISTS idx_opp_status  ON opportunities(status, priority);
`;

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;
  ensureDirs();
  _db = new DatabaseSync(DB_PATH);
  _db.exec(SCHEMA);
  const meta = _db.prepare("SELECT value FROM schema_meta WHERE key='version'").get() as
    | { value: string }
    | undefined;
  if (!meta) {
    _db.prepare("INSERT INTO schema_meta(key,value) VALUES('version',?)").run("1");
  }
  return _db;
}

export function query<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
  return getDb().prepare(sql).all(...(params as never[])) as T[];
}

export function queryOne<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
  return getDb().prepare(sql).get(...(params as never[])) as T | undefined;
}

export function run(sql: string, ...params: unknown[]): { changes: number; lastInsertRowid: number } {
  const r = getDb().prepare(sql).run(...(params as never[]));
  return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
}

export function insert(table: string, row: Record<string, unknown>): number {
  const keys = Object.keys(row);
  const cols = keys.map((k) => `"${k}"`).join(",");
  const placeholders = keys.map(() => "?").join(",");
  const values = keys.map((k) => row[k]);
  const r = run(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`, ...values);
  return r.lastInsertRowid;
}

export function upsert(table: string, row: Record<string, unknown>, conflictCols: string[]): number {
  const keys = Object.keys(row);
  const cols = keys.map((k) => `"${k}"`).join(",");
  const placeholders = keys.map(() => "?").join(",");
  const updates = keys
    .filter((k) => !conflictCols.includes(k))
    .map((k) => `"${k}"=excluded."${k}"`)
    .join(",");
  const conflict = conflictCols.map((c) => `"${c}"`).join(",");
  const values = keys.map((k) => row[k]);
  const sql = `INSERT INTO ${table} (${cols}) VALUES (${placeholders})
               ON CONFLICT(${conflict}) DO UPDATE SET ${updates}`;
  run(sql, ...values);
  const existing = queryOne<{ id: number }>(
    `SELECT id FROM ${table} WHERE ${conflictCols.map((c) => `"${c}"=?`).join(" AND ")}`,
    ...conflictCols.map((c) => row[c]),
  );
  return existing?.id ?? 0;
}

/** Structured activity log — every agent action is recorded with evidence. */
export function logActivity(
  agent: string,
  message: string,
  opts: { level?: "info" | "success" | "warning" | "error"; evidence?: string; runId?: number } = {},
): void {
  // `run_id` references agent_runs. Callers that hold a different run id (a
  // visibility run, for example) must pass it as evidence instead; guard here
  // so a stray foreign key can never break an agent's real work.
  let runId: number | null = opts.runId ?? null;
  if (runId !== null) {
    const exists = queryOne<{ id: number }>("SELECT id FROM agent_runs WHERE id=?", runId);
    if (!exists) runId = null;
  }
  insert("activity", {
    agent,
    level: opts.level ?? "info",
    message,
    evidence: opts.evidence ?? null,
    run_id: runId,
  });
}

export function audit(actor: string, action: string, target?: string, detail?: string): void {
  insert("audit_log", { actor, action, target: target ?? null, detail: detail ?? null });
}
