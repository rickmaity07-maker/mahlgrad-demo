import type { Metadata } from "next";
import { StampLookup } from "@/components/shop/StampLookup";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = { title: "Stempelkarte" };

export default async function StampCardPage() {
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6">
      <h1 className="display text-[clamp(2.8rem,7vw,4.8rem)]">{t.card.title}</h1>
      <p className="mt-4 text-lg text-muted">{t.card.body}</p>
      <StampLookup />
    </div>
  );
}
