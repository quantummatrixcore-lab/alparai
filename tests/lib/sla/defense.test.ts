import { describe, expect, it } from "vitest";
import { defenseWindow } from "@/lib/sla/defense";

describe("B2B defense window", () => {
  it("blocks publish before 30 days", () => {
    const w = defenseWindow("2026-01-01T00:00:00.000Z", new Date("2026-01-10T00:00:00.000Z"));
    expect(w.canPublish).toBe(false);
    expect(w.expired).toBe(false);
  });
  it("allows publish after 30 days", () => {
    const w = defenseWindow("2026-01-01T00:00:00.000Z", new Date("2026-02-05T00:00:00.000Z"));
    expect(w.canPublish).toBe(true);
    expect(w.expired).toBe(true);
  });
});
