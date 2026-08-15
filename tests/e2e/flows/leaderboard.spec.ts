import { test, expect } from "@playwright/test";

test.describe("Leaderboard Spec", () => {
  test("renders /leaderboard page and provider scoring table", async ({ page }) => {
    await page.goto("/en/leaderboard");
    await expect(page).toHaveURL(/\/en\/leaderboard/);
    await expect(page.getByRole("heading").first()).toBeVisible();
    const table = page.locator("table, [role='table'], .grid").first();
    await expect(table).toBeVisible();
  });
});
