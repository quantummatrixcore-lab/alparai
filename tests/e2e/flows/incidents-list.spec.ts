import { test, expect } from "@playwright/test";

test.describe("Incidents List Spec", () => {
  test("renders /incidents page and search/filter interface", async ({ page }) => {
    await page.goto("/en/incidents");
    await expect(page).toHaveURL(/\/en\/incidents/);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });
});
