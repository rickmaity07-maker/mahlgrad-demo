import type { CartLine } from "@/lib/types";

// localStorage-backed cart, read through useSyncExternalStore (no setState-in-effect, no hydration mismatch).
const STORAGE_KEY = "mahlgrad.cart.v1";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (l): l is CartLine =>
        typeof l?.key === "string" && typeof l?.itemId === "number" && Number.isInteger(l?.qty) && l.qty > 0 && Array.isArray(l?.extras),
    );
  } catch {
    return EMPTY;
  }
}

export function getCart() {
  if (cache === null) cache = readStored();
  return cache;
}

export function getServerCart() {
  return EMPTY;
}

export function setCart(update: (prev: CartLine[]) => CartLine[]) {
  cache = update(getCart());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* private mode: cart lives in memory only */
  }
  for (const l of listeners) l();
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null; // another tab changed the cart
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
