import Link from "next/link";
import { LangToggle } from "@/components/LangProvider";
import { getDict } from "@/lib/lang";
import { CartButton } from "./CartDrawer";

export async function SiteHeader() {
  const { t } = await getDict();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-stone/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="display text-2xl" aria-label="Mahlgrad">
          mahlgrad
        </Link>
        <nav className="ml-6 hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Main">
          <Link href="/menu" className="hover:text-cobalt">
            {t.nav.menu}
          </Link>
          <Link href="/menu#beans" className="hover:text-cobalt">
            {t.nav.shop}
          </Link>
          <Link href="/karte" className="hover:text-cobalt">
            {t.nav.card}
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
