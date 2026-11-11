"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { fill, pick } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import type { StampCard } from "@/lib/types";
import { useShop } from "./ShopProvider";

type FieldErrors = Partial<Record<"name" | "phone" | "slot", string>>;

export function CheckoutForm() {
  const { lang, t } = useLang();
  const router = useRouter();
  const { cart, priced, slots, asapOpen, clear } = useShop();
  const [slot, setSlot] = useState(asapOpen ? "asap" : (slots[0] ?? "asap"));
  const canOrder = asapOpen || slots.length > 0;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [card, setCard] = useState<StampCard | null>(null);
  const [redeem, setRedeem] = useState(false);

  if (cart.length === 0 || !priced.ok) {
    return (
      <div className="mt-10 flex flex-col items-start gap-5">
        <p className="text-lg text-muted">{t.cart.empty}</p>
        <Link href="/menu" className="btn btn-primary">
          {t.cart.toMenu}
        </Link>
      </div>
    );
  }

  const canRedeem = !!card && card.rewards > 0 && priced.drinkCount > 0;
  const discount = canRedeem && redeem ? priced.rewardCents : 0;
  const stamps = Math.max(0, priced.drinkCount - (discount > 0 ? 1 : 0));

  // Check the stamp card once the phone field is left, so a reward can be offered.
  async function lookup(phone: string) {
    if (phone.replace(/\D/g, "").length < 6) return setCard(null);
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      setCard(json.ok ? json.card : null);
    } catch {
      setCard(null);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: String(f.get("name") ?? "").trim(),
      phone: String(f.get("phone") ?? "").trim(),
      note: String(f.get("note") ?? "").trim(),
    };
    const errs: FieldErrors = {};
    if (data.name.length < 2) errs.name = t.checkout.errors.name;
    if (!/^[+\d][\d\s/()-]{5,}$/.test(data.phone)) errs.phone = t.checkout.errors.phone;
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length > 0) return;

    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          slot,
          redeem: discount > 0,
          lines: cart.map(({ itemId, qty, extras }) => ({ itemId, qty, extras })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        clear();
        router.push(`/status/${json.code}`);
        return;
      }
      const map: Record<string, string> = t.checkout.errors;
      if (json.error === "slot") setErrors({ slot: t.checkout.errors.slot });
      setFormError(map[json.error] ?? t.checkout.errors.generic);
    } catch {
      setFormError(t.checkout.errors.generic);
    }
    setSending(false);
  }

  const err = (name: keyof FieldErrors) =>
    errors[name] ? (
      <span id={`${name}-err`} className="text-sm font-medium text-[#c2412d]">
        {errors[name]}
      </span>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-10 md:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-5">
        {!canOrder ? (
          <p className="rounded-[var(--radius-m)] bg-card p-4 font-medium">{t.checkout.noSlots}</p>
        ) : (
          <label className="flex flex-col gap-2">
            <span className="font-medium">{t.checkout.when}</span>
            <select
              className="field"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              aria-invalid={errors.slot ? true : undefined}
            >
              {asapOpen ? <option value="asap">{t.checkout.asap}</option> : null}
              {slots.map((s) => (
                <option key={s} value={s}>
                  {fill(t.checkout.at, { time: s })}
                </option>
              ))}
            </select>
            {err("slot")}
          </label>
        )}

        <label className="flex flex-col gap-2">
          <span className="font-medium">{t.checkout.name}</span>
          <input
            name="name"
            autoComplete="name"
            className="field"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-err" : undefined}
          />
          {err("name")}
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-medium">{t.checkout.phone}</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field"
            onBlur={(e) => lookup(e.target.value)}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "phone-err" : "phone-hint"}
          />
          {err("phone") ?? (
            <span id="phone-hint" className="text-sm text-muted">
              {t.checkout.phoneHint}
            </span>
          )}
        </label>

        {canRedeem ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-m)] bg-cobalt p-4 text-cobalt-ink">
            <input
              type="checkbox"
              checked={redeem}
              onChange={(e) => setRedeem(e.target.checked)}
              className="mt-1 size-5 accent-[var(--cobalt-ink)]"
            />
            <span>
              <span className="block font-semibold">{t.checkout.reward}</span>
              <span className="text-sm opacity-90">{fill(t.checkout.rewardHint, { n: card!.rewards })}</span>
            </span>
          </label>
        ) : null}

        <label className="flex flex-col gap-2">
          <span className="font-medium">{t.checkout.note}</span>
          <textarea name="note" rows={3} maxLength={300} placeholder={t.checkout.notePh} className="field" />
        </label>
        <p className="text-sm text-muted">{t.checkout.pay}</p>
      </div>

      <aside className="h-fit rounded-[var(--radius-m)] bg-card p-6">
        <ul className="divide-y divide-line">
          {priced.lines.map((l, i) => (
            <li key={cart[i].key} className="flex justify-between gap-4 py-3">
              <span>
                <span className="font-medium">
                  {l.qty} x {pick(l.item, "name", lang)}
                </span>
                {l.extras.length > 0 ? (
                  <span className="block text-sm text-muted">{l.extras.map((e) => pick(e, "name", lang)).join(", ")}</span>
                ) : null}
              </span>
              <span className="tabular-nums">{formatPrice(l.lineCents, lang)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-4">
          {discount > 0 ? (
            <div className="flex justify-between text-cobalt">
              <dt>{t.checkout.discount}</dt>
              <dd className="tabular-nums">-{formatPrice(discount, lang)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between pt-1 text-xl font-semibold">
            <dt>{t.checkout.total}</dt>
            <dd className="tabular-nums">{formatPrice(priced.subtotalCents - discount, lang)}</dd>
          </div>
        </dl>
        {stamps > 0 ? <p className="mt-3 text-sm text-muted">{fill(t.checkout.stamps, { n: stamps })}</p> : null}
        {formError ? (
          <p role="alert" className="mt-4 rounded-[var(--radius-m)] bg-[#c2412d]/10 p-3 text-sm font-medium text-[#c2412d]">
            {formError}
          </p>
        ) : null}
        <button type="submit" disabled={sending || !canOrder} className="btn btn-primary mt-5 w-full text-lg">
          {sending ? t.checkout.placing : t.checkout.place}
        </button>
      </aside>
    </form>
  );
}
