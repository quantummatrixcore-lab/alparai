import { test } from "@playwright/test";

const TARGET_PAGES = [
  { name: "home", path: "/" },
  { name: "insights", path: "/insights" },
  { name: "models", path: "/models" },
];

test.describe("VRT Baseline Generator", () => {
  for (const { name, path } of TARGET_PAGES) {
    test(`capture baseline screenshot for ${name} (${path})`, async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "alpar_cookie_consent",
          JSON.stringify({ level: "all", at: Date.now() }),
        );
      });

      await page.goto(path, { waitUntil: "domcontentloaded" });

      await page.screenshot({
        path: `./ops/visual-baseline/${name}-fullpage.png`,
        fullPage: true,
      });
    });
  }
});
