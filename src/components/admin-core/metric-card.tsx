"use client";

import React, { memo } from "react";
import { type LucideIcon } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "alert";
  icon?: LucideIcon;
  badge?: string;
  sparkline?: "up" | "down" | "neutral" | "stable" | React.ReactNode;
}

export const MetricCard = memo(function MetricCard({
  label,
  value,
  subtext,
  change,
  changeType = "neutral",
  icon: Icon,
  badge,
  sparkline = "up",
}: MetricCardProps) {
  const changeStyles = {
    positive:
      "text-[#1a7f37] dark:text-[#3fb950] bg-[#dafbe1] dark:bg-[#238636]/20 border-[#4ac26b]/40 dark:border-[#238636]/40 shadow-sm dark:shadow-none",
    negative:
      "text-[#cf222e] dark:text-[#ff7b72] bg-[#ffebe9] dark:bg-[#da3633]/20 border-[#ff8182]/40 dark:border-[#da3633]/40 shadow-sm dark:shadow-none",
    neutral:
      "text-[#656d76] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#21262d] border-[#d0d7de] dark:border-[#30363d]",
    alert:
      "text-[#9a6700] dark:text-[#f0b72f] bg-[#fff8c5] dark:bg-[#9e6a03]/20 border-[#d4a72c]/40 dark:border-[#9e6a03]/40 font-semibold shadow-sm dark:shadow-none animate-pulse",
  }[changeType];

  const renderSparkline = () => {
    if (typeof sparkline !== "string") return sparkline;
    const isPositive = sparkline === "up" || changeType === "positive";
    const isNegative = sparkline === "down" || changeType === "negative";
    const strokeColor = isPositive ? "#2da44e" : isNegative ? "#cf222e" : "#0969da";

    const pathData = isPositive
      ? "M 2 20 Q 20 18, 35 12 T 65 6 T 90 2"
      : isNegative
        ? "M 2 4 Q 20 8, 35 14 T 65 18 T 90 22"
        : "M 2 12 Q 20 8, 35 14 T 65 10 T 90 12";

    return (
      <svg className="h-6 w-20 shrink-0 overflow-visible" viewBox="0 0 92 24" fill="none">
        <defs>
          <linearGradient id={`sparkGrad-${label.replace(/\s+/g, "")}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          stroke={`url(#sparkGrad-${label.replace(/\s+/g, "")})`}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="90"
          cy={isPositive ? "2" : isNegative ? "22" : "12"}
          r="2.5"
          fill={strokeColor}
          className="animate-pulse"
        />
      </svg>
    );
  };

  return (
    <div className="group relative flex min-h-[132px] transform-gpu flex-col justify-between overflow-hidden rounded-md border border-[#d0d7de] bg-[#ffffff] p-4.5 shadow-sm transition-all duration-200 contain-content hover:-translate-y-0.5 hover:border-[#0969da] dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none dark:hover:border-[#58a6ff]">
      {/* Header Row: Label & Badge/Icon */}
      <div className="z-10 flex items-center justify-between gap-2">
        <span className="line-clamp-1 font-sans text-[11px] font-medium tracking-wider text-[#656d76] uppercase dark:text-[#8b949e]">
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {badge && (
            <span className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-1.5 py-0.5 font-sans text-[10px] font-medium text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#c9d1d9]">
              {badge}
            </span>
          )}
          {Icon && (
            <div className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-1.5 text-[#656d76] transition-colors dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* Value & Change Tag Row */}
      <div className="z-10 mt-2.5 flex items-baseline justify-between gap-3">
        <span className="font-sans text-2xl font-bold tracking-tight text-[#1f2328] tabular-nums lg:text-3xl dark:text-[#f0f6fc]">
          {value}
        </span>
        {change && (
          <span
            className={`rounded border px-2 py-0.5 font-sans text-[11px] font-medium ${changeStyles} shrink-0`}
          >
            {change}
          </span>
        )}
      </div>

      {/* Subtext & Sparkline Row */}
      <div className="z-10 mt-2 flex min-h-[22px] items-center justify-between gap-2">
        {subtext ? (
          <p className="line-clamp-1 font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
            {subtext}
          </p>
        ) : (
          <div />
        )}
        {renderSparkline()}
      </div>
    </div>
  );
});
