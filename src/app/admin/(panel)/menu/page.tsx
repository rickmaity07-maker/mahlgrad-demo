import { requireAdmin } from "@/lib/session";
import type { Metadata } from "next";
import Image from "next/image";
import { saveItem } from "@/app/admin/actions";
import { SaveForm } from "@/components/admin/SaveForm";
import { getExtras, getMenu } from "@/lib/data";
import { pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { CATEGORIES, SHOP_CATEGORIES, type Extra, type MenuItem } from "@/lib/types";

export const metadata: Metadata = { title: "Karte & Lager", robots: { index: false } };

type Labels = { available: string; stock: string; price: string };

function Row({ row, kind, label, labels }: { row: MenuItem | Extra; kind: "item" | "extra"; label: string; labels: Labels }) {
  const tracked = "category" in row && SHOP_CATEGORIES.includes(row.category);
  const low = tracked && row.stock !== null && row.stock <= 3;
  return (
    <SaveForm action={saveItem} className="flex flex-wrap items-center gap-4 py-3">
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="kind" value={kind} />
      {"image" in row ? (
        <span className="relative size-12 shrink-0 overflow-hidden rounded-[var(--radius-m)] bg-stone">
          {row.image ? <Image src={row.image} alt="" fill sizes="48px" className="object-cover" /> : null}
        </span>
      ) : null}
      <span className="min-w-40 flex-1 font-medium">{label}</span>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">EUR</span>
        <input
          name="price"
          inputMode="decimal"
          aria-label={labels.price}
          defaultValue={(row.price_cents / 100).toFixed(2)}
          className="field w-24 py-2 text-right tabular-nums"
        />
      </label>
      {tracked ? (
        <label className="flex items-center gap-2 text-sm">
          <span className={low ? "font-semibold text-danger" : "text-muted"}>{labels.stock}</span>
          <input
            name="stock"
            inputMode="numeric"
            defaultValue={"stock" in row && row.stock !== null ? String(row.stock) : ""}
            className="field w-20 py-2 text-right tabular-nums"
          />
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input name="available" type="checkbox" defaultChecked={row.available} className="size-5 accent-[var(--cobalt)]" />
        {labels.available}
      </label>
    </SaveForm>
  );
}

export default async function MenuAdminPage() {
  await requireAdmin();
  const [{ lang, t }, menu, extras] = await Promise.all([
    getDict(),
    getMenu({ includeUnavailable: true }),
    getExtras({ includeUnavailable: true }),
  ]);
  const labels = { available: t.admin.menu.available, stock: t.admin.menu.stock, price: t.admin.menu.price };

  return (
    <div className="max-w-4xl">
      <h1 className="display text-3xl">{t.admin.menu.title}</h1>
      {CATEGORIES.map((c) => {
        const items = menu.filter((m) => m.category === c);
        if (items.length === 0) return null;
        return (
          <section key={c} className="mt-8">
            <h2 className="mb-1 font-semibold">{t.categories[c]}</h2>
            <div className="divide-y divide-line rounded-[var(--radius-m)] bg-card px-4">
              {items.map((m) => (
                <Row key={m.id} row={m} kind="item" label={pick(m, "name", lang)} labels={labels} />
              ))}
            </div>
          </section>
        );
      })}
      <section className="mt-8">
        <h2 className="mb-1 font-semibold">{t.admin.menu.extras}</h2>
        <div className="divide-y divide-line rounded-[var(--radius-m)] bg-card px-4">
          {extras.map((x) => (
            <Row key={x.id} row={x} kind="extra" label={pick(x, "name", lang)} labels={labels} />
          ))}
        </div>
      </section>
    </div>
  );
}
