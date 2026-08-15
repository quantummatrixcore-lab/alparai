"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import type { Json } from "@/types/database";

export async function trackFunnelEvent(eventName: string, metadata?: Record<string, unknown>) {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const user = await getCurrentUser();
    const rlKey = user
      ? `${RATE_LIMIT_KEYS.funnel_event}:${user.id}`
      : `${RATE_LIMIT_KEYS.funnel_event}:${ip}`;
    const rl = await checkRateLimit(rlKey);
    if (!rl.ok) {
      return;
    }
    const supabase = await createServerClient();

    const { error } = await supabase.from("funnel_events").insert({
      event_name: eventName,
      user_id: user?.id ?? null,
      metadata: (metadata ?? {}) as Json,
    });

    if (error) {
      console.error("[trackFunnelEvent] DB error:", error);
      logger.error(`Failed to insert funnel event: ${eventName}`, { error, metadata });
    }
  } catch (err) {
    logger.error(`Error tracking funnel event: ${eventName}`, { err, metadata });
  }
}
