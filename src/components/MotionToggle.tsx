"use client";

import { useEffect } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { useLang } from "@/components/LangProvider";
import { getMotionPaused, setMotionPaused, useMotionPaused } from "@/lib/motion";

/** Small floating switch that stops every looping clip and the marquee. */
export function MotionToggle() {
  const { t } = useLang();
  const paused = useMotionPaused();

  useEffect(() => {
    document.documentElement.dataset.motion = getMotionPaused() ? "paused" : "on";
  }, []);

  const label = paused ? t.motion.play : t.motion.pause;
  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!paused)}
      aria-pressed={paused}
      aria-label={label}
      title={label}
      className="glass fixed bottom-4 right-4 z-50 grid size-11 place-items-center rounded-full text-ink transition-transform hover:scale-105 active:scale-95 print:hidden"
    >
      {paused ? <Play size={16} weight="fill" aria-hidden /> : <Pause size={16} weight="fill" aria-hidden />}
    </button>
  );
}
