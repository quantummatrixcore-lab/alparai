"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";

interface TickerIncident {
  id: string;
  title_masked?: string | null;
  ai_provider: { name: string } | null;
  ai_model?: { name: string } | null;
  category: string;
}

export function LiveTicker() {
  const t = useTranslations("common");
  const locale = useLocale();
  const [incidents, setIncidents] = useState<TickerIncident[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchTickerData() {
      // Fetch latest verified incidents
      const { data: latest } = await supabase
        .from("incidents")
        .select(
          "id, title_masked, category, ai_provider:ai_providers(name), ai_model:ai_models(name)",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (latest && latest.length > 0) {
        setIncidents(latest as unknown as TickerIncident[]);
      }

      // Fetch total verified count
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

  // Resolve clean, professional provider label (never return "Bilinmiyor")
  const resolveProvider = (inc: TickerIncident) => {
    if (
      inc.ai_provider?.name &&
      inc.ai_provider.name.trim() &&
      inc.ai_provider.name.toLowerCase() !== "unknown"
    ) {
      return inc.ai_provider.name;
    }
    if (inc.ai_model?.name && inc.ai_model.name.trim()) {
      return inc.ai_model.name;
    }
    const raw = (inc.title_masked || "").toLowerCase();
    if (raw.includes("openai") || raw.includes("chatgpt") || raw.includes("gpt")) return "OpenAI";
    if (raw.includes("google") || raw.includes("gemini")) return "Google AI";
    if (raw.includes("anthropic") || raw.includes("claude")) return "Anthropic";
    if (raw.includes("meta") || raw.includes("llama")) return "Meta AI";
    if (raw.includes("deepseek")) return "DeepSeek";
    if (raw.includes("microsoft") || raw.includes("copilot")) return "Microsoft AI";
    if (raw.includes("grok") || raw.includes("xai")) return "xAI";
    if (raw.startsWith("[hn]")) return "HackerNews";
    if (raw.startsWith("[reddit]")) return locale === "tr" ? "Topluluk Raporu" : "Community Report";

    return locale === "tr" ? "Küresel YZ Gözlemi" : "Global AI Incident";
  };

  // Resolve clean, professional title label
  const resolveTitle = (inc: TickerIncident) => {
    let title = inc.title_masked || "";
    // Clean prefix tags
    title = title.replace(/^\[(?:HN|Reddit|Tech)\]\s*/i, "");
    if (!title) {
      return inc.category || (locale === "tr" ? "Doğrulanmış Olay" : "Verified Incident");
    }
    return title.length > 45 ? `${title.slice(0, 45)}…` : title;
  };

  const renderTickerItems = () => (
    <div className="flex shrink-0 items-center space-x-8 px-4">
      <span className="text-brand-400 flex items-center gap-2 font-bold tracking-wider uppercase">
        <span className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full" />
        {t("live_telemetry")}
      </span>
      {incidents.map((inc) => {
        const providerName = resolveProvider(inc);
        const label = resolveTitle(inc);
        return (
          <Link
            key={inc.id}
            href={`/incidents`}
            className="text-fg-secondary hover:text-brand-300 inline-flex items-center transition-colors"
          >
            <span className="text-fg-primary font-semibold">{providerName}</span>
            <span className="text-fg-muted mx-1.5">—</span>
            <span>{label}</span>
            <span className="text-fg-muted ml-1">#{inc.id.substring(0, 8)}</span>
            <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 ml-2 rounded-full border px-1.5 py-0.5 text-[9px] font-bold">
              {t("verified_badge", { defaultValue: "Doğrulandı" })}
            </span>
          </Link>
        );
      })}
      <span className="text-fg-muted font-medium">
        • {totalCount} {t("total_cases", { defaultValue: "Toplam Vaka" })}
      </span>
    </div>
  );

  return (
    <div className="bg-brand-500/10 border-brand-500/20 relative flex w-full overflow-hidden border-b py-1.5 select-none">
      <div className="animate-marquee flex w-max shrink-0 items-center text-[11px] font-medium tracking-wide whitespace-nowrap hover:[animation-play-state:paused]">
        {renderTickerItems()}
      </div>
      <div
        aria-hidden
        className="animate-marquee flex w-max shrink-0 items-center text-[11px] font-medium tracking-wide whitespace-nowrap hover:[animation-play-state:paused]"
      >
        {renderTickerItems()}
      </div>
      <style>{`
        @keyframes alparMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: alparMarquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
}
