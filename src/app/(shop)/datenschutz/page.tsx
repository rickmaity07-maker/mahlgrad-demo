import type { Metadata } from "next";
import { Privacy } from "@/components/shop/Legal";
import { BUSINESS } from "@/lib/business";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Datenschutz" };

export default async function PrivacyPage() {
  return <Privacy b={BUSINESS} lang={await getLang()} />;
}
