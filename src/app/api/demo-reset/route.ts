import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { resetDemo } from "@/lib/demoReset";

export const dynamic = "force-dynamic";

/** constant-time compare, so response timing reveals nothing about the secret */
function sameSecret(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Nightly reset of the public demo (Vercel Cron, see vercel.json).
 * Only exists while DEMO_MODE=1. When CRON_SECRET is set, Vercel sends it as a bearer
 * token and every other caller is refused. Without it the route stays open, which is
 * harmless: it can only put the demo back to its seeded state.
 */
export async function GET(request: Request) {
  if (process.env.DEMO_MODE !== "1") return new NextResponse(null, { status: 404 });
  const secret = process.env.CRON_SECRET;
  if (secret && !sameSecret(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const result = await resetDemo();
    if (!result) return NextResponse.json({ ok: false, error: "too_soon" }, { status: 429 });
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("demo reset failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
