import { LangToggle } from "@/components/LangProvider";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "@/app/admin/actions";
import { getDict } from "@/lib/lang";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { t } = await getDict();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-stone/95 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <span className="display text-xl text-cobalt">mahlgrad</span>
          <AdminNav />
          <div className="ml-auto flex items-center gap-2">
            <LangToggle />
            <form action={logout}>
              <button type="submit" className="rounded-[var(--radius-m)] px-3 py-1.5 text-sm font-medium hover:bg-line">
                {t.admin.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
