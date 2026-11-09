"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Manual run controls for every scheduled operation (spec §13). These call the
 * same orchestrator the scheduler uses, so a manual run and a scheduled run are
 * identical in behaviour.
 */
export function RunControls() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(label: string, url: string, body?: unknown) {
    setBusy(label);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json()) as { ok?: boolean; summary?: string; message?: string; error?: string; published?: number };
      setMsg(data.summary ?? data.message ?? data.error ?? (data.ok ? "Done." : "Completed with issues."));
      router.refresh();
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => run("daily", "/api/run?trigger=manual")}
        disabled={busy !== null}
        className="rounded-xl bg-[color:var(--color-brand)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[color:var(--color-brand-dark)] disabled:opacity-60"
      >
        {busy === "daily" ? "Running…" : "Run daily operations"}
      </button>
      <button
        onClick={() => run("sweep", "/api/agent", { agent: "geo-research-sweep", limit: 10 })}
        disabled={busy !== null}
        className="rounded-xl border border-[color:var(--color-line)] bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-[color:var(--color-canvas)] disabled:opacity-60"
      >
        {busy === "sweep" ? "Sweeping…" : "Run visibility sweep"}
      </button>
      <button
        onClick={() => run("entity", "/api/entity")}
        disabled={busy !== null}
        className="rounded-xl border border-[color:var(--color-line)] bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-[color:var(--color-canvas)] disabled:opacity-60"
      >
        {busy === "entity" ? "Checking…" : "Entity check"}
      </button>
      <button
        onClick={() => run("publish", "/api/publish", { action: "publish-safe" })}
        disabled={busy !== null}
        className="rounded-xl border border-[color:var(--color-line)] bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-[color:var(--color-canvas)] disabled:opacity-60"
      >
        {busy === "publish" ? "Publishing…" : "Publish safe fixes"}
      </button>
      {msg ? <span className="text-[11px] text-ink-soft">{msg}</span> : null}
    </div>
  );
}
