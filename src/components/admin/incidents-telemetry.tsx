"use client";

import React from "react";
import { CANONICAL_INCIDENT_COUNT } from "@/lib/constants";
import type { IncidentRecord } from "@/types/admin";

interface IncidentsTelemetryProps {
  incidents: IncidentRecord[];
  filtered: IncidentRecord[];
}

// incidents/page.tsx içinden saf çıkarma: 4 telemetri kartı (görsel aynı).
export const IncidentsTelemetry = React.memo(function IncidentsTelemetry({
  incidents,
  filtered,
}: IncidentsTelemetryProps) {
  const verifiedCount = incidents.filter((i) => i.humanVerified).length;
  const riskMillions = filtered.reduce((s, i) => s + (i.potentialFineEur || 0), 0) / 1_000_000;
  const criticalSlaCount = filtered.filter(
    (i) => i.slaRemainingHours > 0 && i.slaRemainingHours <= 24,
  ).length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-md border border-[#d0d7de] bg-[#ffffff] p-3 dark:border-[#30363d] dark:bg-[#161b22]">
        <span className="block font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
          Toplam İndeks
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-sans text-lg font-bold text-[#1f2328] dark:text-[#f0f6fc]">
            {CANONICAL_INCIDENT_COUNT.toLocaleString("tr-TR")}
          </span>
          <span className="font-sans text-[10px] font-semibold text-[#1a7f37] dark:text-[#3fb950]">
            kayıtlı vaka
          </span>
        </div>
      </div>
      <div className="rounded-md border border-[#d0d7de] bg-[#ffffff] p-3 dark:border-[#30363d] dark:bg-[#161b22]">
        <span className="block font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
          Doğrulanmış (listede)
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-sans text-lg font-bold text-[#1f2328] dark:text-[#f0f6fc]">
            {verifiedCount}
          </span>
          <span className="font-sans text-[10px] text-[#0969da] dark:text-[#58a6ff]">
            listelenen vaka
          </span>
        </div>
      </div>
      <div className="rounded-md border border-[#d0d7de] bg-[#ffffff] p-3 dark:border-[#30363d] dark:bg-[#161b22]">
        <span className="block font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
          Risk Maruziyeti (listede)
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-sans text-lg font-bold text-[#cf222e] dark:text-[#ff7b72]">
            €{riskMillions.toFixed(1)}M
          </span>
          <span className="font-sans text-[10px] text-[#cf222e] dark:text-[#ff7b72]">
            toplam potansiyel ceza
          </span>
        </div>
      </div>
      <div className="rounded-md border border-[#d0d7de] bg-[#ffffff] p-3 dark:border-[#30363d] dark:bg-[#161b22]">
        <span className="block font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
          Kritik 72h SLA (listede)
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-sans text-lg font-bold text-[#9a6700] dark:text-[#d29922]">
            {criticalSlaCount} Vaka
          </span>
          <span className="font-sans text-[10px] text-[#9a6700] dark:text-[#d29922]">
            &lt; 24h kalan
          </span>
        </div>
      </div>
    </div>
  );
});
