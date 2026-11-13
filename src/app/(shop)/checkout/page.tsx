import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = { title: "Kasse" };

export default async function CheckoutPage() {
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <h1 className="display text-[clamp(3.4rem,8vw,6rem)]">{t.checkout.title}</h1>
      {process.env.DEMO_MODE === "1" ? (
        <p className="mt-4 max-w-2xl rounded-[var(--radius-m)] bg-card px-4 py-3 text-sm font-medium">
          {t.checkout.demoNote}
        </p>
      ) : null}
      <CheckoutForm />
    </div>
  );
}
