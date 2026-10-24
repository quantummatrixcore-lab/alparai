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
    expect(a.label).toBe("10 günlük yasal bildirim");
    expect(a.overdue).toBe(false);
  });
  it("computes 2-day tier with 48 saat label for critical incident", () => {
    const res = computeArticle73Deadline({
      incidentDate: "2026-01-01T00:00:00.000Z",
      severity: "critical",
      now: new Date("2026-01-01T12:00:00.000Z"),
    });
    expect(res.tier).toBe("2-day");
    expect(res.label).toBe("48 saat / 2 gün acil bildirim");
    expect(res.overdue).toBe(false);
    expect(res.remainingMs).toBe(36 * 3600 * 1000);
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
