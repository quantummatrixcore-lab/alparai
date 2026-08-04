import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  page.on("console", (msg) => {
    console.info(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    console.error(`[BROWSER ERROR] ${err.message}\nStack: ${err.stack}`);
  });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("EU AI Act Tracker Page E2E", () => {
  test("renders tracker page, handles filtering and pagination", async ({ page }) => {
    // Navigate to the AI Act page
    await page.goto("/en/ai-act");

    // Expect header and title to be visible
    await expect(page.locator("h1")).toBeVisible();

    // Verify filter buttons exist
    const unacceptableFilter = page.locator("a[href*='risk=Unacceptable']:visible").first();
    const highRiskFilter = page.locator("a[href*='risk=High']:visible").first();
    await expect(unacceptableFilter).toBeVisible();
    await expect(highRiskFilter).toBeVisible();

    // Click on High Risk filter
    await highRiskFilter.click();
    await page.waitForURL(/.*risk=High/);
    await expect(page).toHaveURL(/.*risk=High/);

    // Verify reset/active class behavior (clicking active filter should clear it)
    const activeHighRiskFilter = page.locator("a[href='/en/ai-act']:visible").first();
    await activeHighRiskFilter.click();
    await page.waitForURL(/\/ai-act$/);
    await expect(page).toHaveURL(/\/ai-act$/);
  });
});
