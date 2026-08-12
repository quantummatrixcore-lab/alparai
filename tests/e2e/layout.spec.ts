import { test, expect } from "@playwright/test";

const PAGES = [
  "/en",
  "/en/incidents",
  "/en/submit",
  "/en/ai-act",
  "/en/transparency",
  "/en/leaderboard",
  "/en/academy",
  "/en/blog",
  "/en/unsubscribe",
];

test.describe("Mobile Layout Responsiveness", () => {
  test.beforeEach(async ({ page }) => {
    // Block all external network requests to avoid SSL hang issues in WebKit
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (url.startsWith("http://localhost:3000") || url.startsWith("http://127.0.0.1:3000")) {
        route.continue();
      } else {
        route.abort("failed");
      }
    });

    // Pre-inject cookie consent to avoid banner cluttering layout
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "alpar_cookie_consent",
        JSON.stringify({ level: "all", at: Date.now() }),
      );
    });
  });

  for (const path of PAGES) {
    test(`page ${path} has no horizontal overflow on mobile`, async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
        return;
      }

      page.on("console", (msg) => console.info(`[PAGE LOG ${path}]:`, msg.text()));
      page.on("pageerror", (err) => console.info(`[PAGE ERROR ${path}]:`, err.message));

      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Ensure Tailwind CSS is applied before measuring by checking background color
      await page
        .waitForFunction(
          () => {
            const bg = window.getComputedStyle(document.body).backgroundColor;
            return (
              bg !== "rgba(0, 0, 0, 0)" &&
              bg !== "rgb(255, 255, 255)" &&
              bg !== "rgb(0, 0, 0)" &&
              bg !== ""
            );
          },
          { timeout: 8000 },
        )
        .catch(() => {});

      // Verify no horizontal overflow
      const overflow = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const bodyWidth = document.body.clientWidth;

        const maxScrollWidth = Math.max(scrollWidth, bodyScrollWidth);
        const maxInnerWidth = Math.max(innerWidth, bodyWidth);

        return {
          scrollWidth: maxScrollWidth,
          innerWidth: maxInnerWidth,
          hasOverflow: maxScrollWidth > maxInnerWidth + 1,
        };
      });

      expect(
        overflow.hasOverflow,
        `Page ${path} has horizontal overflow: scrollWidth is ${overflow.scrollWidth}px but innerWidth is ${overflow.innerWidth}px`,
      ).toBe(false);
    });
  }
});
