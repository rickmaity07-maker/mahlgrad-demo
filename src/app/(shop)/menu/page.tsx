import type { Metadata } from "next";
import Image from "next/image";
import { OpenItemButton } from "@/components/shop/OpenItemButton";
import { getMenu } from "@/lib/data";
import { fill, pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { formatPrice } from "@/lib/pricing";
import { CATEGORIES } from "@/lib/types";

export const metadata: Metadata = { title: "Karte" };

export default async function MenuPage() {
  const [{ lang, t }, menu] = await Promise.all([getDict(), getMenu()]);
  const groups = CATEGORIES.map((c) => ({ c, items: menu.filter((m) => m.category === c) })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <h1 className="display text-[clamp(3rem,7vw,5.5rem)]">{t.nav.menu}</h1>

      <nav
        aria-label={t.nav.menu}
        className="rail sticky top-[4.75rem] z-20 -mx-4 mt-6 flex gap-2 overflow-x-auto border-b border-line bg-stone/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"
      >
        {groups.map(({ c }) => (
          <a
            key={c}
            href={`#${c}`}
            className="shrink-0 rounded-[var(--radius-m)] border-[1.5px] border-line px-3.5 py-2 text-sm font-semibold hover:border-ink"
          >
            {t.categories[c]}
          </a>
        ))}
      </nav>

      {groups.map(({ c, items }) => (
        <section key={c} id={c} className="scroll-mt-44 pt-12">
          <h2 className="display text-4xl">{t.categories[c]}</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {items.map((item) => {
              const soldOut = item.stock === 0;
              return (
                <li key={item.id}>
                  <OpenItemButton
                    slug={item.slug}
                    className="flex w-full items-center gap-4 rounded-[var(--radius-m)] bg-card p-3 text-left ring-cobalt hover:ring-[1.5px]"
                  >
                    {item.image ? (
                      <span className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-m)] bg-ink sm:size-24">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="96px"
                          className={`object-cover ${soldOut ? "opacity-45 grayscale" : ""}`}
                        />
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1 py-1">
                      <span className="flex items-baseline gap-2">
                        <span className="font-semibold">{pick(item, "name", lang)}</span>
                        {item.tag ? <span className="text-xs font-semibold text-cobalt">{t.tags[item.tag]}</span> : null}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">{pick(item, "desc", lang)}</span>
                      {item.stock !== null ? (
                        <span className={`mt-1 block text-xs font-semibold ${soldOut ? "text-danger" : "text-muted"}`}>
                          {soldOut ? t.shop.soldOut : fill(t.shop.left, { n: item.stock })}
                        </span>
                      ) : null}
                    </span>
                    <span className="self-start pr-1 pt-1 font-semibold tabular-nums">{formatPrice(item.price_cents, lang)}</span>
                  </OpenItemButton>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
