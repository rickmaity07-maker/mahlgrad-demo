import "server-only";
import { cache } from "react";
import { sql } from "./db";
import type { DayHours, Extra, MenuItem, OrderView } from "./types";

export const getMenu = cache(async (opts: { includeUnavailable?: boolean } = {}) => {
  const rows = opts.includeUnavailable
    ? await sql`SELECT id, slug, category, name_de, name_en, desc_de, desc_en, price_cents, image, tag, stock, available
                FROM menu_items ORDER BY sort, id`
    : await sql`SELECT id, slug, category, name_de, name_en, desc_de, desc_en, price_cents, image, tag, stock, available
                FROM menu_items WHERE available ORDER BY sort, id`;
  return rows as MenuItem[];
});

export const getExtras = cache(async (opts: { includeUnavailable?: boolean } = {}) => {
  const rows = opts.includeUnavailable
    ? await sql`SELECT id, slug, grp, name_de, name_en, price_cents, available FROM extras ORDER BY sort, id`
    : await sql`SELECT id, slug, grp, name_de, name_en, price_cents, available FROM extras WHERE available ORDER BY sort, id`;
  return rows as Extra[];
});

export type Settings = { hours: DayHours[]; loyalty: { stamps_per_reward: number } };

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = (await sql`SELECT key, value FROM settings`) as { key: string; value: unknown }[];
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    hours: (map.hours as DayHours[]) ?? [],
    loyalty: (map.loyalty as Settings["loyalty"]) ?? { stamps_per_reward: 10 },
  };
});

export const isDemo = () => process.env.DEMO_MODE === "1";

type OrderRow = Omit<OrderView, "lines" | "created_at" | "pickup_at"> & {
  created_at: string | Date;
  pickup_at: string | Date | null;
};
type LineRow = OrderView["lines"][number] & { order_id: number };

async function attachLines(orders: OrderRow[]): Promise<OrderView[]> {
  if (orders.length === 0) return [];
  const ids = orders.map((o) => o.id);
  const lines = (await sql`
    SELECT order_id, name_de, name_en, qty, extras, line_cents
    FROM order_lines WHERE order_id = ANY(${ids}) ORDER BY id`) as LineRow[];
  const byOrder = new Map<number, OrderView["lines"]>();
  for (const { order_id, ...l } of lines) {
    const list = byOrder.get(order_id) ?? [];
    list.push(l);
    byOrder.set(order_id, list);
  }
  return orders.map((o) => ({
    ...o,
    created_at: new Date(o.created_at).toISOString(),
    pickup_at: o.pickup_at ? new Date(o.pickup_at).toISOString() : null,
    lines: byOrder.get(o.id) ?? [],
  }));
}

export async function getOrderByCode(code: string) {
  const rows = (await sql`
    SELECT id, code, customer_name, phone, pickup_at, note, status, subtotal_cents, discount_cents,
           total_cents, stamps_earned, created_at
    FROM orders WHERE code = ${code}`) as OrderRow[];
  return (await attachLines(rows))[0] ?? null;
}

/** Orders still in play plus the last 12 hours of finished ones. */
export async function getActiveOrders() {
  const rows = (await sql`
    SELECT id, code, customer_name, phone, pickup_at, note, status, subtotal_cents, discount_cents,
           total_cents, stamps_earned, created_at
    FROM orders
    WHERE status IN ('new', 'preparing', 'ready') OR created_at > now() - interval '12 hours'
    ORDER BY created_at DESC LIMIT 200`) as OrderRow[];
  return attachLines(rows);
}
