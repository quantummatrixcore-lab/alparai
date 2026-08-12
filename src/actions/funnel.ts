"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";
import type { Json } from "@/types/database";

export async function trackFunnelEvent(eventName: string, metadata?: Record<string, unknown>) {
  try {
    const user = await getCurrentUser();
    const supabase = await createServerClient();

    const { error } = await supabase.from("funnel_events").insert({
      event_name: eventName,
      user_id: user?.id ?? null,
      metadata: (metadata ?? {}) as Json,
    });

    if (error) {
      logger.error(`Failed to insert funnel event: ${eventName}`, { error, metadata });
    }
  } catch (err) {
    logger.error(`Error tracking funnel event: ${eventName}`, { err, metadata });
  }
}
