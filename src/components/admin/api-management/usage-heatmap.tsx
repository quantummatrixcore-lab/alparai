"use client";

import React from "react";
import type { Provider } from "./api-hub";
import { useTranslations } from "next-intl";

interface HeatmapData {
  hour: number;
  openai: number;
  anthropic: number;
  google: number;
  supabase: number;
  upstash: number;
  resend: number;
}

const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  openai: { bg: "bg-warning-500", text: "text-warning-900" },
  anthropic: { bg: "bg-brand-500", text: "text-brand-900" },
  google: { bg: "bg-success-500", text: "text-success-900" },
  supabase: { bg: "bg-pink-500", text: "text-pink-900" },
  upstash: { bg: "bg-accent-500", text: "text-accent-900" },
  resend: { bg: "bg-brand-500", text: "text-brand-900" },
};

function getHeatmapColor(value: number, maxValue: number) {
  const ratio = value / maxValue;

  if (ratio < 0.1) return "bg-bg-elevated";
  if (ratio < 0.2) return "bg-zinc-700";
  if (ratio < 0.4) return "bg-zinc-600";
  if (ratio < 0.6) return "bg-zinc-500";
  if (ratio < 0.8) return "bg-zinc-400";
  return "bg-zinc-300";
}

export function UsageHeatmap({
  providers,
  usageData = [],
}: {
  providers: Provider[];
  usageData?: HeatmapData[];
}) {
  const t = useTranslations("admin");

  const dataToUse =
    usageData.length > 0
      ? usageData
      : Array.from({ length: 24 }).map((_, i) => ({
          hour: i,
          openai: 0,
          anthropic: 0,
          google: 0,
          supabase: 0,
          upstash: 0,
          resend: 0,
        }));

  const allValues = dataToUse.flatMap((row) => [
    row.openai,
    row.anthropic,
    row.google,
    row.supabase,
    row.upstash,
    row.resend,
  ]);
  const maxValue = Math.max(...allValues);

  const providerIds = ["openai", "anthropic", "google", "supabase", "upstash", "resend"];

  return (
    <div className="space-y-4">
      <div className="bg-bg-elevated/80 border-border-subtle rounded-xl border p-6">
        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4">
          {providers.map((provider) => (
            <div key={provider.id} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded ${PROVIDER_COLORS[provider.id]?.bg || "bg-zinc-500"}`}
              />
              <span className="text-fg-muted text-xs">{provider.name}</span>
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div
            className="mb-4 grid gap-1"
            style={{ gridTemplateColumns: "60px repeat(24, minmax(32px, 1fr))" }}
          >
            {/* Header row with hours */}
            <div className="text-fg-disabled flex items-center justify-center text-xs font-semibold">
              {t("hour")}
            </div>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={`header-${i}`}
                className="text-fg-disabled flex items-center justify-center text-xs"
              >
                {i % 3 === 0 ? `${i}h` : ""}
              </div>
            ))}

            {/* Heatmap rows for each provider */}
            {providerIds.map((providerId) => (
              <React.Fragment key={providerId}>
                <div className="text-fg-muted flex items-center truncate text-xs font-semibold">
                  {providers.find((p) => p.id === providerId)?.name || providerId}
                </div>
                {dataToUse.map((row, hourIndex) => {
                  const value = row[providerId as keyof HeatmapData] as number;
                  const colorClass = getHeatmapColor(value, maxValue);

                  return (
                    <div
                      key={`${providerId}-${hourIndex}`}
                      className={`flex h-8 cursor-pointer items-center justify-center rounded ring-white/30 transition-all hover:ring-2 ${colorClass}`}
                      title={`${providers.find((p) => p.id === providerId)?.name}: ${value.toLocaleString()} requests at hour ${hourIndex}`}
                    >
                      <span className="text-[10px] font-semibold text-zinc-900 opacity-0 hover:opacity-100">
                        {value > 999 ? `${(value / 1000).toFixed(1)}K` : value}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Legend for intensity */}
        <div className="border-border-subtle mt-6 border-t pt-4">
          <p className="text-fg-muted mb-3 text-xs font-semibold">{t("intensity_scale")}</p>
          <div className="flex items-center gap-2">
            <span className="text-fg-disabled text-xs">{t("low")}</span>
            <div className="flex gap-1">
              {[
                "bg-bg-elevated",
                "bg-zinc-700",
                "bg-zinc-600",
                "bg-zinc-500",
                "bg-zinc-400",
                "bg-zinc-300",
              ].map((color, i) => (
                <div key={i} className={`h-4 w-4 rounded ${color}`} />
              ))}
            </div>
            <span className="text-fg-disabled text-xs">{t("high")}</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="border-border-subtle mt-6 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {providers.map((provider) => {
              const totalRequests = dataToUse.reduce(
                (sum, row) => sum + (row[provider.id as keyof HeatmapData] as number),
                0,
              );
              const avgRequests = Math.round(totalRequests / 24);

              return (
                <div key={provider.id}>
                  <p className="text-fg-disabled text-xs">{provider.name}</p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {totalRequests > 999 ? `${(totalRequests / 1000).toFixed(1)}K` : totalRequests}
                  </p>
                  <p className="text-fg-muted text-xs">
                    {t("avg")}
                    {avgRequests}/h
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
