import type { Metadata } from "next";
import { Imprint } from "@/components/shop/Legal";
import { BUSINESS } from "@/lib/business";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Impressum" };

export default async function ImprintPage() {
  return <Imprint b={BUSINESS} lang={await getLang()} />;
}
