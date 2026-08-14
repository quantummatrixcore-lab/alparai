import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MetricCardChart } from "./metric-card-chart";

interface SparkPoint {
  value: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  sparkData?: SparkPoint[];
  chartType?: "line" | "bar";
  accentColor?: string;
  badge?: string;
  badgeColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  sparkData,
  chartType = "line",
  accentColor = "#6366f1",
  badge,
  badgeColor = "text-success-400",
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-success-400" : trend === "down" ? "text-danger-400" : "text-fg-muted";

  return (
    <div className="bg-bg-elevated/80 rounded-xl border border-white/10 p-4 transition-all hover:border-white/20">
      <div className="text-fg-muted flex items-center justify-between text-xs">
        <span>{title}</span>
        <span className="h-4 w-4" style={{ color: accentColor }}>
          {icon}
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-black text-white">{value}</span>
        {badge && <span className={`text-xs font-bold ${badgeColor}`}>{badge}</span>}
      </div>

      {subtitle && <p className="text-fg-muted mt-1 text-[11px]">{subtitle}</p>}

      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 h-10">
          <MetricCardChart sparkData={sparkData} chartType={chartType} accentColor={accentColor} />
        </div>
      )}

      {trend && trendLabel && (
        <div className={`mt-2 flex items-center gap-1 text-[11px] ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
