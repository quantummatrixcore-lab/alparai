import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  snapshotDir: "./ops/visual-baseline",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0,
      threshold: 0,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0,
      threshold: 0,
    },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
    { name: "mobile-pixel", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "npx next dev",
        port: 3000,
        timeout: 120_000,
        reuseExistingServer: true,
        env: {
          // NEXT_PUBLIC_DEHOST_URL: "https://mock-dehost.dehost.internal",
          // NEXT_PUBLIC_DEHOST_ANON_KEY: "mock-anon-key",
          // DEHOST_SERVICE_ROLE_KEY: "mock-service-role-key-for-playwright",
          IS_PLAYWRIGHT_TEST: "true",
          NEXT_TEST_AUTH_BYPASS: "true",
          NODE_ENV: "test",
          IP_SALT: process.env.IP_SALT ?? "test-salt-must-be-at-least-16-chars",
          NEXT_PUBLIC_APP_URL: "http://localhost:3000",
          DEHOST_PASSWORD: process.env.DEHOST_PASSWORD ?? "dehost-test-password",
        },
      },
});
