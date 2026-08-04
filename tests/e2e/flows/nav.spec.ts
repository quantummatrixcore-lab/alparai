import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe.skip("Navigation Flow E2E (Broken Locators)", () => {
  test("shows Academy link directly on desktop and in mobile drawer without dropdown", async ({
    page,
  }) => {
    await page.goto("/en");

    // On mobile or screens < 2xl (1536px), the desktop nav is hidden
    const menuBtn = page.getByRole("button", { name: /open menu|menüyü aç/i }).first();

    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      // Inside mobile menu, the Academy link is visible directly
      const mobileAcademyLink = page.locator("a[href='/en/academy']:visible").first();
      await expect(mobileAcademyLink).toBeVisible();
      await expect(mobileAcademyLink).toHaveText(/Academy/i);
    } else {
      // On very large desktop (2xl+), the Academy link should be visible directly in the main header nav
      const desktopAcademyLink = page.locator("nav a[href='/en/academy']:visible").first();
      await expect(desktopAcademyLink).toBeVisible();
      await expect(desktopAcademyLink).toHaveText(/Academy/i);
    }
  });
});
