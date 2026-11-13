"use client";

import { useEffect, useRef } from "react";
import { getMotionPaused } from "@/lib/motion";

type Wisp = { x: number; y: number; r: number; life: number; max: number; drift: number; sway: number; seed: number };

/**
 * Soft steam rising over a photo, drawn on a canvas. It only runs while on screen,
 * stops with the site-wide pause switch and is skipped under reduced motion.
 * `origin` is where the steam leaves the cup, as fractions of the canvas size.
 */
export function Steam({ origin = { x: 0.62, y: 0.62 }, spread = 0.08, className = "" }: {
  origin?: { x: number; y: number };
  spread?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const wisps: Wisp[] = [];
    const spawn = () => {
      const max = 260 + Math.random() * 200;
      wisps.push({
        x: w * (origin.x + (Math.random() - 0.5) * spread),
        y: h * origin.y,
        r: 18 + Math.random() * 26,
        life: 0,
        max,
        drift: 0.35 + Math.random() * 0.35,
        sway: 0.6 + Math.random() * 0.8,
        seed: Math.random() * 1000,
      });
    };

    let raf = 0;
    let visible = false;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      if (getMotionPaused()) return;
      if (wisps.length < 34 && Math.random() < 0.28 * dt) spawn();
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = wisps.length - 1; i >= 0; i--) {
        const p = wisps[i];
        p.life += dt;
        if (p.life > p.max) {
          wisps.splice(i, 1);
          continue;
        }
        const t = p.life / p.max;
        p.y -= p.drift * dt * (h / 700);
        const x = p.x + Math.sin(p.seed + p.life * 0.018) * 22 * p.sway * t;
        const r = p.r * (1 + t * 2.4);
        // fade in quickly, out slowly
        const a = Math.min(1, t * 6) * (1 - t) * 0.09;
        const g = ctx.createRadialGradient(x, p.y, 0, x, p.y, r);
        g.addColorStop(0, `rgba(245, 238, 228, ${a})`);
        g.addColorStop(1, "rgba(245, 238, 228, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [origin.x, origin.y, spread]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 size-full ${className}`} aria-hidden="true" />;
}
