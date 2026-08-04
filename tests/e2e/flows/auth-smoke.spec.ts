import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

const AUTH_GATED_ADMIN_ROUTES = [
  "/admin/providers",
  "/admin/settings",
  "/admin/feature-flags",
  "/admin/geo",
  "/admin/health",
  "/admin/marketing",
  "/admin/users",
  "/admin/audit",
  "/admin/experts",
  "/admin/dsar",
  "/admin/billing",
  "/admin/analysis",
  "/admin/redaction-queue",
  "/admin/investors",
  "/admin/ecosystem",
  "/admin/cross-audit-dashboard",
  "/admin/takedown",
  "/admin/innovations",
];

const AUTH_GATED_USER_ROUTES = [
  "/settings",
  "/my-incidents",
  "/profile",
  "/onboarding",
  "/dashboard/compliance",
  "/dashboard/journalist",
  "/dashboard/legal",
  "/dashboard/safety",
];

test.describe("Auth Gates — Admin Routes", () => {
  for (const route of AUTH_GATED_ADMIN_ROUTES) {
    test(`unauthenticated access to ${route} redirects to signin`, async ({ page }) => {
      await page.goto(`/en${route}`);
      await page.waitForURL(/\/auth\/signin/);
      await expect(page).toHaveURL(/signin\?next=.*/);
    });
  }
});

test.describe("Auth Gates — User Routes", () => {
  for (const route of AUTH_GATED_USER_ROUTES) {
    test(`unauthenticated access to ${route} redirects to signin`, async ({ page }) => {
      await page.goto(`/en${route}`);
      await page.waitForURL(/\/auth\/signin/);
      await expect(page).toHaveURL(/signin\?next=.*/);
    });
  }
});
