"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, X } from "@phosphor-icons/react";
import { useLang } from "@/components/LangProvider";
import { fill, pick } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import { OPTION_CATEGORIES, type MenuItem } from "@/lib/types";
import { Dialog } from "./Dialog";
import { useShop } from "./ShopProvider";

export function ItemSheet() {
  const { sheetItem, closeItem } = useShop();
  const { t } = useLang();
  return (
    <Dialog open={sheetItem !== null} onClose={closeItem} label={t.item.close}>
      {sheetItem ? <ItemForm key={sheetItem.id} item={sheetItem} /> : null}
    </Dialog>
  );
}

const chip = (on: boolean) =>
  `cursor-pointer rounded-[var(--radius-m)] border-[1.5px] px-3.5 py-2 text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalt ${
    on ? "border-cobalt bg-cobalt text-cobalt-ink" : "border-line hover:border-ink"
  }`;

function ItemForm({ item }: { item: MenuItem }) {
  const { lang, t } = useLang();
  const { extras, add, closeItem, setDrawerOpen, cart } = useShop();
  const hasOptions = OPTION_CATEGORIES.includes(item.category);
  const milks = extras.filter((e) => e.grp === "milk");
  const adds = extras.filter((e) => e.grp === "add");

  const [milk, setMilk] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const inCart = cart.filter((l) => l.itemId === item.id).reduce((s, l) => s + l.qty, 0);
  const maxQty = item.stock === null ? 20 : Math.max(0, item.stock - inCart);
  const soldOut = maxQty === 0;
  const picked = [...(milk ? [milk] : []), ...chosen];
  const unit = item.price_cents + extras.filter((e) => picked.includes(e.slug)).reduce((s, e) => s + e.price_cents, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (soldOut) return;
    add({ itemId: item.id, qty: Math.min(qty, maxQty), extras: picked });
    closeItem();
    setDrawerOpen(true);
  }

  return (
    <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
      {item.image ? (
        <div className="relative aspect-[16/10] shrink-0 bg-ink">
          <Image src={item.image} alt="" fill sizes="512px" className="object-cover" />
        </div>
      ) : null}
      <button
        type="button"
        onClick={closeItem}
        aria-label={t.item.close}
        className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-[var(--radius-m)] bg-card text-ink shadow-sm"
      >
        <X size={18} weight="bold" />
      </button>

      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-5" data-lenis-prevent>
        <h2 className="display pr-12 text-3xl">{pick(item, "name", lang)}</h2>
        <p className="mt-2 text-muted">{pick(item, "desc", lang)}</p>
        {item.stock !== null ? (
          <p className={`mt-3 text-sm font-semibold ${soldOut ? "text-danger" : "text-muted"}`}>
            {soldOut ? t.item.soldOut : fill(t.item.left, { n: maxQty })}
          </p>
        ) : null}

        {hasOptions && milks.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="font-semibold">{t.item.milk}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className={chip(milk === null)}>
                <input type="radio" name="milk" className="sr-only" checked={milk === null} onChange={() => setMilk(null)} />
                {t.item.milkDefault}
              </label>
              {milks.map((m) => (
                <label key={m.slug} className={chip(milk === m.slug)}>
                  <input type="radio" name="milk" className="sr-only" checked={milk === m.slug} onChange={() => setMilk(m.slug)} />
                  {pick(m, "name", lang)} +{formatPrice(m.price_cents, lang)}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {hasOptions && adds.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="font-semibold">{t.item.add}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {adds.map((x) => {
                const on = chosen.includes(x.slug);
                return (
                  <label key={x.slug} className={chip(on)}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => setChosen((c) => (on ? c.filter((s) => s !== x.slug) : [...c, x.slug]))}
                    />
                    {pick(x, "name", lang)} +{formatPrice(x.price_cents, lang)}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}
      </div>

      <div className="flex items-center gap-3 border-t border-line px-5 py-4">
        <div className="flex items-center gap-1" role="group" aria-label={t.item.qty}>
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-10 place-items-center rounded-[var(--radius-m)] border-[1.5px] border-line"
            aria-label="-1"
          >
            <Minus size={16} weight="bold" />
          </button>
          <output className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
            {qty}
          </output>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(Math.max(1, maxQty), q + 1))}
            className="grid size-10 place-items-center rounded-[var(--radius-m)] border-[1.5px] border-line"
            aria-label="+1"
          >
            <Plus size={16} weight="bold" />
          </button>
        </div>
        <button type="submit" disabled={soldOut} className="btn btn-primary flex-1">
          {soldOut ? t.item.soldOut : fill(t.item.addFor, { price: formatPrice(unit * qty, lang) })}
        </button>
      </div>
    </form>
  );
}
