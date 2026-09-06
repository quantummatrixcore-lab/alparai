"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackFunnelEvent } from "@/actions/funnel";

export function ReferralTracker() {
  const searchParams = useSearchParams();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    const ref = searchParams.get("ref");
    const bh = searchParams.get("BH");
    const utmSource = searchParams.get("utm_source");
    const source = bh || ref || utmSource;
    if (source) {
      trackedRef.current = true;
      void trackFunnelEvent("visit", { source });
    }
  }, [searchParams]);

  return null;
}
