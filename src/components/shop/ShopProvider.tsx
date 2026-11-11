"use client";

import { createContext, use, useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { priceCart, type PriceResult } from "@/lib/pricing";
import type { CartLine, Extra, MenuItem } from "@/lib/types";
import { getCart, getServerCart, setCart, subscribeCart } from "./cartStore";

type NewLine = Omit<CartLine, "key">;

type ShopState = {
  menu: MenuItem[];
  extras: Extra[];
  slots: string[];
  asapOpen: boolean;
  cart: CartLine[];
  priced: PriceResult;
  count: number;
  add: (line: NewLine) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  sheetItem: MenuItem | null;
  openItem: (item: MenuItem) => void;
  closeItem: () => void;
};

const ShopContext = createContext<ShopState | null>(null);

/** Same item with the same options merges into one line. */
const lineKey = (l: NewLine) => `${l.itemId}|${[...l.extras].sort().join(",")}`;

export function ShopProvider(props: {
  menu: MenuItem[];
  extras: Extra[];
  slots: string[];
  asapOpen: boolean;
  children: React.ReactNode;
}) {
  const { menu, extras, slots, asapOpen } = props;
  const stored = useSyncExternalStore(subscribeCart, getCart, getServerCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);

  // Lines whose item left the menu (or was switched off) are ignored, not priced.
  const cart = useMemo(() => {
    const ids = new Set(menu.map((m) => m.id));
    return stored.filter((l) => ids.has(l.itemId));
  }, [stored, menu]);

  const add = useCallback((line: NewLine) => {
    const key = lineKey(line);
    setCart((prev) => {
      const hit = prev.find((l) => l.key === key);
      if (hit) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(20, l.qty + line.qty) } : l));
      return [...prev, { ...line, key }];
    });
  }, []);
  const setQty = useCallback(
    (key: string, qty: number) =>
      setCart((prev) =>
        qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(20, qty) } : l)),
      ),
    [],
  );
  const clear = useCallback(() => setCart(() => []), []);
  const openItem = useCallback((item: MenuItem) => setSheetItem(item), []);
  const closeItem = useCallback(() => setSheetItem(null), []);

  const priced = useMemo(() => priceCart(cart, menu, extras), [cart, menu, extras]);
  const count = cart.reduce((s, l) => s + l.qty, 0);

  const value: ShopState = {
    menu,
    extras,
    slots,
    asapOpen,
    cart,
    priced,
    count,
    add,
    setQty,
    clear,
    drawerOpen,
    setDrawerOpen,
    sheetItem,
    openItem,
    closeItem,
  };
  return <ShopContext value={value}>{props.children}</ShopContext>;
}

export function useShop() {
  const ctx = use(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
