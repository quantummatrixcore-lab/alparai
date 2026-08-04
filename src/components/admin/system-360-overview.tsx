"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SystemHealthChart } from "./system-health-chart";
import {
  Wallet,
  ShieldCheck,
  Cpu,
  ChartLineUp,
  Database,
  Cloud,
  Bug,
  Envelope,
  GoogleLogo,
  Sparkle,
  Robot,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { motion } from "framer-motion";

interface ServiceHealth {
  name: string;
  status: "healthy" | "unhealthy" | "not_configured";
  latencyMs: number | null;
}

interface HealthResponse {
  status: string;
  services: ServiceHealth[];
  timestamp: string;
}

const SERVICE_ICONS: Record<string, React.ElementType> = {
  supabase: Database,
  redis: Cpu,
  vercel: Cloud,
  sentry: Bug,
  resend: Envelope,
  gemini: Sparkle,
  anthropic: Robot,
  google_oauth: GoogleLogo,
};

function ServiceBadge({ name, status, latencyMs }: ServiceHealth) {
  const Icon = SERVICE_ICONS[name] ?? ShieldCheck;
  const colorMap: Record<string, string> = {
    healthy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    unhealthy: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    not_configured: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  };
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium backdrop-blur-sm ${colorMap[status] ?? colorMap.not_configured}`}
    >
      <Icon weight="duotone" className="h-3.5 w-3.5 shrink-0" />
      <span className="capitalize">{name.replace("_", " ")}</span>
      {status === "healthy" && latencyMs !== null && (
        <span className="ml-auto font-mono opacity-70">{latencyMs}ms</span>
      )}
      {status === "healthy" && <CheckCircle weight="fill" className="ml-auto h-3 w-3" />}
      {status === "unhealthy" && <WarningCircle weight="fill" className="ml-auto h-3 w-3" />}
    </motion.div>
  );
}

export function System360Overview() {
  const t = useTranslations("admin");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setHealth(data))
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  }, []);

  const configuredServices = health?.services.filter((s) => s.status !== "not_configured") ?? [];
  const healthyCount = configuredServices.filter((s) => s.status === "healthy").length;
  const totalConfigured = configuredServices.length;

  const row1health = health?.services.slice(0, 4) ?? [];
  const row2health = health?.services.slice(4) ?? [];

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <ShieldCheck weight="duotone" className="text-brand-400 h-6 w-6" />
            {t("sys360_title", { defaultValue: "360° Command Center" })}
          </h2>
          <p className="text-fg-muted mt-1 text-sm">
            {t("sys360_desc", {
              defaultValue: "Holistic view of system health, finance, and security.",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-fg-muted">{t("last_check", { defaultValue: "Last check:" })}</span>
          {loading ? (
            <span className="animate-pulse text-white/50">
              {t("loading", { defaultValue: "Loading..." })}
            </span>
          ) : (
            <span className="font-mono text-white/70">
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "offline"}
            </span>
          )}
        </div>
      </div>

      {/* Service Health Grid */}
      <div className="space-y-2">
        <h3 className="text-fg-secondary text-xs font-semibold tracking-widest uppercase">
          {t("service_health", { defaultValue: "Service Health" })}
          {totalConfigured > 0 && (
            <span className="ml-2 text-emerald-400">
              {healthyCount}/{totalConfigured} {t("healthy", { defaultValue: "healthy" })}
            </span>
          )}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-white/5 bg-zinc-800/20 px-3 py-2"
                >
                  <div className="h-3 w-20 rounded bg-zinc-700/50"></div>
                </div>
              ))
            : row1health.map((svc) => <ServiceBadge key={svc.name} {...svc} />)}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {!loading && row2health.map((svc) => <ServiceBadge key={svc.name} {...svc} />)}
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {/* Resource Efficiency Widget */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-bg-secondary/40 relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
        >
          <div className="absolute -top-4 -right-4 rounded-full bg-emerald-500/10 p-6 blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-fg-secondary text-sm font-semibold">
              {t("resource_efficiency", { defaultValue: "Resource Efficiency" })}
            </h3>
            <Cpu weight="duotone" className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="relative z-10 mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">94.2</span>
            <span className="text-fg-muted mb-1 font-mono text-xs font-semibold">%</span>
          </div>
          <div className="text-fg-muted relative z-10 mt-2 text-xs">
            <span className="font-medium text-emerald-400">
              {t("optimal", { defaultValue: "Optimal" })}
            </span>{" "}
            {t("resource_usage", { defaultValue: "resource usage" })}
          </div>
        </motion.div>

        {/* Financial Widget */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-bg-secondary/40 relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
        >
          <div className="absolute -top-4 -right-4 rounded-full bg-emerald-500/10 p-6 blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-fg-secondary font-semibold">
              {t("b2b_revenue", { defaultValue: "B2B Revenue (MRR)" })}
            </h3>
            <Wallet weight="duotone" className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="relative z-10 mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">$12,450</span>
            <span className="mb-1 font-mono text-xs font-semibold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
              +14.2%
            </span>
          </div>
          <div className="text-fg-muted relative z-10 mt-2 text-xs">
            <span className="text-white/60">
              {t("active_subscriptions", { defaultValue: "Active Subscriptions:" })}
            </span>{" "}
            48
          </div>
        </motion.div>

        {/* API Cost Widget */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-bg-secondary/40 relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        >
          <div className="absolute -top-4 -right-4 rounded-full bg-amber-500/10 p-6 blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-fg-secondary font-semibold">
              {t("api_operations_cost", { defaultValue: "API Operations Cost" })}
            </h3>
            <ChartLineUp weight="duotone" className="h-5 w-5 text-amber-400" />
          </div>
          <div className="relative z-10 mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">$342.50</span>
            <span className="mb-1 font-mono text-xs font-semibold text-amber-400">{t("mo")}</span>
          </div>
          <div className="relative z-10 mt-2 flex items-center gap-2">
            <div className="bg-bg-tertiary h-1.5 w-full overflow-hidden rounded-full">
              <div className="h-full w-[45%] rounded-full bg-amber-500"></div>
            </div>
            <span className="text-fg-muted text-xs">45%</span>
          </div>
        </motion.div>

        {/* Cross-Audit Engine Widget */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-bg-secondary/40 hover:border-brand-500/50 relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
        >
          <div className="bg-brand-500/10 absolute -top-4 -right-4 rounded-full p-6 blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-fg-secondary font-semibold">{t("cross_audit_engine")}</h3>
            <ShieldCheck weight="duotone" className="text-brand-400 h-5 w-5" />
          </div>
          <div className="relative z-10 mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">{t("active")}</span>
            <span className="mb-1 flex h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
          </div>
          <div className="text-fg-muted relative z-10 mt-2 text-xs">
            <span className="text-white/60">{t("race_conditions")}</span> {t("0_detected")}
          </div>
        </motion.div>

        {/* Inference Load Widget */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-bg-secondary/40 relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <div className="absolute -top-4 -right-4 rounded-full bg-cyan-500/10 p-6 blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-fg-secondary font-semibold">{t("inference_load")}</h3>
            <Cpu weight="duotone" className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="relative z-10 mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">4.2</span>
            <span className="text-fg-muted mb-1 font-mono text-xs font-semibold">
              {t("req_sec")}
            </span>
          </div>
          <div className="text-fg-muted relative z-10 mt-2 flex items-center gap-2 text-xs">
            <span className="font-medium text-cyan-400">99.98%</span> {t("uptime")}
          </div>
        </motion.div>
      </div>

      <SystemHealthChart />
    </div>
  );
}
