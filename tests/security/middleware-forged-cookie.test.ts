import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import "./../helpers/setup";

vi.mock("@/i18n/routing", () => ({
  routing: {},
}));

vi.mock("next-intl/middleware", () => ({
  default: () => () => undefined,
}));

vi.mock("@/lib/dehost/middleware", () => ({
  updateSession: (req: unknown, res: unknown) => ({ response: res, user: null }),
}));

vi.mock("@/lib/geo/bot-tracker", () => ({
  trackBotHit: vi.fn().mockResolvedValue(undefined),
}));

// REV: P0 regression — unsigned admin fallback cookie must not grant access.
function signPayload(payload: string, secret: string): string {
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

describe("middleware forged-cookie guard", () => {
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    process.env.SESSION_SECRET = "test-middleware-secret-1234567890";
    process.env.CRON_SECRET = "test-middleware-secret-1234567890";
  });

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it("source fails closed: verifies HMAC before trusting fallback cookie", async () => {
    const src = readFileSync(join(process.cwd(), "src", "middleware.ts"), "utf8");
    expect(src).toContain("verifyMiddlewareHmac");
    expect(src).toContain("if (!secret) return null");
    expect(src).toContain("await parseAlparSessionCookie");
  });

  it("accepts a correctly signed cookie payload", async () => {
    const { parseAlparSessionCookie } = await import("@/middleware");
    const payload = Buffer.from(
      JSON.stringify({ id: "u1", email: "user@example.com", role: "user" }),
    ).toString("base64url");
    const token = signPayload(payload, process.env.SESSION_SECRET!);
    const parsed = await parseAlparSessionCookie(token);
    expect(parsed?.email).toBe("user@example.com");
  });

  it("rejects forged admin payload without valid signature", async () => {
    const { parseAlparSessionCookie } = await import("@/middleware");
    const forgedPayload = Buffer.from(
      JSON.stringify({ id: "attacker", email: "attacker@example.com", role: "admin" }),
    ).toString("base64url");
    const forged = `${forgedPayload}.invalidsignature`;
    expect(await parseAlparSessionCookie(forged)).toBeNull();
    expect(await parseAlparSessionCookie(forgedPayload)).toBeNull();
  });

  it("vault enforces VAULT_ENCRYPTION_KEY in production", async () => {
    const prevVault = process.env.VAULT_ENCRYPTION_KEY;
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.VAULT_ENCRYPTION_KEY;
    process.env.CRON_SECRET = "fallback-only";
    const { encryptAtRest } = await import("@/lib/security/vault");
    expect(() => encryptAtRest("secret")).toThrow();
    if (prevVault !== undefined) process.env.VAULT_ENCRYPTION_KEY = prevVault;
    else delete process.env.VAULT_ENCRYPTION_KEY;
    vi.unstubAllEnvs();
  });
});
