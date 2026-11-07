"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Sends one notification through whatever channel is configured and reports the
 * real outcome. This exists so the notification path can be proven rather than
 * merely configured — the reply says which channel was used and whether an
 * email actually left the machine.
 */
export function NotificationTestButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  async function send() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-notification" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; result?: { channel: string; status: string; detail: string } };
      if (data.result) {
        setMsg({ tone: data.result.status === "failed" ? "bad" : "good", text: `${data.result.channel}: ${data.result.status} — ${data.result.detail}` });
      } else {
        setMsg({ tone: "bad", text: data.error ?? "Unexpected response." });
      }
      router.refresh();
    } catch (e) {
      setMsg({ tone: "bad", text: `Failed: ${(e as Error).message}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={send}
        disabled={busy}
        className="rounded-xl bg-[color:var(--color-brand)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send test notification"}
      </button>
      {msg ? (
        <p className={`max-w-xs text-[11px] ${msg.tone === "bad" ? "text-red-600" : "text-ink-soft"}`}>{msg.text}</p>
      ) : null}
    </div>
  );
}
