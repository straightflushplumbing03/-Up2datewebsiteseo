"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: { href: string; label: string; icon: string }[] = [
  { href: "/", label: "Command Center", icon: "◎" },
  { href: "/ai-visibility", label: "AI Visibility", icon: "◍" },
  { href: "/geo-console", label: "GEO Console", icon: "▤" },
  { href: "/website", label: "Website Intelligence", icon: "◧" },
  { href: "/competitors", label: "Competitor Intelligence", icon: "◈" },
  { href: "/entity", label: "Entity Intelligence", icon: "⬡" },
  { href: "/experiments", label: "GEO Experiment Lab", icon: "⚗" },
  { href: "/optimization", label: "Optimization Engine", icon: "⚙" },
  { href: "/agents", label: "Autonomous Agents", icon: "◉" },
  { href: "/research", label: "Research Library", icon: "▦" },
  { href: "/publishing", label: "Publishing History", icon: "⇪" },
  { href: "/reports", label: "Reports", icon: "▣" },
  { href: "/integrations", label: "Integrations", icon: "⧉" },
  { href: "/settings", label: "Settings", icon: "⚑" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="card sticky top-20 p-2">
      {ITEMS.map((it) => {
        const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[color:var(--color-brand-soft)] font-semibold text-[color:var(--color-brand-dark)]"
                : "text-ink-soft hover:bg-[color:var(--color-canvas)]"
            }`}
          >
            <span className="w-4 text-center text-[13px] opacity-80">{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
