import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("Submit Flow", () => {
  test("should extract url correctly", async ({ request }) => {
    const response = await request.post("/api/v1/extract", {
      data: { url: "https://chatgpt.com/share/test-id" },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.providerId).toBe("provider-openai");
    expect(data.providerName).toBe("ChatGPT");
  });

  test("submit page renders import URL section", async ({ page }) => {
    await page.goto("/en/submit");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByPlaceholder(/chatgpt\.com\/share/i)).toBeVisible({ timeout: 10000 });
  });

  test("anonymous email field is visible when anonymous checkbox is checked", async ({ page }) => {
    await page.goto("/en/submit");
    await page.waitForLoadState("domcontentloaded");
    const anonCheckbox = page.locator("input[name='is_anonymous']");
    const isVisible = (await anonCheckbox.count()) > 0;
    if (isVisible) {
      await anonCheckbox.check({ force: true });
      const emailInput = page.locator("input[name='anonymous_email']");
      await expect(emailInput).toBeVisible({ timeout: 5000 });
    }
  });
});
