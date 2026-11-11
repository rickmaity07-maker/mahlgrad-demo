"use client";

import { useEffect, useState, useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import { useLang } from "@/components/LangProvider";
import { formatPrice } from "@/lib/pricing";
import type { OrderStatus, OrderView } from "@/lib/types";
import { OrderCard, dueAt } from "./OrderCard";
import { useLiveOrders } from "./useLiveOrders";

const COLUMNS = ["new", "preparing", "ready"] as const;

export function OrderBoard({ initial }: { initial: OrderView[] }) {
  const { lang, t } = useLang();
  const { orders, setOrders, fresh, acknowledge, refresh } = useLiveOrders(initial);
  const [now, setNow] = useState(() => Date.now());
  const [, start] = useTransition();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.title = fresh.size > 0 ? `(${fresh.size}) ${t.admin.orders.title}` : t.admin.orders.title;
  }, [fresh.size, t]);

  function move(order: OrderView, to: OrderStatus) {
    acknowledge(order.id);
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: to } : o)));
    start(async () => {
      await setOrderStatus(order.id, to);
      await refresh();
    });
  }

  const finished = orders.filter((o) => o.status === "done");
  const active = orders.filter((o) => o.status !== "done" && o.status !== "cancelled");

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <h1 className="display text-3xl">{t.admin.orders.title}</h1>
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-m)] bg-ok/15 px-2 py-1 text-xs font-semibold text-ok">
          <span className="size-1.5 animate-pulse rounded-full bg-ok motion-reduce:animate-none" aria-hidden />
          {t.admin.orders.live}
        </span>
      </div>

      {active.length === 0 ? (
        <p className="rounded-[var(--radius-m)] border-[1.5px] border-dashed border-line p-10 text-center text-muted">
          {t.admin.orders.empty}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = active.filter((o) => o.status === col).sort((a, b) => dueAt(a).localeCompare(dueAt(b)));
          return (
            <section key={col} aria-label={t.admin.orders.columns[col]}>
              <h2 className="mb-3 flex items-center justify-between text-sm font-semibold">
                {t.admin.orders.columns[col]}
                <span className="rounded-[var(--radius-m)] bg-line px-2 tabular-nums">{list.length}</span>
              </h2>
              <div className="flex flex-col gap-3">
                {list.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    now={now}
                    fresh={fresh.has(o.id)}
                    onSeen={() => acknowledge(o.id)}
                    onMove={(to) => move(o, to)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {finished.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold">
            {t.admin.orders.finished} ({finished.length})
          </h2>
          <ul className="divide-y divide-line rounded-[var(--radius-m)] bg-card px-4">
            {finished.map((o) => (
              <li key={o.id} className="flex items-center gap-4 py-2.5 text-sm">
                <span className="font-mono font-bold">#{o.code}</span>
                <span className="text-muted">{o.customer_name}</span>
                <span className="ml-auto tabular-nums">{formatPrice(o.total_cents, lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
