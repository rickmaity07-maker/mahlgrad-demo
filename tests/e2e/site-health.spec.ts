import { expect, test } from "@playwright/test";

// Every public page loads, has one h1, no console errors, no broken images,
// no sideways scroll on phones, and the basics for SEO and sharing.
const PAGES = ["/", "/menu", "/karte", "/checkout", "/impressum", "/datenschutz"];

for (const path of PAGES) {
  test(`page ${path} is healthy`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));

    const res = await page.goto(path, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/Mahlgrad/);

    // scroll through so lazy images load
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");

    const broken = await page.$$eval("img", (imgs) =>
      imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.getAttribute("src")),
    );
    expect(broken, "broken images").toEqual([]);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(1);

    expect(errors, "console errors").toEqual([]);
  });
}

test("home page has SEO and share metadata", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("html").getAttribute("lang")).toMatch(/^(de|en)/);
  expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
  expect(await page.locator('meta[property="og:image"]').first().getAttribute("content")).toBeTruthy();
  expect(await page.locator('meta[name="viewport"]').getAttribute("content")).toContain("width=device-width");
});

test("pitch links are personalised and noindex", async ({ page }) => {
  await page.goto("/?for=Café%20Test");
  await expect(page.getByText(/Café Test/).first()).toBeVisible();
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
});

test("language switch changes the page language", async ({ page }) => {
  await page.goto("/menu");
  const before = await page.locator("h1").innerText();
  await page.getByRole("button", { name: /^(EN|DE)$|english|deutsch|language|sprache/i }).first().click();
  await expect(page.locator("h1")).not.toHaveText(before);
});

test("unknown pages show the custom 404", async ({ page }) => {
  const res = await page.goto("/nope-not-here");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toBeVisible();
});

test("photos are served as modern formats", async ({ request }) => {
  const res = await request.get("/_next/image?url=%2Fimg%2Fc1.jpg&w=828&q=75", { headers: { accept: "image/avif,image/webp,*/*" } });
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/avif|webp/);
});
