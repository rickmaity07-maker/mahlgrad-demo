import { expect, test, type Page } from "@playwright/test";

// The demo-video path: menu -> item -> pickup -> status page -> order shows in admin ->
// Accept / Ready / Picked up -> the guest's status page and stamp card update.
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-pass";
const GUEST = { name: "E2E Testgast", phone: "0151 00000099" };

async function english(page: Page, baseURL: string | undefined) {
  await page.context().addCookies([{ name: "lang", value: "en", url: baseURL! }]);
}

async function addToCart(page: Page, item: RegExp) {
  await page.goto("/menu");
  await page.getByRole("button", { name: item }).first().click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: /^Add/ }).click();
}

test.describe.configure({ mode: "serial" });

let orderCode = "";

test("guest pre-orders a Flat White for pickup", async ({ page, baseURL }) => {
  await english(page, baseURL);
  await page.goto("/menu");
  await expect(page.getByRole("heading", { level: 1, name: "Menu" })).toBeVisible();
  await addToCart(page, /Flat White/);

  await page.goto("/checkout");
  await expect(page.getByText("Flat White").first()).toBeVisible();
  await page.getByLabel(/^Name/).fill(GUEST.name);
  await page.getByLabel(/Phone/).fill(GUEST.phone);
  await page.getByRole("button", { name: "Place pre-order" }).click();

  await expect(page).toHaveURL(/\/status\/[A-Z0-9]{6}$/);
  orderCode = page.url().split("/").pop()!;
  await expect(page.getByText(`Order ${orderCode}`)).toBeVisible();
  await expect(page.getByText("Received").first()).toBeVisible();
});

test("the order appears in admin and moves through the bar", async ({ page, baseURL }) => {
  expect(orderCode).toMatch(/^[A-Z0-9]{6}$/);
  await english(page, baseURL);
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);

  const card = () => page.locator("article").filter({ hasText: GUEST.name });
  await expect(card()).toBeVisible();
  for (const step of ["Accept", "Ready", "Picked up"]) {
    await card().getByRole("button", { name: step, exact: true }).click();
    await expect(card().getByRole("button", { name: step, exact: true })).toHaveCount(0);
  }
});

test("the guest sees it picked up and earned a stamp", async ({ page, baseURL, request }) => {
  await english(page, baseURL);
  await page.goto(`/status/${orderCode}`);
  await expect(page.getByText("Picked up").first()).toBeVisible();

  const res = await request.post("/api/loyalty", { data: { phone: GUEST.phone } });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
  // one drink picked up = one stamp on a fresh card
  expect(json.card).toMatchObject({ progress: 1, rewards: 0 });
  // the public lookup must never leak names
  expect(JSON.stringify(json)).not.toContain(GUEST.name);
});

test("a regular with a free drink can redeem it at checkout", async ({ page, baseURL }) => {
  await english(page, baseURL);
  await addToCart(page, /Cortado/);
  await page.goto("/checkout");
  await page.getByLabel(/^Name/).fill("Anouk");
  const phone = page.getByLabel(/Phone/);
  await phone.fill("0151 00000003");
  await phone.blur();
  const redeem = page.getByRole("checkbox");
  await expect(redeem).toBeVisible();
  await redeem.check();
  await page.getByRole("button", { name: "Place pre-order" }).click();
  await expect(page).toHaveURL(/\/status\/[A-Z0-9]{6}$/);
});
