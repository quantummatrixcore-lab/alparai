import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("i18n Language & Routing Checks", () => {
  test("switches between English and Turkish languages and displays appropriate translations", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/en");
    await page.waitForLoadState("domcontentloaded");

    const headerTitle = page.locator("html");
    await expect(headerTitle).toHaveAttribute("lang", "en");

    if (isMobile) {
      const menuBtn = page.getByRole("button", { name: /open menu|menüyü aç/i }).first();
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();
    }

    const trButton = isMobile
      ? page.locator("#mobile-nav-panel").getByRole("button", { name: /^TR$/i }).first()
      : page.getByRole("button", { name: /^TR$/i }).first();
    await expect(trButton).toBeVisible();
    await trButton.click();
    await page.waitForURL(/\/tr/);

    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });

  test("DE locale renders correctly with German language attribute", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("FR locale renders correctly with French language attribute", async ({ page }) => {
    await page.goto("/fr");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("RU locale renders correctly with Russian language attribute", async ({ page }) => {
    await page.goto("/ru");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("admin routes remain accessible in DE and FR locales", async ({ page }) => {
    await page.goto("/de/admin");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page).toHaveURL(/\/de\/auth\/signin\?next=/);

    await page.goto("/fr/admin");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page).toHaveURL(/\/fr\/auth\/signin\?next=/);
  });
});
