"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublishControls() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function call(label: string, body: unknown) {
    setBusy(label);
    setMsg(null);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; count?: number; published?: number; message?: string; error?: string; fixes?: { repoPath: string }[] };
      if (data.error) setMsg(data.error);
      else if (data.fixes) setMsg(`${data.count} candidate(s): ${data.fixes.map((f) => f.repoPath).join(", ") || "none"}`);
      else if (data.published !== undefined) setMsg(`Published ${data.published}. ${data.message ?? ""}`);
      else setMsg(data.message ?? "Done.");
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
        onClick={() => call("preview", { action: "preview-safe" })}
        disabled={busy !== null}
        className="rounded-xl border border-[color:var(--color-line)] bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-[color:var(--color-canvas)] disabled:opacity-60"
      >
        {busy === "preview" ? "Checking…" : "Preview safe fixes"}
      </button>
      <button
        onClick={() => call("publish", { action: "publish-safe" })}
        disabled={busy !== null}
        className="rounded-xl bg-[color:var(--color-brand)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[color:var(--color-brand-dark)] disabled:opacity-60"
      >
        {busy === "publish" ? "Publishing…" : "Publish safe fixes"}
      </button>
      {msg ? <span className="max-w-lg text-[11px] text-ink-soft">{msg}</span> : null}
    </div>
  );
}
