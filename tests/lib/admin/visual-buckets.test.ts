import { describe, expect, it } from "vitest";
import { bucketBySeverity, bucketByCategory, bucketByWeek } from "@/components/admin/admin-visuals";

describe("admin visual buckets", () => {
  it("buckets severities case-insensitively, rest to diğer", () => {
    const out = bucketBySeverity([
      { severity: "CRITICAL" },
      { severity: "high" },
      { severity: "Low" },
      { severity: "weird" },
      {},
    ]);
    const m = new Map(out.map((b) => [b.key, b.count]));
    expect(m.get("critical")).toBe(1);
    expect(m.get("high")).toBe(1);
    expect(m.get("low")).toBe(1);
    expect(m.get("medium")).toBe(0);
    expect(m.get("diğer")).toBe(2);
  });
  it("ranks categories desc and caps top", () => {
    const rows = [
      ...Array.from({ length: 5 }, () => ({ category: "bias" })),
      ...Array.from({ length: 3 }, () => ({ category: "privacy" })),
      ...Array.from({ length: 8 }, () => ({ category: "hallucination" })),
    ];
    const out = bucketByCategory(rows, 2);
    expect(out.map((b) => b.key)).toEqual(["hallucination", "bias"]);
  });
  it("produces a fixed 12-week window", () => {
    const out = bucketByWeek([{ created_at: new Date().toISOString() }]);
    expect(out).toHaveLength(12);
    expect(out.reduce((s, b) => s + b.count, 0)).toBe(1);
  });
  it("ignores dateless and future-out-of-window rows safely", () => {
    const out = bucketByWeek([{ created_at: null }, { created_at: "not-a-date" }]);
    expect(out.reduce((s, b) => s + b.count, 0)).toBe(0);
  });
});
