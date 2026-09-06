"use server";

import { requireAdmin } from "@/lib/auth/session";
export async function getPlausibleMetrics() {
  await requireAdmin();
  try {
    const apiKey = process.env.PLAUSIBLE_API_KEY;
    const siteId = process.env.PLAUSIBLE_SITE_ID || "alparai.com";

    if (!apiKey) {
      return {
        error: "PLAUSIBLE_API_KEY is not set in environment variables.",
        visitors: 0,
        pageviews: 0,
      };
    }

    try {
      const url = new URL("https://plausible.io/api/v1/stats/aggregate");
      url.searchParams.append("site_id", siteId);
      url.searchParams.append("period", "30d");
      url.searchParams.append("metrics", "visitors,pageviews");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: {
          revalidate: 60, // Cache for 60 seconds
        },
      });

      if (!res.ok) {
        console.error(`Plausible API Error: ${res.status} ${res.statusText}`);
        return {
          error: "Failed to fetch metrics from Plausible API.",
          visitors: 0,
          pageviews: 0,
        };
      }

      const data = await res.json();
      return {
        visitors: data.results?.visitors?.value || 0,
        pageviews: data.results?.pageviews?.value || 0,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching Plausible metrics:", error);
      return {
        error: "Internal server error fetching metrics.",
        visitors: 0,
        pageviews: 0,
      };
    }
  } catch (err) {
    console.error("[getPlausibleMetrics] Error:", err);
    throw err;
  }
}
