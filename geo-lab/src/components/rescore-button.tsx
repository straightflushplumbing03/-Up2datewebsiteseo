"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RescoreButton({ url }: { url: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/geo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(url ? { url } : {}),
      });
      const data = (await res.json()) as { ok?: boolean; average?: number; pages?: number; error?: string };
      setMsg(data.error ?? (data.average !== undefined ? `Re-scored ${data.pages} pages (avg ${data.average}).` : "Re-scored."));
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
        {busy ? "Scoring…" : url ? "Re-score this page" : "Re-score all pages"}
      </button>
      {msg ? <span className="text-[11px] text-ink-soft">{msg}</span> : null}
    </div>
  );
}
