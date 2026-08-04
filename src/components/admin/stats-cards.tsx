"use client";

import { useTranslations } from "next-intl";
import {
  Users,
  FileText,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShieldAlert,
  Server,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

export interface AdminStats {
  total: number;
  pending: number;
  published: number;
  taken_down: number;
  users: number;
  providers: number;
  takedown_requests: number;
  recent_24h: number;
}

export function StatsCards({ stats }: { stats: AdminStats }) {
  const t = useTranslations("admin");
  const cards = [
    {
      icon: <FileText className="h-4 w-4" />,
      label: t("stats_total"),
      value: stats.total,
      color: "text-brand-300",
      gradient: "from-brand-500 to-transparent",
      glow: "drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: t("stats_pending"),
      value: stats.pending,
      color: "text-amber-400",
      gradient: "from-amber-500 to-transparent",
      glow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]",
      badge: stats.pending > 0 ? `${stats.pending}` : undefined,
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: t("stats_published"),
      value: stats.published,
      color: "text-cyan-400",
      gradient: "from-cyan-500 to-transparent",
      glow: "drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]",
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: t("stats_users"),
      value: stats.users,
      color: "text-brand-300",
      gradient: "from-brand-500 to-transparent",
      glow: "drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
    },
    {
      icon: <ShieldAlert className="h-4 w-4" />,
      label: t("stats_takedown_requests"),
      value: stats.takedown_requests,
      color: "text-rose-400",
      gradient: "from-rose-500 to-transparent",
      glow: "drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: t("stats_24h"),
      value: stats.recent_24h,
      color: "text-cyan-400",
      gradient: "from-cyan-500 to-transparent",
      glow: "drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]",
    },
    {
      icon: <Server className="h-4 w-4" />,
      label: t("stats_providers"),
      value: stats.providers,
      color: "text-brand-300",
      gradient: "from-brand-500 to-transparent",
      glow: "drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: t("stats_takedown"),
      value: stats.taken_down,
      color: "text-fg-muted",
      gradient: "from-neutral-500 to-transparent",
      glow: "",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 350, damping: 25 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4"
    >
      {cards.map((c) => (
        <motion.div
          key={c.label}
          variants={itemVariants}
          className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-neutral-900/40 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-neutral-800/60 hover:shadow-2xl"
        >
          {/* Spotlight Hover Gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
          />
          {/* Top Line Gradient */}
          <div
            className={`absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r ${c.gradient} opacity-30 transition-opacity duration-300 group-hover:opacity-100`}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/5 ${c.color} ${c.glow} transition-transform duration-300 group-hover:scale-110`}
            >
              {c.icon}
            </div>
            {c.badge && (
              <span className="inline-flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20 px-1.5 text-[10px] font-bold text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                {c.badge}
              </span>
            )}
          </div>
          <p className="relative z-10 mt-4 font-mono text-3xl font-black tracking-tighter text-white drop-shadow-sm transition-transform duration-300 group-hover:translate-x-1">
            {c.value.toLocaleString()}
          </p>
          <p className="text-fg-muted relative z-10 mt-1.5 font-sans text-xs font-medium tracking-wide">
            {c.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
