import { describe, expect, it } from "vitest";
import { computeArticle73Deadline, getArticle73Tier } from "@/lib/legal/article73";

describe("Article73 countdown engine", () => {
  it("critical maps to 2-day tier", () => {
    expect(getArticle73Tier({ severity: "critical" })).toBe("2-day");
  });
  it("high maps to 10-day tier", () => {
    expect(getArticle73Tier({ severity: "high" })).toBe("10-day");
  });
  it("deadline is deterministic for same input", () => {
    const a = computeArticle73Deadline({
      incidentDate: "2026-01-01T00:00:00.000Z",
      severity: "high",
      now: new Date("2026-01-05T00:00:00.000Z"),
    });
    const b = computeArticle73Deadline({
      incidentDate: "2026-01-01T00:00:00.000Z",
      severity: "high",
      now: new Date("2026-01-05T00:00:00.000Z"),
    });
    expect(a.dueAt).toBe(b.dueAt);
    expect(a.tier).toBe("10-day");
    expect(a.overdue).toBe(false);
  });
  it("flags overdue correctly", () => {
    const r = computeArticle73Deadline({
      incidentDate: "2026-01-01T00:00:00.000Z",
      severity: "critical",
      now: new Date("2026-02-01T00:00:00.000Z"),
    });
    expect(r.overdue).toBe(true);
  });
});
