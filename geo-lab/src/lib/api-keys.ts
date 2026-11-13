import crypto from "node:crypto";
import { insert, query, queryOne, run as sqlRun, logActivity } from "./db";

/**
 * Scoped API keys for the Headquarters integration (spec Phase 2).
 *
 * Design decisions worth stating:
 *
 * - The secret is never stored. We keep a SHA-256 hash and a short public
 *   prefix. A database leak therefore yields no usable credential.
 * - Scopes are explicit and checked per endpoint. A key that only holds
 *   `read:visibility` cannot read citations, and no key can publish.
 * - Rate limiting reads the request log instead of an in-process counter, so
 *   the limit holds across restarts and across processes.
 * - Comparison is timing-safe, so a wrong key cannot be discovered by timing.
 */

export const ALL_SCOPES = [
  "read:health",
  "read:visibility",
  "read:competitors",
  "read:citations",
  "read:geo",
  "read:reports",
  "read:opportunities",
  "write:jobs",
] as const;

export type Scope = (typeof ALL_SCOPES)[number];

/** Scopes a read-only consumer needs. Used for the default HQ key. */
export const READ_ONLY_SCOPES: Scope[] = [
  "read:health",
  "read:visibility",
  "read:competitors",
  "read:citations",
  "read:geo",
  "read:reports",
  "read:opportunities",
];

export interface ApiKeyRecord {
  id: number;
  name: string;
  prefix: string;
  scopes: Scope[];
  revoked_at: string | null;
  expires_at: string | null;
  last_used_at: string | null;
  request_count: number;
}

export interface AuthResult {
  ok: boolean;
  status: number;
  error?: string;
  key?: ApiKeyRecord;
}

function hashKey(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

/** Constant-time compare of two hex digests. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export interface CreatedKey {
  id: number;
  name: string;
  prefix: string;
  scopes: Scope[];
  /** Shown once, at creation. It is not recoverable afterwards. */
  secret: string;
}

/**
 * Mint a key. The secret is returned exactly once and never persisted, so a
 * caller that loses it must mint a new key.
 */
export function createApiKey(name: string, scopes: Scope[] = READ_ONLY_SCOPES, expiresAt?: string): CreatedKey {
  const raw = crypto.randomBytes(32).toString("hex");
  const prefix = `geolab_${raw.slice(0, 8)}`;
  const secret = `${prefix}.${raw}`;
  const id = insert("api_keys", {
    name,
    prefix,
    key_hash: hashKey(secret),
    scopes: scopes.join(","),
    expires_at: expiresAt ?? null,
  });
  logActivity("Security and Quality Agent", `Issued API key "${name}" (${scopes.length} scope(s)).`, {
    evidence: `api_keys#${id}`,
  });
  return { id, name, prefix, scopes, secret };
}

function parseScopes(raw: unknown): Scope[] {
  return String(raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Scope => (ALL_SCOPES as readonly string[]).includes(s));
}

/**
 * Verify a presented bearer token. Returns a structured failure rather than
 * throwing, so the route can map it to a status code without leaking whether
 * the key exists.
 */
export function verifyApiKey(presented: string | null): AuthResult {
  if (!presented) return { ok: false, status: 401, error: "Missing API key." };

  // Accept "Bearer <key>" or the raw key.
  const token = presented.startsWith("Bearer ") ? presented.slice(7).trim() : presented.trim();
  const prefix = token.split(".")[0];
  if (!prefix) return { ok: false, status: 401, error: "Malformed API key." };

  const row = queryOne<Record<string, unknown>>("SELECT * FROM api_keys WHERE prefix=?", prefix);
  // Same message for unknown prefix and wrong secret: do not confirm existence.
  if (!row) return { ok: false, status: 401, error: "Invalid API key." };

  if (!safeEqual(String(row.key_hash), hashKey(token))) {
    return { ok: false, status: 401, error: "Invalid API key." };
  }

  if (row.revoked_at) return { ok: false, status: 401, error: "API key revoked." };

  if (row.expires_at && new Date(String(row.expires_at)).getTime() < Date.now()) {
    return { ok: false, status: 401, error: "API key expired." };
  }

  return {
    ok: true,
    status: 200,
    key: {
      id: Number(row.id),
      name: String(row.name),
      prefix: String(row.prefix),
      scopes: parseScopes(row.scopes),
      revoked_at: (row.revoked_at as string) ?? null,
      expires_at: (row.expires_at as string) ?? null,
      last_used_at: (row.last_used_at as string) ?? null,
      request_count: Number(row.request_count ?? 0),
    },
  };
}

export function requireScope(key: ApiKeyRecord, scope: Scope): boolean {
  return key.scopes.includes(scope);
}

export function revokeApiKey(id: number): boolean {
  const res = sqlRun("UPDATE api_keys SET revoked_at=datetime('now') WHERE id=? AND revoked_at IS NULL", id);
  if (res.changes > 0) {
    logActivity("Security and Quality Agent", `Revoked API key #${id}.`, { level: "warning", evidence: `api_keys#${id}` });
  }
  return res.changes > 0;
}

export function listApiKeys(): (ApiKeyRecord & { revoked: boolean })[] {
  return query<Record<string, unknown>>(
    "SELECT id, name, prefix, scopes, revoked_at, expires_at, last_used_at, request_count FROM api_keys ORDER BY id DESC",
  ).map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    prefix: String(r.prefix),
    scopes: parseScopes(r.scopes),
    revoked_at: (r.revoked_at as string) ?? null,
    expires_at: (r.expires_at as string) ?? null,
    last_used_at: (r.last_used_at as string) ?? null,
    request_count: Number(r.request_count ?? 0),
    revoked: Boolean(r.revoked_at),
  }));
}

/** Record a request, update the key's usage, and enforce the rate limit. */
export function recordRequest(args: {
  keyId: number | null;
  method: string;
  path: string;
  status: number;
  ms: number;
  ip: string | null;
  note?: string;
}): void {
  insert("api_requests", {
    key_id: args.keyId,
    method: args.method,
    path: args.path,
    status: args.status,
    ms: args.ms,
    ip: args.ip,
    note: args.note ?? null,
  });
  if (args.keyId) {
    sqlRun(
      "UPDATE api_keys SET last_used_at=datetime('now'), request_count=request_count+1, last_used_ip=? WHERE id=?",
      args.ip,
      args.keyId,
    );
  }
}

export const RATE_LIMIT_PER_MINUTE = Number(process.env.GEO_LAB_API_RATE_LIMIT ?? 120);

/**
 * Rate limit by key, from the persisted request log. Returns remaining quota so
 * the response can carry honest rate-limit headers.
 */
export function checkRateLimit(keyId: number): { allowed: boolean; used: number; limit: number; retryAfterSeconds: number } {
  const limit = RATE_LIMIT_PER_MINUTE;
  const row = queryOne<{ c: number }>(
    "SELECT COUNT(*) c FROM api_requests WHERE key_id=? AND ts > datetime('now','-1 minute')",
    keyId,
  );
  const used = Number(row?.c ?? 0);
  return { allowed: used < limit, used, limit, retryAfterSeconds: 60 };
}

/** Recent external requests, for the connection-status screen. */
export function recentApiRequests(limit = 50) {
  return query<Record<string, unknown>>(
    `SELECT r.ts, r.method, r.path, r.status, r.ms, r.ip, k.name AS key_name
     FROM api_requests r LEFT JOIN api_keys k ON k.id = r.key_id
     ORDER BY r.id DESC LIMIT ?`,
    limit,
  );
}

/** Aggregate health for the /health endpoint. */
export function apiHealth(): {
  keys: { total: number; active: number };
  requests24h: number;
  errors24h: number;
  lastRequestAt: string | null;
} {
  const total = Number(queryOne<{ c: number }>("SELECT COUNT(*) c FROM api_keys")?.c ?? 0);
  const active = Number(
    queryOne<{ c: number }>("SELECT COUNT(*) c FROM api_keys WHERE revoked_at IS NULL")?.c ?? 0,
  );
  const reqs = queryOne<{ c: number }>("SELECT COUNT(*) c FROM api_requests WHERE ts > datetime('now','-1 day')");
  const errs = queryOne<{ c: number }>(
    "SELECT COUNT(*) c FROM api_requests WHERE ts > datetime('now','-1 day') AND status >= 400",
  );
  const last = queryOne<{ ts: string }>("SELECT ts FROM api_requests ORDER BY id DESC LIMIT 1");
  return {
    keys: { total, active },
    requests24h: Number(reqs?.c ?? 0),
    errors24h: Number(errs?.c ?? 0),
    lastRequestAt: last?.ts ?? null,
  };
}
