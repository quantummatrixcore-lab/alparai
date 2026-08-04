"use client";

import { logger } from "@/lib/utils/logger";

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean | null | undefined> },
    ) => void;
  }
}

/**
 * Tracks a custom event in Plausible Analytics.
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean | null | undefined>,
) {
  if (typeof window !== "undefined") {
    try {
      if (window.plausible) {
        window.plausible(eventName, { props });
      } else {
        // Fallback or development logging
        if (process.env.NODE_ENV === "development") {
          logger.info(`[Plausible Event] ${eventName}`, props as Record<string, unknown>);
        }
      }
    } catch (err) {
      logger.error(
        "Failed to track Plausible event",
        undefined,
        err instanceof Error ? err : undefined,
      );
    }
  }
}
