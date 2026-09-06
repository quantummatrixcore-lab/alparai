import { test, expect } from "@playwright/test";

test.describe("P0 - View Flow: Twins Leaderboard", () => {
  test("Leaderboard loads without crashing", async ({ page }) => {
    await page.goto("/en/twins-leaderboard");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15000 });
  });
});