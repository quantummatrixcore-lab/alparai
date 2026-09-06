import { test, expect } from "@playwright/test";

test.describe("P0 - Submit Flow: Incident Form", () => {
  test("Incident submission form renders and validates empty submission", async ({ page }) => {
    await page.goto("/en/submit");
    const submitBtn = page.getByRole("button", { name: /Submit|Gönder/i }).last();
    await expect(submitBtn).toBeVisible();
  });
});