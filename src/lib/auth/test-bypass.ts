/**
 * Test Auth Bypass Guard & Isolation Helper
 *
 * Strict multi-layer containment:
 * 1. NEVER allowed in production (process.env.NODE_ENV === "production")
 * 2. Requires process.env.NODE_ENV === "test"
 * 3. Requires process.env.NEXT_TEST_AUTH_BYPASS === "true"
 * 4. Requires process.env.IS_PLAYWRIGHT_TEST === "true"
 *
 * Any attempt to bypass auth outside these exact conditions is strictly rejected.
 */

import type { SessionUser } from "@/types";

export function isTestAuthBypassActive(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return (
    process.env.NODE_ENV === "test" &&
    process.env.NEXT_TEST_AUTH_BYPASS === "true" &&
    process.env.IS_PLAYWRIGHT_TEST === "true"
  );
}

export function assertTestBypassSafe(): void {
  if (
    process.env.NODE_ENV === "production" &&
    (process.env.IS_PLAYWRIGHT_TEST === "true" || process.env.NEXT_TEST_AUTH_BYPASS === "true")
  ) {
    throw new Error(
      "CRITICAL SECURITY VIOLATION: Test authentication bypass flags (IS_PLAYWRIGHT_TEST / NEXT_TEST_AUTH_BYPASS) detected in production environment! Aborting immediately.",
    );
  }
}

export function getPlaywrightMockUser(): SessionUser {
  return {
    id: "playwright-test-user",
    email: "admin@playwright.test",
    fullName: "Playwright Test Admin",
    avatarUrl: null,
    role: "admin",
    isVerified: true,
    createdAt: "2026-01-01T00:00:00Z",
  };
}
