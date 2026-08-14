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
        return <Cloud className="text-fg-secondary h-6 w-6" />;
      case "supabase":
        return <Database className="text-success-400 h-6 w-6" />;
      case "gemini":
        return <Brain className="text-brand-400 h-6 w-6" />;
      case "anthropic":
        return <Brain className="text-warning-400 h-6 w-6" />;
      case "resend":
        return <Envelope className="h-6 w-6 text-sky-400" />;
      case "upstash":
        return <Lightning className="text-warning-400 h-6 w-6" />;
      case "buffer":
        return <ShareNetwork className="text-brand-400 h-6 w-6" />;
      case "claude_pro":
        return <Brain className="text-warning-500 h-6 w-6" />;
      case "google_ultra":
        return <Brain className="text-brand-400 h-6 w-6" />;
      case "github":
        return <GitBranch className="text-fg-secondary h-6 w-6" />;
      case "openrouter":
        return <Brain className="text-brand-400 h-6 w-6" />;
      case "opencode_free_tier":
        return <Brain className="text-fg-muted h-6 w-6" />;
      default:
        return <Cloud className="text-fg-muted h-6 w-6" />;
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendUp className="text-danger-400 h-4 w-4" />;
      case "down":
        return <TrendDown className="text-success-400 h-4 w-4" />;
      default:
        return <Equals className="text-fg-muted h-4 w-4" />;
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
    <div className="dark:border-border-subtle dark:bg-bg-tertiary relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="dark:bg-bg-elevated flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">{getLabel()}</h4>
            <p className="text-fg-disabled dark:text-fg-muted text-xs">{t("monthlyPlan")}</p>
          </div>
        </div>
        <div className="dark:bg-bg-elevated flex items-center gap-1 rounded bg-zinc-50 px-2 py-0.5 text-xs font-medium">
          {getTrendIcon()}
          <span className="dark:text-fg-secondary text-zinc-600">
            {trend === "up" ? t("rising") : trend === "down" ? t("falling") : t("stable")}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            ${currentCost.toFixed(2)}
          </span>
          <span className="text-fg-disabled dark:text-fg-muted text-sm">/ {t("monthShort")}</span>
        </div>

        <div className="mt-4">
          <div className="text-fg-disabled dark:text-fg-muted flex items-center justify-between text-xs">
            <span>{isFree ? t("freeTier") : `${t("budget")}: $${budgetLimit.toFixed(0)}`}</span>
            {!isFree && <span>{percentUsed}%</span>}
          </div>
          {!isFree && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  percentUsed >= 90
                    ? "bg-danger-500"
                    : percentUsed >= 75
                      ? "bg-warning-500"
                      : "bg-success-500"
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
