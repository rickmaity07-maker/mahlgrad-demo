import type { Metadata } from "next";
import { addStamp } from "@/app/admin/actions";
import { SaveForm } from "@/components/admin/SaveForm";
import { sql } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { getDict } from "@/lib/lang";
import { stampCard } from "@/lib/pricing";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Stempelkarten", robots: { index: false } };

type Row = { phone: string; name: string; stamps: number; rewards_redeemed: number; updated_at: string | Date };

/** Show only the last digits of a phone number on screen. */
const mask = (phone: string) => `+${phone.slice(0, 2)} ••• ${phone.slice(-4)}`;

export default async function LoyaltyPage(props: PageProps<"/admin/loyalty">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const digits = q.replace(/\D/g, "");
  const [{ t }, settings] = await Promise.all([getDict(), getSettings()]);
  const rows = (await sql`
    SELECT phone, name, stamps, rewards_redeemed, updated_at FROM loyalty
    WHERE ${q} = '' OR name ILIKE ${"%" + q + "%"} OR (${digits} <> '' AND phone LIKE ${"%" + digits + "%"})
    ORDER BY updated_at DESC LIMIT 100`) as Row[];
  const per = settings.loyalty.stamps_per_reward;

  return (
    <div className="max-w-4xl">
      <h1 className="display text-3xl">{t.admin.loyalty.title}</h1>
      <form className="mt-5" role="search">
        <input name="q" defaultValue={q} placeholder={t.admin.loyalty.search} aria-label={t.admin.loyalty.search} className="field max-w-sm" />
      </form>

      {rows.length === 0 ? (
        <p className="mt-8 text-muted">{t.admin.loyalty.empty}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-m)] bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-medium">{t.admin.loyalty.customer}</th>
                <th className="px-4 py-3 font-medium">{t.admin.loyalty.phone}</th>
                <th className="px-4 py-3 font-medium">{t.admin.loyalty.progress}</th>
                <th className="px-4 py-3 text-right font-medium">{t.admin.loyalty.rewards}</th>
                <th className="px-4 py-3 text-right font-medium">{t.admin.loyalty.redeemed}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const card = stampCard(r.stamps, r.rewards_redeemed, per);
                const onCard = Math.min(card.progress, per);
                return (
                  <tr key={r.phone}>
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 font-mono text-muted">{mask(r.phone)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1" aria-label={`${onCard} / ${per}`}>
                        {Array.from({ length: per }, (_, i) => (
                          <span key={i} className={`size-2.5 rounded-full ${i < onCard ? "bg-cobalt" : "bg-line"}`} />
                        ))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{card.rewards}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{r.rewards_redeemed}</td>
                    <td className="px-4 py-2">
                      <SaveForm action={addStamp} label={t.admin.loyalty.add} className="flex justify-end">
                        <input type="hidden" name="phone" value={r.phone} />
                      </SaveForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
