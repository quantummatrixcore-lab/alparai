import { describe, it, expect } from "vitest";
import {
  computeIdempotencyKey,
  parseClientIdempotencyKey,
  resolveIdempotencyKey,
  redactForLog,
} from "@/lib/autopilot/idempotency";
import { DEFAULT_IDEMPOTENCY } from "@/lib/autopilot/types";

describe("idempotency", () => {
  it("computeIdempotencyKey is deterministic", () => {
    const a = computeIdempotencyKey("submit", [{ a: 1, b: 2 }], DEFAULT_IDEMPOTENCY);
    const b = computeIdempotencyKey("submit", [{ a: 1, b: 2 }], DEFAULT_IDEMPOTENCY);
    expect(a).toBe(b);
  });

  it("computeIdempotencyKey order-independent for object keys", () => {
    const a = computeIdempotencyKey("submit", [{ a: 1, b: 2 }], DEFAULT_IDEMPOTENCY);
    const b = computeIdempotencyKey("submit", [{ b: 2, a: 1 }], DEFAULT_IDEMPOTENCY);
    expect(a).toBe(b);
  });

  it("computeIdempotencyKey differs for different inputs", () => {
    const a = computeIdempotencyKey("submit", [{ a: 1 }], DEFAULT_IDEMPOTENCY);
    const b = computeIdempotencyKey("submit", [{ a: 2 }], DEFAULT_IDEMPOTENCY);
    expect(a).not.toBe(b);
  });

  it("computeIdempotencyKey differs for different actions", () => {
    const a = computeIdempotencyKey("submit", [{ a: 1 }], DEFAULT_IDEMPOTENCY);
    const b = computeIdempotencyKey("vote", [{ a: 1 }], DEFAULT_IDEMPOTENCY);
    expect(a).not.toBe(b);
  });

  it("parseClientIdempotencyKey accepts valid format", () => {
    expect(parseClientIdempotencyKey("abc-123-DEF_456")).not.toBeNull();
  });

  it("parseClientIdempotencyKey rejects invalid input", () => {
    expect(parseClientIdempotencyKey("")).toBeNull();
    expect(parseClientIdempotencyKey("a".repeat(300))).toBeNull();
    expect(parseClientIdempotencyKey("contains spaces")).toBeNull();
    expect(parseClientIdempotencyKey("weird!chars")).toBeNull();
    expect(parseClientIdempotencyKey(null)).toBeNull();
    expect(parseClientIdempotencyKey(undefined)).toBeNull();
  });

  it("resolveIdempotencyKey prefers client when valid", () => {
    const result = resolveIdempotencyKey(
      DEFAULT_IDEMPOTENCY,
      "submit",
      [{ a: 1 }],
      "client-key-1234",
    );
    expect(String(result).startsWith("client:")).toBe(true);
  });

  it("resolveIdempotencyKey falls back to hash when no client", () => {
    const result = resolveIdempotencyKey(DEFAULT_IDEMPOTENCY, "submit", [{ a: 1 }], null);
    expect(String(result).startsWith("sha256:")).toBe(true);
  });

  it("resolveIdempotencyKey falls back when client is invalid", () => {
    const result = resolveIdempotencyKey(DEFAULT_IDEMPOTENCY, "submit", [{ a: 1 }], "x");
    expect(String(result).startsWith("sha256:")).toBe(true);
  });

  it("redactForLog masks object fields", () => {
    const r = redactForLog({ email: "a@b.c", name: "John", password: "secret" }, ["password"]);
    expect(r).toEqual({ email: "a@b.c", name: "John", password: "[REDACTED]" });
  });

  it("redactForLog recurses into arrays", () => {
    const r = redactForLog([{ api_key: "k1" }, { api_key: "k2" }], ["api_key"]);
    expect(r).toEqual([{ api_key: "[REDACTED]" }, { api_key: "[REDACTED]" }]);
  });

  it("redactForLog masks query strings", () => {
    const r = redactForLog("https://api.example.com/?token=abcd1234", ["token"]);
    expect(String(r)).toContain("token=[REDACTED]");
  });
});
