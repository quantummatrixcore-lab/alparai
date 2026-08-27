"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CaretDown, CaretRight, ArrowsClockwise, Globe } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type {
  IntegrationService,
  IntegrationStatus,
  IntegrationAlternative,
} from "@/lib/integrations/types";
import { LOGO_MAP } from "@/lib/integrations/logos";
import { AlternativeCards } from "./alternative-cards";
import { useTranslations } from "next-intl";

interface ServiceBlockProps {
  service: IntegrationService;
  status: IntegrationStatus | undefined;
  alternatives: IntegrationAlternative[];
  isExpanded: boolean;
  onToggle: () => void;
}

// Zero-cost limits and stats for premium presentation
const SERVICE_LIMIT_SPECS: Record<string, { label: string; limit: string }> = {
  supabase: { label: "Storage & Database Size", limit: "500MB Free (Sync Pending)" },
  vercel: {
    label: "Bandwidth & Serverless Execution",
    limit: "100GB Free (Sync Pending)",
  },
  upstash: { label: "Redis Requests / Month", limit: "10,000 Free (Sync Pending)" },
  resend: { label: "Transaction Emails / Month", limit: "3,000 Free (Sync Pending)" },
  sentry: { label: "Error Logs & Transactions", limit: "5,000 Free (Sync Pending)" },
  cloudflare: { label: "Turnstile Challenges / Month", limit: "Unlimited (Sync Pending)" },
};

export function ServiceBlock({
  service,
  status,
  alternatives,
  isExpanded,
  onToggle,
}: ServiceBlockProps) {
  const t = useTranslations("admin");
  const Logo = LOGO_MAP[service.id];

  const statusType = status?.status ?? "not_configured";

  const statusLabel =
    statusType === "connected"
      ? t("integrations_connected") || "Connected"
      : statusType === "missing_key"
        ? t("integrations_missing_keys") || "Missing Key"
        : statusType === "error"
          ? t("questionnaire_failed") || "Error"
          : "N/A";

  const statusColors = {
    connected: {
      dot: "bg-success-400",
      bg: "bg-success-500/10 border-success-500/20 text-success-400",
      pulse: "shadow-success-400/50 animate-pulse",
    },
    missing_key: {
      dot: "bg-warning-400",
      bg: "bg-warning-500/10 border-warning-500/20 text-warning-400",
      pulse: "shadow-warning-400/50",
    },
    error: {
      dot: "bg-danger-400",
      bg: "bg-danger-500/10 border-danger-500/20 text-danger-400",
      pulse: "shadow-danger-400/50",
    },
    not_configured: {
      dot: "bg-zinc-600",
      bg: "bg-zinc-500/10 border-zinc-500/20 text-fg-muted",
      pulse: "shadow-zinc-600/50",
    },
  }[statusType];

  const spec = SERVICE_LIMIT_SPECS[service.id];

  return (
    <div className="bg-bg-secondary/40 border-border-subtle hover:border-border-subtle hover:bg-bg-secondary overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300">
      <button
        onClick={onToggle}
        className="group flex w-full flex-col justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.01] sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-4">
          {/* Logo with clean glowing borders */}
          <div className="border-border-subtle/50 bg-bg-secondary flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border p-2.5 shadow-inner">
            {Logo ? (
              <Logo className="h-full w-full drop-shadow-[0_0_4px_rgba(255,255,255,0.15)] filter" />
            ) : (
              <span className="text-fg-muted text-xs font-bold uppercase">
                {service.name.slice(0, 2)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-fg-primary text-base font-bold tracking-tight">{service.name}</h3>

              {/* Connected Badge */}
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-bold",
                  statusColors.bg,
                )}
              >
                <span className={cn("inline-block h-1.5 w-1.5 rounded-full", statusColors.dot)} />
                <span className="font-mono text-[9px] tracking-wider uppercase">{statusLabel}</span>
              </div>
            </div>
            <p className="text-fg-muted mt-1 line-clamp-1 text-xs sm:text-sm">
              {service.description}
            </p>
          </div>
        </div>

        {/* Zero cost telemetry limit status */}
        <div className="border-border-subtle/50 flex items-center justify-between gap-6 border-t pt-3 sm:justify-end sm:border-0 sm:pt-0">
          {spec && statusType === "connected" && (
            <div className="hidden min-w-[140px] text-left sm:text-right md:block">
              <p className="text-fg-muted font-mono text-[9px] font-bold tracking-wider uppercase">
                {spec.label}
              </p>
              <div className="mt-1 flex items-center gap-2 sm:justify-end">
                <span className="text-fg-secondary font-mono text-xs font-semibold">
                  {spec.limit}
                </span>
              </div>
              <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-white/5 sm:ml-auto">
                <div className="h-full rounded-full bg-zinc-600" style={{ width: `0%` }} />
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-4">
            {status?.monthlyCost !== undefined && (
              <div className="text-right">
                <p className="text-fg-muted font-mono text-[9px] font-bold tracking-wider uppercase">
                  {t("cost")}
                </p>
                <p className="text-success-400 bg-success-500/10 border-success-500/10 mt-0.5 rounded border px-1.5 py-0.5 font-mono text-xs font-bold">
                  ${status.monthlyCost.toFixed(2)}
                  {t("mo")}
                </p>
              </div>
            )}

            {service.url && (
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-fg-muted hover:text-fg-primary hover:border-border-subtle/50 rounded-lg border border-transparent p-2 transition-all duration-200 hover:bg-white/5"
                title={t("open_dashboard")}
              >
                <Globe weight="duotone" className="h-4 w-4" />
              </a>
            )}

            <div className="text-fg-muted p-1">
              {isExpanded ? (
                <CaretDown weight="bold" className="h-4 w-4" />
              ) : (
                <CaretRight weight="bold" className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-border-subtle bg-bg-secondary border-t">
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-fg-primary text-xs font-bold tracking-wider uppercase">
                    {t("alternatives")}
                    {alternatives.length})
                  </h4>
                  {alternatives.length > 0 && (
                    <span className="text-fg-muted flex items-center gap-1.5 font-mono text-[9px] tracking-wider uppercase">
                      <ArrowsClockwise weight="duotone" className="h-3 w-3 animate-pulse" />
                      {t("live_comparison_data")}
                    </span>
                  )}
                </div>

                {alternatives.length > 0 ? (
                  <AlternativeCards alternatives={alternatives} />
                ) : (
                  <p className="text-fg-muted py-4 text-center text-xs">
                    {t("no_alternative_providers_configured_for_")}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
