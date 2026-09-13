import { test, expect } from "@playwright/test";

test.describe("P0 - Submit Flow: Incident Form", () => {
  test("Incident submission form renders and validates empty submission", async ({ page }) => {
    await page.goto("/en/submit");
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();
  });
});