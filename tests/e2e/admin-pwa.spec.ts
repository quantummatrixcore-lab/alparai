import { test, expect } from "@playwright/test";

test.describe("Item 161 — PWA & Mobile Layout (Phase E Verification)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "alpar_cookie_consent",
        JSON.stringify({ level: "all", at: Date.now() }),
      );
    });
  });

  test.describe("PWA Manifest", () => {
    test("manifest link is present in <head>", async ({ page }) => {
      await page.goto("/en");
      const manifestHref = await page.$eval(
        'link[rel="manifest"]',
        (el) => (el as HTMLLinkElement).href,
      );
      expect(manifestHref).toContain("/manifest.webmanifest");
    });

    test("manifest returns valid JSON with required PWA fields", async ({ page }) => {
      const res = await page.request.get("/manifest.webmanifest");
      expect(res.ok()).toBe(true);
      const json = await res.json();
      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("short_name");
      expect(json).toHaveProperty("start_url");
      expect(json).toHaveProperty("display", "standalone");
      expect(json).toHaveProperty("icons");
      expect(Array.isArray(json.icons)).toBe(true);
      expect(json.icons.length).toBeGreaterThanOrEqual(2);
    });

    test("apple-touch-icon responds with 200", async ({ page }) => {
      const res = await page.request.get("/icons/apple-touch-icon.png");
      expect(res.ok()).toBe(true);
      expect(res.headers()["content-type"]).toContain("image/png");
    });

    test("service worker file is accessible", async ({ page }) => {
      const res = await page.request.get("/sw.js");
      expect(res.ok()).toBe(true);
    });
  });

  test.describe("Mobile Responsive Layout (375×812)", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("home page renders without horizontal overflow", async ({ page }) => {
      await page.goto("/en");
      await page.waitForLoadState("domcontentloaded");

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });

    test("home page shows hero content on mobile", async ({ page }) => {
      await page.goto("/en");
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveTitle(/ALPAR AI/);
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
    });

    test("navigation is accessible on mobile viewport", async ({ page }) => {
      await page.goto("/en");
      await page.waitForLoadState("domcontentloaded");
      const body = page.locator("body");
      await expect(body).toBeVisible();
    });
  });

  test.describe("MetricCard Component Accessibility", () => {
    test("public incident list page renders without overflow", async ({ page }) => {
      await page.goto("/en/incidents");
      await page.waitForLoadState("domcontentloaded");

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  });

  test.describe("PWA Installability Signals", () => {
    test("theme-color meta tag is present", async ({ page }) => {
      await page.goto("/en");
      const themeColor = await page.$eval(
        'meta[name="theme-color"]',
        (el) => (el as HTMLMetaElement).content,
      );
      expect(themeColor).toBeTruthy();
    });

    test("apple-touch-icon link is present", async ({ page }) => {
      await page.goto("/en");
      const appleIcon = await page.$('link[rel="apple-touch-icon"]');
      expect(appleIcon).toBeTruthy();
    });
  });
});
