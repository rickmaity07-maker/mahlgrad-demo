"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Inertia scrolling on desktop, driven by GSAP's ticker so pinned
 * ScrollTrigger chapters stay in sync. Touch devices and visitors who
 * prefer reduced motion keep native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    // from now on, page changes fade in (see .page-enter); the first load does not
    document.documentElement.dataset.navigated = "";
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const lenis = new Lenis({ lerp: 0.11, anchors: { offset: -96 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);
  return null;
}
