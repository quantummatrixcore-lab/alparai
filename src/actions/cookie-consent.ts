"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { getCurrentUser } from "@/lib/auth/session";

export async function logCookieConsent(
  consentLevel: "necessary" | "analytics" | "marketing",
): Promise<{ ok: boolean }> {
  try {
    const user = await getCurrentUser();
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const userAgent = hdrs.get("user-agent") ?? null;

    const admin = createAdminClient();
    const { error } = await admin.from("cookie_consent_log").insert({
      user_id: user?.id ?? null,
      consent_level: consentLevel,
      ip_hash: ipHash,
      user_agent: userAgent,
    });

    if (error) {
      logger.error("Failed to log cookie consent", undefined, error);
      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    logger.error("Cookie consent log exception", undefined, err instanceof Error ? err : undefined);
    return { ok: false };
  }
}
