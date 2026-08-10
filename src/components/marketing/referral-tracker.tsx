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
    if (ref) {
      trackedRef.current = true;
      void trackFunnelEvent("visit", { source: ref });
    }
  }, [searchParams]);

  return null;
}
