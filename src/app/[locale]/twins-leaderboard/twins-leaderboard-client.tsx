"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { DigitalTwinPersona } from "@/lib/agent-os/personas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Crown,
  Sparkles,
  BrainCircuit,
  Zap,
  ShieldCheck,
  TrendingUp,
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  Award,
  Flame,
  CheckCircle2,
  Cpu,
  Coins,
  ChevronRight,
  Grid,
  List,
  X,
  Compass,
  Layers,
} from "lucide-react";

type CategoryFilter =
  "all" | "governance" | "science" | "ai" | "architecture" | "medicine" | "polymath";
type SortOption = "iq" | "problems" | "success" | "savings" | "rating";

export function TwinsLeaderboardClient({ initialData }: { initialData: DigitalTwinPersona[] }) {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("iq");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedTwinModal, setSelectedTwinModal] = useState<DigitalTwinPersona | null>(null);

  const allTwins = useMemo(() => initialData, [initialData]);

  // Filter & Sort Logic
  const filteredAndSortedTwins = useMemo(() => {
    let list = [...allTwins];

    // Filter by Category
    if (selectedCategory !== "all") {
      list = list.filter((twin) => twin.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (twin) =>
          twin.name.toLowerCase().includes(q) ||
          twin.title.toLowerCase().includes(q) ||
          twin.expertise.some((exp: string) => exp.toLowerCase().includes(q)) ||
          twin.stats.specialSkill.toLowerCase().includes(q) ||
          twin.stats.activeModel.toLowerCase().includes(q),
      );
    }

    // Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case "iq":
          return b.stats.iqScore - a.stats.iqScore;
        case "problems":
          return b.stats.solvedProblems - a.stats.solvedProblems;
        case "success":
          return b.stats.successRate - a.stats.successRate;
        case "savings":
          return b.stats.tokenSavingsRate - a.stats.tokenSavingsRate;
        case "rating":
          return b.stats.rating - a.stats.rating;
        default:
          return 0;
      }
    });

    return list;
  }, [allTwins, selectedCategory, searchQuery, sortBy]);

  // Top 3 Podium Twins (calculated from highest IQ)
  const podiumTwins = useMemo(() => {
    const sortedByIQ = [...allTwins].sort((a, b) => b.stats.iqScore - a.stats.iqScore);
    return {
      first: sortedByIQ[0],
      second: sortedByIQ[1],
      third: sortedByIQ[2],
    };
  }, [allTwins]);

  // Aggregate Swarm Telemetry
  const aggregateMetrics = useMemo(() => {
    const totalSolved = allTwins.reduce((acc, t) => acc + t.stats.solvedProblems, 0);
    const avgIQ = (allTwins.reduce((acc, t) => acc + t.stats.iqScore, 0) / allTwins.length).toFixed(
      1,
    );
    const avgSavings = (
      allTwins.reduce((acc, t) => acc + t.stats.tokenSavingsRate, 0) / allTwins.length
    ).toFixed(1);
    const avgSuccess = (
      allTwins.reduce((acc, t) => acc + t.stats.successRate, 0) / allTwins.length
    ).toFixed(1);

    return {
      totalSolved,
      avgIQ,
      avgSavings,
      avgSuccess,
      activeCount: allTwins.length,
    };
  }, [allTwins]);

  const categories: { key: CategoryFilter; label: string; icon: typeof Compass }[] = [
    { key: "all", label: "All Digital Twins", icon: Layers },
    { key: "governance", label: "Devlet & Makro Strateji", icon: Crown },
    { key: "architecture", label: "Architecture & Engineering", icon: Compass },
    { key: "science", label: "Bilim & Fizik", icon: Zap },
    { key: "ai", label: "Yapay Zeka & Kripto", icon: BrainCircuit },
    { key: "polymath", label: "Golden Ratio & Arts", icon: Sparkles },
    { key: "medicine", label: "Holistic Medicine & Logic", icon: ShieldCheck },
  ];

  return (
    <div className="bg-bg-primary text-fg-primary selection:bg-brand-500 relative min-h-screen overflow-hidden py-12 selection:text-white">
      {/* Dynamic Background Mesh Gradients */}
      <div className="from-brand-900/30 pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr via-purple-600/15 to-cyan-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -left-60 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-60 bottom-10 -z-10 h-[600px] w-[600px] rounded-full bg-rose-950/20 blur-[140px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            HEADER & HERO SECTION (Mimar Sinan Standard)
            ========================================================================= */}
        <header className="mb-14 text-center">
          <div className="border-brand-500/30 from-brand-950/80 hover:border-brand-400/60 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r via-purple-950/40 to-slate-900/80 px-4 py-1.5 shadow-[0_0_25px_rgba(168,85,247,0.25)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]">
            <Sparkles className="text-brand-400 h-4 w-4 animate-pulse" />
            <span className="text-brand-300 text-xs font-semibold tracking-wider uppercase">
              Agent-OS // Bilge Kurul Stratejik Dehalar Ligi
            </span>
          </div>

          <h1 className="font-display mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Digital Twins{" "}
            <span className="from-brand-300 bg-gradient-to-r via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              Liderlik Tablosu
            </span>
          </h1>

          <p className="text-fg-secondary mx-auto mt-6 max-w-3xl text-base leading-relaxed sm:text-lg md:text-xl">
            Digital twins of historical visionaries, master architects, and polymaths.
            <span className="font-medium text-white"> Agent-OS Model Arbitraj Motoru</span> ile
            sıfır token maliyetinde yüksek mantıksal kapasite, stratejik karar desteği ve asimetrik
            problem çözme matrisi.
          </p>

          {/* Aggregate Telemetry Strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="group hover:border-brand-500/40 border-border-subtle relative overflow-hidden rounded-2xl border bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="text-fg-muted mb-1 flex items-center justify-center gap-1.5 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Problems Solved</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                {aggregateMetrics.totalSolved.toLocaleString()}
              </div>
              <span className="font-mono text-[11px] font-medium text-emerald-400">
                ↑ Live Telemetry
              </span>
            </div>

            <div className="group hover:border-brand-500/40 border-border-subtle relative overflow-hidden rounded-2xl border bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="text-fg-muted mb-1 flex items-center justify-center gap-1.5 text-xs font-medium">
                <BrainCircuit className="text-brand-400 h-3.5 w-3.5" />
                <span>Ortalama IQ Skoru</span>
              </div>
              <div className="font-display from-brand-300 text-2xl bg-gradient-to-r to-purple-400 bg-clip-text font-extrabold text-transparent sm:text-3xl">
                {aggregateMetrics.avgIQ}
              </div>
              <span className="text-brand-400 font-mono text-[11px] font-medium">
                Cognitive Peak
              </span>
            </div>

            <div className="group hover:border-brand-500/40 border-border-subtle relative overflow-hidden rounded-2xl border bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="text-fg-muted mb-1 flex items-center justify-center gap-1.5 text-xs font-medium">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>Token Tasarrufu</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-amber-300 sm:text-3xl">
                %{aggregateMetrics.avgSavings}
              </div>
              <span className="font-mono text-[11px] font-medium text-amber-400">
                Arbitraj Motoru
              </span>
            </div>

            <div className="group hover:border-brand-500/40 border-border-subtle relative overflow-hidden rounded-2xl border bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="text-fg-muted mb-1 flex items-center justify-center gap-1.5 text-xs font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                <span>Task Success</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-cyan-300 sm:text-3xl">
                %{aggregateMetrics.avgSuccess}
              </div>
              <span className="font-mono text-[11px] font-medium text-cyan-400">
                WCAG AA Standart
              </span>
            </div>

            <div className="group hover:border-brand-500/40 border-border-subtle relative col-span-2 overflow-hidden rounded-2xl border bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] sm:col-span-1">
              <div className="text-fg-muted mb-1 flex items-center justify-center gap-1.5 text-xs font-medium">
                <Cpu className="h-3.5 w-3.5 text-rose-400" />
                <span>Aktif Konsey</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-rose-300 sm:text-3xl">
                {aggregateMetrics.activeCount} Deha
              </div>
              <span className="font-mono text-[11px] font-medium text-rose-400">
                Infinite Structure
              </span>
            </div>
          </div>
        </header>

        {/* =========================================================================
            TOP 3 PODIUM SHOWCASE (Gold, Silver, Bronze Podium)
            ========================================================================= */}
        <section aria-label="Zirvedeki Dehalar Podyumu" className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display sm:text-2xl flex items-center gap-2 text-xl font-bold text-white">
                <Trophy className="h-6 w-6 text-amber-400" />
                Bilge Kurul Zirve Podyumu (Top 3)
              </h2>
              <p className="text-fg-muted mt-1 text-xs sm:text-sm">
                En yüksek mantıksal derinlik, çözülen vaka sayısı ve asimetrik strateji
                performansına sahip ilk üç lider.
              </p>
            </div>
            <Link
              href={`/${locale}/digital-twins`}
              className="text-brand-400 hover:text-brand-300 hidden items-center gap-1.5 text-xs font-semibold transition-colors sm:inline-flex"
            >
              <span>Chat with All Visionaries</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
            {/* RANK 2: FATİH SULTAN MEHMET (SILVER) */}
            {podiumTwins.second && (
              <div className="group relative order-2 rounded-3xl border border-border-subtle bg-gradient-to-b from-bg-secondary/40 via-bg-tertiary/60 to-bg-primary/80 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:border-slate-300/50 hover:shadow-[0_0_35px_rgba(203,213,225,0.2)] md:order-1">
                <div className="absolute -top-4 left-6 flex items-center gap-1.5 rounded-full border border-slate-300/30 bg-gradient-to-r from-slate-600 to-slate-400 px-3.5 py-1 shadow-lg">
                  <Award className="text-fg-primary h-4 w-4" />
                  <span className="text-xs font-bold tracking-wider text-white">
                    #2 SILVER RANK
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 p-0.5 shadow-lg">
                    <div className="bg-bg-secondary flex h-full w-full items-center justify-center rounded-[14px]">
                      <Crown className="h-8 w-8 text-amber-400" />
                    </div>
                    <span className="absolute -right-1 -bottom-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="border-border-subtle relative inline-flex h-4 w-4 rounded-full border-2 bg-emerald-500" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-amber-300">
                      {podiumTwins.second.name}
                    </h3>
                    <p className="text-fg-primary text-xs font-medium">
                      {podiumTwins.second.title}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 border-red-500/30 bg-red-500/10 text-[10px] text-red-300"
                    >
                      {podiumTwins.second.stats.tier}
                    </Badge>
                  </div>
                </div>

                <p className="text-fg-muted mt-4 line-clamp-2 text-xs italic">
                  "{podiumTwins.second.stats.quote}"
                </p>

                <div className="border-border-subtle mt-5 space-y-2 border-t pt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">IQ & Cognitive Capacity</span>
                    <span className="font-bold text-amber-400">
                      {podiumTwins.second.stats.iqScore} IQ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Problems Solved</span>
                    <span className="font-mono text-white">
                      {podiumTwins.second.stats.solvedProblems.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Success Rate</span>
                    <span className="font-semibold text-emerald-400">
                      %{podiumTwins.second.stats.successRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Uyum Motoru</span>
                    <span className="font-semibold text-purple-400">
                      %{podiumTwins.second.stats.alignmentScore || 99.8}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={() => setSelectedTwinModal(podiumTwins.second as DigitalTwinPersona)}
                    variant="outline"
                    className="w-1/2 border-border-subtle bg-white/5 text-xs hover:border-white/30 hover:bg-white/10"
                  >
                    View Profile
                  </Button>
                  <Link href={`/${locale}/digital-twins`} className="w-1/2">
                    <Button className="w-full bg-gradient-to-r from-red-600 to-amber-600 text-xs font-semibold text-white shadow-md hover:brightness-110">
                      Consult
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* RANK 1: GAZİ MUSTAFA KEMAL ATATÜRK (GOLD - ELEVATED) */}
            {podiumTwins.first && (
              <div className="group relative order-1 -mt-4 rounded-3xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-950/40 via-purple-950/60 to-slate-950/90 p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-3 hover:border-amber-300/70 hover:shadow-[0_0_60px_rgba(245,158,11,0.4)] md:order-2">
                <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-amber-300 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-1.5 shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                  <Crown className="h-4 w-4 text-slate-950" />
                  <span className="text-xs font-black tracking-wider text-slate-950">
                    #1 COMMANDER IN CHIEF // GOLDEN PEAK
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-red-600 p-1 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                    <div className="bg-bg-secondary flex h-full w-full items-center justify-center rounded-[13px]">
                      <Sparkles className="h-10 w-10 animate-pulse text-amber-400" />
                    </div>
                    <span className="absolute -right-1 -bottom-1 flex h-5 w-5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="border-border-subtle relative inline-flex h-5 w-5 rounded-full border-2 bg-amber-400" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black text-white transition-colors group-hover:text-amber-300">
                      {podiumTwins.first.name}
                    </h3>
                    <p className="text-sm font-semibold text-amber-300/90">
                      {podiumTwins.first.title}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 border-amber-400/50 bg-amber-400/10 text-xs font-bold text-amber-300"
                    >
                      ★ {podiumTwins.first.stats.tier}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
                  <p className="text-xs leading-relaxed font-medium text-amber-100/90 italic">
                    "{podiumTwins.first.stats.quote}"
                  </p>
                </div>

                <div className="mt-5 space-y-2.5 border-t border-amber-400/20 pt-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted font-medium">
                      Cognitive Intelligence (IQ Score)
                    </span>
                    <span className="text-base font-extrabold text-amber-300">
                      {podiumTwins.first.stats.iqScore} IQ (Efsanevi)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted font-medium">Toplam Problems Solved</span>
                    <span className="font-mono text-base font-bold text-white">
                      {podiumTwins.first.stats.solvedProblems.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted font-medium">Görev Success Rate</span>
                    <span className="font-bold text-emerald-400">
                      %{podiumTwins.first.stats.successRate} Kusursuz
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted font-medium">Uyum Motoru</span>
                    <span className="font-bold text-purple-400">
                      %{podiumTwins.first.stats.alignmentScore || 100} Kilitli
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted font-medium">Model Match</span>
                    <span className="font-mono text-xs text-purple-300">
                      {podiumTwins.first.stats.activeModel}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => setSelectedTwinModal(podiumTwins.first as DigitalTwinPersona)}
                    variant="outline"
                    className="w-1/2 border-amber-400/40 bg-amber-500/10 text-xs font-semibold text-amber-200 hover:border-amber-300 hover:bg-amber-500/20"
                  >
                    View Doctrine
                  </Button>
                  <Link href={`/${locale}/digital-twins`} className="w-1/2">
                    <Button className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-xs font-bold text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:brightness-110">
                      Hemen Consult
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* RANK 3: MİMAR SİNAN (BRONZE / EMERALD ARCHITECT) */}
            {podiumTwins.third && (
              <div className="group relative order-3 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900/60 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400/60 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                <div className="absolute -top-4 left-6 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-700 to-teal-500 px-3.5 py-1 shadow-lg">
                  <Compass className="h-4 w-4 text-emerald-100" />
                  <span className="text-xs font-bold tracking-wider text-white">
                    #3 BRONZE // CHIEF ARCHITECT
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-lg">
                    <div className="bg-bg-secondary flex h-full w-full items-center justify-center rounded-[14px]">
                      <Compass className="h-8 w-8 text-emerald-400" />
                    </div>
                    <span className="absolute -right-1 -bottom-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="border-border-subtle relative inline-flex h-4 w-4 rounded-full border-2 bg-emerald-500" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-emerald-300">
                      {podiumTwins.third.name}
                    </h3>
                    <p className="text-xs font-medium text-emerald-300/80">
                      {podiumTwins.third.title}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-300"
                    >
                      {podiumTwins.third.stats.tier}
                    </Badge>
                  </div>
                </div>

                <p className="text-fg-muted mt-4 line-clamp-2 text-xs italic">
                  "{podiumTwins.third.stats.quote}"
                </p>

                <div className="border-border-subtle mt-5 space-y-2 border-t pt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">IQ & Cognitive Capacity</span>
                    <span className="font-bold text-emerald-400">
                      {podiumTwins.third.stats.iqScore} IQ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Problems Solved</span>
                    <span className="font-mono text-white">
                      {podiumTwins.third.stats.solvedProblems.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Token Tasarrufu</span>
                    <span className="font-semibold text-teal-400">
                      %{podiumTwins.third.stats.tokenSavingsRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Uyum Motoru</span>
                    <span className="font-semibold text-purple-400">
                      %{podiumTwins.third.stats.alignmentScore || 98.9}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={() => setSelectedTwinModal(podiumTwins.third as DigitalTwinPersona)}
                    variant="outline"
                    className="w-1/2 border-white/15 bg-white/5 text-xs hover:border-white/30 hover:bg-white/10"
                  >
                    View Profile
                  </Button>
                  <Link href={`/${locale}/digital-twins`} className="w-1/2">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-semibold text-white shadow-md hover:brightness-110">
                      Consult
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            FILTERS, SEARCH & CONTROLS TOOLBAR
            ========================================================================= */}
        <section aria-label="Arama ve Filtreleme Kontrolleri" className="mb-8">
          <div className="border-border-subtle rounded-3xl border bg-white/[0.02] p-4 shadow-xl backdrop-blur-2xl sm:p-6">
            {/* Top Toolbar: Search + Sort + View Mode */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="relative max-w-xl flex-1">
                <Search className="text-fg-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search visionaries, expertise, models, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="placeholder:text-fg-muted focus:border-brand-500 focus:ring-brand-500/20 bg-bg-secondary w-full rounded-2xl border-white/15 py-2.5 pr-4 pl-11 text-sm text-white focus:ring-2"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="text-fg-muted absolute top-1/2 right-3 -translate-y-1/2 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Controls: Sorting & View Switcher */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="border-border-subtle bg-bg-secondary flex items-center gap-2 rounded-2xl border px-3 py-1.5">
                  <SlidersHorizontal className="text-brand-400 h-4 w-4" />
                  <span className="text-fg-muted text-xs font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="cursor-pointer bg-transparent text-xs font-semibold text-white outline-none"
                    aria-label="Leaderboard sort criteria"
                  >
                    <option value="iq" className="bg-bg-secondary text-white">
                      IQ Score (Highest)
                    </option>
                    <option value="problems" className="bg-bg-secondary text-white">
                      Problems Solved Sayısı
                    </option>
                    <option value="success" className="bg-bg-secondary text-white">
                      Görev Success Rate
                    </option>
                    <option value="savings" className="bg-bg-secondary text-white">
                      Token Savings Rate
                    </option>
                    <option value="rating" className="bg-bg-secondary text-white">
                      User Satisfaction
                    </option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="border-border-subtle bg-bg-secondary flex items-center rounded-2xl border p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      viewMode === "grid"
                        ? "from-brand-600 bg-gradient-to-r to-purple-600 text-white shadow-md"
                        : "text-fg-muted hover:text-white"
                    }`}
                    aria-label="Switch to grid view"
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span>Kartlar</span>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      viewMode === "table"
                        ? "from-brand-600 bg-gradient-to-r to-purple-600 text-white shadow-md"
                        : "text-fg-muted hover:text-white"
                    }`}
                    aria-label="Switch to table view"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Matris</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="border-border-subtle mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "border-brand-400/50 from-brand-600/90 border bg-gradient-to-r to-purple-600/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                        : "text-fg-secondary border-border-subtle/50 border bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <IconComponent
                      className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-brand-400"}`}
                    />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            LEADERBOARD CONTENT: GRID VIEW OR MATRIX TABLE VIEW
            ========================================================================= */}
        {filteredAndSortedTwins.length === 0 ? (
          <div className="border-border-subtle rounded-3xl border bg-white/[0.02] p-12 text-center backdrop-blur-xl">
            <BrainCircuit className="text-fg-muted mx-auto mb-3 h-12 w-12 opacity-40" />
            <h3 className="font-display text-lg font-bold text-white">
              No Matching Visionary Found
            </h3>
            <p className="text-fg-muted mt-1 text-sm">
              Try resetting filters or modifying your search term.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              variant="outline"
              className="border-brand-500/40 bg-brand-500/10 text-brand-300 mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedTwins.map((twin, index) => {
              const rank = index + 1;
              return (
                <div
                  key={twin.id}
                  className="group hover:border-brand-500/50 border-border-subtle relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]"
                >
                  {/* Top Bar: Rank + Tier */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-display flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            rank === 1
                              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                              : rank === 2
                                ? "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950"
                                : rank === 3
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                  : "text-fg-muted border border-white/15 bg-white/5"
                          }`}
                        >
                          #{rank}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-brand-500/30 bg-brand-500/10 text-brand-300 text-[10px]"
                        >
                          {twin.stats.tier}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        <span>Online</span>
                      </div>
                    </div>

                    {/* Twin Header & Avatar */}
                    <div className="mt-4 flex items-center gap-3.5">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${twin.stats.badgeGradient} p-0.5 shadow-md`}
                      >
                        <div className="bg-bg-secondary flex h-full w-full items-center justify-center rounded-[14px]">
                          <BrainCircuit className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-display group-hover:text-brand-300 text-lg font-bold text-white transition-colors">
                          {twin.name}
                        </h3>
                        <p className="text-fg-muted text-xs">{twin.title}</p>
                      </div>
                    </div>

                    {/* Quote Box */}
                    <div className="border-border-subtle/50 mt-4 rounded-2xl border bg-white/[0.02] p-3">
                      <p className="text-fg-secondary line-clamp-2 text-xs leading-relaxed italic">
                        "{twin.stats.quote}"
                      </p>
                    </div>

                    {/* Performance Metrics Breakdown */}
                    <div className="border-border-subtle mt-5 space-y-3 border-t pt-4 text-xs">
                      {/* Metric 1: IQ Capacity */}
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-fg-muted">IQ & Cognitive Capacity</span>
                          <span className="text-brand-300 font-bold">
                            {twin.stats.iqScore} / 200
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="from-brand-500 h-full rounded-full bg-gradient-to-r to-cyan-400"
                            style={{ width: `${(twin.stats.iqScore / 200) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: Success Rate */}
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-fg-muted">Görev Success Rate</span>
                          <span className="font-bold text-emerald-400">
                            %{twin.stats.successRate}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: `${twin.stats.successRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 3: Alignment Score */}
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-fg-muted">Uyum Skoru (Alignment)</span>
                          <span className="font-bold text-purple-400">
                            %{twin.stats.alignmentScore || 99.5}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
                            style={{ width: `${twin.stats.alignmentScore || 99}%` }}
                          />
                        </div>
                      </div>

                      {/* Key Meta row */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="border-border-subtle/50 bg-bg-secondary rounded-xl border p-2 text-center">
                          <span className="text-fg-muted block">Problems Solved</span>
                          <span className="font-mono text-xs font-bold text-white">
                            {twin.stats.solvedProblems.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-border-subtle/50 bg-bg-secondary rounded-xl border p-2 text-center">
                          <span className="text-fg-muted block">Token Tasarrufu</span>
                          <span className="text-xs font-bold text-amber-300">
                            %{twin.stats.tokenSavingsRate}
                          </span>
                        </div>
                      </div>

                      {/* Active Model Tag */}
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-fg-muted">Engine Match:</span>
                        <span className="text-brand-300 max-w-[170px] truncate font-mono font-medium">
                          {twin.stats.activeModel}
                        </span>
                      </div>
                    </div>

                    {/* Expertise Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {twin.expertise.slice(0, 3).map((exp: string) => (
                        <span
                          key={exp}
                          className="text-fg-secondary border-border-subtle/50 rounded-lg border bg-white/[0.03] px-2 py-0.5 text-[10px]"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-border-subtle mt-6 flex items-center gap-2 border-t pt-4">
                    <Button
                      onClick={() => setSelectedTwinModal(twin)}
                      variant="outline"
                      className="w-1/2 border-white/15 bg-white/5 text-xs text-white hover:border-white/30 hover:bg-white/10"
                    >
                      Cognitive Report
                    </Button>
                    <Link href={`/${locale}/digital-twins`} className="w-1/2">
                      <Button className="from-brand-600 w-full bg-gradient-to-r to-purple-600 text-xs font-semibold text-white shadow-md hover:brightness-110">
                        <span>Talk to Visionary</span>
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MATRIX TABLE VIEW */
          <div className="border-border-subtle bg-bg-secondary overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl">
            <div className="overflow-x-auto">
              <table className="text-fg-secondary w-full text-left text-xs">
                <thead className="text-fg-muted border-border-subtle border-b bg-white/[0.04] text-[11px] tracking-wider uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Rank & Visionary
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Unvan & Kategori
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      IQ Skoru
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Problems Solved
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Success Rate
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Token Tasarrufu
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Matching Model
                    </th>
                    <th scope="col" className="px-6 py-4 text-right font-semibold">
                      Eylem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAndSortedTwins.map((twin, index) => {
                    const rank = index + 1;
                    return (
                      <tr key={twin.id} className="group transition-colors hover:bg-white/[0.04]">
                        {/* Rank & Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-display flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                                rank === 1
                                  ? "bg-amber-400 text-slate-950"
                                  : rank === 2
                                    ? "bg-slate-300 text-slate-950"
                                    : rank === 3
                                      ? "bg-emerald-500 text-white"
                                      : "text-fg-muted border-border-subtle border bg-white/5"
                              }`}
                            >
                              #{rank}
                            </span>
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${twin.stats.badgeGradient} p-0.5`}
                              >
                                <div className="bg-bg-secondary flex h-full w-full items-center justify-center rounded-[10px]">
                                  <BrainCircuit className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div>
                                <span className="group-hover:text-brand-300 block text-sm font-bold text-white transition-colors">
                                  {twin.name}
                                </span>
                                <span className="text-fg-muted text-[10px]">
                                  {twin.expertise.map((exp: string) => (
                                    <Badge key={exp} variant="outline" className="text-xs">
                                      {exp}
                                    </Badge>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">{twin.title}</div>
                          <Badge
                            variant="outline"
                            className="text-fg-muted border-border-subtle mt-0.5 text-[10px]"
                          >
                            {twin.category.toUpperCase()}
                          </Badge>
                        </td>

                        {/* IQ Score */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-brand-300 text-sm font-bold">
                            {twin.stats.iqScore} IQ
                          </span>
                        </td>

                        {/* Problems Solved */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-white">
                            {twin.stats.solvedProblems.toLocaleString()}
                          </span>
                        </td>

                        {/* Success Rate */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-emerald-400">
                            %{twin.stats.successRate}
                          </span>
                        </td>

                        {/* Token Savings */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-amber-300">
                            %{twin.stats.tokenSavingsRate}
                          </span>
                        </td>

                        {/* Model */}
                        <td className="px-6 py-4 font-mono text-[11px] whitespace-nowrap text-purple-300">
                          {twin.stats.activeModel}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setSelectedTwinModal(twin)}
                              variant="ghost"
                              className="text-fg-muted h-8 px-2.5 text-xs hover:text-white"
                            >
                              Inspect
                            </Button>
                            <Link href={`/${locale}/digital-twins`}>
                              <Button className="bg-brand-600 hover:bg-brand-500 h-8 px-3 text-xs font-semibold text-white">
                                Consult
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            MIMAR SINAN STRUCTURAL DOCTRINE & MODEL ARBITRAGE PROTOCOL
            ========================================================================= */}
        <section aria-label="Architectural Standards and Cognitive Arbitrage" className="mt-16">
          <div className="border-border-subtle rounded-3xl border bg-gradient-to-br from-slate-900/60 via-purple-950/20 to-slate-950/80 p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
            <div className="border-border-subtle flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-brand-400 mb-2 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                  <Compass className="h-4 w-4" />
                  <span>Mimar Sinan Structural Doctrine</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  Flawless Static Equilibrium & Model Arbitrage
                </h2>
                <p className="text-fg-secondary mt-2 max-w-2xl text-sm leading-relaxed">
                  Each digital twin is constructed like an independent cognitive dome. Agent-OS
                  orkestrasyonu, sorunun semantik ağırlığına göre en uygun egemen yapay zeka
                  modelini sıfır gecikmeyle eşler.
                </p>
              </div>

              <Link href={`/${locale}/digital-twins`}>
                <Button className="from-brand-600 bg-gradient-to-r to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:brightness-110">
                  <span>Start Chat with Council of Sages</span>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* 3 Pillars of Structural Excellence */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="border-border-subtle/50 rounded-2xl border bg-white/[0.02] p-5">
                <div className="bg-brand-500/10 text-brand-400 mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  1. Zero Hallucination Guarantee
                </h3>
                <p className="text-fg-muted mt-2 text-xs leading-relaxed">
                  Her ikiz, kendi tarihi felsefesi ve kanıtlanmış prensipleri sınırında akıl
                  yürütür. Doğrulanmamış veya spekülatif veriler doğrudan filtrelenir.
                </p>
              </div>

              <div className="border-border-subtle/50 rounded-2xl border bg-white/[0.02] p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Coins className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  2. 98% Token Savings Arbitrage
                </h3>
                <p className="text-fg-muted mt-2 text-xs leading-relaxed">
                  Rutin danışmanlık sorguları ücretsiz yüksek hızlı OpenCode modellerine (DeepSeek
                  Flash / Nemotron Ultra), stratejik zirve kararları ise Sovereign modellere
                  yönlendirilir.
                </p>
              </div>

              <div className="border-border-subtle/50 rounded-2xl border bg-white/[0.02] p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Flame className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  3. Asymmetric Problem Solving
                </h3>
                <p className="text-fg-muted mt-2 text-xs leading-relaxed">
                  İstanbul'u fetheden Fatih stratejisinden, Enigma'yı kıran Turing mantığına kadar
                  en karmaşık start-up veya mimari tıkanıklıklar asimetrik açılardan çözülür.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================================
          INTERACTIVE TWIN DETAIL MODAL
          ========================================================================= */}
      {selectedTwinModal && (
        <div className="animate-in fade-in bg-bg-secondary fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl duration-200">
          <div className="bg-bg-secondary relative w-full max-w-2xl rounded-3xl border border-white/15 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTwinModal(null)}
              aria-label="Close modal"
              className="text-fg-muted absolute top-5 right-5 rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="border-border-subtle flex items-center gap-4 border-b pb-6">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedTwinModal.stats.badgeGradient} p-0.5 shadow-lg`}
              >
                <div className="bg-bg-secondary flex h-full w-full items-center justify-center rounded-[14px]">
                  <BrainCircuit className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-2xl font-bold text-white">
                    {selectedTwinModal.name}
                  </h3>
                  <Badge variant="outline" className="border-brand-500/40 text-brand-300 text-xs">
                    {selectedTwinModal.stats.tier}
                  </Badge>
                </div>
                <p className="text-brand-400 text-sm font-medium">{selectedTwinModal.title}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="text-fg-secondary mt-6 space-y-5 text-xs sm:text-sm">
              {/* Quote */}
              <div className="border-brand-500/20 bg-brand-500/5 rounded-2xl border p-4">
                <span className="text-brand-400 mb-1 block text-[11px] font-bold tracking-wider uppercase">
                  Core Philosophy & Principles
                </span>
                <p className="text-sm leading-relaxed text-white italic">
                  "{selectedTwinModal.stats.quote}"
                </p>
              </div>

              {/* System Prompt Philosophy */}
              <div>
                <span className="text-fg-muted mb-1.5 block text-xs font-semibold tracking-wider uppercase">
                  Cognitive Guidelines & Logic Algorithm
                </span>
                <p className="border-border-subtle bg-bg-secondary text-fg-primary rounded-2xl border p-4 font-mono text-xs leading-relaxed">
                  {selectedTwinModal.systemPrompt}
                </p>
              </div>

              {/* Detailed Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="border-border-subtle rounded-xl border bg-white/[0.02] p-3 text-center">
                  <span className="text-fg-muted block text-[11px]">IQ Skoru</span>
                  <span className="text-brand-300 text-sm font-bold">
                    {selectedTwinModal.stats.iqScore} IQ
                  </span>
                </div>
                <div className="border-border-subtle rounded-xl border bg-white/[0.02] p-3 text-center">
                  <span className="text-fg-muted block text-[11px]">Cases Solved</span>
                  <span className="font-mono text-sm font-bold text-white">
                    {selectedTwinModal.stats.solvedProblems.toLocaleString()}
                  </span>
                </div>
                <div className="border-border-subtle rounded-xl border bg-white/[0.02] p-3 text-center">
                  <span className="text-fg-muted block text-[11px]">Success Rate</span>
                  <span className="text-sm font-bold text-emerald-400">
                    %{selectedTwinModal.stats.successRate}
                  </span>
                </div>
                <div className="border-border-subtle rounded-xl border bg-white/[0.02] p-3 text-center">
                  <span className="text-fg-muted block text-[11px]">Avg Response</span>
                  {}
                  <span className="font-mono text-sm font-bold text-cyan-300">
                    {(selectedTwinModal.stats as any).latency || "145ms"}
                  </span>
                </div>
              </div>

              {/* Expertise tags */}
              <div>
                <span className="text-fg-muted mb-2 block text-xs font-semibold tracking-wider uppercase">
                  Strategic Expertise Areas
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTwinModal.expertise.map((exp: string) => (
                    <Badge
                      key={exp}
                      variant="outline"
                      className="border-border-subtle border bg-white/10 text-xs text-white"
                    >
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-border-subtle mt-8 flex items-center justify-end gap-3 border-t pt-4">
              <Button
                onClick={() => setSelectedTwinModal(null)}
                variant="ghost"
                className="text-fg-muted text-xs hover:text-white"
              >
                Kapat
              </Button>
              <Link href={`/${locale}/digital-twins`}>
                <Button className="from-brand-600 bg-gradient-to-r to-purple-600 text-xs font-bold text-white shadow-lg hover:brightness-110">
                  <span>Start Live Chat with this Visionary</span>
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
