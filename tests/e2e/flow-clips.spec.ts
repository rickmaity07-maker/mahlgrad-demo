import { expect, test } from "@playwright/test";
import { CLIPS } from "../../src/lib/media";

// Google Flow clips (src/lib/media.ts): they load lazily, play only on screen, obey the
// site-wide pause switch and never run under reduced motion. Skipped while no clip is set.

test("hero clip plays and obeys the pause switch", async ({ page }) => {
  test.skip(!CLIPS.hero, "no hero clip set yet");
  await page.goto("/");
  const hero = page.locator("section").first().locator("video");
  await expect.poll(() => hero.evaluate((v: HTMLVideoElement) => !v.paused && v.readyState >= 2), { timeout: 15000 }).toBe(true);
  await expect(hero).toHaveClass(/opacity-100/);
  await page.getByRole("button", { name: /Animationen pausieren|Pause animations/ }).click();
  await expect.poll(() => hero.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.getByRole("button", { name: /Animationen abspielen|Play animations/ }).click();
  await expect.poll(() => hero.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
});

test("below-the-fold clips load only when scrolled near", async ({ page }) => {
  test.skip(!CLIPS.latte, "no latte clip set yet");
  await page.goto("/");
  const latte = page.locator("#bar video");
  expect(await latte.getAttribute("src")).toBeNull();
  await page.locator("#bar").scrollIntoViewIfNeeded();
  await expect.poll(() => latte.evaluate((v: HTMLVideoElement) => !v.paused), { timeout: 15000 }).toBe(true);
});

test("reduced motion keeps the still photos only", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("video")).toHaveCount(0);
  await ctx.close();
});
