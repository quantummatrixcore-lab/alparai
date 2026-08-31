"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { UtmTracker } from "@/components/analytics/utm-tracker";
import { ReferralTracker } from "@/components/marketing/referral-tracker";

// Non-critical telemetry loaded lazily with zero SSR impact
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => mod.Analytics),
  { ssr: false },
);

const PlausibleWithConsent = dynamic(
  () => import("@/components/plausible-consent").then((mod) => mod.PlausibleWithConsent),
  { ssr: false },
);

export function DeferredTelemetry() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Schedule telemetry mounting during browser idle time to optimize TBT & FCP
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        const handle = window.requestIdleCallback(() => setMounted(true), { timeout: 3000 });
        return () => window.cancelIdleCallback(handle);
      } else {
        const timer = setTimeout(() => setMounted(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <>
      <UtmTracker />
      <ReferralTracker />
      {mounted && (
        <>
          <PlausibleWithConsent />
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
