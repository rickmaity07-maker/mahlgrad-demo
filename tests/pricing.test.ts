import { describe, expect, it } from "vitest";
import seed from "../db/seed.json";
import { pitchName } from "../src/lib/pitch";
import { normalizePhone, priceCart, stampCard } from "../src/lib/pricing";
import { openNow, pickupSlots, slotToDate } from "../src/lib/slots";
import type { Extra, MenuItem } from "../src/lib/types";

// Fixtures come from the real seed, so these tests also catch a broken seed file.
const menu: MenuItem[] = seed.items.map((i, n) => ({ ...i, id: n + 1, available: true }) as unknown as MenuItem);
const extras: Extra[] = seed.extras.map((e, n) => ({ ...e, id: n + 1, available: true }) as unknown as Extra);
const id = (slug: string) => menu.find((m) => m.slug === slug)!.id;
const line = (slug: string, qty = 1, ex: string[] = []) => ({ itemId: id(slug), qty, extras: ex });

describe("seed", () => {
  it("has unique slugs, positive prices and valid demo regulars", () => {
    expect(new Set(seed.items.map((i) => i.slug)).size).toBe(seed.items.length);
    expect(seed.items.every((i) => i.price_cents > 0)).toBe(true);
    expect(seed.regulars.every((r) => /^49\d+$/.test(r.phone))).toBe(true);
  });
});

describe("priceCart", () => {
  it("adds milk and add-ons to the drink price", () => {
    const r = priceCart([line("flatwhite", 2, ["hafer", "shot"])], menu, extras);
    expect(r).toMatchObject({ ok: true, subtotalCents: 2 * (390 + 40 + 70), drinkCount: 2, rewardCents: 390 });
  });

  it("allows one milk only", () => {
    expect(priceCart([line("flatwhite", 1, ["hafer", "mandel"])], menu, extras)).toEqual({ ok: false, error: "bad_extra" });
  });

  it("rejects options on items that don't take them", () => {
    expect(priceCart([line("v60", 1, ["hafer"])], menu, extras)).toEqual({ ok: false, error: "bad_extra" });
  });

  it("respects stock across lines of the same item", () => {
    // guji is seeded with 9 bags
    expect(priceCart([line("guji", 5), line("guji", 4)], menu, extras)).toMatchObject({ ok: true });
    expect(priceCart([line("guji", 5), line("guji", 5)], menu, extras)).toEqual({ ok: false, error: "soldout" });
    expect(priceCart([line("huila", 1)], menu, extras)).toEqual({ ok: false, error: "soldout" });
  });

  it("rewards the dearest drink, never beans or food", () => {
    const r = priceCart([line("espresso"), line("coldbrew"), line("hausmischung")], menu, extras);
    expect(r).toMatchObject({ ok: true, drinkCount: 2, rewardCents: 420 });
  });
});

describe("stamp card", () => {
  it("counts progress after redeemed rewards", () => {
    expect(stampCard(17, 1, 10)).toEqual({ progress: 7, rewards: 0, perReward: 10 });
    expect(stampCard(12, 0, 10)).toEqual({ progress: 12, rewards: 1, perReward: 10 });
    expect(stampCard(3, 1, 10).progress).toBe(0);
  });
  it("normalises German phone numbers", () => {
    expect(normalizePhone("0151 0000 0003")).toBe("4915100000003");
    expect(normalizePhone("+49 151 00000003")).toBe("4915100000003");
    expect(normalizePhone("0049 151 00000003")).toBe("4915100000003");
  });
});

describe("opening hours and pickup slots", () => {
  const hours = seed.settings.hours;
  // Wednesday 11 Nov 2026, 10:02 in Berlin (UTC+1)
  const wedMorning = new Date("2026-11-11T09:02:00Z");
  const wedNight = new Date("2026-11-11T22:30:00Z");

  it("knows when the café is open", () => {
    expect(openNow(hours, wedMorning)).toBe(true);
    expect(openNow(hours, wedNight)).toBe(false);
  });

  it("offers 15-minute slots from now plus lead time until closing", () => {
    const slots = pickupSlots(hours, false, wedMorning);
    expect(slots[0]).toBe("10:15");
    expect(slots.at(-1)).toBe("17:45");
    expect(pickupSlots(hours, false, wedNight)).toEqual([]);
    expect(pickupSlots(hours, true, wedNight).length).toBeGreaterThan(0);
  });

  it("turns a Berlin slot into the right instant, summer and winter", () => {
    expect(slotToDate("10:15", wedMorning).toISOString()).toBe("2026-11-11T09:15:00.000Z");
    expect(slotToDate("10:15", new Date("2026-07-15T08:00:00Z")).toISOString()).toBe("2026-07-15T08:15:00.000Z");
  });
});

describe("pitchName", () => {
  it("cleans and caps the name", () => {
    expect(pitchName("Kaffeehaus Lindner")).toBe("Kaffeehaus Lindner");
    expect(pitchName("<b>x</b>")).toBe("bxb");
    expect(pitchName("y".repeat(60))).toHaveLength(40);
    expect(pitchName("a")).toBeNull();
  });
});
