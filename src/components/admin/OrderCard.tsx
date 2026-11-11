"use client";

import { Clock, Gift } from "@phosphor-icons/react";
import { useLang } from "@/components/LangProvider";
import { fill } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import { formatTime } from "@/lib/slots";
import type { OrderStatus, OrderView } from "@/lib/types";

export function minutesAgo(iso: string, now: number) {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
}

/** Sort key: when the guest wants it (ASAP = when they ordered). */
export const dueAt = (o: OrderView) => o.pickup_at ?? o.created_at;

export function OrderLines({ order, large = false }: { order: OrderView; large?: boolean }) {
  const { lang } = useLang();
  return (
    <ul className={large ? "space-y-2 text-xl" : "space-y-1 text-sm"}>
      {order.lines.map((l, i) => (
        <li key={i}>
          <span className="font-semibold tabular-nums">{l.qty}x</span> {lang === "de" ? l.name_de : l.name_en}
          {l.extras.length > 0 ? (
            <span className="block pl-6 opacity-70">{l.extras.map((e) => (lang === "de" ? e.name_de : e.name_en)).join(", ")}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function PickupBadge({ order }: { order: OrderView }) {
  const { lang, t } = useLang();
  return (
    <span className="inline-flex items-center gap-1 rounded-[var(--radius-m)] bg-cobalt/12 px-2 py-1 text-xs font-semibold text-cobalt">
      <Clock size={14} weight="bold" />
      {order.pickup_at ? fill(t.admin.orders.at, { time: formatTime(order.pickup_at, lang) }) : t.admin.orders.asap}
    </span>
  );
}

export function OrderCard(props: {
  order: OrderView;
  now: number;
  fresh: boolean;
  onMove: (to: OrderStatus) => void;
  onSeen: () => void;
}) {
  const { lang, t } = useLang();
  const { order } = props;
  const next: Partial<Record<OrderStatus, OrderStatus>> = { new: "preparing", preparing: "ready", ready: "done" };
  const to = next[order.status];

  return (
    <article
      onMouseEnter={props.onSeen}
      onFocus={props.onSeen}
      className={`rounded-[var(--radius-m)] bg-card p-4 ${props.fresh ? "ring-2 ring-cobalt" : "ring-1 ring-line"}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-bold tracking-wide">#{order.code}</p>
          <p className="text-sm text-muted">
            {minutesAgo(order.created_at, props.now)} min · {order.customer_name}
          </p>
        </div>
        <PickupBadge order={order} />
      </header>
      <div className="mt-3">
        <OrderLines order={order} />
      </div>
      {order.note ? <p className="mt-3 rounded-[var(--radius-m)] bg-stone p-2 text-sm">{order.note}</p> : null}
      {order.discount_cents > 0 ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt">
          <Gift size={16} weight="bold" /> {t.admin.orders.reward}
        </p>
      ) : null}
      <p className="mt-1 text-sm text-muted">{order.phone}</p>
      <footer className="mt-4 flex items-center gap-2">
        <span className="mr-auto font-semibold tabular-nums">{formatPrice(order.total_cents, lang)}</span>
        <button
          type="button"
          onClick={() => props.onMove("cancelled")}
          className="rounded-[var(--radius-m)] px-3 py-2 text-sm font-medium text-muted hover:bg-line hover:text-ink"
        >
          {t.admin.orders.cancel}
        </button>
        {to ? (
          <button type="button" onClick={() => props.onMove(to)} className="btn btn-primary px-4 py-2 text-sm">
            {t.admin.orders.next[order.status as keyof typeof t.admin.orders.next]}
          </button>
        ) : null}
      </footer>
    </article>
  );
}
