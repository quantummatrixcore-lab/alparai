/**
 * Playwright E2E tests for the critical user flows.
 * Run with: pnpm test:e2e
 */
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("Home page", () => {
  test("renders hero, live feed, and leaderboard", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/ALPAR AI/);
    await expect(
      page.getByRole("heading", { name: /The world's first community-governed|ALPAR AI/i }).first(),
    ).toBeVisible();
    await expect(page.getByText(/live feed/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /leaderboard/i }).first()).toBeVisible();
  });

  test("switches language to Turkish", async ({ page, isMobile }) => {
    await page.goto("/en");
    await page.waitForLoadState("domcontentloaded");
    if (isMobile) {
      const menuBtn = page.getByRole("button", { name: /open menu|menüyü aç/i }).first();
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();
    }
    const switcher = isMobile
      ? page.locator("#mobile-nav-panel").getByRole("button", { name: /^TR$/i }).first()
      : page.getByRole("button", { name: /^TR$/i }).first();
    await expect(switcher).toBeVisible();
    await switcher.click();
    await page.waitForURL(/\/tr/, { timeout: 15000 });
  });
});

test.describe("Auth flows", () => {
  test("signin page shows continue with google option", async ({ page }) => {
    await page.goto("/en/auth/signin");
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  });
});

test.describe("Legal pages", () => {
  test("privacy policy renders", async ({ page }) => {
    await page.goto("/en/legal/privacy");
    await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible();
  });
  test("takedown form renders", async ({ page }) => {
    await page.goto("/en/legal/takedown");
    await expect(page.getByRole("heading", { name: /takedown/i })).toBeVisible();
    await expect(page.getByLabel(/url of the content/i)).toBeVisible();
  });
});

test.describe("Model pages", () => {
  test("model catalog renders", async ({ page }) => {
    await page.goto("/en/models");
    await expect(page.getByRole("heading", { name: /ai models/i })).toBeVisible();
  });
});
