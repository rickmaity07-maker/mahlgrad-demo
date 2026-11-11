import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusTracker } from "@/components/shop/StatusTracker";
import { getOrderByCode } from "@/lib/data";
import { fill } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { formatPrice } from "@/lib/pricing";
import { formatTime } from "@/lib/slots";

export const metadata: Metadata = { title: "Bestellstatus", robots: { index: false } };

export default async function StatusPage({ params }: PageProps<"/status/[code]">) {
  const { code } = await params;
  if (!/^[A-Z0-9]{6}$/.test(code)) notFound();
  const [{ lang, t }, order] = await Promise.all([getDict(), getOrderByCode(code)]);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <p className="font-semibold text-muted">{fill(t.status.title, { code: order.code })}</p>
      <h1 className="display mt-2 text-[clamp(2.6rem,6vw,4.4rem)]">
        {fill(t.status.thanks, { name: order.customer_name.split(" ")[0] })}
      </h1>
      <p className="mt-4 text-xl font-medium text-cobalt">
        {order.pickup_at ? fill(t.status.pickupAt, { time: formatTime(order.pickup_at, lang) }) : t.status.pickupAsap}
      </p>

      <StatusTracker code={order.code} initial={order.status} />

      <section className="mt-10 rounded-[var(--radius-m)] bg-card p-6">
        <ul className="divide-y divide-line">
          {order.lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-4 py-3">
              <span>
                <span className="font-medium">
                  {l.qty} x {lang === "de" ? l.name_de : l.name_en}
                </span>
                {l.extras.length > 0 ? (
                  <span className="block text-sm text-muted">
                    {l.extras.map((e) => (lang === "de" ? e.name_de : e.name_en)).join(", ")}
                  </span>
                ) : null}
              </span>
              <span className="tabular-nums">{formatPrice(l.line_cents, lang)}</span>
            </li>
          ))}
        </ul>
        {order.discount_cents > 0 ? (
          <div className="flex justify-between border-t border-line pt-3 text-cobalt">
            <span>{t.checkout.discount}</span>
            <span className="tabular-nums">-{formatPrice(order.discount_cents, lang)}</span>
          </div>
        ) : null}
        <div className="mt-2 flex justify-between border-t border-line pt-4 text-xl font-semibold">
          <span>{t.checkout.total}</span>
          <span className="tabular-nums">{formatPrice(order.total_cents, lang)}</span>
        </div>
        {order.stamps_earned > 0 && order.status !== "cancelled" ? (
          <p className="mt-3 text-sm text-muted">{fill(t.status.stamps, { n: order.stamps_earned })}</p>
        ) : null}
      </section>

      <Link href="/menu" className="btn btn-ghost mt-8">
        {t.status.again}
      </Link>
    </div>
  );
}
