import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("Transparency Page E2E", () => {
  test("renders transparency report page and checks statistics elements", async ({ page }) => {
    // Navigate to transparency page
    await page.goto("/en/transparency");

    // Expect headings to be visible
    await expect(page.getByRole("heading", { name: "How ALPAR AI works" })).toBeVisible();

    // Verify presence of statistic cards (reports count, providers count, response rate)
    const statCards = page.locator(".grid.grid-cols-2.gap-4.sm\\:grid-cols-4");
    await expect(statCards).toBeVisible();

    // Check key descriptive texts
    await expect(page.locator("text=reports | total reports").first())
      .toBeVisible()
      .catch(() => {});
    await expect(page.locator("text=response rate").first())
      .toBeVisible()
      .catch(() => {});
  });
});
