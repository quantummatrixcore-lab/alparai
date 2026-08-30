"use client";

import * as React from "react";
import { cn, formatDate } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { SeverityBadge, StatusBadge, Badge } from "@/components/ui/badge";
import { SlaBadge } from "@/components/incidents/sla-badge";
import type { IncidentListItem, IncidentSeverity, IncidentStatus } from "@/types";
import { MessageSquare, ThumbsUp, Clock, Building2, CheckCircle2, Share2, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// High-fidelity brand SVG icons
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function IncidentCard({
  incident,
  className,
}: {
  incident: IncidentListItem;
  className?: string;
}) {
  const t = useTranslations("incident");
  const tCat = useTranslations("categories");
  const tFeed = useTranslations("feed");
  const locale = useLocale();

  const localeIsExtra = locale === "de" || locale === "fr" || locale === "ru";

  const displayTitle =
    locale === "tr" && incident.title_tr && incident.title_tr.length > 0
      ? incident.title_tr
      : localeIsExtra && incident.translated_title && incident.translated_title.length > 0
        ? incident.translated_title
        : incident.title_masked;
  const displayDesc =
    locale === "tr" && incident.description_tr && incident.description_tr.length > 0
      ? incident.description_tr
      : localeIsExtra &&
          incident.translated_description &&
          incident.translated_description.length > 0
        ? incident.translated_description
        : incident.description_masked;

  const severity = incident.severity as IncidentSeverity;

  const isRecent = React.useMemo(() => {
    try {
      const createdTime = new Date(incident.created_at).getTime();
      const now = new Date().getTime();
      const diffMs = now - createdTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours <= 48; // within last 48 hours
    } catch {
      return false;
    }
  }, [incident.created_at]);

  const getShareUrlForPlatform = React.useCallback(
    (platform: string) => {
      const relativeUrl = `/incidents/${incident.id}?ref=${platform}`;
      if (typeof window === "undefined") return `https://alparai.com${relativeUrl}`;
      return `${window.location.origin}${relativeUrl}`;
    },
    [incident.id],
  );

  const severityBorders: Record<IncidentSeverity, string> = {
    low: "border-l-4 border-l-success-500/80 focus-within:border-l-success-500",
    medium: "border-l-4 border-l-warning-500/80 focus-within:border-l-warning-500",
    high: "border-l-4 border-l-danger-500/80 focus-within:border-l-danger-500",
    critical: "border-l-4 border-l-danger-600 focus-within:border-l-danger-600 animate-pulse",
  };

  const borderClass = severityBorders[severity] || "border-l-4 border-l-brand-500";

  return (
    <div className="w-full transition-all duration-300 hover:-translate-y-1 hover:scale-[1.005]">
      <Card
        interactive
        padding="md"
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          borderClass,
          className,
        )}
      >
        {/* Hover Ambient Severity Glow */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            severity === "low" &&
              "from-success-500/5 bg-gradient-to-r via-transparent to-transparent",
            severity === "medium" &&
              "from-warning-500/5 bg-gradient-to-r via-transparent to-transparent",
            severity === "high" &&
              "from-danger-500/5 bg-gradient-to-r via-transparent to-transparent",
            severity === "critical" &&
              "from-danger-600/10 bg-gradient-to-r via-transparent to-transparent",
          )}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {isRecent && (
                <Badge
                  variant="danger"
                  dot
                  className="animate-pulse shadow-[0_0_10px_rgba(230,57,70,0.4)]"
                >
                  {t("new_badge")}
                </Badge>
              )}
              <SeverityBadge severity={severity} />
              <StatusBadge status={incident.status as IncidentStatus} />
              <Badge variant="muted">
                <Building2 className="h-3 w-3" aria-hidden="true" />
                {incident.provider_name}
              </Badge>
              <SlaBadge uptimePct={null} />
              {(() => {
                const source = incident.incident_source || "user_submitted";
                const isUserSubmitted = source === "user_submitted";
                return (
                  <Badge
                    variant={isUserSubmitted ? "default" : "muted"}
                    className={cn(
                      "cursor-help transition-all duration-200",
                      isUserSubmitted
                        ? "border-emerald-accent/20 bg-emerald-accent/10 text-emerald-accent font-bold"
                        : "border-border-subtle bg-bg-tertiary text-fg-muted",
                    )}
                    title={t(`source_tooltip_${source}`)}
                  >
                    {t(`source_${source}`)}
                  </Badge>
                );
              })()}
              {incident.is_expert && (
                <Badge
                  variant="success"
                  className="border-success-500/20 bg-success-500/10 text-success-400 font-bold"
                >
                  <CheckCircle2 className="text-success-400 mr-1 h-3 w-3" aria-hidden="true" />
                  {t("expert_verified", { defaultValue: "Expert Verified" })}
                </Badge>
              )}
              {incident.machine_translated && (
                <Badge
                  variant="muted"
                  className="border-warning-500/20 bg-warning-500/10 text-warning-400"
                  title={t("machine_translated_tooltip", {
                    defaultValue: "This content was machine-translated for accessibility",
                  })}
                >
                  <span className="mr-1" aria-hidden="true">
                    &#x1F916;
                  </span>
                  {t("machine_translated_badge", { defaultValue: "Machine Translated" })}
                </Badge>
              )}
              {incident.source_badge === "seed" && (
                <Badge
                  variant="muted"
                  className="border-warning-500/20 bg-warning-500/10 text-warning-400"
                  title={t("seed_badge_tooltip", {
                    defaultValue:
                      "This incident was imported from curated research data to seed the platform at launch.",
                  })}
                >
                  {t("seed_badge", { defaultValue: "Imported — Research Data" })}
                </Badge>
              )}
              {incident.source_badge === "imported" && (
                <Badge
                  variant="muted"
                  className="border-sky-500/20 bg-sky-500/10 text-sky-400"
                  title={t("imported_badge_tooltip", {
                    defaultValue: "Imported from an external source. Original language preserved.",
                  })}
                >
                  {t("imported_badge", { defaultValue: "Imported" })}
                </Badge>
              )}
              <Badge variant="outline">{tCat(incident.category)}</Badge>
              {incident.cross_audit_truth_score !== null && (
                <Badge
                  variant={
                    incident.cross_audit_truth_score >= 80
                      ? "success"
                      : incident.cross_audit_truth_score >= 50
                        ? "warning"
                        : "danger"
                  }
                  className="font-bold"
                >
                  {t("truthScore")} {incident.cross_audit_truth_score}%
                </Badge>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {incident.is_anonymous && (
                <Badge variant="muted" size="sm">
                  {t("anonymous")}
                </Badge>
              )}
              <span className="bg-bg-tertiary/80 text-fg-muted border-border-subtle/50 rounded border px-2 py-0.5 text-[10px] font-bold">
                {getFormattedBadgeDate(incident.incident_date, locale)}
              </span>
            </div>
          </div>
          <Link
            href={`/incidents/${incident.id}`}
            className="mt-3 block focus-visible:outline-none"
          >
            <h3 className="text-fg-primary group-hover:text-brand-400 line-clamp-2 text-lg font-semibold transition-colors">
              {displayTitle}
            </h3>
            <p className="text-fg-muted mt-1.5 line-clamp-3 text-sm">{displayDesc}</p>
          </Link>
          {/* Timeline indicator */}
          <TimelineIndicator status={incident.status as IncidentStatus} t={t} />

          {/* Modern Corporate Card Footer */}
          <div className="border-border-subtle/50 text-fg-muted mt-5 flex flex-col gap-3.5 border-t pt-3.5">
            {/* Action Bar: Date, Reaction & Comment Buttons, and Provenance */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Date Badge */}
                <span className="text-fg-muted bg-white/5 border-border-subtle/50 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] sm:text-[11px] font-medium select-none shadow-2xs">
                  <Clock className="h-3 w-3 text-fg-muted/70 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{formatDate(new Date(incident.incident_date), locale)}</span>
                </span>

                {/* Ben de Yaşadım */}
                <Link
                  href={`/incidents/${incident.id}#affected`}
                  className="text-fg-secondary hover:text-white hover:border-brand-500/50 hover:bg-brand-500/15 active:scale-[0.97] border-border-subtle/60 inline-flex cursor-pointer items-center gap-1 sm:gap-1.5 rounded-md border bg-white/5 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition-all select-none shadow-2xs hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                >
                  <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-400 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{t("me_too", { defaultValue: "Ben de Yaşadım" })}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-fg-primary">
                    {incident.vote_count}
                  </span>
                </Link>

                {/* Yorum Yap */}
                <Link
                  href={`/incidents/${incident.id}#comments`}
                  className="text-fg-secondary hover:text-white hover:border-accent-500/50 hover:bg-accent-500/15 active:scale-[0.97] border-border-subtle/60 inline-flex cursor-pointer items-center gap-1 sm:gap-1.5 rounded-md border bg-white/5 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition-all select-none shadow-2xs hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                >
                  <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent-400 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{t("comment_action", { defaultValue: "Yorum Yap" })}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-fg-primary">
                    {incident.evidence_count}
                  </span>
                </Link>
              </div>

              {/* Author / Provenance Tag */}
              <span className="border-border-subtle/50 text-fg-muted bg-white/5 inline-flex items-center gap-1 sm:gap-1.5 rounded-md border px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium tracking-wide whitespace-nowrap self-start sm:self-auto shadow-2xs">
                <User className="h-3 w-3 text-fg-muted/60 shrink-0" aria-hidden="true" />
                <span className="text-fg-muted/70">{locale === "tr" ? "Bildiren:" : "By:"}</span>
                <span className="text-fg-secondary font-semibold">
                  {incident.author_name ?? t("anonymous", { defaultValue: "Anonim" })}
                </span>
              </span>
            </div>

            {/* Social Distribution & Rapid Share Bar */}
            <div className="flex items-center justify-between border-t border-border-subtle/30 pt-2.5">
              <span className="text-fg-muted/70 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 select-none">
                <Share2 className="h-3.5 w-3.5 text-brand-400/80" />
                <span>{t("share", { defaultValue: "Paylaş" })}</span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* X */}
                <motion.a
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayTitle)}&url=${encodeURIComponent(getShareUrlForPlatform("x"))}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fg-muted hover:text-white hover:bg-white/10 hover:border-white/30 border border-border-subtle/50 flex h-7 w-7 items-center justify-center rounded-md bg-white/5 transition-all shadow-2xs"
                  aria-label={tFeed("shareOnX")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <XIcon className="h-3.5 w-3.5" />
                </motion.a>

                {/* LinkedIn */}
                <motion.a
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrlForPlatform("linkedin"))}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-social-linkedin hover:bg-social-linkedin/20 border border-social-linkedin/30 flex h-7 w-7 items-center justify-center rounded-md bg-social-linkedin/10 transition-all shadow-2xs"
                  aria-label={tFeed("shareOnLinkedIn")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkedInIcon className="h-3.5 w-3.5" />
                </motion.a>

                {/* Instagram */}
                <motion.button
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-social-instagram hover:bg-social-instagram/20 border border-social-instagram/30 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-social-instagram/10 transition-all shadow-2xs"
                  aria-label={tFeed("copyForInstagram")}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(getShareUrlForPlatform("copy"));
                    toast.success(tFeed("copyForInstagram") + " ✓");
                  }}
                >
                  <InstagramIcon className="h-3.5 w-3.5" />
                </motion.button>

                {/* WhatsApp */}
                <motion.a
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(displayTitle + " " + getShareUrlForPlatform("whatsapp"))}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-social-whatsapp hover:bg-social-whatsapp/20 border border-social-whatsapp/30 flex h-7 w-7 items-center justify-center rounded-md bg-social-whatsapp/10 transition-all shadow-2xs"
                  aria-label={tFeed("shareOnWhatsApp")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TimelineIndicator({ status, t }: { status: IncidentStatus; t: (key: string) => string }) {
  const steps: { label: string; statuses: IncidentStatus[] }[] = [
    {
      label: t("timeline_reported"),
      statuses: ["pending_review", "published", "rejected", "archived", "takedown"],
    },
    { label: t("timeline_reviewed"), statuses: ["published", "rejected", "archived", "takedown"] },
    { label: t("timeline_published"), statuses: ["published", "archived"] },
  ];

  const isRejected = status === "rejected" || status === "takedown";

  return (
    <div className="mt-4 rounded-lg bg-white/[0.02] border border-border-subtle/40 px-3 py-2 sm:px-3.5 sm:py-2.5" aria-label={t("timeline")}>
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {steps.map((step, i) => {
          const active = step.statuses.includes(status);
          const isLast = i === steps.length - 1;
          return (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-1.5 shrink-0">
                <CheckCircle2
                  className={cn(
                    "h-3.5 w-3.5 transition-colors duration-300 shrink-0",
                    active && !isRejected
                      ? "text-success-400"
                      : isRejected && i === 0
                        ? "text-danger-400"
                        : "text-fg-disabled",
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-colors whitespace-nowrap",
                    active && !isRejected ? "text-success-400" : "text-fg-disabled",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-[1.5px] flex-1 min-w-[10px] sm:min-w-[16px] rounded-full transition-colors duration-500",
                    steps[i + 1]?.statuses.includes(status) && !isRejected
                      ? "bg-success-500/60"
                      : "bg-fg-disabled/20",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function getFormattedBadgeDate(dateString: string, locale: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays >= 0 && diffDays <= 30) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (locale === "tr") {
          return `${Math.max(1, diffMins)} dakika önce`;
        }
        return `${Math.max(1, diffMins)}m ago`;
      }
      if (diffHours < 24) {
        if (locale === "tr") {
          return `${diffHours} saat önce`;
        }
        return `${diffHours}h ago`;
      }
      const days = Math.floor(diffDays);
      if (locale === "tr") {
        return `${days} gün önce`;
      }
      return `${days}d ago`;
    } else {
      if (locale === "tr") {
        const monthsTR = [
          "Ocak",
          "Şubat",
          "Mart",
          "Nisan",
          "Mayıs",
          "Haziran",
          "Temmuz",
          "Ağustos",
          "Eylül",
          "Ekim",
          "Kasım",
          "Aralık",
        ];
        return `${monthsTR[date.getMonth()]} ${date.getFullYear()}`;
      } else {
        const monthsEN = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return `${monthsEN[date.getMonth()]} ${date.getFullYear()}`;
      }
    }
  } catch {
    return "";
  }
}
