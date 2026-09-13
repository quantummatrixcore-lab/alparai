"use server";

import { createAdminClient } from "@/lib/dehost/admin";
import { logger } from "@/lib/utils/logger";

export async function logAdminLoginAction(userId: string, ipHash: string) {
  try {
    const dehost = createAdminClient();

    const { data: userProfile } = await dehost
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userProfile && ["admin", "ceo", "moderator", "advisor"].includes(userProfile.role)) {
      await dehost.from("audit_log").insert({
        actor_id: userId,
        action: "auth.login",
        entity_type: "user",
        entity_id: userId,
        ip_hash: ipHash,
        after_data: { role: userProfile.role },
      });

      try {
        await dehost.from("admin_login_events").insert({
          user_id: userId,
          ip_hash: ipHash,
        });
      } catch {
        // Fail-safe
      }
    }
  } catch (err) {
    logger.error("Failed to log admin login in action", undefined, err instanceof Error ? err : undefined);
  }
}