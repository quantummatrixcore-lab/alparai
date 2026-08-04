"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SlaBadgeProps {
  uptimePct?: number | null;
  mttrHours?: number | null;
  className?: string;
}

function getUptimeTier(pct: number | null | undefined): "green" | "yellow" | "red" | "unknown" {
  if (pct == null) return "unknown";
  if (pct >= 99.9) return "green";
  if (pct >= 99.0) return "yellow";
  return "red";
}

const TIER_STYLES = {
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  yellow: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  red: "border-red-500/30 bg-red-500/10 text-red-400",
  unknown: "border-border-subtle bg-bg-tertiary text-fg-muted",
};

const TIER_DOT = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400",
  unknown: "bg-fg-muted",
};

export function SlaBadge({ uptimePct, mttrHours, className }: SlaBadgeProps) {
  const t = useTranslations("sla");
  const tier = getUptimeTier(uptimePct);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TIER_STYLES[tier],
        className,
      )}
      title={
        uptimePct != null
          ? t("tooltip", { uptime: uptimePct.toFixed(2), mttr: mttrHours ?? "?" })
          : t("tooltip_unknown")
      }
      aria-label={
        uptimePct != null ? t("aria_label", { uptime: uptimePct.toFixed(2) }) : t("aria_unknown")
      }
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", TIER_DOT[tier])} aria-hidden="true" />
      {uptimePct != null ? `${uptimePct.toFixed(2)}%` : t("unknown")}
    </span>
  );
}
