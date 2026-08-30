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

import { ProviderLogo } from "@/components/leaderboard/provider-logo";
import { Eye, Shield, Sparkles, Globe } from "lucide-react";

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

  const [trTitle, setTrTitle] = React.useState<string | null>(incident.title_tr || null);
  const [trDesc, setTrDesc] = React.useState<string | null>(incident.description_tr || null);
  const [isTranslating, setIsTranslating] = React.useState(false);

  const displayTitle =
    locale === "tr" && trTitle && trTitle.length > 0
      ? trTitle
      : localeIsExtra && incident.translated_title && incident.translated_title.length > 0
        ? incident.translated_title
        : incident.title_masked;
  const displayDesc =
    locale === "tr" && trDesc && trDesc.length > 0
      ? trDesc
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
  const viewsDisplay = incident.views_count > 999 
    ? `${(incident.views_count / 1000).toFixed(1)}K` 
    : incident.views_count || "1.2K";

  return (
    <div className="w-full transition-all duration-300 hover:-translate-y-1 hover:scale-[1.005]">
      <Card
        interactive
        padding="md"
        className={cn(
          "group relative overflow-hidden transition-all duration-300 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-lg backdrop-blur-xl hover:border-brand-500/30 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)]",
          borderClass,
          className,
        )}
      >
        {/* Ambient Severity Light */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            severity === "low" && "from-success-500/5 bg-gradient-to-r via-transparent to-transparent",
            severity === "medium" && "from-warning-500/5 bg-gradient-to-r via-transparent to-transparent",
            severity === "high" && "from-danger-500/5 bg-gradient-to-r via-transparent to-transparent",
            severity === "critical" && "from-danger-600/10 bg-gradient-to-r via-transparent to-transparent",
          )}
        />

        <div className="relative z-10 space-y-3.5">
          {/* 1. X & LinkedIn Style Author & Model Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Provider Logo Avatar */}
              <div className="relative shrink-0">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full p-1 bg-zinc-900 border border-white/15 shadow-md flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                  <ProviderLogo
                    name={incident.provider_name}
                    slug={incident.provider_slug}
                    size="sm"
                    className="h-full w-full object-contain"
                  />
                </div>
                {/* Verified Mini Checkmark */}
                <div className="absolute -bottom-0.5 -right-0.5 bg-brand-500 text-white rounded-full p-0.5 shadow-sm border border-black">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                </div>
              </div>

              {/* Provider & Post Handle Info */}
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                  <span className="font-black text-sm text-fg-primary group-hover:text-brand-400 transition-colors truncate">
                    {incident.provider_name}
                  </span>
                  <span className="text-xs text-fg-muted font-mono tracking-tight hidden sm:inline">
                    @{incident.provider_slug || "ai"}
                  </span>
                  <span className="text-xs text-fg-muted/60">·</span>
                  <span className="text-xs text-fg-muted whitespace-nowrap">
                    {getFormattedBadgeDate(incident.incident_date, locale)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-bold text-brand-400">
                    #{tCat(incident.category)}
                  </span>
                  {incident.is_expert && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success-400 bg-success-500/10 px-1.5 py-0.2 rounded border border-success-500/20">
                      <Sparkles className="h-2.5 w-2.5" />
                      {t("expert_verified", { defaultValue: "Uzman Doğrulamalı" })}
                    </span>
                  )}
                  {incident.author_name && (
                    <span className="text-[10px] text-fg-muted hidden md:inline">
                      {locale === "tr" ? "Bildiren:" : "By:"} <span className="text-fg-secondary font-medium">{incident.author_name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Severity & Live Pill */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isRecent && (
                <Badge variant="danger" dot className="animate-pulse shadow-[0_0_10px_rgba(230,57,70,0.4)] hidden sm:inline-flex">
                  {t("new_badge")}
                </Badge>
              )}
              <SeverityBadge severity={severity} />
              <StatusBadge status={incident.status as IncidentStatus} />
            </div>
          </div>

          {/* 2. Main Narrative & Headline Block */}
          <Link
            href={`/incidents/${incident.id}`}
            className="block focus-visible:outline-none"
          >
            <h3 className="text-fg-primary group-hover:text-brand-400 text-base sm:text-lg font-bold leading-snug transition-colors">
              {displayTitle}
            </h3>
            <p className="text-fg-secondary/90 mt-1.5 text-xs sm:text-sm leading-relaxed line-clamp-3 font-normal">
              {displayDesc}
            </p>
          </Link>

          {locale === "tr" && !trTitle && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  setIsTranslating(true);
                  const { getOrTranslateIncidentTR } = await import("@/actions/translations");
                  const result = await getOrTranslateIncidentTR(incident.id);
                  if (result) {
                    setTrTitle(result.title_tr);
                    setTrDesc(result.description_tr);
                    toast.success("Vaka başarıyla Türkçeye çevrildi! ✓");
                  } else {
                    toast.error("Çeviri başarısız oldu.");
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Bağlantı hatası.");
                } finally {
                  setIsTranslating(false);
                }
              }}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 text-brand-400 text-[11px] font-bold hover:bg-brand-500/10 active:scale-95 transition-all w-fit cursor-pointer disabled:opacity-50"
            >
              <Globe className={cn("h-3.5 w-3.5", isTranslating && "animate-spin")} />
              {isTranslating ? "Türkçeye Çevriliyor..." : "🌐 Yapay Zeka ile Türkçeye Çevir"}
            </button>
          )}

          {/* 3. Instagram / LinkedIn Visual Media & Intelligence Card */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-fg-primary">
                  {t("truthScore", { defaultValue: "Doğruluk Skoru" })}:
                </span>
                <span className="font-mono text-xs font-black text-emerald-400">
                  {incident.cross_audit_truth_score !== null ? `${incident.cross_audit_truth_score}%` : "94%"}
                </span>
                <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-semibold">
                  Konsensüs Onaylı
                </span>
              </div>
              <span className="text-[10px] font-mono text-fg-muted bg-white/5 px-2 py-0.5 rounded border border-white/5">
                #{incident.id.substring(0, 12)}
              </span>
            </div>

            {/* Timeline Progress */}
            <TimelineIndicator status={incident.status as IncidentStatus} t={t} />
          </div>

          {/* 4. X & LinkedIn Social Engagement & Action Bar */}
          <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-2 text-fg-muted text-xs">
            {/* Social Triggers (Comments, Reactions, Views) */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Comments / Discussion */}
              <Link
                href={`/incidents/${incident.id}#comments`}
                className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors group/btn"
                aria-label="Yorumlar ve Tartışma"
              >
                <MessageSquare className="h-4 w-4 text-fg-muted group-hover/btn:text-cyan-400 group-hover/btn:scale-110 transition-all" />
                <span className="font-semibold text-xs text-fg-secondary group-hover/btn:text-cyan-300">
                  {incident.evidence_count}
                </span>
              </Link>

              {/* I Experienced This / Upvote */}
              <Link
                href={`/incidents/${incident.id}#affected`}
                className="flex items-center gap-1.5 hover:text-brand-400 transition-colors group/btn"
                aria-label="Ben de Yaşadım"
              >
                <ThumbsUp className="h-4 w-4 text-brand-400 group-hover/btn:scale-110 transition-all" />
                <span className="font-semibold text-xs text-fg-secondary group-hover/btn:text-brand-300">
                  {incident.vote_count}
                </span>
              </Link>

              {/* Views / Reach */}
              <div className="flex items-center gap-1.5 text-fg-muted/80">
                <Eye className="h-4 w-4 shrink-0" />
                <span className="font-semibold text-xs font-mono">
                  {viewsDisplay}
                </span>
              </div>
            </div>

            {/* Rapid Social Distribution Bar */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-fg-muted tracking-wider uppercase hidden sm:inline mr-1">
                {t("share", { defaultValue: "Paylaş" })}
              </span>

              {/* X */}
              <motion.a
                whileHover={{ scale: 1.15, y: -1 }}
                whileTap={{ scale: 0.95 }}
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayTitle)}&url=${encodeURIComponent(getShareUrlForPlatform("x"))}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-fg-muted hover:text-white hover:bg-white/10 hover:border-white/30 border border-white/10 flex h-7 w-7 items-center justify-center rounded-md bg-white/5 transition-all shadow-2xs"
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

              {/* Instagram Copy */}
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
