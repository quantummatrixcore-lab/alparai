import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "../helpers/auth";

const ALL_ADMIN_ROUTES = [
  "/admin",
  "/admin/advisory-board",
  "/admin/ai-pulse",
  "/admin/analysis",
  "/admin/api-keys",
  "/admin/api-management",
  "/admin/api-metrics",
  "/admin/audit",
  "/admin/autopilot",
  "/admin/autopilot/analytics",
  "/admin/billing",
  "/admin/crons",
  "/admin/cross-audit-dashboard",
  "/admin/dsar",
  "/admin/ecosystem",
  "/admin/experts",
  "/admin/feature-flags",
  "/admin/finance",
  "/admin/geo",
  "/admin/grants",
  "/admin/health",
  "/admin/import",
  "/admin/innovations",
  "/admin/integrations",
  "/admin/investors",
  "/admin/k-benchmark",
  "/admin/launch-signal",
  "/admin/linkedin",
  "/admin/marketing",
  "/admin/master-plan",
  "/admin/moderation",
  "/admin/outreach",
  "/admin/platforms",
  "/admin/providers",
  "/admin/redaction-queue",
  "/admin/resources",
  "/admin/settings",
  "/admin/signals",
  "/admin/slo-dashboard",
  "/admin/social",
  "/admin/strategy",
  "/admin/strategy/questionnaire",
  "/admin/strategy/risks",
  "/admin/strategy/roadmap",
  "/admin/strategy/state-support",
  "/admin/strategy/swot",
  "/admin/strategy/valuation",
  "/admin/takedown",
  "/admin/users",
];

test.describe("360-Degree Admin Panel Ruthless QA Audit (49 Routes)", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  for (const route of ALL_ADMIN_ROUTES) {
    test(`360 QA Audit: ${route} loads cleanly without 500 or error boundary`, async ({ page }) => {
      const targetUrl = `/en${route}`;
      const response = await page.goto(targetUrl);

      // Verify status code is not server error (500)
      if (response) {
        expect(
          response.status(),
          `Route ${targetUrl} returned status ${response.status()}`,
        ).toBeLessThan(500);
      }

      await page.waitForLoadState("domcontentloaded");

      // Verify body is visible and no uncaught React error boundary triggered
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Check that page does not contain Next.js standard unhandled exception text
      const pageText = await body.innerText();
      expect(pageText).not.toContain("Application error: a client-side exception has occurred");
      expect(pageText).not.toContain("Unhandled Runtime Error");
    });
  }
});
