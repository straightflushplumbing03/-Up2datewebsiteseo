"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OpportunityActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function set(next: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next, result: note || undefined }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      setMsg(data.error ?? "Saved.");
      router.refresh();
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-[color:var(--color-canvas)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        {status !== "in_progress" ? (
          <button onClick={() => set("in_progress")} disabled={busy} className="rounded-lg border border-[color:var(--color-line)] bg-white px-2.5 py-1 text-[11px] font-medium disabled:opacity-60">
            Start
          </button>
        ) : null}
        <button onClick={() => set("done")} disabled={busy} className="rounded-lg bg-[color:var(--color-good)] px-2.5 py-1 text-[11px] font-medium text-white disabled:opacity-60">
          Mark done
        </button>
        <button onClick={() => set("dismissed")} disabled={busy} className="rounded-lg border border-[color:var(--color-line)] bg-white px-2.5 py-1 text-[11px] font-medium disabled:opacity-60">
          Dismiss
        </button>
        <button onClick={() => set("open")} disabled={busy} className="rounded-lg border border-[color:var(--color-line)] bg-white px-2.5 py-1 text-[11px] font-medium disabled:opacity-60">
          Reopen
        </button>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Result note (optional)"
        className="mt-2 w-full rounded-lg border border-[color:var(--color-line)] px-2 py-1 text-[11px] outline-none focus:border-[color:var(--color-brand)]"
      />
      {msg ? <div className="mt-1 text-[10px] text-ink-faint">{msg}</div> : null}
    </div>
  );
}
