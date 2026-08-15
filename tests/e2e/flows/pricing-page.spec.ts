import { test, expect } from "@playwright/test";

test.describe("Pricing Page Spec", () => {
  test("renders /pricing page with plans and CTA", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page).toHaveURL(/\/en\/pricing/);
    await expect(page.getByRole("heading").first()).toBeVisible();
    const cta = page.getByRole("button").first();
    await expect(cta).toBeVisible();
  });
});
