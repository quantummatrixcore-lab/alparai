"use client";

import { useTranslations } from "next-intl";
import {
  TrendUp,
  TrendDown,
  Equals,
  Cloud,
  Database,
  Lightning,
  Brain,
  Envelope,
  ShareNetwork,
  GitBranch,
} from "@phosphor-icons/react";

interface CostCardProps {
  name: string;
  currentCost: number;
  budgetLimit: number;
  percentUsed: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export function CostOverviewCard({
  name,
  currentCost,
  budgetLimit,
  percentUsed,
  trend,
}: CostCardProps) {
  const t = useTranslations("finance");

  // Get service icon
  const getIcon = () => {
    switch (name.toLowerCase()) {
      case "vercel":
        return <Cloud className="h-6 w-6 text-zinc-300" />;
      case "supabase":
        return <Database className="h-6 w-6 text-emerald-400" />;
      case "gemini":
        return <Brain className="h-6 w-6 text-blue-400" />;
      case "anthropic":
        return <Brain className="h-6 w-6 text-orange-400" />;
      case "resend":
        return <Envelope className="h-6 w-6 text-sky-400" />;
      case "upstash":
        return <Lightning className="h-6 w-6 text-yellow-400" />;
      case "buffer":
        return <ShareNetwork className="h-6 w-6 text-indigo-400" />;
      case "claude_pro":
        return <Brain className="h-6 w-6 text-amber-500" />;
      case "google_ultra":
        return <Brain className="h-6 w-6 text-purple-400" />;
      case "github":
        return <GitBranch className="h-6 w-6 text-zinc-300" />;
      case "openrouter":
        return <Brain className="h-6 w-6 text-indigo-400" />;
      case "opencode_free_tier":
        return <Brain className="h-6 w-6 text-zinc-400" />;
      default:
        return <Cloud className="h-6 w-6 text-zinc-400" />;
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendUp className="h-4 w-4 text-rose-400" />;
      case "down":
        return <TrendDown className="h-4 w-4 text-emerald-400" />;
      default:
        return <Equals className="h-4 w-4 text-zinc-400" />;
    }
  };

  // Get service label
  const getLabel = () => {
    switch (name.toLowerCase()) {
      case "vercel":
        return "Vercel Hosting";
      case "supabase":
        return "Supabase Database";
      case "gemini":
        return "Google Gemini API";
      case "anthropic":
        return "Anthropic Claude API";
      case "resend":
        return "Resend Email";
      case "upstash":
        return "Upstash Redis";
      case "buffer":
        return "Buffer Social";
      case "claude_pro":
        return "Claude Pro";
      case "google_ultra":
        return "Google Ultra";
      case "github":
        return "GitHub Premium";
      case "openrouter":
        return "OpenRouter";
      case "opencode_free_tier":
        return "OpenCode Free Tier";
      default:
        return name;
    }
  };

  const isFree = budgetLimit === 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">{getLabel()}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("monthlyPlan")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded bg-zinc-50 px-2 py-0.5 text-xs font-medium dark:bg-zinc-900">
          {getTrendIcon()}
          <span className="text-zinc-600 dark:text-zinc-300">
            {trend === "up" ? t("rising") : trend === "down" ? t("falling") : t("stable")}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            ${currentCost.toFixed(2)}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">/ {t("monthShort")}</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{isFree ? t("freeTier") : `${t("budget")}: $${budgetLimit.toFixed(0)}`}</span>
            {!isFree && <span>{percentUsed}%</span>}
          </div>
          {!isFree && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  percentUsed >= 90
                    ? "bg-rose-500"
                    : percentUsed >= 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
