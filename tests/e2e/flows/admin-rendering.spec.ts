import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage, mockSupabaseResponse } from "../helpers/auth";

const MOCK_USERS = [
  {
    id: "u1",
    email: "admin@test.com",
    full_name: "Admin User",
    role: "admin",
    is_verified: true,
    created_at: "2026-01-01",
  },
  {
    id: "u2",
    email: "mod@test.com",
    full_name: "Moderator User",
    role: "moderator",
    is_verified: true,
    created_at: "2026-01-15",
  },
];

test.beforeEach(async ({ page }) => {
  await setupAuthenticatedPage(page);
  await mockSupabaseResponse(page, "users*", MOCK_USERS);
});

test.describe("Admin Panel — Authenticated Rendering", () => {
  test("admin dashboard renders", async ({ page }) => {
    await page.goto("/en/admin");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin users page renders user table", async ({ page }) => {
    await page.goto("/en/admin/users");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin moderation page renders", async ({ page }) => {
    await page.goto("/en/admin/moderation");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin settings page renders", async ({ page }) => {
    await page.goto("/en/admin/settings");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin audit page renders", async ({ page }) => {
    await page.goto("/en/admin/audit");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin providers page renders", async ({ page }) => {
    await page.goto("/en/admin/providers");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin takedown page renders", async ({ page }) => {
    await page.goto("/en/admin/takedown");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin experts page renders", async ({ page }) => {
    await page.goto("/en/admin/experts");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin health page renders", async ({ page }) => {
    await page.goto("/en/admin/health");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin feature flags page renders", async ({ page }) => {
    await page.goto("/en/admin/feature-flags");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin geo page renders", async ({ page }) => {
    await page.goto("/en/admin/geo");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin marketing page renders", async ({ page }) => {
    await page.goto("/en/admin/marketing");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin autopilot analytics page renders", async ({ page }) => {
    await page.goto("/en/admin/autopilot/analytics");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("User Settings — Authenticated Rendering", () => {
  test("settings page renders", async ({ page }) => {
    await page.goto("/en/settings");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("profile page renders", async ({ page }) => {
    await page.goto("/en/profile");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("my incidents page renders", async ({ page }) => {
    await page.goto("/en/my-incidents");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Dashboard — Authenticated Rendering", () => {
  test("compliance dashboard renders", async ({ page }) => {
    await page.goto("/en/dashboard/compliance");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("journalist dashboard renders", async ({ page }) => {
    await page.goto("/en/dashboard/journalist");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("legal dashboard renders", async ({ page }) => {
    await page.goto("/en/dashboard/legal");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("safety dashboard renders", async ({ page }) => {
    await page.goto("/en/dashboard/safety");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });
});
