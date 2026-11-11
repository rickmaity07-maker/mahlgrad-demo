import { requireAdmin } from "@/lib/session";
import type { Metadata } from "next";
import { BarScreen } from "@/components/admin/BarScreen";
import { getActiveOrders } from "@/lib/data";

export const metadata: Metadata = { title: "Bar", robots: { index: false } };

export default async function BarPage() {
  await requireAdmin();
  const orders = await getActiveOrders();
  return <BarScreen initial={orders} />;
}
