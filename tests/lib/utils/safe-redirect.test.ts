import { describe, expect, it } from "vitest";

import { isSafeNextPath, sanitizeNextPath } from "@/lib/utils/safe-redirect";

describe("isSafeNextPath", () => {
  it("accepts a simple locale-prefixed relative path", () => {
    expect(isSafeNextPath("/en/admin/ai-hub/autopilot")).toBe(true);
  });

  it("accepts the root path", () => {
    expect(isSafeNextPath("/")).toBe(true);
  });

  it("rejects the empty string", () => {
    expect(isSafeNextPath("")).toBe(false);
  });

  it("rejects a path that does not start with a slash", () => {
    expect(isSafeNextPath("admin/users")).toBe(false);
  });

  it("rejects a protocol-relative URL", () => {
    expect(isSafeNextPath("//evil.com")).toBe(false);
  });

  it("rejects a backslash-prefixed path", () => {
    expect(isSafeNextPath("/\\evil.com")).toBe(false);
  });

  it("rejects an absolute URL with an http scheme", () => {
    expect(isSafeNextPath("/http://evil.com")).toBe(false);
  });

  it("rejects an absolute URL with an https scheme", () => {
    expect(isSafeNextPath("https://evil.com")).toBe(false);
  });

  it("rejects a javascript scheme payload", () => {
    expect(isSafeNextPath("/javascript:alert(1)")).toBe(false);
  });

  it("rejects a data scheme payload", () => {
    expect(isSafeNextPath("/data:text/html,evil")).toBe(false);
  });
});

describe("sanitizeNextPath", () => {
  it("returns the value unchanged when it is a safe relative path", () => {
    expect(sanitizeNextPath("/en/admin/analytics-hub/analysis")).toBe(
      "/en/admin/analytics-hub/analysis",
    );
  });

  it("falls back to /profile when given null", () => {
    expect(sanitizeNextPath(null)).toBe("/profile");
  });

  it("falls back to /profile when given undefined", () => {
    expect(sanitizeNextPath(undefined)).toBe("/profile");
  });

  it("falls back to /profile when given an empty string", () => {
    expect(sanitizeNextPath("")).toBe("/profile");
  });

  it("falls back to /profile when given a protocol-relative URL", () => {
    expect(sanitizeNextPath("//evil.com")).toBe("/profile");
  });

  it("falls back to /profile when given an absolute external URL", () => {
    expect(sanitizeNextPath("https://evil.com/phish")).toBe("/profile");
  });

  it("honors a custom fallback", () => {
    expect(sanitizeNextPath("//evil.com", "/en/profile")).toBe("/en/profile");
  });
});
