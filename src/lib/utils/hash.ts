import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export function requireIpSalt(): string {
  const salt = process.env.IP_SALT;

  if (process.env.NODE_ENV === "production") {
    if (!salt) {
      throw new Error(
        "CRITICAL SECURITY ERROR: IP_SALT environment variable is missing in production.",
      );
    }
    if (salt.length < 16) {
      throw new Error(
        "CRITICAL SECURITY ERROR: IP_SALT environment variable must be at least 16 characters in production.",
      );
    }
    return salt;
  }

  // Development/Test fallback
  if (!salt) {
    console.warn(
      "WARNING: IP_SALT environment variable is missing. Using insecure development fallback.",
    );
    return "fallback_default_salt_for_alparai_dev_123";
  }
  if (salt.length < 16) {
    console.warn(
      "WARNING: IP_SALT is shorter than 16 characters. Using padded fallback in development.",
    );
    return salt.padEnd(16, "0");
  }
  return salt;
}

export function hashIp(ip: string | null, salt: string = requireIpSalt()): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function generateProviderToken(incidentId: string, email: string): string {
  const salt = requireIpSalt();
  return createHash("sha256")
    .update(`${incidentId}:${email.toLowerCase().trim()}:${salt}`)
    .digest("hex");
}

export function verifyProviderToken(incidentId: string, email: string, token: string): boolean {
  const expected = generateProviderToken(incidentId, email);
  const expectedBuf = Buffer.from(expected, "hex");
  const tokenBuf = Buffer.from(token, "hex");
  if (expectedBuf.length !== tokenBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, tokenBuf);
}
