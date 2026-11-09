"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-medium text-ink-soft">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[color:var(--color-line)] px-3 py-2 text-sm outline-none focus:border-[color:var(--color-brand)]"
          placeholder="lance@straightflushplumbingoc.com"
          autoComplete="username"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-ink-soft">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[color:var(--color-line)] px-3 py-2 text-sm outline-none focus:border-[color:var(--color-brand)]"
          autoComplete="current-password"
        />
      </label>
      {error ? <div className="rounded-xl bg-[color:var(--color-bad-soft)] px-3 py-2 text-xs text-[color:var(--color-bad)]">{error}</div> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-[color:var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brand-dark)] disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
