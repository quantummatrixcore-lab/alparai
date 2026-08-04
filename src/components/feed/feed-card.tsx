"use client";

import * as React from "react";
import { cn, formatDate } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import type { IncidentListItem } from "@/types";
import {
  MessageSquare,
  ThumbsUp,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export function FeedCard({
  incident,
  isLoggedIn = false,
  isWatched = false,
  onToggleWatch,
}: {
  incident: IncidentListItem;
  isLoggedIn?: boolean;
  isWatched?: boolean;
  onToggleWatch?: () => void;
}) {
  const t = useTranslations("incident");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const tFeed = useTranslations("feed");
  const locale = useLocale();

  const [expanded, setExpanded] = React.useState(false);
  const [showShare, setShowShare] = React.useState(false);
  const [upvotes, setUpvotes] = React.useState(incident.vote_count);
  const [upvoted, setUpvoted] = React.useState(false);

  const displayTitle =
    locale === "tr" && incident.title_tr && incident.title_tr.length > 0
      ? incident.title_tr
      : incident.title_masked;
  const displayDesc =
    locale === "tr" && incident.description_tr && incident.description_tr.length > 0
      ? incident.description_tr
      : incident.description_masked;

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (upvoted) {
      setUpvotes((v) => v - 1);
      setUpvoted(false);
    } else {
      setUpvotes((v) => v + 1);
      setUpvoted(true);
      toast.success(t("upvoted", { defaultValue: "Upvoted!" }));
    }
  };

  const shareUrl = React.useMemo(() => {
    const relativeUrl = `/incidents/${incident.id}`;
    if (typeof window === "undefined") return `https://alparai.com${relativeUrl}`;
    return `${window.location.origin}${relativeUrl}`;
  }, [incident.id]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mb-6 w-full"
    >
      <Card
        variant="glass"
        className="border-border-subtle relative transition-all duration-300 hover:border-white/10"
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:flex-nowrap">
            <div className="flex items-center gap-3">
              <div className="text-brand-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-bold uppercase">
                {incident.provider_name ? incident.provider_name.charAt(0) : "A"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Link
                    href={`/press-kit/${incident.provider_slug}`}
                    className="text-fg-primary hover:text-brand-400 text-sm font-bold transition-colors"
                  >
                    {incident.provider_name}
                  </Link>
                  {isLoggedIn && onToggleWatch && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleWatch();
                      }}
                      className={cn(
                        "cursor-pointer rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all",
                        isWatched
                          ? "text-fg-secondary bg-white/10 hover:bg-white/15"
                          : "bg-brand-500/10 text-brand-400 border-brand-500/20 hover:bg-brand-500/20 border",
                      )}
                    >
                      {isWatched
                        ? locale === "tr"
                          ? "Takipte"
                          : "Following"
                        : locale === "tr"
                          ? "Takip Et"
                          : "Follow"}
                    </button>
                  )}
                </div>
                <div className="text-fg-muted mt-0.5 flex items-center gap-1.5 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(new Date(incident.created_at || incident.incident_date), locale)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
          </div>

          {/* Title and Category */}
          <div className="mt-4">
            <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase">
              {tCat(incident.category)}
            </span>
            <Link href={`/incidents/${incident.id}`} className="mt-2 block">
              <h2 className="text-fg-primary hover:text-brand-400 line-clamp-2 text-xl leading-snug font-extrabold tracking-tight transition-colors">
                {displayTitle}
              </h2>
            </Link>
          </div>

          {/* Description */}
          <div className="text-fg-secondary relative mt-3 text-sm leading-relaxed">
            <p className={cn("transition-all duration-300", !expanded && "line-clamp-4")}>
              {displayDesc}
            </p>
            {displayDesc.length > 250 && (
              <button
                onClick={toggleExpand}
                className="text-brand-400 hover:text-brand-300 mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-bold"
              >
                {expanded ? (
                  <>
                    <span>{tCommon("showLess", { defaultValue: "Show less" })}</span>
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <span>{tCommon("showMore", { defaultValue: "Show more" })}</span>
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Truth Score progress bar */}
          {incident.cross_audit_truth_score !== null && (
            <div className="mt-6 border-y border-white/5 py-4">
              <div className="text-fg-secondary mb-2 flex items-center justify-between text-xs">
                <span className="font-bold tracking-wide uppercase">{tFeed("truthScore")}</span>
                <span
                  className={cn(
                    "text-sm font-black",
                    incident.cross_audit_truth_score >= 80
                      ? "text-success-400"
                      : incident.cross_audit_truth_score >= 50
                        ? "text-warning-400"
                        : "text-danger-400",
                  )}
                >
                  {incident.cross_audit_truth_score}/100
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    incident.cross_audit_truth_score >= 80
                      ? "bg-success-500"
                      : incident.cross_audit_truth_score >= 50
                        ? "bg-warning-500"
                        : "bg-danger-500",
                  )}
                  style={{ width: `${incident.cross_audit_truth_score}%` }}
                />
              </div>
            </div>
          )}

          {/* Engagement row */}
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-2">
            <div className="flex items-center gap-3">
              {/* Upvote */}
              <button
                onClick={handleUpvote}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-all duration-300",
                  upvoted
                    ? "bg-brand-500/20 text-brand-400 border-brand-500/35"
                    : "text-fg-secondary border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                )}
              >
                <ThumbsUp className={cn("h-4 w-4", upvoted && "animate-bounce fill-current")} />
                <span>{upvotes}</span>
              </button>

              {/* Comments */}
              <Link
                href={`/incidents/${incident.id}#comments`}
                className="text-fg-secondary inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{incident.evidence_count}</span>
              </Link>

              {/* Affected users */}
              <Link
                href={`/incidents/${incident.id}#affected`}
                className="text-fg-secondary hover:border-warning-500/30 hover:bg-warning-500/10 hover:text-warning-400 inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold transition-all duration-300"
              >
                <Users className="h-4 w-4" />
                <span>{incident.affected_count || 0}</span>
              </Link>
            </div>

            {/* Share Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShare(!showShare)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-all duration-300",
                  showShare
                    ? "bg-brand-500/20 text-brand-400 border-brand-500/35"
                    : "text-fg-secondary border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                )}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {tCommon("share", { defaultValue: "Share" })}
                </span>
              </button>

              <AnimatePresence>
                {showShare && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="bg-bg-elevated/95 absolute right-0 bottom-11 z-50 flex items-center gap-2 rounded-full border border-white/10 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    {/* X */}
                    <motion.a
                      whileHover={{ scale: 1.15, y: -1 }}
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayTitle)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-100 transition-colors hover:text-white"
                      aria-label={tFeed("shareOnX")}
                    >
                      <XIcon className="h-4 w-4" />
                    </motion.a>

                    {/* LinkedIn */}
                    <motion.a
                      whileHover={{ scale: 1.15, y: -1 }}
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0077b5]/10 text-[#0077b5] transition-colors hover:bg-[#0077b5]/20"
                      aria-label={tFeed("shareOnLinkedIn")}
                    >
                      <LinkedInIcon className="h-4 w-4" />
                    </motion.a>

                    {/* Instagram (Copy Link) */}
                    <motion.button
                      whileHover={{ scale: 1.15, y: -1 }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e1306c]/10 text-[#e1306c] transition-colors hover:bg-[#e1306c]/20"
                      aria-label={tFeed("copyForInstagram")}
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success(tFeed("copyForInstagram") + " ✓");
                        setShowShare(false);
                      }}
                    >
                      <InstagramIcon className="h-4 w-4" />
                    </motion.button>

                    {/* WhatsApp */}
                    <motion.a
                      whileHover={{ scale: 1.15, y: -1 }}
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(displayTitle + " " + shareUrl)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366]/10 text-[#25d366] transition-colors hover:bg-[#25d366]/20"
                      aria-label={tFeed("shareOnWhatsApp")}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
