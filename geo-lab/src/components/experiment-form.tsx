"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ExperimentForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    hypothesis: "",
    targetUrl: "",
    targetSection: "",
    baseline: "",
    variables: "",
    methodology: "",
    evidence: "",
  });

  function upd(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      setMsg(data.error ?? (data.ok ? "Experiment created." : "Failed."));
      if (data.ok) {
        setForm({ code: "", hypothesis: "", targetUrl: "", targetSection: "", baseline: "", variables: "", methodology: "", evidence: "" });
        router.refresh();
      }
    } catch (err) {
      setMsg(`Failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const field = (label: string, key: keyof typeof form, placeholder = "") => (
    <label className="block">
      <span className="text-[11px] font-medium text-ink-soft">{label}</span>
      <input
        value={form[key]}
        onChange={(e) => upd(key, e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-[color:var(--color-line)] px-3 py-2 text-xs outline-none focus:border-[color:var(--color-brand)]"
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      {field("Code (unique)", "code", "exp-2026-11-direct-answers")}
      {field("Target URL", "targetUrl", "/services/slab-leak-detection.html")}
      <label className="block sm:col-span-2">
        <span className="text-[11px] font-medium text-ink-soft">Hypothesis</span>
        <textarea
          required
          value={form.hypothesis}
          onChange={(e) => upd("hypothesis", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-[color:var(--color-line)] px-3 py-2 text-xs outline-none focus:border-[color:var(--color-brand)]"
          placeholder="Concise Q&A sections improve AI citation frequency."
        />
      </label>
      {field("Target section", "targetSection", "FAQ")}
      {field("Baseline", "baseline", "mention rate, 14 days prior")}
      {field("Variables", "variables", "direct answer under each heading")}
      {field("Evidence", "evidence", "spec §8 A / audit row")}
      <label className="block sm:col-span-2">
        <span className="text-[11px] font-medium text-ink-soft">Methodology</span>
        <textarea
          value={form.methodology}
          onChange={(e) => upd("methodology", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-[color:var(--color-line)] px-3 py-2 text-xs outline-none focus:border-[color:var(--color-brand)]"
          placeholder="Fixed query set, before/after window, controls."
        />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-[color:var(--color-brand)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[color:var(--color-brand-dark)] disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create experiment"}
        </button>
        {msg ? <span className="text-[11px] text-ink-soft">{msg}</span> : null}
      </div>
    </form>
  );
}
