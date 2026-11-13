import { BRAND } from "@/brand.config";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LangToggle } from "@/components/LangProvider";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Team-Login", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const demoPassword = process.env.DEMO_MODE === "1" ? (process.env.ADMIN_PASSWORD ?? null) : null;
  return (
    <div className="grid min-h-dvh place-items-center bg-cobalt px-4 text-cobalt-ink">
      <div className="w-full max-w-sm rounded-[var(--radius-m)] bg-stone p-7 text-ink">
        <div className="mb-6 flex items-center justify-between">
          <p className="display text-3xl text-cobalt">{BRAND.wordmark}</p>
          <LangToggle />
        </div>
        <LoginForm demoPassword={demoPassword} />
      </div>
    </div>
  );
}
