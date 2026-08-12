import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "alpar_cookie_consent",
        JSON.stringify({ level: "all", at: Date.now() }),
      );
    });
  });

  test("skip navigation link is functional", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    await page.goto("/en");
    await page.waitForLoadState("domcontentloaded");
    const skipLink = page.locator("a[href='#main-content']");
    const isPresent = (await skipLink.count()) > 0;
    if (isPresent) {
      await skipLink.focus();
      await expect(skipLink).toBeVisible();
      await skipLink.click();
      const main = page.locator("#main-content");
      await expect(main).toBeFocused();
    } else {
      test.skip();
    }
  });

  test("all images have alt text or are decorative", async ({ page }) => {
    await page.goto("/en");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const ariaHidden = await img.getAttribute("aria-hidden");
      const role = await img.getAttribute("role");
      const hasAccessibleLabel = alt !== null || ariaHidden === "true" || role === "presentation";
      expect(hasAccessibleLabel, `Image ${i} missing alt text or aria-hidden`).toBeTruthy();
    }
  });

  test("page has exactly one h1 heading", async ({ page }) => {
    await page.goto("/en");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("interactive elements are keyboard focusable", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    await page.goto("/en");
    await page.waitForLoadState("domcontentloaded");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("language switcher works with keyboard", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    await page.goto("/en");
    await page.waitForLoadState("domcontentloaded");
    const switcher = page.getByRole("button", {
      name: /^TR$/i,
    });
    if (!(await switcher.isVisible())) {
      test.skip();
      return;
    }
    await switcher.focus();
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/tr/, { timeout: 15000 });
  });

  test("focusable elements have visible focus indicators", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    await page.goto("/en");
    await page.waitForLoadState("domcontentloaded");
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
    const outline = await focusedElement.evaluate((el) => window.getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("page language attribute is set correctly", async ({ page }) => {
    await page.goto("/en");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");

    await page.goto("/tr");
    const langTr = await page.locator("html").getAttribute("lang");
    expect(langTr).toBe("tr");
  });

  test("Home page has no axe accessibility violations", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("domcontentloaded");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Submit page has no axe accessibility violations", async ({ page }) => {
    await page.goto("/en/submit");
    await page.waitForLoadState("domcontentloaded");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("AI Act Tracker page has no axe accessibility violations", async ({ page }) => {
    await page.goto("/en/ai-act");
    await page.waitForLoadState("domcontentloaded");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
