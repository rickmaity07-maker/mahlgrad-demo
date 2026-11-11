import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { normalizePhone, stampCard } from "@/lib/pricing";
import { clientIpHash } from "@/lib/session";

const MAX_LOOKUPS = 20; // per IP per 15 minutes

/** Stamp-card lookup by phone. Returns only stamp counts, never the name, so it leaks nothing personal. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = z.object({ phone: z.string().trim().min(6).max(30) }).safeParse(body);
  const phone = parsed.success ? normalizePhone(parsed.data.phone) : "";
  if (phone.length < 6) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });

  const ipHash = await clientIpHash();
  const [{ n }] = (await sql`
    SELECT count(*)::int AS n FROM lookup_attempts
    WHERE ip_hash = ${ipHash} AND at > now() - interval '15 minutes'`) as { n: number }[];
  if (n >= MAX_LOOKUPS) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });

  const [, rows, settings] = await Promise.all([
    sql`INSERT INTO lookup_attempts (ip_hash) VALUES (${ipHash})`,
    sql`SELECT stamps, rewards_redeemed FROM loyalty WHERE phone = ${phone}`,
    getSettings(),
  ]);
  const row = (rows as { stamps: number; rewards_redeemed: number }[])[0];
  if (!row) return NextResponse.json({ ok: true, card: null }, { headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(
    { ok: true, card: stampCard(row.stamps, row.rewards_redeemed, settings.loyalty.stamps_per_reward) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
