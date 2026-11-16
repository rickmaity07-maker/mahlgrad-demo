import { defineConfig, devices } from "@playwright/test";

// Browser tests run the production build against a throwaway in-memory database
// (tests/support/e2e-server.mjs). They never touch the live Neon database.
const port = Number(process.env.E2E_PORT ?? 3100);
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-pass";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "test-results/report" }]],
  outputDir: "test-results/artifacts",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /site-health/ },
  ],
  webServer: {
    command: "node tests/support/e2e-server.mjs",
    url: `http://127.0.0.1:${port}/`,
    timeout: 300_000,
    reuseExistingServer: false,
    env: { E2E_PORT: String(port), E2E_ADMIN_PASSWORD: adminPassword },
  },
});
