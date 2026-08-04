import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatRelativeTime,
  formatNumber,
  slugify,
  sha256,
  getInitials,
} from "@/lib/utils";

describe("utils", () => {
  it("cn merges classes", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
    expect(cn("a", false && "b", "c")).toBe("a c");
    expect(cn("p-2", { "p-4": true })).toBe("p-4");
  });

  it("formatDate respects locale", () => {
    const d = new Date("2026-06-05T12:00:00Z");
    const en = formatDate(d, "en");
    const tr = formatDate(d, "tr");
    expect(typeof en).toBe("string");
    expect(typeof tr).toBe("string");
    expect(en.length).toBeGreaterThan(0);
  });

  it("formatRelativeTime returns recent phrasing for very recent", () => {
    const d = new Date(Date.now() - 5_000);
    const out = formatRelativeTime(d, "en");
    expect(out.toLowerCase()).toMatch(/now|second|minute|hour|day/);
  });

  it("formatNumber adds separators", () => {
    expect(formatNumber(1234567)).toMatch(/1.234.567|1,234,567/);
  });

  it("slugify lowercases and replaces", () => {
    expect(slugify("Hello World! 2026")).toBe("hello-world-2026");
  });

  it("sha256 is 64 hex chars", async () => {
    const h = await sha256("hello");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  it("getInitials", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
    expect(getInitials("john")).toBe("J");
    expect(getInitials("john@example.com")).toBe("J");
    expect(getInitials(null)).toBe("?");
  });
});
