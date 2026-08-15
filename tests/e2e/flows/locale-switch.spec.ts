import { test, expect } from "@playwright/test";

test.describe("Locale Switch Spec", () => {
  test("switches language between EN and TR", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.goto("/tr");
    await expect(page).toHaveURL(/\/tr/);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });
});
