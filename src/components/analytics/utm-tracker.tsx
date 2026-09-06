"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  captured_at: string;
}

const STORAGE_KEY = "alparai_utm";

function UtmTrackerComponent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const source = searchParams.get("utm_source");
    const medium = searchParams.get("utm_medium");
    const campaign = searchParams.get("utm_campaign");

    if (source || medium || campaign) {
      try {
        const utmData: UtmData = {
          ...(source ? { utm_source: source } : {}),
          ...(medium ? { utm_medium: medium } : {}),
          ...(campaign ? { utm_campaign: campaign } : {}),
          captured_at: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(utmData));
      } catch {
        // Quietly catch storage quota or security policy exceptions
      }
    }
  }, [searchParams]);

  return null;
}

export function UtmTracker() {
  return (
    <Suspense fallback={null}>
      <UtmTrackerComponent />
    </Suspense>
  );
}
