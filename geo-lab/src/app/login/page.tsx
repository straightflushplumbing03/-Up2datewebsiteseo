import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { COMPANY } from "@/lib/company";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect("/");

  return (
    <div className="grid min-h-screen place-items-center bg-[color:var(--color-canvas)] px-5">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--color-brand)] text-lg font-bold text-white">
            SF
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">GEO Intelligence Lab</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {COMPANY.name} — autonomous AI-search operations.
          </p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-[11px] text-ink-faint">
          Internal system. Access is authenticated and every action is logged.
        </p>
      </div>
    </div>
  );
}
