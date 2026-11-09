import type { ReactNode } from "react";

/** Shared presentational components — server-safe, no client JS needed. */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  sub,
  source,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  source?: string;
  tone?: "neutral" | "good" | "warn" | "bad" | "brand";
}) {
  const toneClass = {
    neutral: "text-ink",
    good: "text-[color:var(--color-good)]",
    warn: "text-[color:var(--color-warn)]",
    bad: "text-[color:var(--color-bad)]",
    brand: "text-[color:var(--color-brand)]",
  }[tone];
  return (
    <div className="card card-hover p-4 animate-fade-up">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tabular ${toneClass}`}>{value}</div>
      {sub ? <div className="mt-1 text-xs text-ink-soft">{sub}</div> : null}
      {source ? <div className="mt-2 text-[10px] text-ink-faint">source: {source}</div> : null}
    </div>
  );
}

export function ScoreRing({ value, label, size = 96 }: { value: number; label?: string; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const color = pct >= 75 ? "var(--color-good)" : pct >= 55 ? "var(--color-brand)" : pct >= 40 ? "var(--color-warn)" : "var(--color-bad)";
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <div className="-mt-[calc(50%+6px)] mb-[calc(50%-6px)] text-center" style={{ marginTop: -(size / 2) - 8 }}>
        <div className="text-xl font-semibold tabular">{Math.round(pct)}</div>
      </div>
      {label ? <div className="mt-2 text-xs font-medium text-ink-soft text-center">{label}</div> : null}
    </div>
  );
}

export function Bar({ value, max = 100, tone = "brand" }: { value: number; max?: number; tone?: "brand" | "good" | "warn" | "bad" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = {
    brand: "var(--color-brand)",
    good: "var(--color-good)",
    warn: "var(--color-warn)",
    bad: "var(--color-bad)",
  }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-muted-soft)]">
      <div className="h-full rounded-full animate-grow" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function LayerBars({ layers }: { layers: Record<string, number> }) {
  return (
    <div className="space-y-3">
      {Object.entries(layers).map(([label, value]) => (
        <div key={label}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-ink-soft">{label}</span>
            <span className="tabular font-semibold">{value}</span>
          </div>
          <div className="mt-1">
            <Bar value={value} tone={value >= 75 ? "good" : value >= 55 ? "brand" : value >= 40 ? "warn" : "bad"} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "brand" | "muted" }) {
  const map = {
    neutral: "bg-[color:var(--color-muted-soft)] text-ink-soft",
    good: "bg-[color:var(--color-good-soft)] text-[color:var(--color-good)]",
    warn: "bg-[color:var(--color-warn-soft)] text-[color:var(--color-warn)]",
    bad: "bg-[color:var(--color-bad-soft)] text-[color:var(--color-bad)]",
    brand: "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-dark)]",
    muted: "bg-[color:var(--color-muted-soft)] text-ink-faint",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${map}`}>{children}</span>;
}

export function statusTone(status: string): "good" | "warn" | "bad" | "brand" | "muted" {
  switch (status) {
    case "recommended":
    case "cited":
    case "connected":
    case "ok":
    case "verified":
    case "published":
    case "done":
      return "good";
    case "mentioned":
    case "partial":
    case "in_progress":
    case "rate_limited":
      return "brand";
    case "inconclusive":
    case "not_testable":
    case "skipped":
    case "queued":
    case "planned":
    case "pending":
      return "muted";
    case "absent":
    case "failed":
    case "error":
    case "disconnected":
    case "needs_auth":
      return "bad";
    case "warning":
    case "needs_auth ":
      return "warn";
    default:
      return "muted";
  }
}

export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Table({ head, rows, empty = "No data yet." }: { head: string[]; rows: ReactNode[][]; empty?: string }) {
  if (!rows.length) return <div className="rounded-xl border border-dashed border-[color:var(--color-line)] p-6 text-center text-sm text-ink-faint">{empty}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[color:var(--color-line)] text-left text-[11px] uppercase tracking-wider text-ink-faint">
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[color:var(--color-line)]/60 last:border-0 hover:bg-[color:var(--color-canvas)]">
              {r.map((c, j) => (
                <td key={j} className="py-2 pr-4 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LineChart({
  points,
  height = 160,
  series = [{ key: "value", color: "var(--color-brand)" }],
  labels = [],
}: {
  points: { date: string; [k: string]: number | string }[];
  height?: number;
  series?: { key: string; color: string; label?: string }[];
  labels?: string[];
}) {
  if (!points.length) return <div className="p-6 text-center text-sm text-ink-faint">No history yet.</div>;
  const width = 720;
  const pad = 24;
  const allVals = points.flatMap((p) => series.map((s) => Number(p[s.key] ?? 0)));
  const max = Math.max(100, ...allVals);
  const min = 0;
  const x = (i: number) => pad + (i / Math.max(points.length - 1, 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / (max - min)) * (height - pad * 2);
  void labels;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="trend chart">
      {[0, 25, 50, 75, 100].map((g) => (
        <line key={g} x1={pad} x2={width - pad} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeWidth="1" />
      ))}
      {series.map((s) => (
        <polyline
          key={s.key}
          fill="none"
          stroke={s.color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points.map((p, i) => `${x(i)},${y(Number(p[s.key] ?? 0))}`).join(" ")}
        />
      ))}
      {points.map((p, i) => (
        <g key={i}>
          {series.map((s) => (
            <circle key={s.key} cx={x(i)} cy={y(Number(p[s.key] ?? 0))} r="2.5" fill={s.color} />
          ))}
        </g>
      ))}
      <text x={pad} y={height - 6} fontSize="10" fill="var(--color-ink-faint)">
        {points[0]?.date}
      </text>
      <text x={width - pad} y={height - 6} fontSize="10" fill="var(--color-ink-faint)" textAnchor="end">
        {points[points.length - 1]?.date}
      </text>
    </svg>
  );
}
