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

import { trackFunnelEvent } from "@/actions/funnel";

/**
 * Retrieves current UTM parameters from URL search params merged with stored localStorage UTMs.
 */
export function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const utm: Record<string, string> = {};

  try {
    const params = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
      const val = params.get(key);
      if (val) utm[key] = val;
    });

    const stored = localStorage.getItem("alparai_utm");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.utm_source && !utm.utm_source) utm.utm_source = parsed.utm_source;
      if (parsed.utm_medium && !utm.utm_medium) utm.utm_medium = parsed.utm_medium;
      if (parsed.utm_campaign && !utm.utm_campaign) utm.utm_campaign = parsed.utm_campaign;
    }
  } catch {
    // Ignore storage quota or SSR errors
  }
  return utm;
}

/**
 * Tracks a showcase page view across Plausible & Supabase funnel_events with UTM data.
 */
export function trackShowcasePageView(pagePath: string) {
  const utm = getUtmParams();
  const cleanName = pagePath.replace(/^\//, "").replace(/\//g, "_") || "home";

  trackEvent(`page_view_${cleanName}`, utm);
  trackFunnelEvent(`page_view_${cleanName}`, { page: pagePath, ...utm });
  trackFunnelEvent("page_view", { page: pagePath, ...utm });
}

/**
 * Tracks a CTA click on a showcase page across Plausible & Supabase funnel_events with UTM data.
 */
export function trackShowcaseCtaClick(
  pagePath: string,
  ctaAction: string,
  extraData?: Record<string, unknown>,
) {
  const utm = getUtmParams();
  const cleanName = pagePath.replace(/^\//, "").replace(/\//g, "_") || "home";

  trackEvent(`cta_click_${cleanName}`, { action: ctaAction, ...extraData, ...utm });
  trackFunnelEvent(`cta_click_${cleanName}`, {
    page: pagePath,
    action: ctaAction,
    ...extraData,
    ...utm,
  });
  trackFunnelEvent("cta_click", { page: pagePath, action: ctaAction, ...extraData, ...utm });
}
