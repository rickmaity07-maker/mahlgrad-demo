import { NextResponse } from "next/server";
import { getActiveOrders } from "@/lib/data";
import { isAdmin } from "@/lib/session";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const orders = await getActiveOrders();
  return NextResponse.json({ ok: true, orders }, { headers: { "Cache-Control": "no-store" } });
}
