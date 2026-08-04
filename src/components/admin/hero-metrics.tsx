"use client";

import React from "react";
import { FileText, Cpu, ShieldCheck, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  sparklineData: number[];
  color: "brand" | "cyan" | "amber" | "rose";
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;

  const width = 120;
  const height = 40;
  const padding = 2;

  const points = data
    .map((val, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor =
    {
      brand: "rgb(168, 85, 247)",
      cyan: "rgb(6, 182, 212)",
      amber: "rgb(245, 158, 11)",
      rose: "rgb(244, 63, 94)",
    }[color] || "rgb(168, 85, 247)";

  const fillColor =
    {
      brand: "rgba(168, 85, 247, 0.1)",
      cyan: "rgba(6, 182, 212, 0.1)",
      amber: "rgba(245, 158, 11, 0.1)",
      rose: "rgba(244, 63, 94, 0.1)",
    }[color] || "rgba(168, 85, 247, 0.1)";

  const lastX = width - padding;
  const lastY =
    data.length > 0
      ? height - padding - ((data[data.length - 1]! - min) / range) * (height - padding * 2)
      : 0;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
        fill={fillColor}
      />
      <polyline fill="none" stroke={strokeColor} strokeWidth="2" points={points} />
      {/* Active Glowing Dot */}
      <circle
        cx={lastX}
        cy={lastY}
        r="5"
        fill={strokeColor}
        opacity="0.4"
        className="animate-pulse"
      />
      <circle cx={lastX} cy={lastY} r="2" fill="#fff" stroke={strokeColor} strokeWidth="1" />
    </svg>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon,
  sparklineData,
  color,
}: MetricCardProps) {
  const glowClasses = {
    brand: "shadow-[0_0_15px_rgba(168,85,247,0.1)] border-brand-500/20 hover:border-brand-500/30",
    cyan: "shadow-[0_0_15px_rgba(6,182,212,0.1)] border-cyan-500/20 hover:border-cyan-500/30",
    amber: "shadow-[0_0_15px_rgba(245,158,11,0.1)] border-amber-500/20 hover:border-amber-500/30",
    rose: "shadow-[0_0_15px_rgba(244,63,94,0.1)] border-rose-500/20 hover:border-rose-500/30",
  }[color];

  const textColors = {
    brand: "text-brand-400",
    cyan: "text-cyan-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  }[color];

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "bg-bg-secondary/40 flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300",
        glowClasses,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-fg-secondary text-xs font-semibold tracking-wider uppercase">
            {title}
          </span>
          <h3 className="font-mono text-2xl font-black text-white">{value}</h3>
        </div>
        <div className={cn("rounded-xl border border-white/5 bg-neutral-950/40 p-2.5", textColors)}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
          )}
          <span
            className={cn(
              "font-mono text-xs font-bold",
              isPositive ? "text-emerald-400" : "text-rose-400",
            )}
          >
            {change}
          </span>
        </div>
        <div className="h-10 shrink-0">
          <Sparkline data={sparklineData} color={color} />
        </div>
      </div>
    </motion.div>
  );
}

import { useTranslations } from "next-intl";

export function HeroMetrics({
  totalIncidents,
  responseRate,
  trustScore,
  activeProviders,
}: {
  totalIncidents: number;
  responseRate: number;
  trustScore: number;
  activeProviders: number;
}) {
  const t = useTranslations("admin");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      <MetricCard
        title={t("hero_total_incidents")}
        value={totalIncidents}
        change={t("hero_total_incidents_change", { defaultValue: "+12.4% vs last week" })}
        isPositive={true}
        icon={<FileText className="h-5 w-5" />}
        sparklineData={[30, 40, 35, 50, 49, 60, 70, 91, 125]}
        color="brand"
      />
      <MetricCard
        title={t("hero_response_rate")}
        value={`${responseRate}%`}
        change={t("hero_response_rate_change", { defaultValue: "+2.1% this month" })}
        isPositive={true}
        icon={<ShieldCheck className="h-5 w-5" />}
        sparklineData={[70, 72, 75, 74, 76, 78, 80, 81, 82.5]}
        color="cyan"
      />
      <MetricCard
        title={t("hero_avg_trust")}
        value={`${trustScore}/100`}
        change={t("hero_avg_trust_change", { defaultValue: "-0.5% fluctuation" })}
        isPositive={false}
        icon={<Zap className="h-5 w-5" />}
        sparklineData={[80, 81, 79, 78, 77, 78, 79, 78.5, 78]}
        color="amber"
      />
      <MetricCard
        title={t("hero_active_providers")}
        value={activeProviders}
        change={t("hero_new_this_week")}
        isPositive={true}
        icon={<Cpu className="h-5 w-5" />}
        sparklineData={[30, 32, 35, 36, 38, 39, 40, 41, 42]}
        color="rose"
      />
    </motion.div>
  );
}
