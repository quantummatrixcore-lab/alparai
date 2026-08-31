"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid,
  Shield,
  Zap,
  Lock,
  Scale,
  Users,
  CheckCircle2,
  Award,
  ArrowRight,
  Sparkles,
  Cpu,
  Mail,
  Share2,
  Check,
  Building2,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";

export interface SlideData {
  id: number;
  numberStr: string;
  category: string;
  title: string;
  subtitle: string;
  badge: string;
}

const TOTAL_SLIDES = 12;

const SLIDES_META: SlideData[] = [
  {
    id: 1,
    numberStr: "01",
    category: "Vision & Title",
    title: "ALPAR AI — Trust Infrastructure for AI Accountability",
    subtitle:
      "Cryptographic verification, real-time auditability, and regulatory compliance for enterprise AI deployments.",
    badge: "Sequoia / YC 12-Slide Seed Framework",
  },
  {
    id: 2,
    numberStr: "02",
    category: "The Problem",
    title: "Autonomous AI Deployment Outpaces Trust & Compliance",
    subtitle: "Enterprise adoption of autonomous AI is blocked by three existential threats.",
    badge: "$150B+ Market Crisis",
  },
  {
    id: 3,
    numberStr: "03",
    category: "The Solution",
    title: "Real-Time Accountability Infrastructure for the AI Era",
    subtitle:
      "Enterprise-grade trust engine sitting between user prompts, autonomous agents, and core backend infrastructure.",
    badge: "0.2ms Overhead",
  },
  {
    id: 4,
    numberStr: "04",
    category: "Why Now?",
    title: "The Regulatory Enforcement Window is Open",
    subtitle: "EU AI Act & Global Mandates legally enforce automated logging and human oversight.",
    badge: "€35M Non-Compliance Risk",
  },
  {
    id: 5,
    numberStr: "05",
    category: "Market Opportunity",
    title: "A $45B+ Infrastructure Opportunity at the Intersection of Security & AI",
    subtitle:
      "Targeting the rapidly emerging market for AI governance, compliance, and audit observability.",
    badge: "TAM $48.5B",
  },
  {
    id: 6,
    numberStr: "06",
    category: "Product Architecture",
    title: "Enterprise-Grade Architecture Built for Speed and Security",
    subtitle:
      "Engineered on Next.js 15, Supabase PostgreSQL RLS, and cryptographic verification modules.",
    badge: "Zero-Knowledge PII Protection",
  },
  {
    id: 7,
    numberStr: "07",
    category: "Business Model",
    title: "High-Margin Usage-Based SaaS + Enterprise Certification",
    subtitle: "Scalable revenue model aligning platform usage with enterprise risk exposure.",
    badge: "135% Projected NRR",
  },
  {
    id: 8,
    numberStr: "08",
    category: "Go-To-Market",
    title: "Developer-Led Adoption + Enterprise Top-Down Sales",
    subtitle:
      "Dual-engine GTM strategy driving rapid open-core adoption and high-ACV enterprise deals.",
    badge: "AGPL-3.0 Open Core",
  },
  {
    id: 9,
    numberStr: "09",
    category: "Competitive Landscape",
    title: "Unrivaled Cryptographic Proof & Open Infrastructure",
    subtitle: "Traditional telemetry ignores legal auditability. ALPAR AI bridges the gap.",
    badge: "Defensible Moat",
  },
  {
    id: 10,
    numberStr: "10",
    category: "Team & Advisory",
    title: "Founded by Systems Architects & Security Engineers",
    subtitle:
      "World-class engineering execution combined with deep expertise in compliance infrastructure.",
    badge: "Deep Tech Leadership",
  },
  {
    id: 11,
    numberStr: "11",
    category: "Financials & Economics",
    title: "Path to $10M ARR in 36 Months with 85%+ Gross Margins",
    subtitle:
      "Rapid revenue acceleration backed by PLG acquisition costs and high contract values.",
    badge: "87% Gross Margin",
  },
  {
    id: 12,
    numberStr: "12",
    category: "The Ask",
    title: "Raising $2.5M Seed Capital to Scale the AI Trust Layer",
    subtitle:
      "Capital allocation focused on engineering expansion, compliance certification, and global GTM.",
    badge: "Seed Round",
  },
];

export function PitchDeckViewer() {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGridView, setShowGridView] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const goToSlide = useCallback(
    (slideNum: number, dir?: number) => {
      if (slideNum < 1 || slideNum > TOTAL_SLIDES) return;
      setDirection(dir ?? (slideNum > currentSlide ? 1 : -1));
      setCurrentSlide(slideNum);
      setShowGridView(false);
    },
    [currentSlide],
  );

  const nextSlide = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES) {
      goToSlide(currentSlide + 1, 1);
    }
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1, -1);
    }
  }, [currentSlide, goToSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(() => {});
      }
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(1);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(TOTAL_SLIDES);
      } else if (e.key === "Escape") {
        setShowGridView(false);
      } else if (e.key === "g" || e.key === "G") {
        setShowGridView((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  return (
    <div className="selection:bg-brand-500 text-fg-primary relative flex h-screen w-screen flex-col overflow-hidden bg-[#0a0a0f] antialiased selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="bg-brand-600/10 pointer-events-none absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full blur-[150px]" />
      <div className="bg-brand-600/10 pointer-events-none absolute right-1/4 -bottom-40 h-[500px] w-[500px] rounded-full blur-[140px]" />

      {/* Top Header Navigation Bar */}
      <header className="border-border-subtle relative z-30 flex shrink-0 items-center justify-between border-b bg-[#0a0a0f]/80 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Wordmark size="md" />
          </Link>
          <span className="hidden h-4 w-px bg-white/20 sm:inline-block" />
          <span className="border-brand-500/30 bg-brand-500/10 text-brand-400 hidden rounded-full border px-3 py-1 text-xs font-semibold sm:inline-block">
            Investor Pitch Deck
          </span>
        </div>

        {/* Center Progress Counter & Quick Dots */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {SLIDES_META.map((s) => (
              <button
                key={s.id}
                onClick={() => goToSlide(s.id)}
                title={`Slide ${s.id}: ${s.category}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === s.id
                    ? "bg-brand-400 w-6 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to slide ${s.id}`}
              />
            ))}
          </div>
          <span className="text-fg-muted ml-2 font-mono text-xs font-bold">
            <span className="text-white">{SLIDES_META[currentSlide - 1]?.numberStr}</span> /{" "}
            {TOTAL_SLIDES}
          </span>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="text-fg-secondary border-border-subtle flex items-center gap-1.5 rounded-lg border bg-white/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10 hover:text-white"
            title="Copy Deck URL"
          >
            {copiedLink ? (
              <Check className="text-success-400 h-3.5 w-3.5" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Share"}</span>
          </button>

          <button
            onClick={() => setShowGridView((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              showGridView
                ? "border-brand-500 bg-brand-500/20 text-brand-300"
                : "text-fg-secondary border-border-subtle bg-white/5 hover:bg-white/10 hover:text-white"
            }`}
            title="Grid Overview (G)"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="text-fg-secondary border-border-subtle flex items-center gap-1.5 rounded-lg border bg-white/5 p-1.5 text-xs font-medium transition-colors hover:bg-white/10 hover:text-white"
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>

          <a
            href="mailto:ercument.erden@alparai.com?subject=ALPAR%20AI%20Seed%20Investment%20Inquiry"
            className="bg-brand-500 shadow-brand-500/25 hover:bg-brand-600 hidden items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 md:flex"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Contact Founder</span>
          </a>
        </div>
      </header>

      {/* Main Slide Stage */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="border-border-subtle relative flex h-full w-full max-w-6xl scrollbar-none flex-col justify-between overflow-y-auto rounded-3xl border bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-2xl backdrop-blur-2xl sm:p-10 lg:p-12"
          >
            {/* Top Slide Metadata Badge Header */}
            <div className="border-border-subtle flex shrink-0 items-center justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                <span className="bg-brand-500/20 text-brand-300 border-brand-500/30 flex h-7 items-center justify-center rounded-lg border px-3 font-mono text-xs font-bold">
                  SLIDE {SLIDES_META[currentSlide - 1]?.numberStr}
                </span>
                <span className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  {SLIDES_META[currentSlide - 1]?.category}
                </span>
              </div>
              <span className="text-fg-secondary rounded-full border border-border-subtle bg-white/5 px-3 py-1 text-xs font-medium">
                {SLIDES_META[currentSlide - 1]?.badge}
              </span>
            </div>

            {/* Slide Body Content Switcher */}
            <div className="my-auto py-6">
              {currentSlide === 1 && <Slide1 />}
              {currentSlide === 2 && <Slide2 />}
              {currentSlide === 3 && <Slide3 />}
              {currentSlide === 4 && <Slide4 />}
              {currentSlide === 5 && <Slide5 />}
              {currentSlide === 6 && <Slide6 />}
              {currentSlide === 7 && <Slide7 />}
              {currentSlide === 8 && <Slide8 />}
              {currentSlide === 9 && <Slide9 />}
              {currentSlide === 10 && <Slide10 />}
              {currentSlide === 11 && <Slide11 />}
              {currentSlide === 12 && <Slide12 />}
            </div>

            {/* Slide Footer Info */}
            <div className="text-fg-disabled border-border-subtle flex shrink-0 items-center justify-between border-t pt-6 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="text-brand-400 h-3.5 w-3.5" />
                <span className="text-fg-muted font-semibold">ALPAR AI</span>
                <span>• Confidential Investment Memorandum</span>
              </div>
              <div className="hidden items-center gap-4 sm:flex">
                <span>Use ← → Arrow Keys to Navigate</span>
                <span>•</span>
                <span>Press G for Grid View</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Control Bar */}
      <footer className="border-border-subtle relative z-30 flex shrink-0 items-center justify-between border-t bg-[#0a0a0f]/80 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="border-border-subtle flex items-center gap-2 rounded-xl border bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === TOTAL_SLIDES}
            className="bg-brand-500 shadow-brand-500/25 hover:bg-brand-600 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all disabled:pointer-events-none disabled:opacity-30"
          >
            <span>Next Slide</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mx-6 hidden max-w-xs flex-1 items-center gap-3 sm:flex">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="from-brand-500 to-brand-400 h-full bg-gradient-to-r transition-all duration-300"
              style={{ width: `${(currentSlide / TOTAL_SLIDES) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://alparai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-400 text-fg-muted flex items-center gap-1 text-xs transition-colors"
          >
            <span>alparai.com</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </footer>

      {/* Grid Modal View */}
      <AnimatePresence>
        {showGridView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0f]/95 p-6 backdrop-blur-2xl sm:p-10"
          >
            <div className="border-border-subtle flex items-center justify-between border-b pb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Slide Navigator</h2>
                <p className="text-fg-muted text-xs">Select any slide to jump directly</p>
              </div>
              <button
                onClick={() => setShowGridView(false)}
                className="text-fg-secondary border-border-subtle rounded-xl border bg-white/5 p-2 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {SLIDES_META.map((s) => (
                <button
                  key={s.id}
                  onClick={() => goToSlide(s.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all hover:scale-[1.02] ${
                    currentSlide === s.id
                      ? "border-brand-500 bg-brand-500/10 shadow-brand-500/20 shadow-lg"
                      : "border-border-subtle bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-brand-400 font-mono text-xs font-bold">
                      SLIDE {s.numberStr}
                    </span>
                    <span className="text-fg-muted text-[10px]">{s.category}</span>
                  </div>
                  <h3 className="group-hover:text-brand-300 line-clamp-2 text-sm font-bold text-white transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-fg-muted mt-2 line-clamp-2 text-xs">{s.subtitle}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Individual Slide Renderers */

function Slide1() {
  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
          <Sparkles className="text-brand-400 h-3.5 w-3.5 animate-pulse" />
          <span>The Immutable Trust Layer for Enterprise AI</span>
        </div>

        <h1 className="text-3xl leading-tight font-black tracking-tight text-white sm:text-5xl">
          Trust Infrastructure for{" "}
          <span className="from-brand-400 via-brand-300 to-brand-400 bg-gradient-to-r bg-clip-text text-transparent">
            AI Accountability
          </span>
        </h1>

        <p className="text-fg-secondary text-base leading-relaxed font-light sm:text-lg">
          Cryptographic verification, real-time auditability, and regulatory compliance for
          enterprise autonomous AI agent deployments.
        </p>

        <div className="border-border-subtle space-y-2 rounded-2xl border bg-white/5 p-4">
          <p className="text-brand-400 text-xs font-bold tracking-wider uppercase">Core Mission</p>
          <p className="text-fg-secondary text-sm leading-relaxed">
            As autonomous AI agents make high-stakes operational and financial decisions, ALPAR AI
            acts as the immutable safety & audit layer preventing unverified AI failures.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="text-fg-muted flex items-center gap-2 font-mono text-xs">
            <CheckCircle2 className="text-success-400 h-4 w-4" />
            <span>Tagline: &quot;Trust, Verified in Real-Time.&quot;</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center lg:col-span-5">
        <div className="border-brand-500/30 from-brand-950/40 relative w-full max-w-sm rounded-3xl border bg-gradient-to-b to-slate-950/60 p-6 shadow-2xl backdrop-blur-xl">
          <div className="border-success-500/40 text-success-400 absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-emerald-950/80 px-3 py-0.5 font-mono text-[10px] font-bold">
            <span className="bg-success-400 h-2 w-2 animate-ping rounded-full" />
            REAL-TIME CRYPTO SEAL VERIFIED
          </div>

          <div className="mt-4 space-y-4">
            <div className="border-border-subtle flex items-center justify-between border-b pb-3">
              <span className="text-fg-muted font-mono text-xs">Agent Execution Hash</span>
              <span className="text-brand-300 font-mono text-xs font-bold">0x7f8a...e9b2</span>
            </div>
            <div className="text-fg-secondary space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-fg-disabled">Latency Overhead:</span>
                <span className="text-success-400 font-bold">0.18ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-disabled">PII Masking:</span>
                <span className="text-success-400 font-bold">100% Zero Leak</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-disabled">Ledger Proof:</span>
                <span className="text-brand-300 font-bold">Append-Only SHA256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-disabled">EU AI Act Readiness:</span>
                <span className="text-brand-300 font-bold">Art. 12 & 14 Compliant</span>
              </div>
            </div>

            <div className="text-fg-muted border-border-subtle/50 rounded-xl border bg-black/40 p-3 font-mono text-[11px] leading-relaxed">
              &quot;proof&quot;:
              &quot;sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&quot;,
              <br />
              &quot;audit_status&quot;: &quot;PASS_IMMUTABLE&quot;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide2() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          Autonomous AI Deployment Outpaces Trust & Compliance Capabilities
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          Enterprise adoption of autonomous AI is severely blocked by three existential operational
          threats.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border-danger-500/20 space-y-3 rounded-2xl border bg-red-950/10 p-6">
          <div className="border-danger-500/30 bg-danger-500/20 text-danger-400 flex h-10 w-10 items-center justify-center rounded-xl border">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">1. Hallucination & Unbounded Actions</h3>
          <p className="text-fg-secondary text-xs leading-relaxed">
            AI agents make unverified financial, legal, and operational decisions without real-time
            boundary verification or runtime containment.
          </p>
        </div>

        <div className="border-warning-500/20 space-y-3 rounded-2xl border bg-amber-950/10 p-6">
          <div className="border-warning-500/30 bg-warning-500/20 text-warning-400 flex h-10 w-10 items-center justify-center rounded-xl border">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">2. PII & Sensitive Data Leaks</h3>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Unsanitized customer data entering model prompts creates massive GDPR, KVKK, and
            regulatory liability for enterprise deployers.
          </p>
        </div>

        <div className="border-brand-500/20 space-y-3 rounded-2xl border bg-purple-950/10 p-6">
          <div className="border-brand-500/30 bg-brand-500/20 text-brand-400 flex h-10 w-10 items-center justify-center rounded-xl border">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">3. Zero Legal Accountability</h3>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Black-box AI execution leaves organizations legally defenseless during post-incident
            court investigations and compliance audits.
          </p>
        </div>
      </div>

      <div className="border-border-subtle grid grid-cols-1 gap-4 rounded-2xl border bg-white/5 p-6 sm:grid-cols-2">
        <div className="flex items-center gap-4">
          <span className="text-brand-400 text-4xl font-black tracking-tight sm:text-5xl">
            $10M+
          </span>
          <div>
            <p className="text-xs font-bold tracking-wider text-white uppercase">
              Average Failure Cost
            </p>
            <p className="text-fg-muted text-xs">
              Estimated enterprise cost per major unmonitored AI compliance failure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-brand-400 text-4xl font-black tracking-tight sm:text-5xl">78%</span>
          <div>
            <p className="text-xs font-bold tracking-wider text-white uppercase">
              Auditability Barrier
            </p>
            <p className="text-fg-muted text-xs">
              Enterprises citing lack of auditability as their #1 barrier to deploying autonomous
              agents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide3() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          Real-Time Accountability Infrastructure for the AI Era
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          ALPAR AI provides an enterprise-grade trust engine sitting seamlessly between user
          prompts, autonomous agents, and core backend infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border-success-500/20 space-y-2 rounded-2xl border bg-emerald-950/10 p-5">
          <div className="text-success-400 flex items-center gap-2 text-sm font-bold">
            <Zap className="h-4 w-4" />
            <span>Real-Time PII Sanitization</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Automatic neural and regex PII masking before sensitive prompts ever reach external LLM
            endpoints.
          </p>
        </div>

        <div className="border-brand-500/20 bg-brand-950/10 space-y-2 rounded-2xl border p-5">
          <div className="text-brand-400 flex items-center gap-2 text-sm font-bold">
            <Lock className="h-4 w-4" />
            <span>Immutable Incident Ledger</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Cryptographically signed execution records stored in append-only PostgreSQL tables for
            post-incident legal defense.
          </p>
        </div>

        <div className="border-brand-500/20 space-y-2 rounded-2xl border bg-indigo-950/10 p-5">
          <div className="text-brand-400 flex items-center gap-2 text-sm font-bold">
            <Shield className="h-4 w-4" />
            <span>Automated Guardrails</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Instant runtime containment and cross-audit adjudication for non-compliant model outputs
            before execution.
          </p>
        </div>
      </div>

      {/* Architectural Flow Diagram */}
      <div className="border-border-subtle space-y-4 rounded-2xl border bg-black/40 p-6">
        <p className="text-fg-muted text-center text-xs font-bold tracking-wider uppercase">
          ALPAR AI Runtime Pipeline Architecture
        </p>
        <div className="grid grid-cols-2 gap-3 text-center font-mono text-xs sm:grid-cols-5">
          <div className="border-border-subtle flex flex-col justify-center rounded-xl border bg-white/5 p-3">
            <span className="text-fg-muted text-[10px]">Step 1</span>
            <span className="mt-1 font-bold text-white">User / Agent Prompt</span>
          </div>
          <div className="border-success-500/40 bg-success-500/10 flex flex-col justify-center rounded-xl border p-3">
            <span className="text-success-400 text-[10px]">Step 2 (0.18ms)</span>
            <span className="mt-1 font-bold text-white">PII Guardian</span>
          </div>
          <div className="border-brand-500/40 bg-brand-500/10 flex flex-col justify-center rounded-xl border p-3">
            <span className="text-brand-400 text-[10px]">Step 3</span>
            <span className="mt-1 font-bold text-white">LLM Execution</span>
          </div>
          <div className="border-brand-500/40 bg-brand-500/10 flex flex-col justify-center rounded-xl border p-3">
            <span className="text-brand-400 text-[10px]">Step 4</span>
            <span className="mt-1 font-bold text-white">Crypto Ledger</span>
          </div>
          <div className="border-brand-500/40 bg-brand-500/10 col-span-2 flex flex-col justify-center rounded-xl border p-3 sm:col-span-1">
            <span className="text-brand-400 text-[10px]">Step 5</span>
            <span className="mt-1 font-bold text-white">Output Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide4() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          The Regulatory Enforcement Window is Open (EU AI Act & Global Mandates)
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          The EU AI Act imposes strict, legally binding auditability requirements for High-Risk AI
          systems with severe non-compliance penalties.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="border-brand-500/30 bg-brand-950/20 space-y-3 rounded-2xl border p-6">
          <div className="text-brand-400 flex items-center gap-2 font-bold">
            <Scale className="h-5 w-5" />
            <span>EU AI Act Article 12 (Record-Keeping)</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Explicitly mandates continuous, automated event logging for high-risk AI systems to
            ensure traceability throughout their lifecycle.
          </p>
        </div>

        <div className="border-brand-500/30 space-y-3 rounded-2xl border bg-purple-950/20 p-6">
          <div className="text-brand-400 flex items-center gap-2 font-bold">
            <Users className="h-5 w-5" />
            <span>EU AI Act Article 14 (Human Oversight)</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Requires built-in real-time monitoring and intervention tools so human overseers can
            detect anomalies and override AI actions.
          </p>
        </div>
      </div>

      <div className="border-warning-500/30 flex flex-col items-center justify-between gap-6 rounded-2xl border bg-amber-950/10 p-6 sm:flex-row">
        <div className="space-y-1">
          <span className="text-warning-400 text-xs font-bold tracking-wider uppercase">
            Maximum Statutory Penalty
          </span>
          <p className="text-2xl font-black text-white sm:text-3xl">
            Up to €35,000,000 or 7% of Global Turnover
          </p>
          <p className="text-fg-muted text-xs">
            Compliance is no longer optional—it is a non-negotiable prerequisite for enterprise
            market entry.
          </p>
        </div>
        <div className="border-warning-500/40 bg-warning-500/20 shrink-0 rounded-xl border px-4 py-3 text-center">
          <span className="text-warning-300 block text-xl font-bold">2024–2026</span>
          <span className="text-warning-400 text-[10px] font-semibold uppercase">
            Enforcement Window
          </span>
        </div>
      </div>
    </div>
  );
}

function Slide5() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          A $45B+ Infrastructure Opportunity at the Intersection of Security & AI
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          ALPAR AI targets the rapidly emerging market for enterprise AI governance, compliance, and
          audit observability.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border-border-subtle relative space-y-3 overflow-hidden rounded-2xl border bg-white/5 p-6">
          <div className="bg-brand-500/10 absolute top-0 right-0 h-16 w-16 rounded-bl-3xl" />
          <span className="text-brand-400 text-xs font-bold tracking-wider uppercase">
            TAM (Total Addressable)
          </span>
          <p className="text-4xl font-black tracking-tight text-white">$48.5B</p>
          <p className="text-fg-muted text-xs leading-relaxed">
            Global Enterprise AI Governance, Security & Observability Market projected by 2028.
          </p>
        </div>

        <div className="border-brand-500/30 bg-brand-950/20 relative space-y-3 overflow-hidden rounded-2xl border p-6">
          <div className="bg-brand-500/20 absolute top-0 right-0 h-16 w-16 rounded-bl-3xl" />
          <span className="text-brand-300 text-xs font-bold tracking-wider uppercase">
            SAM (Serviceable Addressable)
          </span>
          <p className="text-brand-300 text-4xl font-black tracking-tight">$12.2B</p>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Autonomous AI Agent Guardrail & Compliance Infrastructure market segment.
          </p>
        </div>

        <div className="border-brand-500/40 relative space-y-3 overflow-hidden rounded-2xl border bg-purple-950/30 p-6">
          <div className="bg-brand-500/30 absolute top-0 right-0 h-16 w-16 rounded-bl-3xl" />
          <span className="text-brand-300 text-xs font-bold tracking-wider uppercase">
            SOM (Serviceable Obtainable)
          </span>
          <p className="text-brand-300 text-4xl font-black tracking-tight">$450M</p>
          <p className="text-fg-secondary text-xs leading-relaxed">
            High-risk European & Global enterprise early adopters targeted within 36 months.
          </p>
        </div>
      </div>

      <div className="text-fg-muted border-border-subtle rounded-2xl border bg-black/30 p-4 text-center text-xs">
        Source: Gartner AI Security & Risk Management Telemetry Forecast (2025–2028)
      </div>
    </div>
  );
}

function Slide6() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          Enterprise-Grade Architecture Built for Speed and Security
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          Engineered on Next.js 15, PostgreSQL/Supabase RLS, and cryptographic verification modules
          with sub-millisecond execution overhead.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border-border-subtle space-y-2 rounded-2xl border bg-white/5 p-5">
          <div className="text-brand-400 flex items-center gap-2 text-sm font-bold">
            <Cpu className="h-4 w-4" />
            <span>PII Guardian Pipeline</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Zero-leak regex + neural sanitization layer operating in under 0.2ms.
          </p>
        </div>

        <div className="border-border-subtle space-y-2 rounded-2xl border bg-white/5 p-5">
          <div className="text-brand-400 flex items-center gap-2 text-sm font-bold">
            <Lock className="h-4 w-4" />
            <span>Audit Ledger Engine</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Append-only cryptographic trace keeping complete immutable historical audit logs.
          </p>
        </div>

        <div className="border-border-subtle space-y-2 rounded-2xl border bg-white/5 p-5">
          <div className="text-success-400 flex items-center gap-2 text-sm font-bold">
            <Shield className="h-4 w-4" />
            <span>Server Action Isolation</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Type-safe Next.js mutations strictly enforced with Row Level Security (RLS).
          </p>
        </div>
      </div>

      <div className="border-brand-500/30 bg-brand-950/20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6 font-mono text-xs">
        <div className="text-success-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>100% Deterministic Verification</span>
        </div>
        <div className="text-brand-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Zero PII Leak Guarantee</span>
        </div>
        <div className="text-brand-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>TypeScript Strict (noUncheckedIndexedAccess)</span>
        </div>
      </div>
    </div>
  );
}

function Slide7() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          High-Margin Usage-Based SaaS + Enterprise Certification
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          Scalable revenue model aligning platform usage directly with enterprise risk exposure and
          compliance scale.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border-border-subtle flex flex-col justify-between space-y-4 rounded-2xl border bg-white/5 p-6">
          <div className="space-y-2">
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              1. Developer Tier (PLG)
            </span>
            <p className="text-2xl font-black text-white">Free</p>
            <p className="text-fg-secondary text-xs leading-relaxed">
              Free tier with monthly verification tokens for API key usage and open-source CLI
              integration.
            </p>
          </div>
          <div className="text-fg-muted font-mono text-[11px]">
            Target: Individual Devs & Startups
          </div>
        </div>

        <div className="border-brand-500/40 bg-brand-950/30 relative flex flex-col justify-between space-y-4 rounded-2xl border p-6">
          <div className="bg-brand-500 absolute -top-3 right-4 rounded-full px-3 py-0.5 text-[10px] font-bold text-white">
            POPULAR
          </div>
          <div className="space-y-2">
            <span className="text-brand-300 text-xs font-bold tracking-wider uppercase">
              2. Pro & Growth Tier
            </span>
            <p className="text-brand-300 text-2xl font-black">Pricing under revision</p>
            <p className="text-fg-primary text-xs leading-relaxed">
              Advanced rate limits, automated incident reporting, custom PII rules, and dedicated
              cross-audit logs.
            </p>
          </div>
          <div className="text-brand-400 font-mono text-[11px]">
            Target: Growth Scale AI Companies
          </div>
        </div>

        <div className="border-brand-500/40 flex flex-col justify-between space-y-4 rounded-2xl border bg-purple-950/30 p-6">
          <div className="space-y-2">
            <span className="text-brand-300 text-xs font-bold tracking-wider uppercase">
              3. Enterprise Tier
            </span>
            <p className="text-brand-300 text-2xl font-black">Pricing under revision</p>
            <p className="text-fg-primary text-xs leading-relaxed">
              Dedicated Supabase instances, custom compliance connectors (SOC2, EU AI Act), 99.99%
              SLA, and formal audit sign-off.
            </p>
          </div>
          <div className="text-brand-400 font-mono text-[11px]">
            Target: Tier-1 Enterprises & Banks
          </div>
        </div>
      </div>

      <div className="border-success-500/30 rounded-2xl border bg-emerald-950/20 p-4 text-center">
        <span className="text-success-400 text-sm font-bold">
          Projected Net Revenue Retention (NRR):{" "}
        </span>
        <span className="text-base font-black text-white">135%</span>
      </div>
    </div>
  );
}

function Slide8() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          Developer-Led Adoption + Enterprise Top-Down Sales
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          Dual-engine GTM strategy driving rapid developer ecosystem expansion and high-ACV
          enterprise deals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border-brand-500/30 bg-brand-950/20 space-y-4 rounded-2xl border p-6">
          <div className="text-brand-400 flex items-center gap-2 text-base font-bold">
            <CodeIcon className="h-5 w-5" />
            <span>Bottom-Up (Developer First)</span>
          </div>
          <ul className="text-fg-secondary list-inside list-disc space-y-2 text-xs leading-relaxed">
            <li>Open-source CLI (`opencode` / Antigravity integration)</li>
            <li>AGPL-3.0 open core repository generating organic GitHub traction</li>
            <li>Self-serve developer portal with instant API provisioning</li>
          </ul>
        </div>

        <div className="border-brand-500/30 space-y-4 rounded-2xl border bg-purple-950/20 p-6">
          <div className="text-brand-400 flex items-center gap-2 text-base font-bold">
            <Building2 className="h-5 w-5" />
            <span>Top-Down (Compliance & Legal)</span>
          </div>
          <ul className="text-fg-secondary list-inside list-disc space-y-2 text-xs leading-relaxed">
            <li>Direct outreach to CISOs, Chief Risk Officers, and AI Legal Advisors</li>
            <li>EU AI Act Article 73 readiness audits and executive briefings</li>
            <li>Custom enterprise pilots with guaranteed 45-day conversion target</li>
          </ul>
        </div>
      </div>

      <div className="border-border-subtle space-y-2 rounded-2xl border bg-black/40 p-6">
        <p className="text-fg-muted text-center text-xs font-bold tracking-wider uppercase">
          GTM Conversion Funnel
        </p>
        <div className="flex flex-col items-center justify-between gap-4 text-center font-mono text-xs sm:flex-row">
          <div className="border-border-subtle w-full rounded-xl border bg-white/5 p-3">
            1. Open Source Dev Downloads
          </div>
          <ArrowRight className="text-brand-400 hidden h-4 w-4 shrink-0 sm:block" />
          <div className="bg-brand-500/10 border-brand-500/30 text-brand-300 w-full rounded-xl border p-3">
            2. Free API Token Usage
          </div>
          <ArrowRight className="text-brand-400 hidden h-4 w-4 shrink-0 sm:block" />
          <div className="border-brand-500/40 bg-brand-500/20 text-brand-300 w-full rounded-xl border p-3 font-bold">
            3. Enterprise Pilot (45 Days)
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  );
}

function Slide9() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          Unrivaled Cryptographic Proof & Open Infrastructure
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          Existing observability solutions focus purely on LLM cost telemetry, omitting legal
          auditability and zero-knowledge PII sanitization.
        </p>
      </div>

      {/* 2x2 Matrix Visual */}
      <div className="border-border-subtle relative space-y-4 rounded-2xl border bg-black/40 p-6">
        <p className="text-fg-muted text-center text-xs font-bold tracking-wider uppercase">
          Competitive Positioning Matrix
        </p>
        <div className="bg-bg-tertiary/40 border-border-subtle relative grid h-64 grid-cols-1 gap-4 rounded-xl border p-4 sm:grid-cols-2">
          {/* Top Left */}
          <div className="text-fg-muted border-border-subtle/50 rounded-lg border bg-white/[0.02] p-3 text-xs">
            <span className="text-fg-secondary font-semibold">Traditional GRC (OneTrust)</span>
            <p className="mt-1 text-[10px]">
              High Legal Auditability / Low Real-Time AI API Integration
            </p>
          </div>
          {/* Top Right - ALPAR AI */}
          <div className="border-brand-500 bg-brand-500/20 shadow-brand-500/20 flex flex-col justify-between rounded-lg border-2 p-4 text-xs font-bold text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-brand-300 text-sm">ALPAR AI</span>
              <Sparkles className="text-brand-400 h-4 w-4 animate-pulse" />
            </div>
            <p className="text-fg-primary text-[11px] font-normal">
              High Legal Auditability + High Real-Time Enforcement & Cryptographic Proof
            </p>
          </div>
          {/* Bottom Left */}
          <div className="text-fg-disabled border-border-subtle/50 rounded-lg border bg-white/[0.02] p-3 text-xs">
            <span className="text-fg-muted font-semibold">Legacy Logging</span>
            <p className="mt-1 text-[10px]">Low Auditability / Low AI Real-Time Context</p>
          </div>
          {/* Bottom Right */}
          <div className="text-fg-muted border-border-subtle/50 rounded-lg border bg-white/[0.02] p-3 text-xs">
            <span className="text-fg-secondary font-semibold">
              LLM Telemetry (LangSmith, Datadog)
            </span>
            <p className="mt-1 text-[10px]">
              High Real-Time Context / Low Cryptographic Legal Auditability
            </p>
          </div>
        </div>
      </div>

      <div className="text-fg-secondary grid grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-3">
        <div className="border-border-subtle rounded-xl border bg-white/5 p-3 text-center">
          <span className="text-brand-300 font-bold">AGPL-3.0 Open Core</span>
        </div>
        <div className="border-border-subtle rounded-xl border bg-white/5 p-3 text-center">
          <span className="text-brand-300 font-bold">Cryptographic Ledger Integrity</span>
        </div>
        <div className="border-border-subtle rounded-xl border bg-white/5 p-3 text-center">
          <span className="text-success-400 font-bold">Zero-Knowledge PII Masking</span>
        </div>
      </div>
    </div>
  );
}

function Slide10() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          Founded by Systems Architects & Security Engineers
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          World-class engineering execution combined with deep expertise in compliance
          infrastructure and autonomous systems.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border-brand-500/30 bg-brand-950/20 space-y-4 rounded-2xl border p-6">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500/20 text-brand-400 border-brand-500/40 flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-bold">
              EE
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                <a
                  href="https://ercumenterden.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 hover:underline"
                >
                  Ercüment Erden
                </a>
              </h3>
              <p className="text-brand-400 text-xs font-semibold tracking-wider uppercase">
                Founder & Chief Architect
              </p>
            </div>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Senior Systems Architect & Security Specialist with deep expertise in high-throughput
            Next.js, Supabase PostgreSQL architectures, and real-time AI security boundaries.
          </p>
        </div>

        <div className="border-brand-500/30 space-y-4 rounded-2xl border bg-purple-950/20 p-6">
          <div className="text-brand-400 flex items-center gap-3 text-base font-bold">
            <Award className="h-5 w-5" />
            <span>Strategic Advisory Board</span>
          </div>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Strategic advisory council spanning EU AI Regulatory Affairs, AI Safety Research, and
            Enterprise Security CISOs guiding our regulatory alignment roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}

function Slide11() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          Path to $10M ARR in 36 Months with 85%+ Gross Margins
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          Rapid revenue acceleration backed by low customer acquisition costs (PLG) and high
          Enterprise Contract Values (ACV).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border-border-subtle space-y-2 rounded-2xl border bg-white/5 p-6">
          <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
            Year 1 Projection
          </span>
          <p className="text-3xl font-black text-white">$1.2M ARR</p>
          <p className="text-fg-muted text-xs">50 Enterprise Pilots onboarded</p>
        </div>

        <div className="border-brand-500/30 bg-brand-950/20 space-y-2 rounded-2xl border p-6">
          <span className="text-brand-300 text-xs font-bold tracking-wider uppercase">
            Year 2 Projection
          </span>
          <p className="text-brand-300 text-3xl font-black">$4.8M ARR</p>
          <p className="text-fg-secondary text-xs">200 Enterprise Customers</p>
        </div>

        <div className="border-brand-500/40 space-y-2 rounded-2xl border bg-purple-950/30 p-6">
          <span className="text-brand-300 text-xs font-bold tracking-wider uppercase">
            Year 3 Projection
          </span>
          <p className="text-brand-300 text-3xl font-black">$12.5M ARR</p>
          <p className="text-fg-secondary text-xs">500+ Active Enterprises</p>
        </div>
      </div>

      <div className="border-success-500/30 grid grid-cols-1 gap-4 rounded-2xl border bg-emerald-950/20 p-6 sm:grid-cols-2">
        <div className="flex items-center gap-4">
          <span className="text-success-400 text-4xl font-black">87%</span>
          <div>
            <p className="text-xs font-bold tracking-wider text-white uppercase">Gross Margin</p>
            <p className="text-fg-muted text-xs">Low infrastructure cost per verification check.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-success-400 text-4xl font-black">5.2x</span>
          <div>
            <p className="text-xs font-bold tracking-wider text-white uppercase">LTV : CAC Ratio</p>
            <p className="text-fg-muted text-xs">Strong PLG developer funnel efficiency.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide12() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          Raising $2.5M Seed Capital to Scale the AI Trust Layer
        </h2>
        <p className="text-fg-secondary text-sm sm:text-base">
          Capital allocation focused on core engineering expansion, enterprise compliance
          certification, and global GTM acceleration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border-brand-500/30 bg-brand-950/20 space-y-2 rounded-2xl border p-6">
          <span className="text-brand-300 text-2xl font-black">60%</span>
          <p className="text-xs font-bold tracking-wider text-white uppercase">
            Engineering & Product
          </p>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Core trust engine, zero-knowledge verification research, and sub-millisecond PII
            pipeline optimization.
          </p>
        </div>

        <div className="border-brand-500/30 space-y-2 rounded-2xl border bg-purple-950/20 p-6">
          <span className="text-brand-300 text-2xl font-black">25%</span>
          <p className="text-xs font-bold tracking-wider text-white uppercase">Go-To-Market</p>
          <p className="text-fg-secondary text-xs leading-relaxed">
            Enterprise sales team, developer advocacy, open-source community management, and EU AI
            Act roadshows.
          </p>
        </div>

        <div className="border-success-500/30 space-y-2 rounded-2xl border bg-emerald-950/20 p-6">
          <span className="text-success-400 text-2xl font-black">15%</span>
          <p className="text-xs font-bold tracking-wider text-white uppercase">Security & Audits</p>
          <p className="text-fg-secondary text-xs leading-relaxed">
            SOC2 Type II, ISO 27001, and independent third-party EU AI Act compliance
            certifications.
          </p>
        </div>
      </div>

      <div className="border-border-subtle space-y-3 rounded-2xl border bg-black/40 p-6 text-center">
        <p className="text-fg-muted text-xs font-bold tracking-wider uppercase">
          Target 18-Month Milestones
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-white">
          <span className="text-brand-400">$3M ARR</span>
          <span>•</span>
          <span className="text-brand-300">1,000 Active Clusters</span>
          <span>•</span>
          <span className="text-success-400">SOC2 & ISO Certified</span>
        </div>
        <div className="pt-2">
          <a
            href="mailto:ercument.erden@alparai.com?subject=ALPAR%20AI%20Seed%20Investment%20Inquiry"
            className="bg-brand-500 shadow-brand-500/30 hover:bg-brand-600 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition-all hover:scale-105"
          >
            <Mail className="h-4 w-4" />
            <span>Connect with Founder: ercument.erden@alparai.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
