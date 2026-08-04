import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("Pricing Page", () => {
  test("renders pricing tiers", async ({ page }) => {
    await page.goto("/en/pricing");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/ALPAR AI/);
    await expect(page.getByRole("heading", { name: /pricing/i }).first()).toBeVisible();
  });
});

test.describe("Contact Page", () => {
  test("renders contact form", async ({ page }) => {
    await page.goto("/en/contact");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/ALPAR AI/);
    await expect(page.getByRole("heading", { name: /contact/i }).first()).toBeVisible();
  });
});

test.describe("Blog Post Detail", () => {
  test("renders blog post with content", async ({ page }) => {
    await page.goto("/en/blog/why-ai-accountability-matters-2025");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/ALPAR AI/);
  });

  test("blog post has JSON-LD BlogPosting", async ({ page }) => {
    await page.goto("/en/blog/why-ai-accountability-matters-2025");
    const jsonLds = page.locator('script[type="application/ld+json"]');
    const count = await jsonLds.count();
    expect(count).toBeGreaterThanOrEqual(2);

    let hasBlogPosting = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLds.nth(i).textContent();
      if (!content) continue;
      const parsed = JSON.parse(content);
      if (parsed["@type"] === "BlogPosting") {
        hasBlogPosting = true;
        break;
      }
    }
    expect(hasBlogPosting).toBe(true);
  });

  test("returns 404 for unknown blog slug", async ({ page }) => {
    const response = await page.goto("/en/blog/this-slug-does-not-exist-0000");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Error Pages", () => {
  test("returns 404 for unknown route", async ({ page }) => {
    const response = await page.goto("/en/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
