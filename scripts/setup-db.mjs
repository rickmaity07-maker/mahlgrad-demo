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

const items = [
  // slug, category, de, en, desc_de, desc_en, cents, image, tag, stock
  ["espresso", "espresso", "Espresso", "Espresso", "Doppelter Shot unserer Hausmischung.", "Double shot of our house blend.", 240, "/img/c5.jpg", null, null],
  ["cortado", "espresso", "Cortado", "Cortado", "Espresso mit gleich viel warmer Milch.", "Espresso cut with an equal part of warm milk.", 320, null, null, null],
  ["cappuccino", "espresso", "Cappuccino", "Cappuccino", "Doppelter Espresso, feiner Milchschaum.", "Double espresso, fine milk foam.", 360, "/img/c2.jpg", null, null],
  ["flatwhite", "espresso", "Flat White", "Flat White", "Doppelter Ristretto, wenig, seidige Milch.", "Double ristretto, a little silky milk.", 390, "/img/c1.jpg", null, null],
  ["latte", "espresso", "Caffè Latte", "Caffè Latte", "Mild, viel Milch, groß.", "Mild, lots of milk, large.", 410, "/img/c13.jpg", null, null],
  ["v60", "filter", "V60 des Tages", "V60 of the day", "Handgebrüht, wechselnde Single Origins.", "Hand-brewed, rotating single origins.", 420, "/img/c8.jpg", "seasonal", null],
  ["batch", "filter", "Batch Brew", "Batch Brew", "Filterkaffee aus der Kanne, schnell und klar.", "Filter coffee from the urn, fast and clean.", 320, null, null, null],
  ["icedlatte", "cold", "Iced Latte", "Iced Latte", "Espresso auf Eis mit kalter Milch.", "Espresso over ice with cold milk.", 440, "/img/c9.jpg", null, null],
  ["coldbrew", "cold", "Cold Brew", "Cold Brew", "18 Stunden kalt extrahiert, schokoladig.", "Steeped cold for 18 hours, chocolatey.", 420, "/img/c14.jpg", "new", null],
  ["zimtschnecke", "food", "Zimtschnecke", "Cinnamon Bun", "Jeden Morgen frisch aus dem Ofen.", "Fresh from the oven every morning.", 350, null, null, null],
  ["bananenbrot", "food", "Bananenbrot", "Banana Bread", "Mit Walnüssen, leicht getoastet.", "With walnuts, lightly toasted.", 320, null, null, null],
  ["toastie", "food", "Sauerteig-Toastie", "Sourdough Toastie", "Bergkäse, Lauch, Senf.", "Mountain cheese, leek, mustard.", 650, null, null, null],
  ["hausmischung", "beans", "Hausmischung", "House Blend", "Brasilien und Kolumbien. Nuss, Kakao, wenig Säure. 250 g.", "Brazil and Colombia. Nutty, cocoa, low acidity. 250 g.", 1290, "/img/c4.jpg", null, 24],
  ["guji", "beans", "Äthiopien Guji", "Ethiopia Guji", "Gewaschen, hell geröstet. Pfirsich, Jasmin. 250 g.", "Washed, light roast. Peach, jasmine. 250 g.", 1550, "/img/c15.jpg", "new", 9],
  ["huila", "beans", "Kolumbien Huila", "Colombia Huila", "Honey-Aufbereitung. Rote Beeren, Rohrzucker. 250 g.", "Honey process. Red berries, cane sugar. 250 g.", 1450, "/img/c3.jpg", null, 0],
  ["becher", "merch", "Mahlgrad Becher", "Mahlgrad Cup", "Steinzeug, 240 ml, spülmaschinenfest.", "Stoneware, 240 ml, dishwasher safe.", 1900, "/img/c6.jpg", null, 12],
];
let sort = 0;
for (const [slug, category, nde, nen, dde, den, cents, image, tag, stock] of items) {
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

const extras = [
  ["hafer", "milk", "Hafermilch", "Oat milk", 40],
  ["mandel", "milk", "Mandelmilch", "Almond milk", 40],
  ["shot", "add", "Extra Shot", "Extra shot", 70],
  ["vanille", "add", "Vanillesirup", "Vanilla syrup", 50],
  ["karamell", "add", "Karamellsirup", "Caramel syrup", 50],
];
sort = 0;
for (const [slug, grp, nde, nen, cents] of extras) {
  sort += 10;
  await sql`
    INSERT INTO extras (slug, grp, name_de, name_en, price_cents, sort)
    VALUES (${slug}, ${grp}, ${nde}, ${nen}, ${cents}, ${sort})
    ON CONFLICT (slug) DO UPDATE SET grp = EXCLUDED.grp, name_de = EXCLUDED.name_de, name_en = EXCLUDED.name_en, sort = EXCLUDED.sort`;
}

const hours = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
  day,
  open: day === 0 || day === 6 ? "09:00" : "07:30",
  close: day === 0 ? "17:00" : "18:00",
  closed: false,
}));
for (const [key, value] of Object.entries({ hours, loyalty: { stamps_per_reward: 10 } })) {
  await sql`INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb) ON CONFLICT (key) DO NOTHING`;
}

if (reset) {
  await sql`TRUNCATE orders, loyalty RESTART IDENTITY CASCADE`;
  // A few regulars so the stamp-card admin isn't empty in the demo (fictional people, fake numbers).
  const regulars = [
    ["4915100000001", "Lena Vogt", 17, 1],
    ["4915100000002", "Tarik Aydın", 3, 0],
    ["4915100000003", "Anouk de Wit", 12, 0],
  ];
  for (const [phone, name, stamps, redeemed] of regulars) {
    await sql`INSERT INTO loyalty (phone, name, stamps, rewards_redeemed) VALUES (${phone}, ${name}, ${stamps}, ${redeemed})`;
  }
  console.log("Orders and stamp cards reset, stock restored.");
}

const [{ count }] = await sql`SELECT count(*)::int AS count FROM menu_items`;
console.log(`Schema ready. ${count} menu items, ${extras.length} extras.`);
