import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isTestAuthBypassActive,
  assertTestBypassSafe,
  getPlaywrightMockUser,
} from "@/lib/auth/test-bypass";

describe("AUTH-1 Test Bypass Isolation & Containment", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("isTestAuthBypassActive", () => {
    it("should return false if NODE_ENV is production, even if flags are set", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      process.env.IS_PLAYWRIGHT_TEST = "true";
      process.env.NEXT_TEST_AUTH_BYPASS = "true";

      expect(isTestAuthBypassActive()).toBe(false);
    });

    it("should return false if NODE_ENV is development", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.IS_PLAYWRIGHT_TEST = "true";
      process.env.NEXT_TEST_AUTH_BYPASS = "true";

      expect(isTestAuthBypassActive()).toBe(false);
    });

    it("should return false if NEXT_TEST_AUTH_BYPASS is missing in test mode", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "test";
      process.env.IS_PLAYWRIGHT_TEST = "true";
      delete process.env.NEXT_TEST_AUTH_BYPASS;

      expect(isTestAuthBypassActive()).toBe(false);
    });

    it("should return false if IS_PLAYWRIGHT_TEST is missing in test mode", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "test";
      process.env.NEXT_TEST_AUTH_BYPASS = "true";
      delete process.env.IS_PLAYWRIGHT_TEST;

      expect(isTestAuthBypassActive()).toBe(false);
    });

    it("should return true ONLY when NODE_ENV is test AND both bypass flags are true", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "test";
      process.env.IS_PLAYWRIGHT_TEST = "true";
      process.env.NEXT_TEST_AUTH_BYPASS = "true";

      expect(isTestAuthBypassActive()).toBe(true);
    });
  });

  describe("assertTestBypassSafe", () => {
    it("should throw in production if IS_PLAYWRIGHT_TEST is true", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      process.env.IS_PLAYWRIGHT_TEST = "true";
      delete process.env.NEXT_TEST_AUTH_BYPASS;

      expect(() => assertTestBypassSafe()).toThrow(
        /CRITICAL SECURITY VIOLATION/i,
      );
    });

    it("should throw in production if NEXT_TEST_AUTH_BYPASS is true", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.IS_PLAYWRIGHT_TEST;
      process.env.NEXT_TEST_AUTH_BYPASS = "true";

      expect(() => assertTestBypassSafe()).toThrow(
        /CRITICAL SECURITY VIOLATION/i,
      );
    });

    it("should not throw in production if flags are clean", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.IS_PLAYWRIGHT_TEST;
      delete process.env.NEXT_TEST_AUTH_BYPASS;

      expect(() => assertTestBypassSafe()).not.toThrow();
    });

    it("should not throw in test mode even if flags are set", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "test";
      process.env.IS_PLAYWRIGHT_TEST = "true";
      process.env.NEXT_TEST_AUTH_BYPASS = "true";

      expect(() => assertTestBypassSafe()).not.toThrow();
    });
  });

  describe("getPlaywrightMockUser", () => {
    it("should return a structured SessionUser with admin role", () => {
      const user = getPlaywrightMockUser();
      expect(user).toEqual({
        id: "playwright-test-user",
        email: "admin@playwright.test",
        fullName: "Playwright Test Admin",
        avatarUrl: null,
        role: "admin",
        isVerified: true,
        createdAt: "2026-01-01T00:00:00Z",
      });
    });
  });
});
