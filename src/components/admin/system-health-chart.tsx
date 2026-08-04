"use client";

import { useTranslations } from "next-intl";

export function SystemHealthChart() {
  const t = useTranslations("admin");

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl">
        <div className="mb-6">
          <h3 className="font-bold tracking-tight text-white">
            {t("health_chart_title_incidents", { defaultValue: "Incidents vs Resolutions" })}
          </h3>
          <p className="text-fg-muted mt-1 font-mono text-xs">
            {t("health_chart_trajectory", { defaultValue: "7-Day Trajectory" })}
          </p>
        </div>
        <div className="flex h-64 w-full items-center justify-center">
          <p className="text-fg-muted text-sm">
            {t("health_chart_no_data", {
              defaultValue: "No data yet — connect Sentry/Vercel Analytics for real metrics.",
            })}
          </p>
        </div>
      </div>

      <div className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl">
        <div className="mb-6">
          <h3 className="font-bold tracking-tight text-white">
            {t("health_chart_title_api", { defaultValue: "API Gateway Traffic" })}
          </h3>
          <p className="text-fg-muted mt-1 font-mono text-xs">
            {t("health_chart_volume", { defaultValue: "Daily Requests Volume" })}
          </p>
        </div>
        <div className="flex h-64 w-full items-center justify-center">
          <p className="text-fg-muted text-sm">
            {t("health_chart_no_data", {
              defaultValue: "No data yet — connect Sentry/Vercel Analytics for real metrics.",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
