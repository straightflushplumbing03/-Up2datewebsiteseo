import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { insert, queryOne, audit, run as sqlRun } from "./db";
import { DATA_DIR, ensureDirs } from "./paths";

/**
 * Authentication + role-based access control (spec §18).
 *
 * - Passwords are hashed with scrypt (never stored or logged in plaintext).
 * - Sessions are opaque random tokens in the `sessions` table, carried in an
 *   httpOnly cookie. No JWT secrets to leak, and revocation is immediate.
 * - Roles: owner (full, incl. locked-fact changes) > operator (publish) >
 *   viewer (read-only).
 *
 * The initial owner account is created by `scripts/seed.ts`. The password comes
 * from GEO_LAB_OWNER_PASSWORD if set; otherwise a strong random password is
 * generated and written to data/owner-credentials.txt (gitignored) so the owner
 * can retrieve it once and change it in Settings.
 */

export type Role = "owner" | "operator" | "viewer";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

const SESSION_COOKIE = "geolab_session";
const SESSION_TTL_DAYS = 14;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const N = 16384;
  const hash = crypto.scryptSync(password, salt, 64, { N, r: 8, p: 1 });
  return `scrypt$${N}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, nStr, saltHex, hashHex] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const N = parseInt(nStr, 10);
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = crypto.scryptSync(password, salt, expected.length, { N, r: 8, p: 1 });
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * Constant-time check of an `Authorization: Bearer <token>` header. Both sides
 * are hashed first so the comparison length never depends on the input.
 */
export function bearerTokenMatches(header: string | null | undefined, token: string | undefined): boolean {
  if (!token) return false;
  const digest = (v: string) => crypto.createHash("sha256").update(v).digest();
  return crypto.timingSafeEqual(digest(header ?? ""), digest(`Bearer ${token}`));
}

export function createUser(email: string, name: string, role: Role, password: string): number {
  return insert("users", {
    email: email.toLowerCase().trim(),
    name,
    role,
    password_hash: hashPassword(password),
  });
}

export function ensureOwnerAccount(): { created: boolean; email: string; passwordFile?: string } {
  const existing = queryOne<{ id: number }>("SELECT id FROM users WHERE role='owner' LIMIT 1");
  if (existing) return { created: false, email: "existing" };

  const email = process.env.GEO_LAB_OWNER_EMAIL || "lance@straightflushplumbingoc.com";
  const envPw = process.env.GEO_LAB_OWNER_PASSWORD;
  const password = envPw || crypto.randomBytes(12).toString("base64url");
  createUser(email, "Lance (owner)", "owner", password);

  let passwordFile: string | undefined;
  if (!envPw) {
    ensureDirs();
    passwordFile = path.join(DATA_DIR, "owner-credentials.txt");
    fs.writeFileSync(
      passwordFile,
      `GEO Lab owner account\nemail: ${email}\npassword: ${password}\n\nChange this in Settings after first login. This file is gitignored.\n`,
      { mode: 0o600 },
    );
  }
  audit("system", "create-owner-account", email, envPw ? "password from GEO_LAB_OWNER_PASSWORD" : `password written to ${passwordFile}`);
  return { created: true, email, passwordFile };
}

/**
 * Brute-force guard. A failed attempt is counted per email; after
 * LOGIN_MAX_FAILURES failures within LOGIN_WINDOW_MS the account is locked for
 * the remainder of the window. Counters live in `schema_meta` so they survive
 * a process restart, and a successful login clears them.
 */
const LOGIN_MAX_FAILURES = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function loginAttemptKey(email: string): string {
  return `login_fail:${email.toLowerCase().trim()}`;
}

export function loginLockRemainingMs(email: string): number {
  const raw = queryOne<{ value: string }>("SELECT value FROM schema_meta WHERE key=?", loginAttemptKey(email))?.value;
  if (!raw) return 0;
  try {
    const { count, first } = JSON.parse(raw) as { count: number; first: number };
    if (count < LOGIN_MAX_FAILURES) return 0;
    const remaining = first + LOGIN_WINDOW_MS - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

function recordLoginFailure(email: string): void {
  const key = loginAttemptKey(email);
  const now = Date.now();
  const raw = queryOne<{ value: string }>("SELECT value FROM schema_meta WHERE key=?", key)?.value;
  let count = 1;
  let first = now;
  if (raw) {
    try {
      const prev = JSON.parse(raw) as { count: number; first: number };
      if (now - prev.first < LOGIN_WINDOW_MS) {
        count = prev.count + 1;
        first = prev.first;
      }
    } catch {
      /* start a fresh window */
    }
  }
  sqlRun("INSERT INTO schema_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", key, JSON.stringify({ count, first }));
}

function clearLoginFailures(email: string): void {
  sqlRun("DELETE FROM schema_meta WHERE key=?", loginAttemptKey(email));
}

export function login(email: string, password: string, userAgent?: string): { token: string; user: User } | null {
  if (loginLockRemainingMs(email) > 0) {
    audit(email, "login-locked", email, "Too many failed attempts; attempt refused.");
    return null;
  }
  const row = queryOne<{ id: number; email: string; name: string; role: Role; password_hash: string }>(
    "SELECT id, email, name, role, password_hash FROM users WHERE email=?",
    email.toLowerCase().trim(),
  );
  if (!row || !verifyPassword(password, row.password_hash)) {
    recordLoginFailure(email);
    audit(email, "login-failed", email, undefined);
    return null;
  }
  clearLoginFailures(email);
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86400_000).toISOString();
  insert("sessions", { token, user_id: row.id, expires_at: expires, user_agent: userAgent ?? null });
  sqlRun("UPDATE users SET last_login_at=datetime('now') WHERE id=?", row.id);
  audit(row.email, "login", row.email, undefined);
  return { token, user: { id: row.id, email: row.email, name: row.name, role: row.role } };
}

export function logout(token: string): void {
  sqlRun("DELETE FROM sessions WHERE token=?", token);
}

export function userForToken(token: string | undefined): User | null {
  if (!token) return null;
  const row = queryOne<{ id: number; email: string; name: string; role: Role; expires_at: string }>(
    `SELECT u.id, u.email, u.name, u.role, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ?`,
    token,
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    sqlRun("DELETE FROM sessions WHERE token=?", token);
    return null;
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export function changePassword(userId: number, newPassword: string): void {
  sqlRun("UPDATE users SET password_hash=? WHERE id=?", hashPassword(newPassword), userId);
  // Invalidate other sessions for safety.
  sqlRun("DELETE FROM sessions WHERE user_id=?", userId);
}

/** Server-side current user from the request cookie. */
export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return userForToken(token);
}

export async function requireUser(): Promise<User> {
  const u = await currentUser();
  if (!u) throw new AuthError(401, "Not authenticated");
  return u;
}

export function requireRole(user: User | null, roles: Role[]): void {
  if (!user) throw new AuthError(401, "Not authenticated");
  if (!roles.includes(user.role)) throw new AuthError(403, `Requires role: ${roles.join(" or ")}`);
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 86400_000;

/** Wrap an API handler with auth + error handling. */
export function guard<T>(roles: Role[], handler: (user: User, req: Request) => Promise<T>) {
  return async (req: Request): Promise<Response> => {
    try {
      const user = await requireUser();
      requireRole(user, roles);
      const data = await handler(user, req);
      return Response.json(data as object);
    } catch (e) {
      if (e instanceof AuthError) return Response.json({ error: e.message }, { status: e.status });
      return Response.json({ error: (e as Error).message }, { status: 500 });
    }
  };
}
