"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLang } from "@/components/LangProvider";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** one photo per step: roast, grind, brew, pick up */
const PHOTOS = ["/img/c4.jpg", "/img/c3.jpg", "/img/c8.jpg", "/img/c1.jpg"];

/**
 * Pinned chapter "from bean to cup": while the section is pinned, scrolling
 * crossfades four photos (each settling from a slow push-in) and swaps the copy.
 * Visitors who prefer reduced motion get the four steps as a plain list instead.
 */
export function CraftChapter() {
  const root = useRef<HTMLElement>(null);
  const { t } = useLang();
  const steps = t.craft.steps;

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const photos = gsap.utils.toArray<HTMLElement>(".craft-photo", section);
        const copies = gsap.utils.toArray<HTMLElement>(".craft-copy", section);
        const chips = gsap.utils.toArray<HTMLElement>(".craft-chip", section);
        const bar = section.querySelector<HTMLElement>(".craft-bar");

        gsap.set(photos.slice(1), { opacity: 0, scale: 1.14 });
        gsap.set(photos[0], { scale: 1.06 });
        gsap.set(copies.slice(1), { opacity: 0, y: 40 });

        let active = -1;
        const mark = (i: number) => {
          if (i === active) return;
          active = i;
          chips.forEach((c, j) => c.toggleAttribute("data-on", j === i));
        };
        mark(0);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * (photos.length - 0.4)}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (st) => {
              mark(Math.min(photos.length - 1, Math.round(st.progress * (photos.length - 1))));
              if (bar) bar.style.transform = `scaleX(${st.progress})`;
            },
          },
        });
        tl.to(photos[0], { scale: 1, duration: 0.6, ease: "none" }, 0);
        for (let i = 1; i < photos.length; i++) {
          const at = i - 0.5;
          tl.to(photos[i - 1], { opacity: 0, duration: 0.5 }, at)
            .to(photos[i], { opacity: 1, scale: 1, duration: 0.9 }, at)
            .to(copies[i - 1], { opacity: 0, y: -40, duration: 0.35 }, at)
            .to(copies[i], { opacity: 1, y: 0, duration: 0.4 }, at + 0.2);
        }
        tl.to({}, { duration: 0.3 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <>
      {/* animated, pinned version */}
      <section
        ref={root}
        aria-label={t.craft.eyebrow}
        className="relative h-svh min-h-[620px] overflow-hidden bg-espresso motion-reduce:hidden"
      >
        <div className="absolute inset-0 overflow-hidden md:left-[42%]">
          {PHOTOS.map((src) => (
            <div key={src} className="craft-photo absolute inset-0 will-change-transform">
              <Image src={src} alt="" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
            </div>
          ))}
          {/* phone: darken the photo under the copy; desktop: blend its left edge into the espresso panel */}
          <div
            className="absolute inset-0 md:hidden"
            style={{ background: "linear-gradient(0deg, #13100e 8%, rgb(19 16 14 / 0.75) 42%, rgb(19 16 14 / 0.15) 75%)" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 left-0 hidden w-48 md:block"
            style={{ background: "linear-gradient(90deg, #13100e, transparent)" }}
            aria-hidden="true"
          />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 md:justify-center md:pb-0">
          <p className="eyebrow">{t.craft.eyebrow}</p>
          <div className="relative mt-4 h-[15rem] md:h-[19rem] md:w-[38%]">
            {steps.map((s) => (
              <div key={s.key} className="craft-copy absolute inset-x-0 top-0">
                <h2 className="display text-[clamp(2.4rem,4.6vw,4.4rem)]">{s.title}</h2>
                <p className="mt-5 max-w-[38ch] text-lg text-ink/85">{s.body}</p>
              </div>
            ))}
          </div>
          <ol className="mt-6 flex gap-2 md:w-[38%]" aria-hidden="true">
            {steps.map((s) => (
              <li
                key={s.key}
                className="craft-chip rounded-[var(--radius-m)] border border-line px-3 py-1.5 text-sm font-semibold text-muted transition-colors data-[on]:border-cobalt data-[on]:bg-cobalt data-[on]:text-cobalt-ink"
              >
                {s.key}
              </li>
            ))}
          </ol>
          <div className="mt-6 h-0.5 w-full bg-line md:w-[38%]">
            <div className="craft-bar h-0.5 origin-left bg-cobalt" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </section>

      {/* reduced motion: the same four steps, no pinning */}
      <section aria-label={t.craft.eyebrow} className="hidden bg-espresso py-24 motion-reduce:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">{t.craft.eyebrow}</p>
          <ol className="mt-10 grid gap-10 md:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.key}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-m)]">
                  <Image src={PHOTOS[i]} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                </div>
                <h2 className="display mt-5 text-3xl">{s.title}</h2>
                <p className="mt-2 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
