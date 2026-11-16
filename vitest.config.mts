import { defineConfig } from "vitest/config";

// Unit tests only; tests/e2e holds the Playwright browser suites (npm run test:e2e).
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});
