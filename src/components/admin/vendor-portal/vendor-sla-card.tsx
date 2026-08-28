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
        return "bg-success-500/10 text-success-400 border-success-500/30";
      case "AA":
        return "bg-accent-500/10 text-accent-400 border-accent-500/30";
      case "A":
        return "bg-brand-500/10 text-brand-400 border-brand-500/30";
      default:
        return "bg-warning-500/10 text-warning-400 border-warning-500/30";
    }
  };

  return (
    <div className="group border-border-subtle bg-bg-secondary hover:border-border-subtle/80 hover:bg-bg-tertiary relative overflow-hidden rounded-3xl border p-4 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="group-hover:text-brand-300 text-fg-primary text-lg sm:text-xl font-bold transition-colors truncate">
              {vendor.providerName}
            </h3>
            <span
              className={`rounded-xl border px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black tracking-wide shrink-0 ${getTierColor(
                vendor.rankingTier,
              )}`}
            >
              {vendor.rankingTier}
            </span>
          </div>
          <p className="text-fg-muted mt-1 font-mono text-[11px] sm:text-xs truncate">slug: {vendor.providerSlug}</p>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <div className="text-fg-primary text-xl sm:text-2xl flex items-center gap-1 font-black">
            <ShieldCheck className="text-brand-400 inline-block h-4 w-4 sm:h-5 sm:w-5" />
            <span>{vendor.compositeScore.toFixed(1)}</span>
            <span className="text-fg-muted text-xs font-normal">/100</span>
          </div>
          <span className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase block">
            {t("trust_score")}
          </span>
        </div>
      </div>

      <div className="border-border-subtle mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4 border-t pt-4 sm:grid-cols-4">
        <div className="min-w-0">
          <div className="text-fg-muted flex items-center gap-1.5 text-xs truncate">
            <CheckCircle2 className="text-success-400 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t("sla_uptime")}</span>
          </div>
          <p className="text-success-400 mt-1 font-mono text-base sm:text-lg font-bold truncate">
            {vendor.slaUptimePercent}%
          </p>
        </div>

        <div className="min-w-0">
          <div className="text-fg-muted flex items-center gap-1.5 text-xs truncate">
            <Zap className="text-warning-400 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t("avg_latency")}</span>
          </div>
          <p className="text-fg-primary mt-1 font-mono text-base sm:text-lg font-bold truncate">
            {vendor.avgResponseLatencyMs}ms
          </p>
        </div>

        <div className="min-w-0">
          <div className="text-fg-muted flex items-center gap-1.5 text-xs truncate">
            <AlertTriangle className="text-danger-400 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t("penalty")}</span>
          </div>
          <p className="text-danger-400 mt-1 font-mono text-base sm:text-lg font-bold truncate">
            -{vendor.incidentPenalty.toFixed(1)}
          </p>
        </div>

        <div className="min-w-0">
          <div className="text-fg-muted flex items-center gap-1.5 text-xs truncate">
            <Activity className="text-accent-400 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t("resp_bonus")}</span>
          </div>
          <p className="text-accent-400 mt-1 font-mono text-base sm:text-lg font-bold truncate">
            +{vendor.responseRateBonus.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

