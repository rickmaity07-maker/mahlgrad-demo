"use client";

import { useEffect, useRef, useState } from "react";
import { Coffee } from "@phosphor-icons/react";

/**
 * Ten stamp circles. With `animate`, filled stamps press in one after another
 * the first time the card scrolls into view (instant under reduced motion).
 */
export function StampGrid(props: { filled: number; total?: number; animate?: boolean; tone?: "onCobalt" | "onCard" }) {
  const total = props.total ?? 10;
  const ref = useRef<HTMLOListElement>(null);
  const [shown, setShown] = useState(!props.animate);

  useEffect(() => {
    if (!props.animate || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [props.animate]);

  const onCobalt = props.tone !== "onCard";
  return (
    <ol ref={ref} className="grid grid-cols-5 gap-3 sm:gap-4" aria-label={`${props.filled} / ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const on = i < props.filled;
        const last = i === total - 1;
        return (
          <li
            key={i}
            className={`grid aspect-square place-items-center rounded-full border-2 ${last ? "border-dashed" : ""} ${
              onCobalt ? "border-cobalt-ink/45" : "border-line"
            }`}
          >
            <span
              className={`grid size-full place-items-center rounded-full transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
                onCobalt ? "bg-cobalt-ink text-cobalt" : "bg-cobalt text-cobalt-ink"
              } ${on && shown ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
              style={{ transitionDelay: shown ? `${i * 110}ms` : "0ms" }}
            >
              <Coffee size={22} weight="fill" aria-hidden />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
