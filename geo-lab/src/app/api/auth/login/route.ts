import { NextResponse } from "next/server";
import { login, loginLockRemainingMs, SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  getDb();
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
  if (!body.email || !body.password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }
  const lockedMs = loginLockRemainingMs(body.email);
  if (lockedMs > 0) {
    return NextResponse.json(
      { ok: false, error: `Too many failed attempts. Try again in ${Math.ceil(lockedMs / 60000)} minute(s).` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(lockedMs / 1000)) } },
    );
  }
  const result = login(body.email, body.password, req.headers.get("user-agent") ?? undefined);
  if (!result) {
    return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, user: result.user });
  res.cookies.set(SESSION_COOKIE_NAME, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
  return res;
}
