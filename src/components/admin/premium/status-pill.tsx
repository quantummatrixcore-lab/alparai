"use client";

import { cn } from "@/lib/utils";
import { LivePulseRing } from "./live-pulse-ring";
import { useTranslations } from "next-intl";

interface StatusPillProps {
  name: string;
  status: "healthy" | "warning" | "danger" | "idle";
  uptime?: number;
  latency?: string;
  lastIncident?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatusPill({
  name,
  status,
  uptime,
  latency,
  lastIncident,
  icon,
  className,
}: StatusPillProps) {
  const t = useTranslations("admin");
  const statusLabel = {
    healthy: "Operational",
    warning: "Degraded",
    danger: "Down",
    idle: "Unknown",
  };

  const statusTextColor = {
    healthy: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-rose-400",
    idle: "text-zinc-400",
  };

  return (
    <div
      className={cn(
        "bg-bg-secondary/60 border-border-subtle hover:bg-bg-secondary/80 flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-fg-muted flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5">
            {icon}
          </div>
        )}
        <div>
          <p className="text-fg-primary text-sm font-bold">{name}</p>
          <div className="flex items-center gap-2">
            <LivePulseRing status={status} size="sm" />
            <span className={cn("text-xs font-semibold", statusTextColor[status])}>
              {statusLabel[status]}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-right">
        {uptime !== undefined && (
          <div>
            <p className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("uptime")}
            </p>
            <p className="font-mono text-sm font-bold text-white">{uptime}%</p>
          </div>
        )}
        {latency && (
          <div>
            <p className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("latency")}
            </p>
            <p className="font-mono text-sm font-bold text-white">{latency}</p>
          </div>
        )}
        {lastIncident && (
          <div className="hidden sm:block">
            <p className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("last_issue")}
            </p>
            <p className="text-fg-secondary text-xs">{lastIncident}</p>
          </div>
        )}
      </div>
    </div>
  );
}
