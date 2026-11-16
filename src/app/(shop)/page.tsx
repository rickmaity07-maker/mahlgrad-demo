import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BRAND } from "@/brand.config";
import { CraftChapter } from "@/components/shop/CraftChapter";
import { FlowMedia } from "@/components/shop/FlowMedia";
import { OpenItemButton } from "@/components/shop/OpenItemButton";
import { ReviewWall } from "@/components/shop/ReviewWall";
import { StampGrid } from "@/components/shop/StampGrid";
import { Steam } from "@/components/shop/Steam";
import { getMenu, getSettings } from "@/lib/data";
import { fill, pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { CLIPS } from "@/lib/media";
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

/** "Hell geröstet. Langsam gebrüht." -> the second sentence set in copper italic */
function twoTone(title: string): ReactNode {
  const i = title.indexOf(". ");
  if (i < 0) return title;
  return (
    <>
      {title.slice(0, i + 1)} <em>{title.slice(i + 2)}</em>
    </>
  );
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
      {/* Hero: one full-screen moving picture, the headline set large over its dark left side */}
      <section className="grain relative -mt-24 flex min-h-[100svh] items-end overflow-hidden bg-espresso">
        <FlowMedia
          clip={CLIPS.hero}
          poster="/img/c8.jpg"
          alt={lang === "de" ? "Filterkaffee wird von Hand aufgegossen" : "Filter coffee being poured by hand"}
          sizes="100vw"
          priority
          drift="62% 45%"
        />
        {CLIPS.hero ? null : <Steam origin={{ x: 0.62, y: 0.5 }} spread={0.06} />}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(20 16 13 / 0.9) 0%, rgb(20 16 13 / 0.5) 42%, transparent 72%), linear-gradient(0deg, #14100d 0%, transparent 50%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
          {forName ? (
            <p className="glass mb-8 inline-flex rounded-[var(--radius-m)] px-4 py-2 text-sm font-medium">
              {fill(t.pitch.eyebrow, { name: forName })}
            </p>
          ) : null}
          <p className="flex items-center gap-2.5 text-sm font-medium tracking-wide text-ink/85">
            <span className={`size-2 rounded-full ${isOpen ? "bg-ok" : "bg-muted"}`} aria-hidden="true" />
            {isOpen ? t.hero.openNow : t.hero.closedNow}
            <span className="text-ink/40" aria-hidden="true">
              /
            </span>
            {BRAND.street}
          </p>
          <h1 className="display mt-6 max-w-6xl text-[clamp(3.6rem,9vw,9.5rem)]">{twoTone(t.hero.title)}</h1>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
            <p className="max-w-[40ch] text-lg leading-relaxed text-ink/85 md:text-xl">{t.hero.sub}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/menu" className="btn btn-primary text-base">
                {t.hero.cta}
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
              <Link href="/karte" className="btn btn-ghost text-base">
                {t.nav.card}
              </Link>
              <a href="#bar" className="ml-3 hidden items-center gap-2 text-sm text-ink/70 hover:text-ink md:inline-flex">
                <ArrowDown size={16} aria-hidden />
                {t.hero.scroll}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* At the bar: a tall moving picture beside the price list */}
      <section id="bar" className="relative scroll-mt-24 py-28 md:py-44">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-m)]">
            <FlowMedia
              clip={CLIPS.latte}
              poster="/img/c1.jpg"
              alt={lang === "de" ? "Zwei Flat Whites mit Latte Art" : "Two flat whites with latte art"}
              sizes="(min-width: 768px) 42vw, 100vw"
              drift="50% 40%"
            />
          </div>
          <div>
            <p className="eyebrow">Espresso &middot; Filter</p>
            <h2 className="display mt-5 text-[clamp(3rem,6vw,5.6rem)]">{t.bar.title}</h2>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">{t.bar.body}</p>
            <ul className="mt-12 border-t border-line">
              {barDrinks.map((d) => (
                <li key={d.id}>
                  <OpenItemButton slug={d.slug} className="group flex w-full items-baseline gap-4 border-b border-line py-4 text-left">
                    <span className="display text-[1.75rem] transition-colors group-hover:text-copper">{pick(d, "name", lang)}</span>
                    <span className="flex-1 -translate-y-1 border-b border-dotted border-line" aria-hidden="true" />
                    <span className="tabular-nums text-ink/85">{formatPrice(d.price_cents, lang)}</span>
                  </OpenItemButton>
                </li>
              ))}
            </ul>
            <Link href="/menu" className="mt-10 inline-flex items-center gap-2 font-medium text-copper underline-offset-4 hover:underline">
              {t.bar.all}
              <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <CraftChapter />

      {/* Stamp card: steam drifting through the dark, the card on glass */}
      <section className="grain relative isolate overflow-hidden bg-espresso">
        {/* faded in with a mask (not an overlay), so its edges never show as a line */}
        <div
          className="absolute inset-y-0 right-0 -z-10 w-full opacity-60 md:w-[66%]"
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 45%), linear-gradient(0deg, transparent, #000 18%, #000 82%, transparent)",
            maskComposite: "intersect",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 45%), linear-gradient(0deg, transparent, #000 18%, #000 82%, transparent)",
            WebkitMaskComposite: "source-in",
          }}
        >
          <FlowMedia clip={CLIPS.steam} poster="/img/c5-top.jpg" alt="" sizes="(min-width: 768px) 66vw, 100vw" drift="50% 50%" />
          {CLIPS.steam ? null : <Steam origin={{ x: 0.5, y: 0.55 }} spread={0.1} />}
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-32 sm:px-6 md:grid-cols-2 md:py-48">
          <div>
            <p className="eyebrow">{t.nav.card}</p>
            <h2 className="display mt-5 max-w-[13ch] text-[clamp(3rem,6vw,5.6rem)]">{twoTone(t.stamp.title)}</h2>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-ink/85">{t.stamp.body}</p>
            <Link href="/karte" className="btn btn-primary mt-10">
              {t.stamp.cta}
              <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
          </div>
          <div className="glass rounded-[var(--radius-m)] p-7 sm:p-9">
            <div className="mb-7 flex items-baseline justify-between">
              <p className="display text-3xl">{BRAND.wordmark}</p>
              <p className="text-sm tabular-nums text-muted">7 / 10</p>
            </div>
            <StampGrid filled={7} animate tone="onCard" />
          </div>
        </div>
      </section>

      {/* Beans for home: a wide moving banner, then the bags */}
      <section className="py-28 md:py-44">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative isolate flex aspect-[4/5] items-end overflow-hidden rounded-[var(--radius-m)] sm:aspect-[21/9]">
            <FlowMedia
              clip={CLIPS.beans}
              poster="/img/c4.jpg"
              alt=""
              sizes="(min-width: 1280px) 1232px, 100vw"
              drift="40% 60%"
              className="-z-10"
            />
            <div
              className="absolute inset-0 -z-10"
              style={{ background: "linear-gradient(0deg, rgb(20 16 13 / 0.92) 0%, rgb(20 16 13 / 0.2) 60%)" }}
              aria-hidden="true"
            />
            <div className="p-7 sm:p-12">
              <h2 className="display text-[clamp(3rem,6vw,5.6rem)]">{t.shop.title}</h2>
              <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink/85">{t.shop.body}</p>
            </div>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
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
                    <span className="display mt-5 block text-[1.6rem] transition-colors group-hover:text-copper">
                      {pick(p, "name", lang)}
                    </span>
                    <span className="mt-1 flex items-baseline justify-between gap-2 text-sm">
                      <span className="tabular-nums text-ink/85">{formatPrice(p.price_cents, lang)}</span>
                      {p.stock !== null ? (
                        <span className={soldOut ? "font-medium text-danger" : "text-muted"}>
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

      {/* Visit: the room, slowly drifting, the hours on glass */}
      <section id="visit" className="grain relative isolate scroll-mt-24 overflow-hidden">
        <FlowMedia
          clip={CLIPS.visit}
          poster="/img/c12.jpg"
          alt={lang === "de" ? "Die Bar mit Siebträgermaschine" : "The bar with its espresso machine"}
          sizes="100vw"
          drift="40% 50%"
          className="-z-10"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(180deg, #14100d 0%, rgb(20 16 13 / 0.6) 22%, rgb(20 16 13 / 0.6) 60%, #14100d 100%)" }}
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-36 sm:px-6 md:grid-cols-[1fr_1.4fr] md:items-end md:py-52">
          <div>
            <h2 className="display text-[clamp(3.4rem,7vw,6.5rem)]">{t.visit.title}</h2>
            <p className="mt-5 text-xl text-ink/85">{t.visit.address}</p>
          </div>
          <dl className="glass grid grid-cols-2 gap-x-8 gap-y-5 rounded-[var(--radius-m)] p-7 sm:grid-cols-4 sm:p-9">
            {hours.map((h) => (
              <div key={h.day}>
                <dt className="text-sm text-ink/70">{t.days[h.day]}</dt>
                <dd className="mt-1 font-medium tabular-nums">{h.closed ? t.visit.closed : `${h.open} - ${h.close}`}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
