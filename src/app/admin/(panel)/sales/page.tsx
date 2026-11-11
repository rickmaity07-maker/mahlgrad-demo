import type { Metadata } from "next";
import { sql } from "@/lib/db";
import { getDict } from "@/lib/lang";
import { formatPrice } from "@/lib/pricing";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Umsatz", robots: { index: false } };

type DayRow = { day: string; orders: number; revenue: number };
type TopRow = { name_de: string; name_en: string; qty: number; revenue: number };

export default async function SalesPage() {
  await requireAdmin();
  const { lang, t } = await getDict();
  // Berlin calendar days; cancelled orders don't count.
  const [days, top] = (await Promise.all([
    sql`
      SELECT to_char(d::date, 'YYYY-MM-DD') AS day,
             count(o.id)::int AS orders,
             coalesce(sum(o.total_cents), 0)::int AS revenue
      FROM generate_series((now() AT TIME ZONE 'Europe/Berlin')::date - 6,
                           (now() AT TIME ZONE 'Europe/Berlin')::date, interval '1 day') AS d
      LEFT JOIN orders o
        ON (o.created_at AT TIME ZONE 'Europe/Berlin')::date = d::date AND o.status <> 'cancelled'
      GROUP BY d ORDER BY d`,
    sql`
      SELECT l.name_de, l.name_en, sum(l.qty)::int AS qty, sum(l.line_cents)::int AS revenue
      FROM order_lines l JOIN orders o ON o.id = l.order_id
      WHERE o.status <> 'cancelled' AND o.created_at > now() - interval '7 days'
      GROUP BY l.name_de, l.name_en ORDER BY qty DESC LIMIT 5`,
  ])) as [DayRow[], TopRow[]];

  const today = days[days.length - 1] ?? { orders: 0, revenue: 0, day: "" };
  const max = Math.max(1, ...days.map((d) => d.revenue));
  const dayName = (iso: string) =>
    new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-GB", { weekday: "short", day: "numeric" }).format(new Date(`${iso}T12:00:00`));

  return (
    <div className="max-w-4xl">
      <h1 className="display text-3xl">{t.admin.sales.title}</h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          [t.admin.sales.today, formatPrice(today.revenue, lang)],
          [t.admin.sales.orders, String(today.orders)],
          [t.admin.sales.avg, formatPrice(today.orders ? Math.round(today.revenue / today.orders) : 0, lang)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[var(--radius-m)] bg-card p-5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="display mt-1 text-4xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 rounded-[var(--radius-m)] bg-card p-5">
        <h2 className="font-semibold">{t.admin.sales.week}</h2>
        <ul className="mt-4 space-y-2">
          {days.map((d) => (
            <li key={d.day} className="grid grid-cols-[4.5rem_1fr_6rem] items-center gap-3 text-sm">
              <span className="text-muted">{dayName(d.day)}</span>
              <span className="h-5">
                <span
                  className="block h-full rounded-r-[3px] bg-cobalt"
                  style={{ width: `${(d.revenue / max) * 100}%`, minWidth: d.revenue > 0 ? 4 : 0 }}
                />
              </span>
              <span className="text-right tabular-nums">{formatPrice(d.revenue, lang)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-[var(--radius-m)] bg-card p-5">
        <h2 className="font-semibold">{t.admin.sales.top}</h2>
        {top.length === 0 ? (
          <p className="mt-3 text-muted">{t.admin.sales.none}</p>
        ) : (
          <ol className="mt-3 divide-y divide-line">
            {top.map((r) => (
              <li key={r.name_de} className="flex items-center gap-4 py-2.5">
                <span className="flex-1 font-medium">{lang === "de" ? r.name_de : r.name_en}</span>
                <span className="tabular-nums text-muted">{r.qty}x</span>
                <span className="w-24 text-right tabular-nums">{formatPrice(r.revenue, lang)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
