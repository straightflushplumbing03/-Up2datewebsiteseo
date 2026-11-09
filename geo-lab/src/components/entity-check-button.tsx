"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EntityCheckButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/entity", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; report?: { consistencyScore: number; discrepancies: string[] }; error?: string };
      setMsg(data.error ?? (data.report ? `Consistency ${data.report.consistencyScore}% · ${data.report.discrepancies.length} discrepancy(ies).` : "Done."));
      router.refresh();
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={run}
        disabled={busy}
        className="rounded-xl border border-[color:var(--color-line)] bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-[color:var(--color-canvas)] disabled:opacity-60"
      >
        {busy ? "Checking live hosts…" : "Run entity check"}
      </button>
      {msg ? <span className="max-w-md text-[11px] text-ink-soft">{msg}</span> : null}
    </div>
  );
}
