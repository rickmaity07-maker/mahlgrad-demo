"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLang } from "@/components/LangProvider";
import { INTRO_SEEN_KEY } from "./introGate";

gsap.registerPlugin(useGSAP);

/**
 * A single drip falls from the top, the line floods the screen in cobalt,
 * the wordmark surfaces, then the whole sheet lifts away.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || document.documentElement.dataset.introSeen) return;
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      document.documentElement.style.overflow = "hidden";
      const finish = () => {
        document.documentElement.style.overflow = "";
        document.documentElement.dataset.introSeen = "1";
      };

      const spread = Math.ceil(window.innerWidth / 3) + 4; // line is 3px wide
      const tl = gsap.timeline({ onComplete: finish });
      tl.set(".intro-drop", { autoAlpha: 1 })
        .fromTo(".intro-drop", { y: -40 }, { y: "52vh", duration: 0.55, ease: "power2.in" })
        .set(".intro-drop", { autoAlpha: 0 })
        .fromTo(".intro-line", { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: "power3.out" }, "-=0.25")
        .to(".intro-line", { scaleX: spread, duration: 0.85, ease: "power4.inOut" }, "+=0.05")
        .fromTo(
          ".intro-letter",
          // y: 0 clears the pixel offset GSAP parses from the inline translateY(110%).
          { yPercent: 105, y: 0 },
          { yPercent: 0, y: 0, duration: 0.7, stagger: 0.04, ease: "power3.out" },
          "-=0.35",
        )
        .to(el, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "+=0.45");

      el.querySelector("button")?.addEventListener("click", () => tl.progress(1));
      return () => {
        tl.kill();
        finish();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="intro fixed inset-0 z-50 overflow-hidden bg-stone" aria-hidden="true">
      <span className="intro-drop invisible absolute left-[calc(50%-6px)] top-0 size-3 rounded-full bg-cobalt" />
      {/* Initial transforms are inline (not Tailwind scale/translate utilities, which use separate CSS
          properties that would stack on top of GSAP's transform). */}
      <span
        className="intro-line absolute inset-y-0 left-[calc(50%-1.5px)] w-[3px] origin-top bg-cobalt"
        style={{ transform: "scaleY(0)" }}
      />
      <p className="display absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center overflow-hidden pb-2 text-[clamp(3.5rem,14vw,10rem)] text-cobalt-ink">
        {"mahlgrad".split("").map((ch, i) => (
          <span key={i} className="intro-letter inline-block" style={{ transform: "translateY(110%)" }}>
            {ch}
          </span>
        ))}
      </p>
      <button
        type="button"
        tabIndex={-1}
        className="absolute bottom-6 right-6 rounded-[var(--radius-m)] bg-ink/75 px-4 py-2 text-sm text-stone hover:bg-ink"
      >
        {t.intro.skip}
      </button>
    </div>
  );
}
