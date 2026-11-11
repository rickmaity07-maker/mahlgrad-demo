import Image from "next/image";
import Link from "next/link";
import { Intro } from "@/components/shop/Intro";
import { OpenItemButton } from "@/components/shop/OpenItemButton";
import { StampGrid } from "@/components/shop/StampGrid";
import { getMenu, getSettings } from "@/lib/data";
import { fill, pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { formatPrice } from "@/lib/pricing";
import { openNow } from "@/lib/slots";
import { SHOP_CATEGORIES } from "@/lib/types";

export default async function HomePage() {
  const [{ lang, t }, menu, settings] = await Promise.all([getDict(), getMenu(), getSettings()]);
  const isOpen = openNow(settings.hours);
  const barDrinks = menu.filter((m) => m.category === "espresso" || m.category === "filter");
  const shop = menu.filter((m) => SHOP_CATEGORIES.includes(m.category));
  const hours = [1, 2, 3, 4, 5, 6, 0].map((d) => settings.hours.find((h) => h.day === d)).filter((h) => h !== undefined);

  return (
    <>
      <Intro />

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-end gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-14">
        <div className="md:pb-6">
          <p className={`text-sm font-semibold ${isOpen ? "text-ok" : "text-muted"}`}>
            {isOpen ? t.hero.openNow : t.hero.closedNow}
          </p>
          <h1 className="display mt-4 max-w-[16ch] text-[clamp(3rem,6.4vw,5.8rem)]">{t.hero.title}</h1>
          <p className="mt-6 max-w-[40ch] text-lg text-muted">{t.hero.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary text-lg">
              {t.hero.cta}
            </Link>
            <Link href="/karte" className="btn btn-ghost text-lg">
              {t.nav.card}
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-m)] bg-ink">
          <Image
            src="/img/c8.jpg"
            alt={lang === "de" ? "Filterkaffee wird von Hand aufgegossen" : "Filter coffee being poured by hand"}
            fill
            priority
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* At the bar: typographic price list beside one photo */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-24">
          <div>
            <h2 className="display text-[clamp(2.4rem,4.6vw,3.8rem)]">{t.bar.title}</h2>
            <p className="mt-4 max-w-[52ch] text-muted">{t.bar.body}</p>
            <ul className="mt-10 grid gap-x-10 sm:grid-cols-2">
              {barDrinks.map((d) => (
                <li key={d.id}>
                  <OpenItemButton
                    slug={d.slug}
                    className="flex w-full items-baseline gap-3 border-b border-line py-3.5 text-left hover:text-cobalt"
                  >
                    <span className="text-lg font-medium">{pick(d, "name", lang)}</span>
                    <span className="flex-1" />
                    <span className="tabular-nums">{formatPrice(d.price_cents, lang)}</span>
                  </OpenItemButton>
                </li>
              ))}
            </ul>
            <Link href="/menu" className="mt-8 inline-block font-semibold text-cobalt underline-offset-4 hover:underline">
              {t.bar.all}
            </Link>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-[var(--radius-m)] bg-ink">
            <Image src="/img/c3.jpg" alt="" fill sizes="(min-width: 768px) 38vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Stamp card: the signature */}
      <section className="bg-cobalt text-cobalt-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <h2 className="display max-w-[14ch] text-[clamp(2.6rem,5vw,4.4rem)]">{t.stamp.title}</h2>
            <p className="mt-5 max-w-[44ch] text-lg opacity-90">{t.stamp.body}</p>
            <Link
              href="/karte"
              className="btn mt-8 bg-cobalt-ink text-cobalt hover:bg-[color-mix(in_oklab,var(--cobalt-ink)_88%,var(--cobalt))]"
            >
              {t.stamp.cta}
            </Link>
          </div>
          <div className="rounded-[var(--radius-m)] border-2 border-cobalt-ink/30 p-6 sm:p-8">
            <p className="display mb-6 text-2xl">mahlgrad</p>
            <StampGrid filled={7} animate />
          </div>
        </div>
      </section>

      {/* Beans & gear */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <h2 className="display text-[clamp(2.4rem,4.6vw,3.8rem)]">{t.shop.title}</h2>
        <p className="mt-4 max-w-[56ch] text-muted">{t.shop.body}</p>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {shop.map((p) => {
            const soldOut = p.stock === 0;
            return (
              <li key={p.id}>
                <OpenItemButton slug={p.slug} className="group block w-full text-left">
                  <span className="relative block aspect-square overflow-hidden rounded-[var(--radius-m)] bg-ink">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${soldOut ? "opacity-45 grayscale" : ""}`}
                      />
                    ) : null}
                  </span>
                  <span className="mt-3 block font-semibold">{pick(p, "name", lang)}</span>
                  <span className="mt-0.5 flex items-baseline justify-between gap-2 text-sm">
                    <span className="tabular-nums">{formatPrice(p.price_cents, lang)}</span>
                    {p.stock !== null ? (
                      <span className={soldOut ? "font-semibold text-[#c2412d]" : "text-muted"}>
                        {soldOut ? t.shop.soldOut : fill(t.shop.left, { n: p.stock })}
                      </span>
                    ) : null}
                  </span>
                </OpenItemButton>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Visit */}
      <section id="visit" className="scroll-mt-20">
        <div className="relative aspect-[21/9] min-h-[260px] w-full overflow-hidden bg-ink">
          <Image src="/img/c11.jpg" alt={lang === "de" ? "Der Gastraum" : "The café inside"} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="display text-[clamp(2.2rem,4vw,3.4rem)]">{t.visit.title}</h2>
            <p className="mt-3 text-xl">{t.visit.address}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 md:self-end">
            {hours.map((h) => (
              <div key={h.day}>
                <dt className="text-sm text-muted">{t.days[h.day]}</dt>
                <dd className="font-medium tabular-nums">{h.closed ? t.visit.closed : `${h.open} - ${h.close}`}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
