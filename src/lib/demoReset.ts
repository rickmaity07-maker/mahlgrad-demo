import "server-only";
import seed from "../../db/seed.json";
import { sql } from "./db";

/**
 * Puts the public demo back to its seeded state: prices, stock, availability, opening hours,
 * the loyalty rule and the three demo stamp cards. Orders older than a few hours and stamp
 * cards that visitors created (names and phone numbers) are deleted.
 * Returns null when a reset already ran in the last 10 minutes.
 */
export async function resetDemo() {
  // At most one reset every 10 minutes, so an open endpoint can't be used to hammer the database.
  const claimed = await sql`
    INSERT INTO settings (key, value) VALUES ('demo_reset_at', to_jsonb(now()))
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    WHERE (settings.value #>> '{}')::timestamptz < now() - interval '10 minutes'
    RETURNING key`;
  if (claimed.length === 0) return null;

  const items = JSON.stringify(seed.items.map((i) => ({ slug: i.slug, price_cents: i.price_cents, stock: i.stock })));
  const extras = JSON.stringify(seed.extras.map((e) => ({ slug: e.slug, price_cents: e.price_cents })));
  const regulars = JSON.stringify(seed.regulars);
  const phones = seed.regulars.map((r) => r.phone);

  const [itemRows, , , orderRows, cardRows] = await Promise.all([
    sql`UPDATE menu_items m SET price_cents = s.price_cents, stock = s.stock, available = true
        FROM jsonb_to_recordset(${items}::jsonb) AS s(slug text, price_cents int, stock int)
        WHERE m.slug = s.slug RETURNING m.id`,
    sql`UPDATE extras e SET price_cents = s.price_cents, available = true
        FROM jsonb_to_recordset(${extras}::jsonb) AS s(slug text, price_cents int)
        WHERE e.slug = s.slug`,
    sql`INSERT INTO settings (key, value)
        SELECT key, value FROM jsonb_each(${JSON.stringify(seed.settings)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    // Orders and visitor stamp cards hold names and phone numbers; keep them only briefly.
    sql`DELETE FROM orders WHERE created_at < now() - interval '6 hours' RETURNING id`,
    sql`DELETE FROM loyalty WHERE NOT (phone = ANY(${phones})) AND updated_at < now() - interval '6 hours' RETURNING phone`,
    sql`INSERT INTO loyalty (phone, name, stamps, rewards_redeemed, updated_at)
        SELECT phone, name, stamps, rewards_redeemed, now()
        FROM jsonb_to_recordset(${regulars}::jsonb) AS r(phone text, name text, stamps int, rewards_redeemed int)
        ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, stamps = EXCLUDED.stamps,
          rewards_redeemed = EXCLUDED.rewards_redeemed, updated_at = now()`,
    sql`DELETE FROM login_attempts WHERE at < now() - interval '1 day'`,
    sql`DELETE FROM lookup_attempts WHERE at < now() - interval '1 day'`,
  ]);

  return { items: itemRows.length, ordersRemoved: orderRows.length, cardsRemoved: cardRows.length };
}
