import { describe, it, expect, beforeEach } from "vitest";
import {
  computeIdempotencyKey,
  redactForLog,
  resolveIdempotencyKey,
  parseClientIdempotencyKey,
} from "@/lib/autopilot/idempotency";
import { DEFAULT_IDEMPOTENCY, type IdempotencyConfig } from "@/lib/autopilot/types";

describe("idempotency full suite", () => {
  let config: IdempotencyConfig;
  beforeEach(() => {
    config = { ...DEFAULT_IDEMPOTENCY };
  });

  it("hashInputs=false produces stable act key", () => {
    const a = computeIdempotencyKey("submit", [{ a: 1 }], { ...config, hashInputs: false });
    const b = computeIdempotencyKey("submit", [{ a: 999 }], { ...config, hashInputs: false });
    expect(a).toBe(b);
  });

  it("enabled=false returns unique noop keys", () => {
    const a = computeIdempotencyKey("submit", [{ a: 1 }], { ...config, enabled: false });
    const b = computeIdempotencyKey("submit", [{ a: 1 }], { ...config, enabled: false });
    expect(a).not.toBe(b);
  });

  it("parseClientIdempotencyKey boundary lengths", () => {
    expect(parseClientIdempotencyKey("a".repeat(8))).not.toBeNull();
    expect(parseClientIdempotencyKey("a".repeat(7))).toBeNull();
    expect(parseClientIdempotencyKey("a".repeat(256))).not.toBeNull();
    expect(parseClientIdempotencyKey("a".repeat(257))).toBeNull();
  });

  it("resolveIdempotencyKey null header -> hash", () => {
    const r = resolveIdempotencyKey(config, "submit", [{ a: 1 }], null);
    expect(String(r).startsWith("sha256:")).toBe(true);
  });

  it("redactForLog leaves non-string non-object untouched", () => {
    expect(redactForLog(42, ["x"])).toBe(42);
    expect(redactForLog(true, ["x"])).toBe(true);
    expect(redactForLog(null, ["x"])).toBe(null);
  });
});
