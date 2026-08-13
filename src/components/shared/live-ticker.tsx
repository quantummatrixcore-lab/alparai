"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import { useTranslations } from "next-intl";

interface TickerIncident {
  id: string;
  ai_provider: { name: string } | null;
  category: string;
}

export function LiveTicker() {
  const t = useTranslations("common");
  const [incidents, setIncidents] = useState<TickerIncident[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchTickerData() {
      // Fetch latest 3 critical incidents
      const { data: latest } = await supabase
        .from("incidents")
        .select("id, ai_provider:ai_providers(name), category")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);

      if (latest) {
        setIncidents(latest as unknown as TickerIncident[]);
      }

      // Fetch total verified count
      const { data: stats } = await (
        supabase as unknown as {
          from: (table: string) => {
            select: (cols: string) => {
              eq: (
                col: string,
                val: string,
              ) => {
                single: () => Promise<{
                  data: { stat_value: number | string } | null;
                  error: unknown;
                }>;
              };
            };
          };
        }
      )
        .from("platform_statistics")
        .select("stat_value")
        .eq("stat_key", "total_incidents")
        .single();

      if (stats?.stat_value !== undefined) {
        setTotalCount(Number(stats.stat_value));
      }
    }
    const timer = setTimeout(() => {
      fetchTickerData();
    }, 2500);

    return () => clearTimeout(timer);
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
            {incidents.map((inc) => (
              <span key={inc.id} className="text-fg-secondary">
                {inc.ai_provider?.name || t("unknown")} — {inc.category} #{inc.id.substring(0, 8)}
                <span className="text-brand-400 ml-1">{t("verified_badge")}</span>
              </span>
            ))}
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
