"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportControls() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function gen(period: string) {
    setBusy(period);
    setMsg(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: number; error?: string };
      setMsg(data.error ?? (data.ok ? `Generated ${period} report (#${data.id}).` : "Failed."));
      if (data.id) router.push(`/reports?id=${data.id}`);
      router.refresh();
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {["daily", "weekly", "monthly"].map((p) => (
        <button
          key={p}
          onClick={() => gen(p)}
          disabled={busy !== null}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold disabled:opacity-60 ${
            p === "daily" ? "bg-[color:var(--color-brand)] text-white hover:bg-[color:var(--color-brand-dark)]" : "border border-[color:var(--color-line)] bg-white text-ink-soft hover:bg-[color:var(--color-canvas)]"
          }`}
        >
          {busy === p ? "Generating…" : `Generate ${p}`}
        </button>
      ))}
      {msg ? <span className="text-[11px] text-ink-soft">{msg}</span> : null}
    </div>
  );
}
