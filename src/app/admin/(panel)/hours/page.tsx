import { requireAdmin } from "@/lib/session";
import type { Metadata } from "next";
import { saveHours } from "@/app/admin/actions";
import { SaveForm } from "@/components/admin/SaveForm";
import { getSettings } from "@/lib/data";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = { title: "Öffnungszeiten", robots: { index: false } };

export default async function HoursPage() {
  await requireAdmin();
  const [{ t }, settings] = await Promise.all([getDict(), getSettings()]);
  const days = [1, 2, 3, 4, 5, 6, 0].map(
    (day) => settings.hours.find((h) => h.day === day) ?? { day, open: "11:30", close: "22:00", closed: false },
  );
  return (
    <div className="max-w-2xl">
      <h1 className="display text-4xl">{t.admin.hours.title}</h1>
      <SaveForm action={saveHours} label={t.admin.hours.save} className="mt-6 flex flex-col gap-5">
        <div className="divide-y divide-line rounded-[var(--radius-m)] bg-card px-4">
          {days.map((h) => (
            <fieldset key={h.day} aria-label={t.days[h.day]} className="flex flex-wrap items-center gap-4 py-3">
              <span className="w-28 font-medium" aria-hidden>{t.days[h.day]}</span>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted">{t.admin.hours.open}</span>
                <input type="time" name={`open-${h.day}`} defaultValue={h.open} className="field w-32 py-2" />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted">{t.admin.hours.close}</span>
                <input type="time" name={`close-${h.day}`} defaultValue={h.close} className="field w-32 py-2" />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={`closed-${h.day}`} defaultChecked={h.closed} className="size-5 accent-[var(--cobalt)]" />
                {t.admin.hours.closed}
              </label>
            </fieldset>
          ))}
        </div>
      </SaveForm>
    </div>
  );
}
