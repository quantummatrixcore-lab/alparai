import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CRITICAL_PAGES = [
  "/en",
  "/en/incidents",
  "/en/ratings",
  "/en/transparency",
  "/en/methodology/k-benchmark",
];

test.describe("Accessibility (WCAG 2.2 AA)", () => {
  for (const path of CRITICAL_PAGES) {
    test(`${path} should have no critical or serious violations`, async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "alpar_cookie_consent",
          JSON.stringify({ level: "all", at: Date.now() }),
        );
      });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const violations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(violations).toEqual([]);
    });
  }
});
