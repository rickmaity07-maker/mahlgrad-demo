"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken } from "@/lib/auth";
import { sql } from "@/lib/db";
import { clientIpHash, requireAdmin } from "@/lib/session";
import type { OrderStatus } from "@/lib/types";

const MAX_ATTEMPTS = 8;

export type LoginState = { error: "wrong" | "locked" | null };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const ipHash = await clientIpHash();
  const [{ n }] = (await sql`
    SELECT count(*)::int AS n FROM login_attempts
    WHERE ip_hash = ${ipHash} AND at > now() - interval '15 minutes'`) as { n: number }[];
  if (n >= MAX_ATTEMPTS) return { error: "locked" };

  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!(await checkPassword(password))) {
    await sql`INSERT INTO login_attempts (ip_hash) VALUES (${ipHash})`;
    return { error: n + 1 >= MAX_ATTEMPTS ? "locked" : "wrong" };
  }

  await sql`DELETE FROM login_attempts WHERE ip_hash = ${ipHash} OR at < now() - interval '1 day'`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/** Allowed moves: each target lists the statuses it can be reached from. */
const FROM: Record<OrderStatus, OrderStatus[]> = {
  new: [],
  preparing: ["new"],
  ready: ["preparing"],
  done: ["ready"],
  cancelled: ["new", "preparing", "ready"],
};

const StatusInput = z.object({
  id: z.number().int().positive(),
  to: z.enum(["preparing", "ready", "done", "cancelled"]),
});

export async function setOrderStatus(id: number, to: OrderStatus) {
  await requireAdmin();
  const input = StatusInput.safeParse({ id, to });
  if (!input.success) return { ok: false };
  const from = FROM[input.data.to];
  if (input.data.to === "done") {
    // Picked up: stamps land on the card in the same statement, exactly once.
    const rows = await sql`
      WITH o AS (
        UPDATE orders SET status = 'done', updated_at = now()
        WHERE id = ${input.data.id} AND status = ANY(${from})
        RETURNING phone_norm, customer_name, stamps_earned
      ),
      card AS (
        INSERT INTO loyalty (phone, name, stamps)
        SELECT phone_norm, customer_name, stamps_earned FROM o WHERE stamps_earned > 0
        ON CONFLICT (phone) DO UPDATE
          SET stamps = loyalty.stamps + EXCLUDED.stamps, name = EXCLUDED.name, updated_at = now()
        RETURNING 1
      )
      SELECT count(*)::int AS n FROM o`;
    return { ok: (rows[0] as { n: number }).n === 1 };
  }
  if (input.data.to === "cancelled") {
    // Cancelling gives back reserved stock and a redeemed reward.
    const rows = await sql`
      WITH o AS (
        UPDATE orders SET status = 'cancelled', updated_at = now()
        WHERE id = ${input.data.id} AND status = ANY(${from})
        RETURNING id, phone_norm, discount_cents
      ),
      back AS (
        UPDATE menu_items m SET stock = m.stock + l.qty
        FROM (SELECT item_id, sum(qty)::int AS qty FROM order_lines
              WHERE order_id = (SELECT id FROM o) GROUP BY item_id) l
        WHERE m.id = l.item_id AND m.stock IS NOT NULL
        RETURNING 1
      ),
      reward AS (
        UPDATE loyalty SET rewards_redeemed = rewards_redeemed - 1
        FROM o WHERE o.discount_cents > 0 AND loyalty.phone = o.phone_norm AND rewards_redeemed > 0
        RETURNING 1
      )
      SELECT count(*)::int AS n FROM o`;
    return { ok: (rows[0] as { n: number }).n === 1 };
  }
  const rows = await sql`
    UPDATE orders SET status = ${input.data.to}, updated_at = now()
    WHERE id = ${input.data.id} AND status = ANY(${from})
    RETURNING id`;
  return { ok: rows.length === 1 };
}

const ItemInput = z.object({
  id: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0).max(999),
  stock: z.union([z.literal(""), z.coerce.number().int().min(0).max(100000)]),
  available: z.boolean(),
});

export async function saveItem(form: FormData) {
  await requireAdmin();
  const input = ItemInput.safeParse({
    id: form.get("id"),
    price: String(form.get("price") ?? "").replace(",", "."),
    stock: String(form.get("stock") ?? "").trim(),
    available: form.get("available") === "on",
  });
  if (!input.success) return { ok: false };
  const cents = Math.round(input.data.price * 100);
  if (form.get("kind") === "extra") {
    await sql`UPDATE extras SET price_cents = ${cents}, available = ${input.data.available} WHERE id = ${input.data.id}`;
  } else if (form.has("stock")) {
    const stock = input.data.stock === "" ? null : input.data.stock;
    await sql`UPDATE menu_items SET price_cents = ${cents}, stock = ${stock}, available = ${input.data.available}
              WHERE id = ${input.data.id}`;
  } else {
    await sql`UPDATE menu_items SET price_cents = ${cents}, available = ${input.data.available} WHERE id = ${input.data.id}`;
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addStamp(form: FormData) {
  await requireAdmin();
  const phone = z.string().regex(/^\d{6,20}$/).safeParse(form.get("phone"));
  if (!phone.success) return { ok: false };
  const rows = await sql`UPDATE loyalty SET stamps = stamps + 1, updated_at = now() WHERE phone = ${phone.data} RETURNING 1`;
  revalidatePath("/admin/loyalty");
  return { ok: rows.length === 1 };
}

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const HoursInput = z
  .array(z.object({ day: z.number().int().min(0).max(6), open: time, close: time, closed: z.boolean() }))
  .length(7);

export async function saveHours(form: FormData) {
  await requireAdmin();
  const days = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: String(form.get(`open-${day}`) ?? ""),
    close: String(form.get(`close-${day}`) ?? ""),
    closed: form.get(`closed-${day}`) === "on",
  }));
  const input = HoursInput.safeParse(days);
  if (!input.success) return { ok: false };
  await sql`INSERT INTO settings (key, value) VALUES ('hours', ${JSON.stringify(input.data)}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  revalidatePath("/", "layout");
  return { ok: true };
}
