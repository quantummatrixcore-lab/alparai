"use client";

import { useEffect } from "react";
import { incrementIncidentViews } from "@/actions/incidents";
import { logger } from "@/lib/utils/logger";

export function ViewTracker({ incidentId }: { incidentId: string }) {
  useEffect(() => {
    let active = true;
    const track = async () => {
      try {
        if (active) {
          await incrementIncidentViews(incidentId);
        }
      } catch (err) {
        if (active) {
          logger.error(
            "Failed to increment views",
            undefined,
            err instanceof Error ? err : undefined,
          );
        }
      }
    };
    track();
    return () => {
      active = false;
    };
  }, [incidentId]);

  return null;
}
