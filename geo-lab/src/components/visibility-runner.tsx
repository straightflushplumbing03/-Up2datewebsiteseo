"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VisibilityRunner() {
  const router = useRouter();
  const [limit, setLimit] = useState(10);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "geo-research-sweep", limit }),
      });
      const data = (await res.json()) as { rows?: number; providers?: { provider: string; ok: number; inconclusive: number }[]; error?: string };
      if (data.error) setMsg(data.error);
      else setMsg(`${data.rows ?? 0} test(s): ${(data.providers ?? []).map((p) => `${p.provider} ${p.ok} ok / ${p.inconclusive} inconclusive`).join("; ")}`);
      router.refresh();
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 text-[11px] text-ink-soft">
        queries
        <input
          type="number"
          min={1}
          max={40}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="w-14 rounded-lg border border-[color:var(--color-line)] px-2 py-1 text-xs"
        />
      </label>
      <button
        onClick={run}
        disabled={busy}
        className="rounded-xl bg-[color:var(--color-brand)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[color:var(--color-brand-dark)] disabled:opacity-60"
      >
        {busy ? "Sweeping…" : "Run sweep"}
      </button>
      {msg ? <span className="max-w-md text-[11px] text-ink-soft">{msg}</span> : null}
    </div>
  );
}
