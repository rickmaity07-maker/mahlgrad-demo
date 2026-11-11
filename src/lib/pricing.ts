import {
  DRINK_CATEGORIES,
  OPTION_CATEGORIES,
  type CartLine,
  type Extra,
  type MenuItem,
  type StampCard,
} from "./types";

export type PricedLine = {
  item: MenuItem;
  qty: number;
  extras: Extra[];
  unitCents: number;
  lineCents: number;
};

export type PriceError = "unknown_item" | "unavailable" | "bad_extra" | "soldout" | "empty";
export type PriceResult =
  | { ok: true; lines: PricedLine[]; subtotalCents: number; drinkCount: number; rewardCents: number }
  | { ok: false; error: PriceError };

/**
 * Single source of truth for prices. The client uses it for display;
 * the server re-runs it on submit with fresh DB data, so a tampered cart can't change prices.
 * `rewardCents` is what a free-drink reward takes off: the base price of the dearest drink.
 */
export function priceCart(cart: Pick<CartLine, "itemId" | "qty" | "extras">[], menu: MenuItem[], extras: Extra[]): PriceResult {
  if (cart.length === 0) return { ok: false, error: "empty" };
  const byId = new Map(menu.map((m) => [m.id, m]));
  const extraBySlug = new Map(extras.map((e) => [e.slug, e]));
  const qtyByItem = new Map<number, number>();

  const lines: PricedLine[] = [];
  let subtotalCents = 0;
  let drinkCount = 0;
  let rewardCents = 0;
  for (const c of cart) {
    const item = byId.get(c.itemId);
    if (!item) return { ok: false, error: "unknown_item" };
    if (!item.available) return { ok: false, error: "unavailable" };

    const total = (qtyByItem.get(item.id) ?? 0) + c.qty;
    qtyByItem.set(item.id, total);
    if (item.stock !== null && total > item.stock) return { ok: false, error: "soldout" };

    const chosen: Extra[] = [];
    if (c.extras.length > 0) {
      if (!OPTION_CATEGORIES.includes(item.category)) return { ok: false, error: "bad_extra" };
      let milk = 0;
      for (const slug of new Set(c.extras)) {
        const e = extraBySlug.get(slug);
        if (!e || !e.available) return { ok: false, error: "bad_extra" };
        if (e.grp === "milk" && ++milk > 1) return { ok: false, error: "bad_extra" }; // one milk only
        chosen.push(e);
      }
    }

    const unitCents = item.price_cents + chosen.reduce((s, e) => s + e.price_cents, 0);
    const lineCents = unitCents * c.qty;
    subtotalCents += lineCents;
    if (DRINK_CATEGORIES.includes(item.category)) {
      drinkCount += c.qty;
      rewardCents = Math.max(rewardCents, item.price_cents);
    }
    lines.push({ item, qty: c.qty, extras: chosen, unitCents, lineCents });
  }
  return { ok: true, lines, subtotalCents, drinkCount, rewardCents };
}

export function stampCard(stamps: number, redeemed: number, perReward: number): StampCard {
  const progress = Math.max(0, stamps - redeemed * perReward);
  return { progress, rewards: Math.floor(progress / perReward), perReward };
}

/** Digits only; German local numbers get the 49 prefix, so "0151 2345" and "+49 151 2345" match. */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `49${digits.slice(1)}`;
  return digits;
}

export function formatPrice(cents: number, lang: "de" | "en") {
  return new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-IE", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}
