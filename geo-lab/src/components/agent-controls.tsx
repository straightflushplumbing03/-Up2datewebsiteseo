"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const MANUAL_AGENT_ACTIONS = [
  { id: "geo-research", label: "GEO Research" },
  { id: "seo-technical", label: "SEO Technical" },
  { id: "content-intelligence", label: "Content Intelligence" },
  { id: "entity-intelligence", label: "Entity Intelligence" },
  { id: "competitor-intelligence", label: "Competitor Intelligence" },
  { id: "geographic", label: "Service Areas" },
  { id: "experiment", label: "Experiment" },
  { id: "analytics", label: "Analytics" },
  { id: "security-quality", label: "Security & Quality" },
  { id: "publishing", label: "Publishing" },
  { id: "geo-research-sweep", label: "Visibility Sweep" },
];

export function AgentControls() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(agent: string) {
    setBusy(agent);
    setMsg(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; result?: { summary?: string }; published?: number; message?: string };
      setMsg(data.error ?? data.result?.summary ?? data.message ?? (data.published !== undefined ? `published ${data.published}` : "Done."));
      router.refresh();
    } catch (e) {
      setMsg(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {MANUAL_AGENT_ACTIONS.map((a) => (
        <button
          key={a.id}
          onClick={() => run(a.id)}
          disabled={busy !== null}
          className="rounded-xl border border-[color:var(--color-line)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft hover:bg-[color:var(--color-canvas)] disabled:opacity-60"
        >
          {busy === a.id ? "…" : a.label}
        </button>
      ))}
      {msg ? <span className="max-w-md text-[11px] text-ink-soft">{msg}</span> : null}
    </div>
  );
}
