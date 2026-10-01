import { describe, it, expect } from "vitest";
import { safeNextPath, detectLocale } from "@/lib/auth/callback-helpers";
import { NextRequest } from "next/server";
import { DEFAULT_LOCALE } from "@/lib/constants";

describe("safeNextPath", () => {
  it("defaults to /profile when raw is null, empty or root", () => {
    expect(safeNextPath(null)).toBe("/profile");
    expect(safeNextPath("")).toBe("/profile");
    expect(safeNextPath("/")).toBe("/profile");
  });

  it("blocks open redirects and protocol-relative paths", () => {
    expect(safeNextPath("https://evil.com")).toBe("/profile");
    expect(safeNextPath("//evil.com")).toBe("/profile");
    expect(safeNextPath("/\\evil.com")).toBe("/profile");
    expect(safeNextPath("javascript:alert(1)")).toBe("/profile");
  });

  it("allows safe internal application paths", () => {
    expect(safeNextPath("/incidents")).toBe("/incidents");
    expect(safeNextPath("/admin/dashboard")).toBe("/admin/dashboard");
    expect(safeNextPath("/tr/settings")).toBe("/tr/settings");
  });
});

describe("detectLocale", () => {
  it("detects supported locale from accept-language header", () => {
    const reqTr = new NextRequest("http://localhost/auth/callback", {
      headers: { "accept-language": "tr-TR,tr;q=0.9,en;q=0.8" }
    });
    expect(detectLocale(reqTr)).toBe("tr");

    const reqEn = new NextRequest("http://localhost/auth/callback", {
      headers: { "accept-language": "en-US,en;q=0.9" }
    });
    expect(detectLocale(reqEn)).toBe("en");
  });

  it("falls back to DEFAULT_LOCALE when accept-language is missing or unsupported", () => {
    const reqEmpty = new NextRequest("http://localhost/auth/callback");
    expect(detectLocale(reqEmpty)).toBe(DEFAULT_LOCALE);

    const reqUnsupported = new NextRequest("http://localhost/auth/callback", {
      headers: { "accept-language": "ja-JP,ja;q=0.9" }
    });
    expect(detectLocale(reqUnsupported)).toBe(DEFAULT_LOCALE);
  });
});
