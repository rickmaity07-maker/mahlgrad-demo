import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { getExtras, getMenu, getSettings, isDemo } from "@/lib/data";
import { normalizePhone, priceCart } from "@/lib/pricing";
import { clientIpHash } from "@/lib/session";
import { openNow, pickupSlots, slotToDate } from "@/lib/slots";

const OrderSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[+\d][\d\s/()-]{5,}$/),
  slot: z.union([z.literal("asap"), z.string().regex(/^\d{2}:\d{2}$/)]),
  note: z.string().trim().max(300).optional().default(""),
  redeem: z.boolean().optional().default(false),
  lines: z
    .array(
      z.object({
        itemId: z.number().int().positive(),
        qty: z.number().int().min(1).max(20),
        extras: z.array(z.string().max(40)).max(6),
      }),
    )
    .min(1)
    .max(30),
});

type ErrorCode = "invalid" | "closed" | "slot" | "changed" | "soldout" | "reward" | "rate" | "server";
const fail = (error: ErrorCode, status: number, field?: string) =>
  NextResponse.json({ ok: false, error, field }, { status });

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function orderCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("invalid", 400);
  }
  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) return fail("invalid", 400, String(parsed.error.issues[0]?.path[0] ?? ""));
  const order = parsed.data;
  const phoneNorm = normalizePhone(order.phone);
  if (phoneNorm.length < 6) return fail("invalid", 400, "phone");

  const ipHash = await clientIpHash();
  const [menu, extras, settings, recent] = await Promise.all([
    getMenu(),
    getExtras(),
    getSettings(),
    sql`SELECT count(*)::int AS n FROM orders WHERE ip_hash = ${ipHash} AND created_at > now() - interval '10 minutes'`,
  ]);
  if ((recent[0] as { n: number }).n >= 5) return fail("rate", 429);

  const demo = isDemo();
  // ASAP needs the shop to be open now (always true in demo mode); a timed slot must be one we offered.
  if (order.slot === "asap") {
    if (!demo && !openNow(settings.hours)) return fail("closed", 409);
  } else if (!pickupSlots(settings.hours, demo).includes(order.slot)) {
    return fail("slot", 409, "slot");
  }
  const pickupAt = order.slot === "asap" ? null : slotToDate(order.slot).toISOString();

  const priced = priceCart(order.lines, menu, extras);
  if (!priced.ok) return fail(priced.error === "soldout" ? "soldout" : "changed", 409);

  const redeem = order.redeem && priced.drinkCount > 0;
  const discount = redeem ? priced.rewardCents : 0;
  const perReward = settings.loyalty.stamps_per_reward;
  // The free drink doesn't earn a stamp itself.
  const stampsEarned = Math.max(0, priced.drinkCount - (redeem ? 1 : 0));

  const lines = priced.lines.map((l) => ({
    item_id: l.item.id,
    name_de: l.item.name_de,
    name_en: l.item.name_en,
    qty: l.qty,
    unit_cents: l.unitCents,
    extras: l.extras.map((e) => ({ slug: e.slug, name_de: e.name_de, name_en: e.name_en })),
    line_cents: l.lineCents,
  }));
  // One row per item (UPDATE ... FROM applies only one of several matching rows).
  const stockQty = new Map<number, number>();
  for (const l of priced.lines) if (l.item.stock !== null) stockQty.set(l.item.id, (stockQty.get(l.item.id) ?? 0) + l.qty);
  const stockMoves = [...stockQty].map(([id, qty]) => ({ id, qty }));

  const code = orderCode();
  try {
    // One statement = one transaction. If the reward isn't available the order isn't written;
    // if stock would go below zero the CHECK constraint aborts everything.
    const rows = (await sql`
      WITH red AS (
        UPDATE loyalty SET rewards_redeemed = rewards_redeemed + 1, updated_at = now()
        WHERE ${redeem} AND phone = ${phoneNorm} AND (stamps - rewards_redeemed * ${perReward}) >= ${perReward}
        RETURNING phone
      ),
      ok AS (SELECT (NOT ${redeem}) OR EXISTS (SELECT 1 FROM red) AS go),
      stock AS (
        UPDATE menu_items m SET stock = m.stock - s.qty
        FROM jsonb_to_recordset(${JSON.stringify(stockMoves)}::jsonb) AS s(id int, qty int), ok
        WHERE ok.go AND m.id = s.id AND m.stock IS NOT NULL
        RETURNING m.id
      ),
      o AS (
        INSERT INTO orders (code, customer_name, phone, phone_norm, pickup_at, note, subtotal_cents,
                            discount_cents, total_cents, stamps_earned, ip_hash)
        SELECT ${code}, ${order.name}, ${order.phone}, ${phoneNorm}, ${pickupAt}::timestamptz, ${order.note || null},
               ${priced.subtotalCents}, ${discount}, ${priced.subtotalCents - discount}, ${stampsEarned}, ${ipHash}
        FROM ok WHERE ok.go
        RETURNING id
      ),
      l AS (
        INSERT INTO order_lines (order_id, item_id, name_de, name_en, qty, unit_cents, extras, line_cents)
        SELECT o.id, l.item_id, l.name_de, l.name_en, l.qty, l.unit_cents, l.extras, l.line_cents
        FROM o, jsonb_to_recordset(${JSON.stringify(lines)}::jsonb)
          AS l(item_id int, name_de text, name_en text, qty int, unit_cents int, extras jsonb, line_cents int)
        RETURNING 1
      )
      SELECT (SELECT count(*) FROM o)::int AS created`) as { created: number }[];
    if (rows[0]?.created !== 1) return fail("reward", 409);
  } catch (err) {
    const pgCode = (err as { code?: string }).code;
    if (pgCode === "23514") return fail("soldout", 409); // stock CHECK
    console.error("order insert failed", err instanceof Error ? err.message : err);
    return fail("server", 500);
  }

  return NextResponse.json({ ok: true, code }, { status: 201 });
}
