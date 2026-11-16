# Mahlgrad (demo)

Fictional specialty coffee bar in Cologne. Portfolio demo for restaurant clients: cinematic dark home page
(slow camera moves on the photos, canvas steam, a pinned bean-to-cup chapter),
pre-order for pickup with time slots, stamp card (every 10th drink free), bean and merch shop with stock,
and an admin portal. German by default, English switch.

## Run

```bash
npm install
npm run db:setup                    # schema + menu seed (keeps orders and stamp cards)
npm run db:setup -- --reset-orders  # clean slate: clears orders, resets stock and demo stamp cards
npm run dev                         # or: npm run build && npm start
npm test                            # unit tests (pricing)
npm run test:e2e                    # browser tests: order flow, admin, security, site health, clips
npm run clips                       # encode Google Flow clips from flow/ (see FLOW_SHOTS.md)
```

`test:e2e` builds the site and runs it against a throwaway in-memory Postgres (PGlite behind a
Neon-compatible endpoint, `tests/support/local-db.mjs`), seeded from `db/seed.json`. It never
touches the Neon database in `.env.local`.

## Moving pictures (Google Flow)

The home page has nine clip slots (`src/lib/media.ts`). Each shows its photo until a clip is added.
`FLOW_SHOTS.md` has the Flow prompts and start frames; `npm run clips` encodes the downloads and
switches the slots on. Clips load only near the screen, play only while visible, stop with the
site's pause button and are skipped for reduced motion and Save-Data.

`.env.local` (git-ignored) holds `DATABASE_URL` / `DATABASE_URL_UNPOOLED` (Neon **test** project
`mahlgrad-demo`, never production), `ADMIN_PASSWORD`, `ADMIN_SECRET` and `DEMO_MODE=1`.

`DEMO_MODE=1` shows the admin password on the login page and keeps "as soon as possible" open outside
opening hours. Turn it off for any real client.

Because the demo admin is public, a Vercel Cron job (`vercel.json`, daily 03:00 UTC) calls
`/api/demo-reset`. It restores prices, stock, availability, hours, the loyalty rule and the three demo
stamp cards from `db/seed.json`, and deletes orders and visitor stamp cards older than 6 hours. The route
only exists with `DEMO_MODE=1`, runs at most once every 10 minutes, and requires
`Authorization: Bearer $CRON_SECRET` once a `CRON_SECRET` env var is set (Vercel sends it automatically).

## Rebranding and pitch links

- `src/brand.config.ts`: name, wordmark, address, contact, accent colours, VAT ID, data protection authority, SEO text.
- `/?for=Café Name`: personal pitch line in the hero, a matching share card (`/api/og`) and noindex.

## Demo flow (for the video)

Hero, then scroll (bean-to-cup chapter, the stamp card fills in), then Karte, then a Flat White with Hafermilch + Extra Shot and a
bag of beans, then Abholung with phone `0151 00000003` (Anouk, has a free drink to redeem), then the status
page. Admin `/admin`: Annehmen, Fertig, Abgeholt; the stamps then show on `/admin/loyalty`.

Seeded stamp cards (fictional, fake numbers): Lena `0151 00000001`, Tarik `0151 00000002`, Anouk `0151 00000003`.

## How it works

- `src/lib/pricing.ts`: pricing, one-milk rule, stock limits and reward value, shared by cart and API.
- `src/app/api/orders/route.ts`: one SQL statement redeems the reward, decrements stock and writes the order.
  A `CHECK (stock >= 0)` constraint makes overselling impossible; a reward can only be used once.
- Stamps are credited when an order is marked "Abgeholt" (same statement as the status change).
  Cancelling returns stock and a redeemed reward.
- `/api/loyalty` returns stamp counts only (no names) and is rate limited per IP.
- Admin guard: `proxy.ts` plus `requireAdmin()` everywhere; signed httpOnly cookie; DB-backed login lockout.
