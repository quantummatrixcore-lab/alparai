import { test, expect } from "@playwright/test";

test.describe("Home Navigation Spec", () => {
  test("renders homepage and main navigation links", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en/);
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    const logo = page.getByRole("link", { name: /ALPAR/i }).first();
    await expect(logo).toBeVisible();
  });
});
