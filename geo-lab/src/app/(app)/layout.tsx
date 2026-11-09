import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { COMPANY } from "@/lib/company";
import { Nav } from "@/components/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Ensure the schema exists even on a cold start.
  getDb();
  const user = await currentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--color-brand)] text-sm font-bold text-white">
              SF
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">GEO Intelligence Lab</span>
              <span className="block text-[11px] text-ink-faint">
                {COMPANY.shortName} · {COMPANY.city}
              </span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3 text-xs text-ink-soft">
            <span className="hidden sm:inline">{user.name}</span>
            <span className="rounded-full bg-[color:var(--color-brand-soft)] px-2 py-0.5 font-medium text-[color:var(--color-brand-dark)]">
              {user.role}
            </span>
            <form action="/api/auth/logout" method="post">
              <button
                className="rounded-lg border border-[color:var(--color-line)] px-2.5 py-1 font-medium text-ink-soft hover:bg-[color:var(--color-canvas)]"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-5 py-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <Nav />
        </aside>
        <main className="min-w-0 flex-1 animate-fade-up">{children}</main>
      </div>

      <footer className="border-t border-[color:var(--color-line)] bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-5 py-3 text-[11px] text-ink-faint">
          <span>
            Straight Flush Plumbing &amp; Leak Detection — internal intelligence system. Scores are diagnostic heuristics, not platform scores.
          </span>
          <span>{COMPANY.website.replace("https://", "")}</span>
        </div>
      </footer>
    </div>
  );
}
