import { describe, expect, it } from "vitest";
import { checkInternalQuota } from "@/lib/internal/guard";

describe("internal quota guard", () => {
  it("rejects missing key", () => {
    expect(checkInternalQuota(null).ok).toBe(false);
  });
  it("allows first call with key", () => {
    const r = checkInternalQuota("test-client-" + Math.random().toString(36).slice(2));
    expect(r.ok).toBe(true);
  });
});
