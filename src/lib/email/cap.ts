import { createHash } from "node:crypto";
import { logger } from "@/lib/utils/logger";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

/**
 * Check if the email recipient has received fewer than 3 notifications in the last 24 hours.
 * Uses Redis Rate Limit instead of database queries for performance.
 * If yes, log the email send to Redis and return true.
 * If no or on error, return false (indicating email should NOT be allowed/sent - fail-closed).
 */
export async function isEmailAllowed(email: string, emailType: string): Promise<boolean> {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();
  const emailHash = createHash("sha256").update(normalizedEmail).digest("hex");
  const key = `${RATE_LIMIT_KEYS.email_notification}:${emailHash}`;

  try {
    const result = await checkRateLimit(key);

    if (!result.ok) {
      logger.warn(
        `[EmailCap] Daily email cap of 3 reached for recipient. Skipping send. type=${emailType}`,
      );
      return false;
    }

    return true;
  } catch (err) {
    logger.error(
      "[EmailCap] Unexpected exception during check",
      undefined,
      err instanceof Error ? err : undefined,
    );
    // Fail-closed
    return false;
  }
}
