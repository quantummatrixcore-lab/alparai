import { test, expect } from "@playwright/test";

test.describe("P0 - View Flow: Public Incident", () => {
  test("Public incident page renders correctly", async ({ page }) => {
    await page.goto("/en/incidents");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });
});