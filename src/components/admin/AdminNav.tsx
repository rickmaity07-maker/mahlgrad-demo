"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LangProvider";

export function AdminNav() {
  const { t } = useLang();
  const path = usePathname();
  const links = [
    ["/admin", t.admin.nav.orders],
    ["/admin/bar", t.admin.nav.bar],
    ["/admin/menu", t.admin.nav.menu],
    ["/admin/loyalty", t.admin.nav.loyalty],
    ["/admin/hours", t.admin.nav.hours],
    ["/admin/sales", t.admin.nav.sales],
  ] as const;
  return (
    <nav className="rail flex gap-1 overflow-x-auto" aria-label="Admin">
      {links.map(([href, label]) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-[var(--radius-m)] px-3 py-1.5 text-sm font-medium ${
              active ? "bg-cobalt text-cobalt-ink" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
