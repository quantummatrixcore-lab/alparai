import { test, expect } from "@playwright/test";

test.describe("Admin Integrations Page Layout", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the integrations list call from DeHost or API
    await page.route("**/*_dehost/rest/v1/integrations*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "1", provider: "slack", status: "connected", created_at: new Date().toISOString() },
          {
            id: "2",
            provider: "hubspot",
            status: "disconnected",
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto("/admin/integrations");
  });

  test("should render the integrations page layout correctly", async ({ page }) => {
    // Wait for the page heading to load (English or Turkish supported regex)
    const heading = page
      .locator("h1, h2")
      .filter({ hasText: /(Integrations|Entegrasyonlar)/i })
      .first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify that the main layout area is visible
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();

    // Verify that the page did not crash (Next.js error boundary check)
    const body = page.locator("body");
    await expect(body).not.toContainText("Application error: a client-side exception has occurred");
    await expect(body).not.toContainText("500 Internal Server Error");
  });
});
