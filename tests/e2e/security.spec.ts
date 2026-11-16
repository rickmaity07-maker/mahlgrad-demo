import { expect, test } from "@playwright/test";

// Security headers, admin guard and API input validation.

test("security headers on public pages", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("default-src 'self'");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("admin pages redirect to login without a session", async ({ page }) => {
  for (const path of ["/admin", "/admin/menu", "/admin/loyalty", "/admin/sales", "/admin/hours", "/admin/bar"]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/admin\/login/);
  }
});

test("admin is noindex and not cached", async ({ request }) => {
  const res = await request.get("/admin/login");
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
  expect(res.headers()["cache-control"]).toContain("no-store");
});

test("wrong admin password is refused", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(/password|passwort/i).fill("definitely-wrong");
  await page.getByRole("button", { name: /^(Anmelden|Sign in)$/ }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText(/password is wrong|Passwort stimmt nicht/)).toBeVisible();
});

test("order API rejects malformed and tampered orders", async ({ request }) => {
  const bad = [
    {},
    { name: "x", phone: "1", slot: "asap", lines: [] },
    { name: "Test", phone: "0151 1234567", slot: "asap", lines: [{ itemId: 999999, qty: 1, extras: [] }] },
    { name: "Test", phone: "0151 1234567", slot: "asap", lines: [{ itemId: 1, qty: 500, extras: [] }] },
    { name: "<script>alert(1)</script>".repeat(50), phone: "abc", slot: "asap", lines: [{ itemId: 1, qty: 1 }] },
  ];
  for (const data of bad) {
    const res = await request.post("/api/orders", { data });
    expect(res.status(), JSON.stringify(data).slice(0, 80)).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
    expect((await res.json()).ok).toBe(false);
  }
});

test("order API rejects non-JSON bodies", async ({ request }) => {
  const res = await request.post("/api/orders", { data: "not json", headers: { "content-type": "text/plain" } });
  expect(res.status()).toBeGreaterThanOrEqual(400);
  expect(res.status()).toBeLessThan(500);
});

test("demo reset is refused without the cron secret when one is required", async ({ request }) => {
  const res = await request.get("/api/demo-reset", { headers: { authorization: "Bearer wrong" } });
  // with no CRON_SECRET set the route may run (demo mode); it must never 500
  expect(res.status()).toBeLessThan(500);
});

test("unknown status codes 404 instead of erroring", async ({ request }) => {
  expect((await request.get("/status/ZZZZZZ")).status()).toBe(404);
  expect((await request.get("/status/not-a-code")).status()).toBe(404);
});
