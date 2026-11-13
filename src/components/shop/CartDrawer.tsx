"use client";

import Link from "next/link";
import { Minus, Plus, X } from "@phosphor-icons/react";
import { useLang } from "@/components/LangProvider";
import { pick } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import { Dialog } from "./Dialog";
import { useShop } from "./ShopProvider";

export function CartDrawer() {
  const { lang, t } = useLang();
  const { drawerOpen, setDrawerOpen, cart, priced, setQty } = useShop();
  const lines = priced.ok ? priced.lines : [];

  return (
    <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} label={t.cart.title} side="right">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="display text-2xl">{t.cart.title}</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t.item.close}
            className="grid size-10 place-items-center rounded-[var(--radius-m)] hover:bg-stone"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-5">
            <p className="text-lg text-muted">{t.cart.empty}</p>
            <Link href="/menu" onClick={() => setDrawerOpen(false)} className="btn btn-ghost">
              {t.cart.toMenu}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5" data-lenis-prevent>
              {lines.map((l, i) => {
                const key = cart[i].key;
                const atMax = l.item.stock !== null && cart.filter((c) => c.itemId === l.item.id).reduce((s, c) => s + c.qty, 0) >= l.item.stock;
                return (
                  <li key={key} className="flex gap-4 py-4">
                    <div className="flex-1">
                      <p className="font-semibold">{pick(l.item, "name", lang)}</p>
                      {l.extras.length > 0 ? (
                        <p className="text-sm text-muted">{l.extras.map((e) => pick(e, "name", lang)).join(", ")}</p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQty(key, l.qty - 1)}
                          className="grid size-8 place-items-center rounded-[var(--radius-m)] border-[1.5px] border-line"
                          aria-label={l.qty === 1 ? t.cart.remove : "-1"}
                        >
                          <Minus size={14} weight="bold" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums">{l.qty}</span>
                        <button
                          type="button"
                          disabled={atMax}
                          onClick={() => setQty(key, l.qty + 1)}
                          className="grid size-8 place-items-center rounded-[var(--radius-m)] border-[1.5px] border-line disabled:opacity-40"
                          aria-label="+1"
                        >
                          <Plus size={14} weight="bold" />
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold tabular-nums">{formatPrice(l.lineCents, lang)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line px-5 py-5">
              <div className="mb-4 flex justify-between text-lg">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold tabular-nums">
                  {priced.ok ? formatPrice(priced.subtotalCents, lang) : "..."}
                </span>
              </div>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)} className="btn btn-primary w-full">
                {t.cart.checkout}
              </Link>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}

export function CartButton() {
  const { t, lang } = useLang();
  const { count, priced, setDrawerOpen } = useShop();
  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      className="btn btn-primary px-3.5 py-2 text-sm"
    >
      {t.nav.cart}
      <span className="tabular-nums">{count}</span>
      {count > 0 && priced.ok ? (
        <span className="hidden border-l border-cobalt-ink/30 pl-2 tabular-nums sm:inline">
          {formatPrice(priced.subtotalCents, lang)}
        </span>
      ) : null}
    </button>
  );
}
