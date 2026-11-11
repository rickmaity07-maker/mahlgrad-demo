import { NextResponse } from "next/server";
import { getOrderByCode } from "@/lib/data";

/** Public status lookup. The 6-character random code is the only key, so personal data is left out. */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  if (!/^[A-Z0-9]{6}$/.test(code)) return NextResponse.json({ ok: false }, { status: 404 });
  const order = await getOrderByCode(code);
  if (!order) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json(
    { ok: true, status: order.status },
    { headers: { "Cache-Control": "no-store" } },
  );
}
