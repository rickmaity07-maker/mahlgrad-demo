"use client";

import { useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import { useLang } from "@/components/LangProvider";
import type { OrderView } from "@/lib/types";
import { OrderLines, PickupBadge, dueAt } from "./OrderCard";
import { useLiveOrders } from "./useLiveOrders";

/** Big tickets for the barista: accepted and new orders, ordered by pickup time. */
export function BarScreen({ initial }: { initial: OrderView[] }) {
  const { t } = useLang();
  const { orders, setOrders, refresh } = useLiveOrders(initial);
  const [, start] = useTransition();
  const tickets = orders
    .filter((o) => o.status === "new" || o.status === "preparing")
    .sort((a, b) => dueAt(a).localeCompare(dueAt(b)));

  function advance(o: OrderView) {
    const to = o.status === "new" ? "preparing" : "ready";
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: to } : x)));
    start(async () => {
      await setOrderStatus(o.id, to);
      await refresh();
    });
  }

  return (
    <div>
      <h1 className="display mb-5 text-3xl">{t.admin.bar.title}</h1>
      {tickets.length === 0 ? (
        <p className="grid min-h-[50dvh] place-items-center rounded-[var(--radius-m)] border-[1.5px] border-dashed border-line text-2xl text-muted">
          {t.admin.bar.empty}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tickets.map((o) => (
            <article key={o.id} className="flex flex-col rounded-[var(--radius-m)] bg-ink p-5 text-stone">
              <header className="mb-4 flex items-center justify-between gap-3">
                <span className="font-mono text-3xl font-bold">#{o.code}</span>
                <span className="rounded-[var(--radius-m)] bg-stone">
                  <PickupBadge order={o} />
                </span>
              </header>
              <p className="mb-3 text-lg font-semibold">{o.customer_name}</p>
              <div className="flex-1">
                <OrderLines order={o} large />
                {o.note ? <p className="mt-4 rounded-[var(--radius-m)] bg-cobalt p-3 text-lg text-cobalt-ink">{o.note}</p> : null}
              </div>
              <button type="button" onClick={() => advance(o)} className="btn btn-primary mt-5 py-4 text-lg">
                {o.status === "new" ? t.admin.orders.next.new : t.admin.bar.done}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
