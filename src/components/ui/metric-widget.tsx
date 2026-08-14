"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricWidgetProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export function MetricWidget({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  className,
  onClick,
}: MetricWidgetProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "bg-bg-secondary border-border-subtle flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200",
        "focus-visible:ring-brand-500 focus-visible:ring-offset-bg-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        onClick
          ? "hover:border-brand-500/30 cursor-pointer active:scale-[0.98]"
          : "cursor-default disabled:opacity-100",
        className,
      )}
    >
      {Icon && (
        <div
          className="bg-brand-500/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <Icon className="text-brand-400 h-5 w-5" strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-fg-muted truncate text-xs font-medium">{label}</p>
        <p className="text-fg-primary truncate text-lg font-bold">{value}</p>
      </div>
      {trend && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            trend === "up" && "bg-success-500/10 text-success-400",
            trend === "down" && "bg-danger-500/10 text-danger-400",
            trend === "neutral" && "text-fg-muted bg-white/5",
          )}
        >
          <TrendIcon className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
          {trendValue}
        </div>
      )}
    </button>
  );
}
