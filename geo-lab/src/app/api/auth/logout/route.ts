import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logout, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (token) logout(token);
  const res = NextResponse.redirect(new URL("/login", process.env.GEO_LAB_PUBLIC_URL || "http://localhost:12000"), 303);
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
