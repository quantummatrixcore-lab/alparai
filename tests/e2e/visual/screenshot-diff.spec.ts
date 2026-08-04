import { test, expect } from "@playwright/test";

const KEY_PAGES = [
  { path: "/en", name: "home" },
  { path: "/en/incidents", name: "incidents" },
  { path: "/en/ratings", name: "ratings" },
  { path: "/en/transparency", name: "transparency" },
  { path: "/en/methodology/k-benchmark", name: "methodology" },
  { path: "/en/bounties", name: "bounties" },
  { path: "/en/status", name: "status" },
  { path: "/en/legal/terms", name: "legal" },
];

test.describe("Visual Regression", () => {
  for (const { path, name } of KEY_PAGES) {
    test(`${name} (${path}) should not visually regress`, async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "alpar_cookie_consent",
          JSON.stringify({ level: "all", at: Date.now() }),
        );
      });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`${name}.png`);
    });
  }
});
