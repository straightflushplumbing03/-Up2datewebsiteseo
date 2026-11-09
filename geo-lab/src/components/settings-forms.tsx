"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsForms() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function call(label: string, body: unknown) {
    setBusy(label);
    setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      setMsg(data.error ?? data.message ?? "Saved.");
      router.refresh();
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="text-[11px] font-medium text-ink-soft">New password (min 10 chars)</span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[color:var(--color-line)] px-3 py-2 text-xs outline-none focus:border-[color:var(--color-brand)]"
          />
        </label>
        <button
          onClick={() => call("pw", { action: "change-password", newPassword: pw })}
          disabled={busy !== null || pw.length < 10}
          className="rounded-xl bg-[color:var(--color-brand)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[color:var(--color-brand-dark)] disabled:opacity-60"
        >
          {busy === "pw" ? "Saving…" : "Change password"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => call("integrations", { action: "refresh-integrations" })}
          disabled={busy !== null}
          className="rounded-xl border border-[color:var(--color-line)] bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-[color:var(--color-canvas)] disabled:opacity-60"
        >
          {busy === "integrations" ? "Refreshing…" : "Re-check integrations"}
        </button>
      </div>
      {msg ? <div className="text-[11px] text-ink-soft">{msg}</div> : null}
      <p className="text-[11px] text-ink-faint">
        After a password change, sign out and sign back in. The owner account was created at first seed with a generated password stored in the
        workspace at <code>data/owner-credentials.txt</code> — change it and delete that file.
      </p>
    </div>
  );
}
