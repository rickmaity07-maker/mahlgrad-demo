// Creates the schema and seeds the demo menu. Uses the direct (unpooled) URL.
// Run: npm run db:setup                       (keeps orders and stamp cards)
//      npm run db:setup -- --reset-orders     (also clears orders, stamp cards and restores stock)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (see .env.local)");
const sql = neon(url);

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
for (const s of schema.split(/;\s*$/m).map((x) => x.replace(/^\s*--.*$/gm, "").trim()).filter(Boolean)) {
  await sql.query(s);
}
const reset = process.argv.includes("--reset-orders");

// Menu, extras, settings and demo regulars live in db/seed.json (the nightly demo reset uses it too).
const seed = JSON.parse(readFileSync(new URL("../db/seed.json", import.meta.url), "utf8"));

let sort = 0;
for (const { slug, category, name_de: nde, name_en: nen, desc_de: dde, desc_en: den, price_cents: cents, image, tag, stock } of seed.items) {
  sort += 10;
  await sql`
    INSERT INTO menu_items (slug, category, name_de, name_en, desc_de, desc_en, price_cents, image, tag, stock, sort)
    VALUES (${slug}, ${category}, ${nde}, ${nen}, ${dde}, ${den}, ${cents}, ${image}, ${tag}, ${stock}, ${sort})
    ON CONFLICT (slug) DO UPDATE SET
      category = EXCLUDED.category, name_de = EXCLUDED.name_de, name_en = EXCLUDED.name_en,
      desc_de = EXCLUDED.desc_de, desc_en = EXCLUDED.desc_en, image = EXCLUDED.image,
      tag = EXCLUDED.tag, sort = EXCLUDED.sort`;
  if (reset) await sql`UPDATE menu_items SET stock = ${stock}, price_cents = ${cents}, available = true WHERE slug = ${slug}`;
}

sort = 0;
for (const { slug, grp, name_de: nde, name_en: nen, price_cents: cents } of seed.extras) {
  sort += 10;
  await sql`
    INSERT INTO extras (slug, grp, name_de, name_en, price_cents, sort)
    VALUES (${slug}, ${grp}, ${nde}, ${nen}, ${cents}, ${sort})
    ON CONFLICT (slug) DO UPDATE SET grp = EXCLUDED.grp, name_de = EXCLUDED.name_de, name_en = EXCLUDED.name_en, sort = EXCLUDED.sort`;
}

for (const [key, value] of Object.entries(seed.settings)) {
  await sql`INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb) ON CONFLICT (key) DO NOTHING`;
}

if (reset) {
  await sql`TRUNCATE orders, loyalty RESTART IDENTITY CASCADE`;
  // A few regulars so the stamp-card admin isn't empty in the demo (fictional people, fake numbers).
  for (const { phone, name, stamps, rewards_redeemed: redeemed } of seed.regulars) {
    await sql`INSERT INTO loyalty (phone, name, stamps, rewards_redeemed) VALUES (${phone}, ${name}, ${stamps}, ${redeemed})`;
  }
  console.log("Orders and stamp cards reset, stock restored.");
}

const [{ count }] = await sql`SELECT count(*)::int AS count FROM menu_items`;
console.log(`Schema ready. ${count} menu items, ${seed.extras.length} extras.`);
