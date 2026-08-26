"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import { useTranslations } from "next-intl";

interface TickerIncident {
  id: string;
  title_masked?: string | null;
  ai_provider: { name: string } | null;
  ai_model?: { name: string } | null;
  category: string;
}

export function LiveTicker() {
  const t = useTranslations("common");
  const [incidents, setIncidents] = useState<TickerIncident[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchTickerData() {
      // Fetch latest critical incidents with provider details
      const { data: latest } = await supabase
        .from("incidents")
        .select(
          "id, title_masked, category, ai_provider:ai_providers(name), ai_model:ai_models(name)",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5);

      if (latest && latest.length > 0) {
        setIncidents(latest as unknown as TickerIncident[]);
      }

      // Fetch live verified count directly from incidents table
      const { count } = await supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");

      if (typeof count === "number") {
        setTotalCount(count);
      }
    }

    fetchTickerData();
  }, []);

  if (incidents.length === 0) return null;

  return (
    <div className="bg-brand-500/10 border-brand-500/20 relative flex overflow-hidden border-b py-1">
      <div className="flex animate-[ticker_20s_linear_infinite] text-[11px] font-medium tracking-wide whitespace-nowrap">
        {/* Double the content for seamless infinite loop */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center space-x-8 px-4">
            <span className="text-brand-400 flex items-center gap-2 font-bold uppercase">
              <span className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full" />
              {t("live_telemetry")}
            </span>
            {incidents.map((inc) => {
              const providerName = inc.ai_provider?.name || inc.ai_model?.name || t("unknown");
              const label = inc.title_masked
                ? inc.title_masked.length > 40
                  ? `${inc.title_masked.slice(0, 40)}…`
                  : inc.title_masked
                : inc.category;
              return (
                <span key={inc.id} className="text-fg-secondary">
                  {providerName} — {label} #{inc.id.substring(0, 8)}
                  <span className="text-brand-400 ml-1 font-semibold">{t("verified_badge")}</span>
                </span>
              );
            })}
            • {totalCount} {t("total_cases")}
          </div>
        ))}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `,
        }}
      />
    </div>
  );
}
