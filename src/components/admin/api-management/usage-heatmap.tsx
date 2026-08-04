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

const MOCK_24H_USAGE: HeatmapData[] = [
  { hour: 0, openai: 280, anthropic: 420, google: 850, supabase: 1200, upstash: 8500, resend: 0 },
  { hour: 1, openai: 120, anthropic: 180, google: 450, supabase: 800, upstash: 4200, resend: 0 },
  { hour: 2, openai: 90, anthropic: 110, google: 320, supabase: 600, upstash: 2100, resend: 0 },
  { hour: 3, openai: 75, anthropic: 95, google: 280, supabase: 500, upstash: 1800, resend: 1 },
  { hour: 4, openai: 65, anthropic: 85, google: 250, supabase: 450, upstash: 1500, resend: 0 },
  { hour: 5, openai: 110, anthropic: 160, google: 380, supabase: 700, upstash: 3200, resend: 2 },
  { hour: 6, openai: 450, anthropic: 620, google: 1100, supabase: 2100, upstash: 12000, resend: 5 },
  {
    hour: 7,
    openai: 890,
    anthropic: 1200,
    google: 1850,
    supabase: 3500,
    upstash: 18000,
    resend: 2,
  },
  {
    hour: 8,
    openai: 1200,
    anthropic: 1650,
    google: 2200,
    supabase: 4200,
    upstash: 24000,
    resend: 3,
  },
  {
    hour: 9,
    openai: 1400,
    anthropic: 1850,
    google: 2400,
    supabase: 4600,
    upstash: 28000,
    resend: 1,
  },
  {
    hour: 10,
    openai: 1300,
    anthropic: 1750,
    google: 2300,
    supabase: 4400,
    upstash: 26000,
    resend: 0,
  },
  {
    hour: 11,
    openai: 1100,
    anthropic: 1550,
    google: 2100,
    supabase: 4000,
    upstash: 22000,
    resend: 2,
  },
  {
    hour: 12,
    openai: 950,
    anthropic: 1350,
    google: 1900,
    supabase: 3600,
    upstash: 20000,
    resend: 4,
  },
  {
    hour: 13,
    openai: 1050,
    anthropic: 1450,
    google: 2000,
    supabase: 3800,
    upstash: 21000,
    resend: 3,
  },
  {
    hour: 14,
    openai: 1200,
    anthropic: 1600,
    google: 2150,
    supabase: 4100,
    upstash: 23000,
    resend: 2,
  },
  {
    hour: 15,
    openai: 1350,
    anthropic: 1800,
    google: 2300,
    supabase: 4400,
    upstash: 25000,
    resend: 1,
  },
  {
    hour: 16,
    openai: 1280,
    anthropic: 1750,
    google: 2250,
    supabase: 4300,
    upstash: 24000,
    resend: 2,
  },
  {
    hour: 17,
    openai: 1100,
    anthropic: 1550,
    google: 2000,
    supabase: 4000,
    upstash: 22000,
    resend: 5,
  },
  {
    hour: 18,
    openai: 850,
    anthropic: 1200,
    google: 1700,
    supabase: 3200,
    upstash: 18000,
    resend: 3,
  },
  {
    hour: 19,
    openai: 650,
    anthropic: 950,
    google: 1400,
    supabase: 2600,
    upstash: 14000,
    resend: 2,
  },
  {
    hour: 20,
    openai: 520,
    anthropic: 780,
    google: 1100,
    supabase: 2100,
    upstash: 11000,
    resend: 1,
  },
  { hour: 21, openai: 420, anthropic: 630, google: 900, supabase: 1800, upstash: 9000, resend: 0 },
  { hour: 22, openai: 350, anthropic: 520, google: 750, supabase: 1500, upstash: 7500, resend: 0 },
  { hour: 23, openai: 310, anthropic: 480, google: 680, supabase: 1400, upstash: 6800, resend: 0 },
];

const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  openai: { bg: "bg-amber-500", text: "text-amber-900" },
  anthropic: { bg: "bg-indigo-500", text: "text-indigo-900" },
  google: { bg: "bg-emerald-500", text: "text-emerald-900" },
  supabase: { bg: "bg-pink-500", text: "text-pink-900" },
  upstash: { bg: "bg-cyan-500", text: "text-cyan-900" },
  resend: { bg: "bg-purple-500", text: "text-purple-900" },
};

function getHeatmapColor(value: number, maxValue: number) {
  const ratio = value / maxValue;

  if (ratio < 0.1) return "bg-zinc-800";
  if (ratio < 0.2) return "bg-zinc-700";
  if (ratio < 0.4) return "bg-zinc-600";
  if (ratio < 0.6) return "bg-zinc-500";
  if (ratio < 0.8) return "bg-zinc-400";
  return "bg-zinc-300";
}

export function UsageHeatmap({ providers }: { providers: Provider[] }) {
  const t = useTranslations("admin");
  const allValues = MOCK_24H_USAGE.flatMap((row) => [
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
      <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4">
          {providers.map((provider) => (
            <div key={provider.id} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded ${PROVIDER_COLORS[provider.id]?.bg || "bg-zinc-500"}`}
              />
              <span className="text-xs text-zinc-400">{provider.name}</span>
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
            <div className="flex items-center justify-center text-xs font-semibold text-zinc-500">
              {t("hour")}
            </div>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={`header-${i}`}
                className="flex items-center justify-center text-xs text-zinc-500"
              >
                {i % 3 === 0 ? `${i}h` : ""}
              </div>
            ))}

            {/* Heatmap rows for each provider */}
            {providerIds.map((providerId) => (
              <React.Fragment key={providerId}>
                <div className="flex items-center truncate text-xs font-semibold text-zinc-400">
                  {providers.find((p) => p.id === providerId)?.name || providerId}
                </div>
                {MOCK_24H_USAGE.map((row, hourIndex) => {
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
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="mb-3 text-xs font-semibold text-zinc-400">{t("intensity_scale")}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{t("low")}</span>
            <div className="flex gap-1">
              {[
                "bg-zinc-800",
                "bg-zinc-700",
                "bg-zinc-600",
                "bg-zinc-500",
                "bg-zinc-400",
                "bg-zinc-300",
              ].map((color, i) => (
                <div key={i} className={`h-4 w-4 rounded ${color}`} />
              ))}
            </div>
            <span className="text-xs text-zinc-500">{t("high")}</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {providers.map((provider) => {
              const totalRequests = MOCK_24H_USAGE.reduce(
                (sum, row) => sum + (row[provider.id as keyof HeatmapData] as number),
                0,
              );
              const avgRequests = Math.round(totalRequests / 24);

              return (
                <div key={provider.id}>
                  <p className="text-xs text-zinc-500">{provider.name}</p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {totalRequests > 999 ? `${(totalRequests / 1000).toFixed(1)}K` : totalRequests}
                  </p>
                  <p className="text-xs text-zinc-400">
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
