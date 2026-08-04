"use client";

import * as React from "react";
import { motion, animate, useInView } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ArrowRight, ShieldAlert, Target, Trophy, Quote, Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export function HeroSection({
  totalIncidents = 0,
  totalProviders = 0,
  totalCountries = 0,
  topProviders = [],
  countsBySource,
}: {
  totalIncidents?: number;
  totalProviders?: number;
  totalCountries?: number;
  topProviders?: Array<{ name: string; count: number; slug: string }>;
  countsBySource?: {
    user_submitted: number;
    aiaaic_import: number;
    aiid_import: number;
    news_curated: number;
    court_record: number;
  };
}) {
  const t = useTranslations("hero");
  const tIncident = useTranslations("incident");

  const incidentTooltip = countsBySource
    ? `${tIncident("source_user_submitted")}: ${countsBySource.user_submitted}\n` +
      `${tIncident("source_aiaaic_import")}: ${countsBySource.aiaaic_import}\n` +
      `${tIncident("source_aiid_import")}: ${countsBySource.aiid_import}\n` +
      `${tIncident("source_news_curated")}: ${countsBySource.news_curated}\n` +
      `${tIncident("source_court_record")}: ${countsBySource.court_record}`
    : undefined;

  return (
    <section className="bg-bg-primary relative overflow-hidden pt-24 pb-16">
      {/* Background Effects */}
      <div
        aria-hidden="true"
        className="from-gradient-hero-start to-gradient-hero-end animate-gradient-shift absolute inset-0 z-0 overflow-hidden bg-gradient-to-br bg-[length:200%_200%]"
      >
        <div className="bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%221%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] absolute inset-0 opacity-20 mix-blend-overlay" />

        {/* Floating particles */}
        <div className="bg-brand-600/20 animate-float absolute -top-[10%] left-[20%] h-[400px] w-[400px] rounded-full mix-blend-screen blur-[120px]" />
        <div className="bg-accent-500/20 animate-float-delayed absolute top-[20%] right-[10%] h-[300px] w-[300px] rounded-full mix-blend-screen blur-[100px]" />
        <div className="bg-danger-500/15 animate-float absolute -bottom-[10%] left-[40%] h-[350px] w-[350px] rounded-full mix-blend-screen blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] bg-[size:64px_64px]" />
      </div>

      <Container className="relative z-10">
        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[55fr_45fr]">
          {/* LEFT: Manifesto Column */}
          <div className="flex flex-col justify-center">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 flex"
            >
              <div className="border-danger-500/30 bg-danger-500/10 text-danger-400 inline-flex items-center gap-2 rounded-sm border px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(230,57,70,0.3)] backdrop-blur-md">
                <Target className="h-4 w-4" />
                <span>{t("eyebrow")}</span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-fg-primary animate-fade-up pb-4 text-5xl leading-[0.95] font-black tracking-tighter opacity-0 drop-shadow-lg sm:text-6xl lg:text-[72px]"
            >
              {t("title_primary")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-fg-secondary mt-6 max-w-xl text-lg leading-relaxed font-medium tracking-tight"
            >
              {t("subtitle")}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/submit"
                onClick={() => trackEvent("hero_cta_click", { action: "primary" })}
                className="group bg-danger-500 hover:bg-danger-400 animate-gradient-shift relative inline-flex h-13 items-center justify-center gap-3 rounded-md px-8 text-base font-black text-white shadow-[0_0_25px_rgba(230,57,70,0.4)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[length:200%_auto] hover:shadow-[0_0_40px_rgba(230,57,70,0.7)]"
              >
                <ShieldAlert className="h-5 w-5" />
                {t("cta_primary")}
              </Link>
              <Link
                href="/dashboard/journalist"
                onClick={() => trackEvent("hero_cta_click", { action: "journalist" })}
                className="bg-brand-600 hover:bg-brand-500 relative inline-flex h-13 items-center justify-center gap-3 rounded-md px-8 text-base font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                <Radio className="h-5 w-5" />
                {t("cta_journalist")}
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => trackEvent("hero_cta_click", { action: "secondary" })}
                className="bg-glass text-fg-primary hover:border-brand-500/40 inline-flex h-13 items-center justify-center gap-3 rounded-md px-8 text-base font-bold shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                {t("cta_secondary")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Link>
            </motion.div>

            {/* Founder Story / Trust Infrastructure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="border-brand-500/50 mt-12 flex flex-col gap-4 border-l-2 pl-6"
            >
              <div className="text-brand-400 flex items-center gap-2">
                <Quote className="h-5 w-5" />
                <span className="text-xs font-bold tracking-wider uppercase">
                  The Founder&apos;s Vision
                </span>
              </div>
              <p className="text-fg-secondary text-sm leading-relaxed italic">
                &quot;
                {t("founder_quote", {
                  fallback:
                    "We are building the trust infrastructure for AI accountability. Because humanity deserves to know how algorithms shape our world. This is a public trust platform.",
                })}
                &quot;
              </p>
              <div className="mt-1 flex items-center gap-3">
                <div className="from-brand-500 to-brand-700 border-brand-400/40 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-gradient-to-br text-xs font-black text-white shadow-md">
                  EE
                </div>
                <div>
                  <p className="text-fg-primary text-xs font-bold">Ercüment ERDEN</p>
                  <p className="text-brand-400 text-[10px] font-medium">
                    {t("founder_role", { defaultValue: "Kurucu, ALPAR AI" })}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Live Data Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* LIVE badge */}
            <div className="flex items-center gap-2">
              <span className="bg-danger-500 h-2 w-2 animate-pulse rounded-full shadow-[0_0_8px_rgba(230,57,70,0.8)]" />
              <span className="text-danger-400 text-xs font-black tracking-[0.2em] uppercase">
                {t("live_data")}
              </span>
            </div>

            {/* Stats Panel */}
            <div className="bg-glass rounded-2xl border border-white/5 p-5 shadow-2xl">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <LiveStatCard
                  value={totalIncidents}
                  label={t("stats_incidents")}
                  glowColor="rgba(230,57,70,0.15)"
                  accentClass="text-danger-400"
                  tooltip={incidentTooltip}
                />
                <LiveStatCard
                  value={totalProviders}
                  label={t("stats_providers")}
                  glowColor="rgba(168,85,247,0.15)"
                  accentClass="text-brand-400"
                />
                <LiveStatCard
                  value={totalCountries}
                  label={t("stats_countries")}
                  glowColor="rgba(39,174,96,0.15)"
                  accentClass="text-success-400"
                />
              </div>
            </div>

            {/* Leaderboard Panel */}
            <div className="bg-glass rounded-2xl border border-white/5 p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-fg-primary text-sm font-black tracking-wider uppercase">
                  📊 {t("leaderboard_title")}
                </h3>
                <Link
                  href="/leaderboard"
                  className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-xs font-bold transition-colors"
                >
                  {t("view_all")}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {topProviders.length > 0 ? (
                  topProviders
                    .slice(0, 5)
                    .map((p, i) => (
                      <ProviderBar
                        key={p.slug}
                        rank={i + 1}
                        name={p.name}
                        count={p.count}
                        maxCount={topProviders[0]?.count ?? 1}
                      />
                    ))
                ) : (
                  <p className="text-fg-muted py-4 text-center text-xs font-medium">
                    {t("no_providers_data", { defaultValue: "No tracking data available yet." })}
                  </p>
                )}
              </div>
              <Link
                href="/leaderboard"
                className="text-fg-muted hover:text-brand-400 mt-4 block text-center text-xs font-medium transition-colors"
              >
                {t("view_full_leaderboard")}
              </Link>
            </div>

            {/* Last report indicator */}
            <div className="flex items-center gap-2 px-1">
              <Radio className="text-fg-muted h-3.5 w-3.5" />
              <span className="text-fg-muted text-xs">{t("last_report")}</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Side-by-Side Highlight Cards (Perfect Symmetry) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2"
        >
          {/* Left: Founder Story Card */}
          <div className="bg-glass border-danger-500/30 relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border-l-4 p-6 shadow-2xl">
            <div className="from-danger-500/5 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="bg-danger-500/10 border-danger-500/20 text-danger-400 mt-0.5 shrink-0 rounded-lg border p-2">
                <Quote className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <h4 className="text-danger-400 text-xs font-black tracking-wide uppercase">
                  {t("founder_title")}
                </h4>
                <blockquote className="text-fg-secondary text-sm leading-relaxed font-semibold">
                  "{t("founder_subtitle")}"
                </blockquote>
              </div>
            </div>
            <div className="relative z-10 mt-6 pl-14">
              <p className="text-fg-muted text-xs font-bold tracking-wider uppercase">
                {t("founder_signature", { defaultValue: "— Ercüment Erden, Founder" })}
              </p>
              <Link
                href="/incidents/fa11aab1-fa11-4700-8000-000000000031"
                className="text-brand-400 hover:text-brand-300 mt-3 inline-flex items-center gap-1 text-xs font-bold transition-colors"
              >
                {t("founder_cta")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Right: Bug Bounty Card */}
          <div className="bg-glass/60 border-warning-500/30 hover:border-warning-500/50 border-t-warning-500/60 relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-t-2 p-6 shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.18)]">
            <div className="bg-warning-500/15 absolute -top-6 -right-6 -z-10 h-24 w-24 rounded-full blur-xl" />
            <div className="flex items-start gap-4">
              <div className="bg-warning-500/20 border-warning-500/30 text-warning-300 shrink-0 rounded-xl border p-3">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-2">
                  <span className="border-warning-500/40 bg-warning-500/20 text-warning-300 rounded-sm border px-2 py-0.5 text-[9px] font-black tracking-[0.2em] uppercase">
                    {t("bug_bounty_badge", { defaultValue: "Bug Bounty" })}
                  </span>
                </div>
                <h4 className="text-warning-300 text-xl font-black tracking-tight drop-shadow-[0_2px_12px_rgba(249,115,22,0.45)]">
                  {t("title_accent")}
                </h4>
                <p className="text-xs leading-relaxed font-medium text-white/85">
                  {t("title_accent_desc")}
                </p>
              </div>
            </div>
            <div className="mt-6 pl-14">
              <Link
                href="/bounties"
                className="bg-warning-500 hover:bg-warning-400 focus-visible:ring-warning-500 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold text-neutral-950 shadow-lg transition-all hover:scale-105"
              >
                {t("bug_bounty_badge", { defaultValue: "Bug Bounty" })} {t("view_all") ?? "→"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function AnimatedValue({ value }: { value: number | string }) {
  const numVal = typeof value === "number" ? value : 0;
  const [count, setCount] = React.useState(numVal);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  React.useEffect(() => {
    if (numVal === 0 || !isInView) return;

    const controls = animate(0, numVal, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setCount(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [numVal, isInView]);

  if (typeof value === "string") return <>{value}</>;
  return (
    <span
      ref={ref}
      className={cn(
        numVal === 0 &&
          "from-fg-muted/50 to-fg-muted/50 animate-shimmer inline-block min-w-[2ch] bg-gradient-to-r via-white/80 bg-[length:200%_100%] bg-clip-text text-transparent",
      )}
    >
      {count.toLocaleString()}
    </span>
  );
}

function LiveStatCard({
  value,
  label,
  glowColor,
  accentClass,
  tooltip,
}: {
  value: number | string;
  label: string;
  glowColor: string;
  accentClass: string;
  tooltip?: string;
}) {
  return (
    <div
      className={cn("rounded-xl p-2 text-center sm:p-3", tooltip && "cursor-help")}
      style={{ boxShadow: `inset 0 0 20px ${glowColor}` }}
      title={tooltip}
    >
      <p className={`font-mono text-2xl font-black tracking-tight sm:text-3xl ${accentClass}`}>
        <AnimatedValue value={value} />
      </p>
      <p className="text-fg-muted mt-1 text-[9px] leading-tight font-bold tracking-[0.15em] break-words uppercase sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}

function ProviderBar({
  rank,
  name,
  count,
  maxCount,
}: {
  rank: number;
  name: string;
  count: number;
  maxCount: number;
}) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  const rankColors = [
    "text-danger-400",
    "text-warning-400",
    "text-brand-400",
    "text-fg-secondary",
    "text-fg-muted",
  ];
  const barColors = [
    "bg-danger-500/70",
    "bg-warning-500/70",
    "bg-brand-500/70",
    "bg-fg-secondary/40",
    "bg-fg-muted/30",
  ];

  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-4 text-center font-mono text-xs font-black ${rankColors[rank - 1] ?? "text-fg-muted"}`}
      >
        #{rank}
      </span>
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-fg-primary text-xs font-bold">{name}</span>
          <span className="text-fg-muted font-mono text-xs">{count.toLocaleString()}</span>
        </div>
        <div className="bg-bg-tertiary h-1.5 w-full overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: rank * 0.1, ease: "easeOut" }}
            className={`h-full rounded-full ${barColors[rank - 1] ?? "bg-fg-muted/30"}`}
          />
        </div>
      </div>
    </div>
  );
}
