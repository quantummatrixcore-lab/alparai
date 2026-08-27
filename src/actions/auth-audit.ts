"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { logger } from "@/lib/utils/logger";

export async function logAdminLoginAction(userId: string, ipHash: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore
            }
          },
        },
      }
    );

    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userProfile && ["admin", "ceo", "moderator", "advisor"].includes(userProfile.role)) {
      await supabase.from("audit_log").insert({
        actor_id: userId,
        action: "auth.login",
        entity_type: "user",
        entity_id: userId,
        ip_hash: ipHash,
        after_data: { role: userProfile.role },
      });

      try {
        await supabase.from("admin_login_events").insert({
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