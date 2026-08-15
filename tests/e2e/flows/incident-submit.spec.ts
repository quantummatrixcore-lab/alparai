import { test, expect } from "@playwright/test";

test.describe("Incident Submit Spec", () => {
  test("renders /submit incident reporting page and form elements", async ({ page }) => {
    await page.goto("/en/submit");
    await expect(page).toHaveURL(/\/en\/submit/);
    const form = page.locator("form").first();
    await expect(form).toBeVisible();
    await expect(form.getByRole("button").filter({ hasText: /Submit|Report/i })).toBeVisible();
  });
});
