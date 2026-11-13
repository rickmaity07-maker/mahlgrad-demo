import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BRAND } from "@/brand.config";
import { CraftChapter } from "@/components/shop/CraftChapter";
import { CremaRing } from "@/components/shop/CremaRing";
import { OpenItemButton } from "@/components/shop/OpenItemButton";
import { ReviewWall } from "@/components/shop/ReviewWall";
import { StampGrid } from "@/components/shop/StampGrid";
import { Steam } from "@/components/shop/Steam";
import { getMenu, getSettings } from "@/lib/data";
import { fill, pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { pitchName } from "@/lib/pitch";
import { formatPrice } from "@/lib/pricing";
import { openNow } from "@/lib/slots";
import { SHOP_CATEGORIES } from "@/lib/types";

export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const name = pitchName((await searchParams).for);
  if (!name) return {};
  const title = `Entwurf für ${name}`;
  const description = `Ein Website-Entwurf für ${name}: Karte, Vorbestellung mit Abholzeit und digitale Stempelkarte.`;
  const image = { url: `/api/og?for=${encodeURIComponent(name)}`, width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    // personalised pitch pages stay out of search engines
    robots: { index: false, follow: false },
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const [{ lang, t }, menu, settings, params] = await Promise.all([getDict(), getMenu(), getSettings(), searchParams]);
  const forName = pitchName(params.for);
  const isOpen = openNow(settings.hours);
  const barDrinks = menu.filter((m) => m.category === "espresso" || m.category === "filter");
  const shop = menu.filter((m) => SHOP_CATEGORIES.includes(m.category));
  const hours = [1, 2, 3, 4, 5, 6, 0].map((d) => settings.hours.find((h) => h.day === d)).filter((h) => h !== undefined);

  return (
    <>
      {/* Hero: a hand-poured filter, steam rising, the camera slowly leaning in */}
      <section className="grain relative -mt-24 flex min-h-[100svh] items-end overflow-hidden bg-espresso">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/img/c8.jpg"
            alt={lang === "de" ? "Filterkaffee wird von Hand aufgegossen" : "Filter coffee being poured by hand"}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="kenburns object-cover object-[62%_50%]"
            style={{ ["--kb-origin" as string]: "62% 45%" }}
          />
        </div>
        <Steam origin={{ x: 0.62, y: 0.5 }} spread={0.06} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(19 16 14 / 0.92) 0%, rgb(19 16 14 / 0.55) 40%, transparent 70%), linear-gradient(0deg, #13100e 2%, transparent 45%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20">
          {forName ? (
            <p className="glass mb-6 inline-flex rounded-[var(--radius-m)] px-4 py-2 text-sm font-semibold">
              {fill(t.pitch.eyebrow, { name: forName })}
            </p>
          ) : null}
          <p className={`text-sm font-semibold ${isOpen ? "text-ok" : "text-muted"}`}>
            {isOpen ? t.hero.openNow : t.hero.closedNow}
          </p>
          <h1 className="display mt-4 max-w-5xl text-[clamp(3.4rem,7.4vw,7.6rem)]">{t.hero.title}</h1>
          <p className="mt-6 max-w-[42ch] text-lg text-ink/90 md:text-xl">{t.hero.sub}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/menu" className="btn btn-primary text-lg">
              {t.hero.cta}
              <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
            <Link href="/karte" className="btn btn-ghost text-lg">
              {t.nav.card}
            </Link>
            <a href="#bar" className="ml-2 hidden items-center gap-2 text-sm font-medium text-ink/75 hover:text-ink md:inline-flex">
              <ArrowDown size={16} aria-hidden />
              {t.hero.scroll}
            </a>
          </div>
        </div>
      </section>

      {/* At the bar: the price list beside a slowly turning black coffee */}
      <section id="bar" className="relative scroll-mt-24 overflow-hidden py-28 md:py-40">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 md:grid-cols-[1.25fr_1fr]">
          <div>
            <h2 className="display text-[clamp(2.6rem,5vw,4.6rem)]">{t.bar.title}</h2>
            <p className="mt-5 max-w-[50ch] text-lg text-muted">{t.bar.body}</p>
            <ul className="mt-12 grid gap-x-10 sm:grid-cols-2">
              {barDrinks.map((d) => (
                <li key={d.id}>
                  <OpenItemButton
                    slug={d.slug}
                    className="flex w-full items-baseline gap-3 border-b border-line py-4 text-left transition-colors hover:text-cobalt"
                  >
                    <span className="text-lg font-medium">{pick(d, "name", lang)}</span>
                    <span className="flex-1" />
                    <span className="tabular-nums">{formatPrice(d.price_cents, lang)}</span>
                  </OpenItemButton>
                </li>
              ))}
            </ul>
            <Link
              href="/menu"
              className="mt-10 inline-flex items-center gap-2 font-semibold text-cobalt underline-offset-4 hover:underline"
            >
              {t.bar.all}
              <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
          <CremaRing text={t.ring} className="mx-auto w-full max-w-[30rem]" />
        </div>
      </section>

      <CraftChapter />

      {/* Stamp card: the signature, with the regulars' table turning behind it */}
      <section className="relative overflow-hidden bg-cobalt text-cobalt-ink">
        <div
          className="pointer-events-none absolute -right-[20%] top-1/2 aspect-square w-[70rem] max-w-none -translate-y-1/2 overflow-hidden rounded-full opacity-[0.1] mix-blend-luminosity md:-right-[12%]"
          aria-hidden="true"
        >
          <Image src="/img/c13.jpg" alt="" fill sizes="70rem" className="spin-slow object-cover" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-28 sm:px-6 md:grid-cols-2 md:py-40">
          <div>
            <h2 className="display max-w-[14ch] text-[clamp(2.8rem,5.4vw,5rem)]">{t.stamp.title}</h2>
            <p className="mt-6 max-w-[44ch] text-lg">{t.stamp.body}</p>
            <Link href="/karte" className="btn mt-9 bg-cobalt-ink text-cobalt hover:bg-[color-mix(in_oklab,var(--cobalt-ink)_86%,var(--cobalt))]">
              {t.stamp.cta}
            </Link>
          </div>
          <div className="rounded-[var(--radius-m)] border-2 border-cobalt-ink/30 bg-cobalt/40 p-6 backdrop-blur-sm sm:p-8">
            <p className="display mb-6 text-2xl">{BRAND.wordmark}</p>
            <StampGrid filled={7} animate />
          </div>
        </div>
      </section>

      {/* Beans & gear */}
      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="display text-[clamp(2.6rem,5vw,4.6rem)]">{t.shop.title}</h2>
          <p className="mt-5 max-w-[56ch] text-lg text-muted">{t.shop.body}</p>
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {shop.map((p) => {
              const soldOut = p.stock === 0;
              return (
                <li key={p.id}>
                  <OpenItemButton slug={p.slug} className="group block w-full text-left">
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-m)] bg-card">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${soldOut ? "opacity-45 grayscale" : ""}`}
                        />
                      ) : null}
                    </span>
                    <span className="mt-4 block text-lg font-semibold">{pick(p, "name", lang)}</span>
                    <span className="mt-0.5 flex items-baseline justify-between gap-2 text-sm">
                      <span className="tabular-nums">{formatPrice(p.price_cents, lang)}</span>
                      {p.stock !== null ? (
                        <span className={soldOut ? "font-semibold text-danger" : "text-muted"}>
                          {soldOut ? t.shop.soldOut : fill(t.shop.left, { n: p.stock })}
                        </span>
                      ) : null}
                    </span>
                  </OpenItemButton>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <ReviewWall lang={lang} title={t.reviews.title} note={t.reviews.note} />

      {/* Visit: the room, slowly drifting, with the hours on glass */}
      <section id="visit" className="grain relative isolate scroll-mt-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/img/c11.jpg"
            alt={lang === "de" ? "Der Gastraum" : "The café inside"}
            fill
            sizes="100vw"
            className="kenburns object-cover"
            style={{ ["--kb-origin" as string]: "40% 50%" }}
          />
          <div className="absolute inset-0 bg-espresso/70" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-32 sm:px-6 md:grid-cols-[1fr_1.4fr] md:items-end md:py-44">
          <div>
            <h2 className="display text-[clamp(2.8rem,5.4vw,5rem)]">{t.visit.title}</h2>
            <p className="mt-4 text-xl">{t.visit.address}</p>
          </div>
          <dl className="glass grid grid-cols-2 gap-x-8 gap-y-4 rounded-[var(--radius-m)] p-6 sm:grid-cols-4 sm:p-8">
            {hours.map((h) => (
              <div key={h.day}>
                <dt className="text-sm text-ink/75">{t.days[h.day]}</dt>
                <dd className="mt-0.5 font-medium tabular-nums">{h.closed ? t.visit.closed : `${h.open} - ${h.close}`}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
