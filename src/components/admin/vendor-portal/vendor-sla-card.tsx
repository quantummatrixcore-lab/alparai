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
            <CheckCircle2 className="text-success-400 h-3.5 w-3.5" />
            <span>{t("sla_uptime")}</span>
          </div>
          <p className="text-success-400 mt-1 font-mono text-lg font-bold">
            {vendor.slaUptimePercent}%
          </p>
        </div>

        <div>
          <div className="text-fg-muted flex items-center gap-1.5 text-xs">
            <Zap className="text-warning-400 h-3.5 w-3.5" />
            <span>{t("avg_latency")}</span>
          </div>
          <p className="text-fg-primary mt-1 font-mono text-lg font-bold">
            {vendor.avgResponseLatencyMs}ms
          </p>
        </div>

        <div>
          <div className="text-fg-muted flex items-center gap-1.5 text-xs">
            <AlertTriangle className="text-danger-400 h-3.5 w-3.5" />
            <span>{t("penalty")}</span>
          </div>
          <p className="text-danger-400 mt-1 font-mono text-lg font-bold">
            -{vendor.incidentPenalty.toFixed(1)}
          </p>
        </div>

        <div>
          <div className="text-fg-muted flex items-center gap-1.5 text-xs">
            <Activity className="text-accent-400 h-3.5 w-3.5" />
            <span>{t("resp_bonus")}</span>
          </div>
          <p className="text-accent-400 mt-1 font-mono text-lg font-bold">
            +{vendor.responseRateBonus.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
