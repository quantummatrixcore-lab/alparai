import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Generate a stateless secure unsubscribe token for a given user.
 */
export function generateUnsubscribeToken(userId: string): string {
  const salt = process.env.UNSUBSCRIBE_SALT;
  if (!salt) {
    throw new Error("UNSUBSCRIBE_SALT environment variable is required");
  }
  return createHash("sha256").update(`${userId}:${salt}`).digest("hex");
}

/**
 * Verify if the provided unsubscribe token is valid for the given user.
 */
export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  if (!userId || !token) return false;
  const expected = generateUnsubscribeToken(userId);
  return expected === token;
}

/**
 * Generate a secure HMAC-based unsubscribe token for a given email address.
 */
export function generateEmailUnsubscribeToken(email: string): string {
  const salt = process.env.IP_SALT;
  if (!salt) {
    throw new Error("IP_SALT environment variable is required");
  }
  return createHmac("sha256", salt).update(email.toLowerCase().trim()).digest("hex");
}

/**
 * Verify if the provided HMAC unsubscribe token is valid for the given email address.
 */
export function verifyEmailUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  try {
    const expected = generateEmailUnsubscribeToken(email);
    const bufExpected = Buffer.from(expected);
    const bufProvided = Buffer.from(token);
    if (bufExpected.length !== bufProvided.length) return false;
    return timingSafeEqual(bufExpected, bufProvided);
  } catch {
    return false;
  }
}
