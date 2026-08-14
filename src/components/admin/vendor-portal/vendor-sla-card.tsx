"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, Activity, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";
import type { VendorSlaMetric } from "@/actions/admin/vendor-portal";

interface VendorSlaCardProps {
  vendor: VendorSlaMetric;
}

export function VendorSlaCard({ vendor }: VendorSlaCardProps) {
  const t = useTranslations("vendorPortal");
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "AAA":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "AA":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "A":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="group border-border-subtle bg-bg-secondary hover:border-border-subtle/80 hover:bg-bg-tertiary relative overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="group-hover:text-brand-300 text-fg-primary text-xl font-bold transition-colors">
              {vendor.providerName}
            </h3>
            <span
              className={`rounded-xl border px-2.5 py-1 text-xs font-black tracking-wide ${getTierColor(
                vendor.rankingTier,
              )}`}
            >
              {vendor.rankingTier}
            </span>
          </div>
          <p className="text-fg-muted mt-1 font-mono text-xs">slug: {vendor.providerSlug}</p>
        </div>
        <div className="text-right">
          <div className="text-fg-primary flex items-center gap-1 text-2xl font-black">
            <ShieldCheck className="text-brand-400 inline-block h-5 w-5" />
            <span>{vendor.compositeScore.toFixed(1)}</span>
            <span className="text-fg-muted text-xs font-normal">/100</span>
          </div>
          <span className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
            {t("trust_score")}
          </span>
        </div>
      </div>

      <div className="border-border-subtle mt-6 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
        <div>
          <div className="text-fg-muted flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t("sla_uptime")}</span>
          </div>
          <p className="mt-1 font-mono text-lg font-bold text-emerald-400">
            {vendor.slaUptimePercent}%
          </p>
        </div>

        <div>
          <div className="text-fg-muted flex items-center gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>{t("avg_latency")}</span>
          </div>
          <p className="text-fg-primary mt-1 font-mono text-lg font-bold">
            {vendor.avgResponseLatencyMs}ms
          </p>
        </div>

        <div>
          <div className="text-fg-muted flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>{t("penalty")}</span>
          </div>
          <p className="mt-1 font-mono text-lg font-bold text-rose-400">
            -{vendor.incidentPenalty.toFixed(1)}
          </p>
        </div>

        <div>
          <div className="text-fg-muted flex items-center gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t("resp_bonus")}</span>
          </div>
          <p className="mt-1 font-mono text-lg font-bold text-cyan-400">
            +{vendor.responseRateBonus.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
