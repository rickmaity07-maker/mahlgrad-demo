import Link from "next/link";
import { BRAND } from "@/brand.config";
import { LangToggle } from "@/components/LangProvider";
import { getDict } from "@/lib/lang";
import { CartButton } from "./CartDrawer";

/** Floating glass bar; fixed, so the hero photograph runs underneath it. */
export async function SiteHeader() {
  const { t } = await getDict();
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="glass mx-auto flex h-14 max-w-7xl items-center gap-4 rounded-[var(--radius-m)] px-4 text-ink sm:px-5">
        <Link href="/" className="display text-2xl" aria-label={BRAND.name}>
          {BRAND.wordmark}
        </Link>
        <nav className="ml-6 hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Main">
          <Link href="/menu" className="transition-colors hover:text-cobalt">
            {t.nav.menu}
          </Link>
          <Link href="/menu#beans" className="transition-colors hover:text-cobalt">
            {t.nav.shop}
          </Link>
          <Link href="/karte" className="transition-colors hover:text-cobalt">
            {t.nav.card}
          </Link>
          <Link href="/#visit" className="transition-colors hover:text-cobalt">
            {t.nav.hours}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link href="/menu" className="text-sm font-medium md:hidden">
            {t.nav.menu}
          </Link>
          <LangToggle />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
