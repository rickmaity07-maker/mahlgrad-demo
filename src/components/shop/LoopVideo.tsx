"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPaused } from "@/lib/motion";

/**
 * Muted looping clip laid over its poster photo. It only loads once near the screen, only plays
 * while visible (seven clips never run at once), fades in on its first frame, stops with the
 * site-wide "pause animations" switch (WCAG 2.2.2), and is skipped entirely for reduced motion
 * or Save-Data, where the poster photo underneath simply stays.
 */
export function LoopVideo({ src, eager = false }: { src: string; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const paused = useMotionPaused();
  const [enabled, setEnabled] = useState(false);
  const [near, setNear] = useState(eager);
  const [visible, setVisible] = useState(eager);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only preferences after mount
    setEnabled(!reduce && !saveData);
  }, []);

  // track whether the clip is on (or near) the screen
  useEffect(() => {
    const v = ref.current;
    if (!enabled || !v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [enabled]);

  // play only when loaded, on screen and not paused by the visitor
  useEffect(() => {
    const v = ref.current;
    if (!enabled || !v || !near) return;
    if (visible && !paused) v.play().catch(() => {});
    else v.pause();
  }, [enabled, near, visible, paused]);

  if (!enabled) return null;
  return (
    <video
      ref={ref}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${shown ? "opacity-100" : "opacity-0"}`}
      src={near ? src : undefined}
      muted
      loop
      playsInline
      preload={eager ? "auto" : "none"}
      onLoadedData={() => setShown(true)}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
