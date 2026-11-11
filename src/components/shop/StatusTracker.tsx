"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import type { OrderStatus } from "@/lib/types";

const POLL_MS = 4000;
const STEPS: OrderStatus[] = ["new", "preparing", "ready", "done"];

export function StatusTracker(props: { code: string; initial: OrderStatus }) {
  const { t } = useLang();
  const [status, setStatus] = useState<OrderStatus>(props.initial);
  const finished = status === "done" || status === "cancelled";

  useEffect(() => {
    if (finished) return;
    let alive = true;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${props.code}`, { cache: "no-store" });
        const json = await res.json();
        if (alive && json.ok) setStatus(json.status);
      } catch {
        /* offline for a moment: next tick retries */
      }
    }, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [props.code, finished]);

  if (status === "cancelled") {
    return <p className="mt-8 rounded-[var(--radius-m)] bg-card p-5 text-lg font-semibold">{t.status.steps.cancelled}</p>;
  }
  const current = STEPS.indexOf(status);

  return (
    <div className="mt-8">
      <ol className="grid grid-cols-4 gap-2" aria-label={t.status.live}>
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === current ? "step" : undefined}>
            <span
              className={`block h-1.5 rounded-full transition-colors duration-500 ${i <= current ? "bg-cobalt" : "bg-line"}`}
            />
            <span className={`mt-2 block text-sm font-semibold ${i <= current ? "" : "text-muted"}`}>{t.status.steps[s]}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-lg font-medium" aria-live="polite">
        {status === "ready" ? t.status.readyNow : t.status.steps[status]}
      </p>
      {!finished ? <p className="mt-1 text-sm text-muted">{t.status.live}</p> : null}
    </div>
  );
}
