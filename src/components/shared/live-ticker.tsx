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
  created_at?: string;
}

export function LiveTicker() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const isAdmin =
    pathname &&
    (/^\/(?:en|tr|[a-z]{2})\/admin(-v2)?(?:\/|$)/.test(pathname) ||
      pathname === "/admin" ||
      pathname.startsWith("/admin") ||
      pathname.includes("/admin-v2") ||
      pathname.includes("/admin/"));

  const [incidents, setIncidents] = useState<TickerIncident[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (isAdmin) return;
    async function fetchTickerData() {
      // Fetch latest verified incidents
      const { data: latest } = await supabase
        .from("incidents")
        .select(
          "id, title_masked, category, created_at, ai_provider:ai_providers(name), ai_model:ai_models(name)",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(8);

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
  }, [isAdmin]);

  if (isAdmin || incidents.length === 0) {
    return null;
  }

  // Resolve clean, professional provider label (never return "Bilinmiyor")
  const resolveProvider = (inc: TickerIncident): string => {
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

    return locale === "tr" ? "Küresel YZ" : "Global AI";
  };

  // Clean title: remove publisher tags ([The Register], [HN], etc.) and apply word-boundary truncation
  const cleanTitle = (rawTitle?: string | null, fallbackCategory = ""): string => {
    let title = (rawTitle || "").trim();

    // Strip all [...] bracket prefixes or suffixes
    title = title.replace(/\[[^\]]+\]\s*/g, "").trim();

    // Strip trailing source attributions like "- The Register", "— BBC"
    title = title
      .replace(
        /\s*[-—|]\s*(?:The Register|BBC|Reuters|TechCrunch|Bloomberg|Ars Technica|The Verge|VentureBeat).*$/i,
        "",
      )
      .trim();

    if (!title) {
      return fallbackCategory || (locale === "tr" ? "Doğrulanmış Olay" : "Verified Incident");
    }

    const maxLen = 65;
    if (title.length <= maxLen) return title;

    // Word boundary ellipsis
    const truncated = title.slice(0, maxLen);
    const lastSpace = truncated.lastIndexOf(" ");
    return `${lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated}…`;
  };

  // Format category badge cleanly
  const formatCategory = (cat?: string): string => {
    if (!cat) return locale === "tr" ? "Doğrulandı" : "Verified";
    const cleaned = cat.replace(/_/g, " ").trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  return (
    <div className="relative flex h-8 w-full items-center overflow-hidden border-b border-white/[0.08] bg-[#09090b]/95 text-[11px] backdrop-blur-md select-none">
      {/* Pinned Left Radar / Telemetry Badge */}
      <div className="relative z-20 flex h-full shrink-0 items-center gap-2 border-r border-white/[0.08] bg-[#09090b] px-3 font-mono text-[10px] font-bold tracking-wider text-[#00f0ff] uppercase shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00f0ff]" />
        </span>
        <span className="flex items-center gap-1">
          <span className="text-white">{t("live_telemetry")}</span>
          {totalCount > 0 && (
            <span className="font-normal text-slate-400">({totalCount.toLocaleString()})</span>
          )}
        </span>
      </div>

      {/* Edge Gradient Mask Overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-[140px] z-10 w-8 bg-gradient-to-r from-[#09090b] to-transparent sm:left-[170px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#09090b] to-transparent" />

      {/* Marquee Track Container */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max shrink-0 items-center gap-6 pr-6 hover:[animation-play-state:paused]">
          {incidents.map((inc) => {
            const provider = resolveProvider(inc);
            const title = cleanTitle(inc.title_masked, inc.category);
            const category = formatCategory(inc.category);

            return (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="group flex items-center gap-2 rounded-md px-2 py-0.5 transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-semibold text-slate-100 transition-colors group-hover:text-[#00f0ff]">
                  {provider}
                </span>
                <span className="text-slate-600">—</span>
                <span className="max-w-[380px] truncate text-slate-300 transition-colors group-hover:text-white">
                  {title}
                </span>
                <span className="rounded border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] font-medium text-slate-400 transition-colors group-hover:border-[#00f0ff]/30 group-hover:text-[#00f0ff]">
                  {category}
                </span>
              </Link>
            );
          })}
        </div>

        <div
          aria-hidden
          className="animate-marquee flex w-max shrink-0 items-center gap-6 pr-6 hover:[animation-play-state:paused]"
        >
          {incidents.map((inc) => {
            const provider = resolveProvider(inc);
            const title = cleanTitle(inc.title_masked, inc.category);
            const category = formatCategory(inc.category);

            return (
              <Link
                key={`clone-${inc.id}`}
                href={`/incidents/${inc.id}`}
                className="group flex items-center gap-2 rounded-md px-2 py-0.5 transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-semibold text-slate-100 transition-colors group-hover:text-[#00f0ff]">
                  {provider}
                </span>
                <span className="text-slate-600">—</span>
                <span className="max-w-[380px] truncate text-slate-300 transition-colors group-hover:text-white">
                  {title}
                </span>
                <span className="rounded border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] font-medium text-slate-400 transition-colors group-hover:border-[#00f0ff]/30 group-hover:text-[#00f0ff]">
                  {category}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes alparMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: alparMarquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
