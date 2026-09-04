"use client";

import * as React from "react";
import { motion, animate, useInView, type Variants } from "framer-motion";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  ShieldAlert,
  Target,
  Trophy,
  Quote,
  Radio,
  Zap,
  CreditCard,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

// Animation Variants for Staggering (Safe initial state prevents stuck opacity in React 19)
const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

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
    <section className="bg-bg-primary selection:bg-brand-500/30 relative overflow-hidden pt-28 pb-20">
      {/* Cyber-Dark Ambient Background */}
      <div aria-hidden="true" className="bg-bg-deep absolute inset-0 z-0 overflow-hidden">
        {/* Dynamic Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_30%,transparent_100%)] bg-[size:80px_80px]" />

        {/* Premium Noise Overlay */}
        <div className="bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] absolute inset-0 opacity-[0.15] mix-blend-overlay" />

        {/* Glowing Orbs (Awwwards Style) */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="bg-brand-600/30 absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full mix-blend-screen blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="bg-accent-500/20 absolute top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full mix-blend-screen blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="bg-danger-500/20 absolute -bottom-[20%] left-[30%] h-[500px] w-[500px] rounded-full mix-blend-screen blur-[130px]"
        />
      </div>

      <Container className="relative z-10">
        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: Manifesto Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex min-w-0 flex-col justify-center lg:col-span-7"
          >
            {/* Eyebrow badge (Glassmorphic) */}
            <motion.div variants={itemVariants} className="mb-6 flex">
              <div className="group hover:border-danger-500/50 border-border-subtle relative inline-flex items-center gap-2 overflow-hidden rounded-full border bg-white/5 px-4 py-2 text-[11px] font-black tracking-[0.25em] text-white uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(230,57,70,0.2)]">
                <span className="from-danger-500/0 via-danger-500/20 to-danger-500/0 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Zap className="text-danger-400 h-3.5 w-3.5" />
                <span className="relative z-10">{t("eyebrow")}</span>
              </div>
            </motion.div>

            {/* Main headline - Premium Gradient Text */}
            <motion.h1
              variants={itemVariants}
              className="animate-fade-up pb-3 text-3xl font-black tracking-tight text-balance drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[48px] xl:leading-[1.15]"
            >
              <span className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
                {t("title_primary")}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-fg-secondary mt-4 max-w-xl text-base leading-relaxed font-medium tracking-tight sm:text-lg"
            >
              {t("subtitle")}
            </motion.p>

            {/* CTAs - High-End Hover States & Micro-interactions */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap gap-4 sm:flex-row sm:items-center"
            >
              <Link
                href="/products/ars-api"
                onClick={() => trackEvent("hero_cta_click", { action: "primary" })}
                className="group bg-danger-500 relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-xl px-8 text-base font-black text-white shadow-[0_0_30px_rgba(230,57,70,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_50px_rgba(230,57,70,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] active:scale-95"
              >
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[100%]" />
                <ShieldAlert className="relative z-10 h-5 w-5" />
                <span className="relative z-10">
                  {t("cta_primary", { defaultValue: "Risk API'yi İncele" })}
                </span>
              </Link>

              <Link
                href="/pricing"
                onClick={() => trackEvent("hero_cta_click", { action: "pricing" })}
                className="group border-brand-500/40 bg-brand-500/10 hover:border-brand-400 hover:bg-brand-500/20 relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-xl border px-8 text-base font-bold text-white shadow-[0_0_25px_rgba(168,85,247,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-95"
              >
                <CreditCard className="text-brand-400 relative z-10 h-5 w-5" />
                <span className="relative z-10">
                  {t("cta_pricing", { defaultValue: "Enterprise & Pricing" })}
                </span>
              </Link>

              <Link
                href="/incidents"
                onClick={() => trackEvent("hero_cta_click", { action: "secondary" })}
                className="group border-border-subtle hover:border-border-strong relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-xl border bg-white/5 px-8 text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95"
              >
                <span className="relative z-10">
                  {t("cta_secondary", { defaultValue: "Kozmik Adalet Panosu" })}
                </span>
                <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Founder Story / Trust Infrastructure */}
            <motion.div
              variants={itemVariants}
              className="border-brand-500/50 mt-14 flex flex-col gap-5 border-l-[3px] pl-6"
            >
              <div className="flex items-center gap-2">
                <Quote className="text-brand-400 h-5 w-5" />
                <span className="from-brand-400 to-accent-400 bg-gradient-to-r bg-clip-text text-xs font-black tracking-[0.2em] text-transparent uppercase">
                  {t("founder_vision")}
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
              <div className="mt-2 flex items-center gap-4">
                <div className="from-brand-500 to-brand-800 relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_0_15px_rgba(147,51,234,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]">
                  <span className="text-sm font-black text-white">EE</span>
                </div>
                <div>
                  <a
                    href="https://ercumenterden.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg-primary text-sm font-black transition-colors hover:text-white hover:underline"
                  >
                    Ercüment ERDEN
                  </a>
                  <p className="text-brand-400 text-[11px] font-bold tracking-wider uppercase">
                    {t("founder_role", { defaultValue: "Kurucu, ALPAR AI" })}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Live Data Panel (Glassmorphic Masterpiece) */}
          <motion.div
            initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex min-w-0 flex-col gap-6 lg:col-span-5"
          >
            {/* LIVE badge */}
            <div className="flex items-center gap-3">
              <span className="bg-danger-500 relative flex h-2.5 w-2.5">
                <span className="bg-danger-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-danger-500 relative inline-flex h-2.5 w-2.5 rounded-full shadow-[0_0_12px_rgba(230,57,70,1)]"></span>
              </span>
              <span className="text-danger-400 text-xs font-black tracking-[0.25em] uppercase">
                {t("live_data")}
              </span>
            </div>

            {/* Stats Panel - Deep Glassmorphism */}
            <div className="bg-bg-tertiary/40 border-border-subtle/50 relative overflow-hidden rounded-3xl border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent mix-blend-overlay" />
              <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
                <LiveStatCard
                  value={totalIncidents}
                  label={t("stats_incidents")}
                  glowColor="rgba(230,57,70,0.2)"
                  accentClass="text-danger-400"
                  tooltip={incidentTooltip}
                />
                <LiveStatCard
                  value={totalProviders}
                  label={t("stats_providers")}
                  glowColor="rgba(168,85,247,0.2)"
                  accentClass="text-brand-400"
                />
                <LiveStatCard
                  value={totalCountries}
                  label={t("stats_countries")}
                  glowColor="rgba(39,174,96,0.2)"
                  accentClass="text-success-400"
                />
              </div>
            </div>

            {/* Leaderboard Panel - Deep Glassmorphism */}
            <div className="bg-bg-tertiary/40 border-border-subtle/50 relative overflow-hidden rounded-3xl border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent mix-blend-overlay" />
              <div className="relative z-10 mb-5 flex items-center justify-between">
                <h3 className="text-fg-primary flex items-center gap-2 text-sm font-black tracking-wider uppercase">
                  <span className="text-brand-400">📊</span> {t("leaderboard_title")}
                </h3>
                <Link
                  href="/leaderboard"
                  className="group text-brand-400 flex items-center gap-1 text-xs font-bold transition-colors hover:text-white"
                >
                  {t("view_all")}
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="relative z-10 space-y-3">
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
                  <p className="text-fg-muted py-6 text-center text-xs font-bold tracking-wider uppercase">
                    {t("no_providers_data", { defaultValue: "No tracking data available yet." })}
                  </p>
                )}
              </div>
              <div className="border-border-subtle/50 relative z-10 mt-5 border-t pt-4">
                <Link
                  href="/leaderboard"
                  className="text-fg-muted block text-center text-xs font-bold tracking-wider uppercase transition-colors hover:text-white"
                >
                  {t("view_full_leaderboard")}
                </Link>
              </div>
            </div>

            {/* Last report indicator */}
            <div className="flex items-center gap-2 px-2">
              <Radio className="text-fg-muted/70 h-3.5 w-3.5" />
              <span className="text-fg-muted/70 text-xs font-semibold tracking-wide uppercase">
                {t("last_report")}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Side-by-Side Highlight Cards */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-20 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2"
        >
          {/* Left: AI Act Compliance Card */}
          <div className="group bg-bg-tertiary/40 hover:bg-bg-tertiary/60 hover:border-brand-500/30 border-border-subtle/50 relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-3xl transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]">
            <div className="bg-brand-500/10 group-hover:bg-brand-500/20 absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-all duration-500" />

            <div className="relative z-10 flex items-start gap-5">
              <div className="bg-brand-500/10 border-brand-500/20 shrink-0 rounded-2xl border p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <Target className="text-brand-400 h-6 w-6" />
              </div>
              <div className="space-y-3">
                <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
                  {t("b2b_compliance", { defaultValue: "B2B Compliance" })}
                </div>
                <h4 className="text-xl font-black tracking-tight text-white">
                  {t("ai_act_compliance_title", { defaultValue: "EU AI Act Compliance Test" })}
                </h4>
                <p className="text-fg-secondary text-sm leading-relaxed font-medium">
                  {t("ai_act_compliance_desc", {
                    defaultValue:
                      "Are your AI systems ready for the European Union AI Act? Run a risk classification for your enterprise now.",
                  })}
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-8 pl-16">
              <Link
                href="/products/eu-ai-act"
                className="bg-brand-500 hover:bg-brand-400 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-95"
              >
                {t("start_test", { defaultValue: "Start Test" })} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: Bug Bounty Card */}
          <div className="group bg-bg-tertiary/40 hover:bg-bg-tertiary/60 hover:border-warning-500/30 border-border-subtle/50 relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-3xl transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]">
            <div className="bg-warning-500/10 group-hover:bg-warning-500/20 absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-all duration-500" />

            <div className="relative z-10 flex items-start gap-5">
              <div className="bg-warning-500/10 border-warning-500/20 shrink-0 rounded-2xl border p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <Trophy className="text-warning-400 h-6 w-6" />
              </div>
              <div className="flex-grow space-y-3">
                <div className="border-warning-500/30 bg-warning-500/10 text-warning-300 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
                  {t("bug_bounty_badge", { defaultValue: "Bug Bounty" })}
                </div>
                <h4 className="text-xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(249,115,22,0.3)]">
                  {t("title_accent")}
                </h4>
                <p className="text-fg-secondary text-sm leading-relaxed font-medium">
                  {t("title_accent_desc")}
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-8 pl-16">
              <Link
                href="/bounties"
                className="bg-warning-500 hover:bg-warning-400 focus-visible:ring-warning-500 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold text-neutral-950 shadow-[0_0_20px_rgba(249,115,22,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.5),inset_0_1px_0_rgba(255,255,255,0.7)] active:scale-95"
              >
                {t("bug_bounty_badge", { defaultValue: "Bug Bounty" })} {t("view_all") ?? "→"}
                <ArrowRight className="h-4 w-4" />
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
      duration: 2,
      ease: [0.21, 0.47, 0.32, 0.98], // Custom ease for premium feel
      onUpdate: (latest) => {
        setCount(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [numVal, isInView]);

  if (typeof value === "string") return <>{value}</>;
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "inline-block",
        numVal === 0 &&
          "from-fg-muted/30 to-fg-muted/30 animate-shimmer min-w-[2ch] bg-gradient-to-r via-white/50 bg-[length:200%_100%] bg-clip-text text-transparent",
      )}
    >
      {count.toLocaleString()}
    </motion.span>
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
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white/5 p-3 text-center shadow-inner ring-1 shadow-white/5 ring-white/10 transition-all duration-300 hover:bg-white/10 sm:p-4",
        tooltip && "cursor-help",
      )}
      title={tooltip}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <p
        className={`relative z-10 font-sans text-3xl font-black tracking-tight sm:text-4xl ${accentClass} drop-shadow-md transition-transform duration-300 group-hover:scale-105`}
      >
        <AnimatedValue value={value} />
      </p>
      <p className="text-fg-secondary relative z-10 mt-2 text-[11px] leading-snug font-bold tracking-wider text-balance uppercase sm:text-xs">
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
    "text-danger-400 drop-shadow-[0_0_8px_rgba(230,57,70,0.5)]",
    "text-warning-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    "text-brand-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]",
    "text-fg-secondary",
    "text-fg-muted",
  ];
  const barColors = [
    "bg-gradient-to-r from-danger-600 to-danger-400 shadow-[0_0_15px_rgba(230,57,70,0.5)]",
    "bg-gradient-to-r from-warning-600 to-warning-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
    "bg-gradient-to-r from-brand-600 to-brand-400 shadow-[0_0_15px_rgba(192,132,252,0.5)]",
    "bg-fg-secondary/60",
    "bg-fg-muted/40",
  ];

  return (
    <div className="group flex items-center gap-4 rounded-lg p-1 transition-colors hover:bg-white/5">
      <span
        className={`w-5 text-center font-sans text-xs font-black ${rankColors[rank - 1] ?? "text-fg-muted"}`}
      >
        #{rank}
      </span>
      <div className="flex-1">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-fg-primary text-[13px] font-bold tracking-tight">{name}</span>
          <span className="text-fg-muted font-sans text-xs font-semibold">
            {count.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.5, delay: rank * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={`h-full rounded-full ${barColors[rank - 1] ?? "bg-fg-muted/40"}`}
          />
        </div>
      </div>
    </div>
  );
}
