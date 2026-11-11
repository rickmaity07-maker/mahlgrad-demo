export type Lang = "de" | "en";

export const CATEGORIES = ["espresso", "filter", "cold", "food", "beans", "merch"] as const;
export type Category = (typeof CATEGORIES)[number];

/** Drinks earn stamps and can be the free reward. */
export const DRINK_CATEGORIES: readonly Category[] = ["espresso", "filter", "cold"];
/** Drinks that take milk / syrup options. */
export const OPTION_CATEGORIES: readonly Category[] = ["espresso", "cold"];
/** The shop: stock is tracked, no options. */
export const SHOP_CATEGORIES: readonly Category[] = ["beans", "merch"];

export type MenuItem = {
  id: number;
  slug: string;
  category: Category;
  name_de: string;
  name_en: string;
  desc_de: string;
  desc_en: string;
  price_cents: number;
  image: string | null;
  tag: "new" | "oat" | "seasonal" | null;
  stock: number | null;
  available: boolean;
};

export type Extra = {
  id: number;
  slug: string;
  grp: "milk" | "add";
  name_de: string;
  name_en: string;
  price_cents: number;
  available: boolean;
};

export type DayHours = { day: number; open: string; close: string; closed: boolean };

export type CartLine = {
  key: string;
  itemId: number;
  qty: number;
  extras: string[];
};

export const ORDER_STATUSES = ["new", "preparing", "ready", "done", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderLineView = {
  name_de: string;
  name_en: string;
  qty: number;
  extras: { slug: string; name_de: string; name_en: string }[];
  line_cents: number;
};

export type OrderView = {
  id: number;
  code: string;
  customer_name: string;
  phone: string;
  pickup_at: string | null;
  note: string | null;
  status: OrderStatus;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  stamps_earned: number;
  created_at: string;
  lines: OrderLineView[];
};

export type StampCard = { progress: number; rewards: number; perReward: number };
