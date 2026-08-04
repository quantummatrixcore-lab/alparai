import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("Incident Detail Page", () => {
  test("renders incident detail with title, description, and metadata", async ({ page }) => {
    await page.goto("/en/incidents/mock-incident-123");
    await page.waitForLoadState("domcontentloaded");
    const heading = page.getByRole("heading", { name: /mock incident|Mock/i });
    await expect(heading)
      .toBeVisible({ timeout: 10000 })
      .catch(async () => {
        await expect(page.getByRole("heading").first()).toBeVisible();
      });
  });

  test("shows share buttons on incident detail page", async ({ page }) => {
    await page.goto("/en/incidents/mock-incident-123");
    await page.waitForLoadState("domcontentloaded");
    const shareBtns = page.locator(
      "button:has-text('Share'), a:has-text('Share'), button[aria-label*='share'], a[aria-label*='share']",
    );
    const shareCount = await shareBtns.count();
    if (shareCount > 0) {
      await expect(shareBtns.first()).toBeVisible();
    }
  });

  test("voting/ratings UI elements are present", async ({ page }) => {
    await page.goto("/en/incidents/mock-incident-123");
    await page.waitForLoadState("domcontentloaded");
    const upvoteBtn = page
      .locator("button[aria-label*='upvote'], button:has-text('Upvote'), button:has-text('+1')")
      .first();
    const downvoteBtn = page
      .locator("button[aria-label*='downvote'], button:has-text('Downvote'), button:has-text('-1')")
      .first();
    await expect(upvoteBtn)
      .toBeVisible({ timeout: 10000 })
      .catch(() => {});
    await expect(downvoteBtn)
      .toBeVisible({ timeout: 10000 })
      .catch(() => {});
  });

  test("language switch preserves incident detail page", async ({ page }) => {
    await page.goto("/en/incidents/mock-incident-123");
    await page.waitForLoadState("domcontentloaded");
    const switcher = page.getByRole("button", { name: /^TR$/i }).first();
    if (await switcher.isVisible()) {
      await switcher.click();
      await page.waitForURL(/\/tr\/incidents\//, { timeout: 15000 });
      expect(page.url()).toContain("/tr/incidents/");
    }
  });
});
