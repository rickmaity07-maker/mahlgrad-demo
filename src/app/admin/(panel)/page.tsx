import { requireAdmin } from "@/lib/session";
import type { Metadata } from "next";
import { OrderBoard } from "@/components/admin/OrderBoard";
import { getActiveOrders } from "@/lib/data";

export const metadata: Metadata = { title: "Vorbestellungen", robots: { index: false } };

export default async function OrdersPage() {
  await requireAdmin();
  const orders = await getActiveOrders();
  return <OrderBoard initial={orders} />;
}
