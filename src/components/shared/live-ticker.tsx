"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isExcludedPage =
    pathname &&
    (/^\/(?:en|tr|[a-z]{2})\/admin(-v2)?(?:\/|$)/.test(pathname) ||
      pathname === "/admin" ||
      pathname.startsWith("/admin") ||
      pathname.includes("/admin-v2") ||
      pathname.includes("/admin/") ||
      pathname.includes("/auth/") ||
      pathname.startsWith("/auth") ||
      /^\/(?:en|tr|[a-z]{2})\/auth(?:\/|$)/.test(pathname));

  const [incidents, setIncidents] = useState<TickerIncident[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (isExcludedPage) return;
    async function fetchTickerData() {
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

      const { count } = await supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");

      if (typeof count === "number") {
        setTotalCount(count);
      }
    }

    fetchTickerData();
  }, [isExcludedPage]);

  if (isExcludedPage || incidents.length === 0) {
    return null;
  }

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

  const resolveTitle = (inc: TickerIncident) => {
    let title = inc.title_masked || "";
    title = title.replace(/^\[(?:HN|Reddit|Tech)\]\s*/i, "");
    if (!title) {
      return inc.category || (locale === "tr" ? "Doğrulanmış Olay" : "Verified Incident");
    }
    return title.length > 45 ? `${title.slice(0, 45)}…` : title;
  };

  const renderItems = (prefix: string) => (
    <div className="flex shrink-0 items-center space-x-8 px-6">
      <span className="text-brand-400 flex items-center gap-2 font-bold tracking-wider uppercase">
        <span className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full" />
        {t("live_telemetry")}
      </span>
      {incidents.map((inc) => {
        const providerName = resolveProvider(inc);
        const label = resolveTitle(inc);
        return (
          <Link
            key={`${prefix}-${inc.id}`}
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
    <div className="bg-bg-secondary/90 border-brand-500/20 backdrop-blur-md relative flex h-7 w-full max-w-full overflow-x-hidden overflow-y-hidden border-b py-1 select-none">
      <div className="animate-marquee-track flex w-max shrink-0 items-center text-[11px] font-medium tracking-wide whitespace-nowrap hover:[animation-play-state:paused]">
        {renderItems("track1")}
        {renderItems("track2")}
      </div>
      <style>{`
        @keyframes alparContinuousMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: alparContinuousMarquee 45s linear infinite;
        }
        .animate-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
