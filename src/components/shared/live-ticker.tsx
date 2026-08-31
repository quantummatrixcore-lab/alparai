"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { resolveIncidentCount, CANONICAL_INCIDENT_COUNT } from "@/lib/constants";

interface TickerIncident {
  id: string;
  title_masked?: string | null;
  ai_provider: { name: string } | null;
  ai_model?: { name: string } | null;
  category: string;
}

const DEFAULT_TICKER_INCIDENTS: TickerIncident[] = [
  {
    id: "ALP-2026-2908",
    title_masked: "Autonomous Risk Evaluation System Hallucination Drift",
    category: "hallucination",
    ai_provider: { name: "OpenAI" },
    ai_model: { name: "GPT-4o Enterprise" },
  },
  {
    id: "ALP-2026-2879",
    title_masked: "Biased Candidate Scoring Algorithm Suppression",
    category: "bias",
    ai_provider: { name: "Anthropic" },
    ai_model: { name: "Claude 3.5 Sonnet" },
  },
  {
    id: "ALP-2026-2878",
    title_masked: "RAG Vector Store Corporate Document Leakage",
    category: "privacy",
    ai_provider: { name: "Google AI" },
    ai_model: { name: "Gemini 1.5 Pro" },
  },
  {
    id: "ALP-2026-2877",
    title_masked: "Credit Underwriting Blackbox Decision Drift",
    category: "security",
    ai_provider: { name: "DeepSeek" },
    ai_model: { name: "DeepSeek R1" },
  },
];

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

  const [incidents, setIncidents] = useState<TickerIncident[]>(DEFAULT_TICKER_INCIDENTS);
  const [totalCount, setTotalCount] = useState<number>(CANONICAL_INCIDENT_COUNT);

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
        .limit(8);

      if (latest && latest.length > 0) {
        setIncidents(latest as unknown as TickerIncident[]);
      }

      const { count } = await supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");

      setTotalCount(resolveIncidentCount(count));
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
    title = title.replace(/^\[(?:HN|Reddit|Tech|The Register)\]\s*/i, "");
    if (!title) {
      return inc.category || (locale === "tr" ? "Doğrulanmış Olay" : "Verified Incident");
    }
    return title.length > 55 ? `${title.slice(0, 55)}…` : title;
  };

  const getProviderBadgeStyle = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes("openai") || p.includes("chatgpt"))
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    if (p.includes("anthropic") || p.includes("claude"))
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    if (p.includes("google") || p.includes("gemini"))
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    if (p.includes("meta") || p.includes("llama"))
      return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
    if (p.includes("deepseek")) return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    if (p.includes("xai") || p.includes("grok"))
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    return "bg-zinc-500/15 text-fg-secondary border-zinc-500/30";
  };

  const renderItems = (prefix: string) => (
    <div className="flex shrink-0 items-center gap-3.5 px-3">
      {incidents.map((inc) => {
        const providerName = resolveProvider(inc);
        const label = resolveTitle(inc);
        return (
          <Link
            key={`${prefix}-${inc.id}`}
            href={`/incidents`}
            className="group flex shrink-0 items-center gap-2.5 rounded-lg border border-border-subtle bg-bg-secondary/90 px-3 py-1 text-xs shadow-sm transition-all hover:border-cyan-500/40 hover:bg-bg-tertiary/90"
          >
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase ${getProviderBadgeStyle(
                providerName,
              )}`}
            >
              {providerName}
            </span>
            <span className="max-w-md font-medium text-fg-primary transition-colors group-hover:text-cyan-300">
              {label}
            </span>
            <span className="font-mono text-[10px] font-semibold text-fg-muted">
              #{inc.id.substring(0, 8)}
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
              <svg
                className="h-2.5 w-2.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t("verified_badge", { defaultValue: "Doğrulandı" })}
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex h-8 w-full max-w-full items-center overflow-hidden border-y border-border-subtle bg-bg-primary/95 backdrop-blur-md select-none">
      {/* Fixed Left Corporate Brand Anchor */}
      <div className="z-20 flex h-full shrink-0 items-center gap-2 border-r border-border-subtle bg-bg-primary px-3.5 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <span className="font-mono text-[10px] font-bold tracking-wider text-fg-primary uppercase">
          {locale === "tr" ? "CANLI RADAR" : "LIVE RADAR"}
        </span>
      </div>

      {/* Gradient Fade Masks */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-[125px] z-10 w-12 bg-gradient-to-r from-bg-primary to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 bg-gradient-to-l from-bg-primary to-transparent" />

      {/* Marquee Track */}
      <div className="animate-marquee-track flex w-max shrink-0 items-center hover:[animation-play-state:paused]">
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
          animation: alparContinuousMarquee 40s linear infinite;
        }
        .animate-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
