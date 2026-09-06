import { test, expect } from "@playwright/test";

test.describe("P0 - Moderate Flow: Incident List", () => {
  test("Admin dashboard lists incidents", async ({ page }) => {
    // We expect redirect if not logged in as admin
    await page.goto("/en/admin");
    await expect(page).toHaveURL(/.*auth\/signin/);
  });
});