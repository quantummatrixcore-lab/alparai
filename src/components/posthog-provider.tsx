"use client";
let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }

import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";


function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key = (vault.read('NEXT_PUBLIC_POSTHOG_KEY') ?? process.env.NEXT_PUBLIC_POSTHOG_KEY);
  const isEnabled = Boolean(key && key !== "phc_dummy" && !key.startsWith("phc_dummy") && key !== "placeholder");

  useEffect(() => {
    if (typeof window !== "undefined" && isEnabled && !posthog.__loaded) {
      const initPostHog = () => {
        if (!posthog.__loaded && key) {
          posthog.init(key, {
            api_host: (vault.read('NEXT_PUBLIC_POSTHOG_HOST') ?? process.env.NEXT_PUBLIC_POSTHOG_HOST) || "https://us.i.posthog.com",
            person_profiles: "identified_only",
            capture_pageview: false,
            capture_pageleave: true,
            autocapture: false,
            disable_session_recording: true,
          });
        }
      };

      if ("requestIdleCallback" in window) {
        const handle = window.requestIdleCallback(initPostHog, { timeout: 3000 });
        return () => window.cancelIdleCallback(handle);
      } else {
        const timer = setTimeout(initPostHog, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isEnabled, key]);

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <Provider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </Provider>
  );
}
