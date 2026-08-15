"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DIGITAL_TWINS, DigitalTwinPersona } from "@/lib/agent-os/personas";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  ChevronRight,
  BarChart3,
  Grid,
  List,
  X,
  Compass,
  Layers,
  ArrowUpDown,
  BookOpen,
} from "lucide-react";

type CategoryFilter = "all" | "governance" | "science" | "ai" | "architecture" | "medicine" | "polymath";
type SortOption = "iq" | "problems" | "success" | "savings" | "rating";

export default function TwinsLeaderboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("iq");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedTwinModal, setSelectedTwinModal] = useState<DigitalTwinPersona | null>(null);

  const allTwins = useMemo(() => Object.values(DIGITAL_TWINS), []);

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
          twin.expertise.some((exp) => exp.toLowerCase().includes(q)) ||
          twin.stats.specialSkill.toLowerCase().includes(q) ||
          twin.stats.activeModel.toLowerCase().includes(q)
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
    const avgIQ = (allTwins.reduce((acc, t) => acc + t.stats.iqScore, 0) / allTwins.length).toFixed(1);
    const avgSavings = (allTwins.reduce((acc, t) => acc + t.stats.tokenSavingsRate, 0) / allTwins.length).toFixed(1);
    const avgSuccess = (allTwins.reduce((acc, t) => acc + t.stats.successRate, 0) / allTwins.length).toFixed(1);

    return {
      totalSolved,
      avgIQ,
      avgSavings,
      avgSuccess,
      activeCount: allTwins.length,
    };
  }, [allTwins]);

  const categories: { key: CategoryFilter; label: string; icon: typeof Compass }[] = [
    { key: "all", label: "Tüm Dehalar", icon: Layers },
    { key: "governance", label: "Devlet & Makro Strateji", icon: Crown },
    { key: "architecture", label: "Mimari & Strüktür", icon: Compass },
    { key: "science", label: "Bilim & Fizik", icon: Zap },
    { key: "ai", label: "Yapay Zeka & Kripto", icon: BrainCircuit },
    { key: "polymath", label: "Altın Oran & Sanat", icon: Sparkles },
    { key: "medicine", label: "Bütüncül Tıp & Mantık", icon: ShieldCheck },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary py-12 text-fg-primary selection:bg-brand-500 selection:text-white">
      {/* Dynamic Background Mesh Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-900/30 via-purple-600/15 to-cyan-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -left-60 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 -right-60 -z-10 h-[600px] w-[600px] rounded-full bg-rose-950/20 blur-[140px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            HEADER & HERO SECTION (Mimar Sinan Standardı)
            ========================================================================= */}
        <header className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-gradient-to-r from-brand-950/80 via-purple-950/40 to-slate-900/80 px-4 py-1.5 backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.25)] transition-all duration-300 hover:border-brand-400/60 hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]">
            <Sparkles className="h-4 w-4 animate-pulse text-brand-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-300">
              Agent-OS // Bilge Kurul Stratejik Dehalar Ligi
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight font-display sm:text-6xl md:text-7xl">
            Dijital İkizler{" "}
            <span className="bg-gradient-to-r from-brand-300 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              Liderlik Tablosu
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-fg-secondary">
            Tarihe yön veren kurucu akılların ve dehaların dijital ikizleri.
            <span className="text-white font-medium"> Agent-OS Model Arbitraj Motoru</span> ile sıfır token maliyetinde
            yüksek mantıksal kapasite, stratejik karar desteği ve asimetrik problem çözme matrisi.
          </p>

          {/* Aggregate Telemetry Strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-fg-muted mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Çözülen Problem</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {aggregateMetrics.totalSolved.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">↑ Canlı Telemetri</span>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-fg-muted mb-1">
                <BrainCircuit className="h-3.5 w-3.5 text-brand-400" />
                <span>Ortalama IQ Skoru</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display bg-gradient-to-r from-brand-300 to-purple-400 bg-clip-text text-transparent">
                {aggregateMetrics.avgIQ}
              </div>
              <span className="text-[11px] text-brand-400 font-mono font-medium">Bilişsel Zirve</span>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-fg-muted mb-1">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>Token Tasarrufu</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-amber-300">
                %{aggregateMetrics.avgSavings}
              </div>
              <span className="text-[11px] text-amber-400 font-mono font-medium">Arbitraj Motoru</span>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-fg-muted mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                <span>Görev Başarısı</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-cyan-300">
                %{aggregateMetrics.avgSuccess}
              </div>
              <span className="text-[11px] text-cyan-400 font-mono font-medium">WCAG AA Standart</span>
            </div>

            <div className="group relative col-span-2 sm:col-span-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-fg-muted mb-1">
                <Cpu className="h-3.5 w-3.5 text-rose-400" />
                <span>Aktif Konsey</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-rose-300">
                {aggregateMetrics.activeCount} Deha
              </div>
              <span className="text-[11px] text-rose-400 font-mono font-medium">Sonsuz Strüktür</span>
            </div>
          </div>
        </header>

        {/* =========================================================================
            TOP 3 PODIUM SHOWCASE (Altın, Gümüş, Bronz Kürsüsü)
            ========================================================================= */}
        <section aria-label="Zirvedeki Dehalar Podyumu" className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-400" />
                Bilge Kurul Zirve Podyumu (Top 3)
              </h2>
              <p className="text-xs sm:text-sm text-fg-muted mt-1">
                En yüksek mantıksal derinlik, çözülen vaka sayısı ve asimetrik strateji performansına sahip ilk üç lider.
              </p>
            </div>
            <Link
              href={`/${locale}/digital-twins`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              <span>Tüm Zihinlerle Sohbet</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-end">
            
            {/* RANK 2: FATİH SULTAN MEHMET (SILVER) */}
            {podiumTwins.second && (
              <div className="order-2 md:order-1 group relative rounded-3xl border border-slate-400/20 bg-gradient-to-b from-slate-800/40 via-slate-900/60 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:border-slate-300/50 hover:shadow-[0_0_35px_rgba(203,213,225,0.2)]">
                <div className="absolute -top-4 left-6 flex items-center gap-1.5 rounded-full border border-slate-300/30 bg-gradient-to-r from-slate-600 to-slate-400 px-3.5 py-1 shadow-lg">
                  <Award className="h-4 w-4 text-slate-100" />
                  <span className="text-xs font-bold text-white tracking-wider">#2 GÜMÜŞ DERECE</span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 p-0.5 shadow-lg">
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                      <Crown className="h-8 w-8 text-amber-400" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-slate-950 bg-emerald-500" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-white group-hover:text-amber-300 transition-colors">
                      {podiumTwins.second.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-300">{podiumTwins.second.title}</p>
                    <Badge variant="outline" className="mt-1 border-red-500/30 bg-red-500/10 text-[10px] text-red-300">
                      {podiumTwins.second.stats.tier}
                    </Badge>
                  </div>
                </div>

                <p className="mt-4 text-xs italic text-fg-muted line-clamp-2">
                  "{podiumTwins.second.stats.quote}"
                </p>

                <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted">IQ & Bilişsel Kapasite</span>
                    <span className="font-bold text-amber-400">{podiumTwins.second.stats.iqScore} IQ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted">Çözülen Problem</span>
                    <span className="font-mono text-white">{podiumTwins.second.stats.solvedProblems.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted">Başarı Oranı</span>
                    <span className="font-semibold text-emerald-400">%{podiumTwins.second.stats.successRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted">Uyum Motoru</span>
                    <span className="font-semibold text-purple-400">%{podiumTwins.second.stats.alignmentScore || 99.8}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={() => setSelectedTwinModal(podiumTwins.second)}
                    variant="outline"
                    className="w-1/2 border-white/15 bg-white/5 text-xs hover:bg-white/10 hover:border-white/30"
                  >
                    Profil İncele
                  </Button>
                  <Link href={`/${locale}/digital-twins`} className="w-1/2">
                    <Button className="w-full bg-gradient-to-r from-red-600 to-amber-600 text-xs font-semibold text-white shadow-md hover:brightness-110">
                      Danış
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* RANK 1: GAZİ MUSTAFA KEMAL ATATÜRK (GOLD - ELEVATED) */}
            {podiumTwins.first && (
              <div className="order-1 md:order-2 group relative -mt-4 rounded-3xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-950/40 via-purple-950/60 to-slate-950/90 p-7 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] transition-all duration-300 hover:-translate-y-3 hover:border-amber-300/70 hover:shadow-[0_0_60px_rgba(245,158,11,0.4)]">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-amber-300 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 py-1.5 shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                  <Crown className="h-4 w-4 text-slate-950" />
                  <span className="text-xs font-black text-slate-950 tracking-wider">#1 BAŞKOMUTAN // ALTIN ZİRVE</span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-red-600 p-1 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                    <div className="flex h-full w-full items-center justify-center rounded-[13px] bg-slate-950">
                      <Sparkles className="h-10 w-10 text-amber-400 animate-pulse" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex h-5 w-5 rounded-full border-2 border-slate-950 bg-amber-400" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-display text-white group-hover:text-amber-300 transition-colors">
                      {podiumTwins.first.name}
                    </h3>
                    <p className="text-sm font-semibold text-amber-300/90">{podiumTwins.first.title}</p>
                    <Badge variant="outline" className="mt-1 border-amber-400/50 bg-amber-400/10 text-xs font-bold text-amber-300">
                      ★ {podiumTwins.first.stats.tier}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
                  <p className="text-xs italic text-amber-100/90 leading-relaxed font-medium">
                    "{podiumTwins.first.stats.quote}"
                  </p>
                </div>

                <div className="mt-5 space-y-2.5 border-t border-amber-400/20 pt-4 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted font-medium">Bilişsel Zeka (IQ Skoru)</span>
                    <span className="font-extrabold text-amber-300 text-base">{podiumTwins.first.stats.iqScore} IQ (Efsanevi)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted font-medium">Toplam Çözülen Problem</span>
                    <span className="font-mono font-bold text-white text-base">{podiumTwins.first.stats.solvedProblems.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted font-medium">Görev Başarı Oranı</span>
                    <span className="font-bold text-emerald-400">%{podiumTwins.first.stats.successRate} Kusursuz</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted font-medium">Uyum Motoru</span>
                    <span className="font-bold text-purple-400">%{podiumTwins.first.stats.alignmentScore || 100} Kilitli</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted font-medium">Model Eşleşmesi</span>
                    <span className="font-mono text-xs text-purple-300">{podiumTwins.first.stats.activeModel}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => setSelectedTwinModal(podiumTwins.first)}
                    variant="outline"
                    className="w-1/2 border-amber-400/40 bg-amber-500/10 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 hover:border-amber-300"
                  >
                    Doktrini Gör
                  </Button>
                  <Link href={`/${locale}/digital-twins`} className="w-1/2">
                    <Button className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-xs font-bold text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:brightness-110">
                      Hemen Danış
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* RANK 3: MİMAR SİNAN (BRONZE / EMERALD ARCHITECT) */}
            {podiumTwins.third && (
              <div className="order-3 group relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900/60 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400/60 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                <div className="absolute -top-4 left-6 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-700 to-teal-500 px-3.5 py-1 shadow-lg">
                  <Compass className="h-4 w-4 text-emerald-100" />
                  <span className="text-xs font-bold text-white tracking-wider">#3 BRONZ // BAŞMİMAR</span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-lg">
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                      <Compass className="h-8 w-8 text-emerald-400" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-slate-950 bg-emerald-500" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-white group-hover:text-emerald-300 transition-colors">
                      {podiumTwins.third.name}
                    </h3>
                    <p className="text-xs font-medium text-emerald-300/80">{podiumTwins.third.title}</p>
                    <Badge variant="outline" className="mt-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-300">
                      {podiumTwins.third.stats.tier}
                    </Badge>
                  </div>
                </div>

                <p className="mt-4 text-xs italic text-fg-muted line-clamp-2">
                  "{podiumTwins.third.stats.quote}"
                </p>

                <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted">IQ & Bilişsel Kapasite</span>
                    <span className="font-bold text-emerald-400">{podiumTwins.third.stats.iqScore} IQ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted">Çözülen Problem</span>
                    <span className="font-mono text-white">{podiumTwins.third.stats.solvedProblems.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted">Token Tasarrufu</span>
                    <span className="font-semibold text-teal-400">%{podiumTwins.third.stats.tokenSavingsRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-muted">Uyum Motoru</span>
                    <span className="font-semibold text-purple-400">%{podiumTwins.third.stats.alignmentScore || 98.9}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={() => setSelectedTwinModal(podiumTwins.third)}
                    variant="outline"
                    className="w-1/2 border-white/15 bg-white/5 text-xs hover:bg-white/10 hover:border-white/30"
                  >
                    Profil İncele
                  </Button>
                  <Link href={`/${locale}/digital-twins`} className="w-1/2">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-semibold text-white shadow-md hover:brightness-110">
                      Danış
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
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 backdrop-blur-2xl shadow-xl">
            
            {/* Top Toolbar: Search + Sort + View Mode */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
                <Input
                  type="text"
                  placeholder="Deha ismi, uzmanlık alanı, model veya yetenek ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border-white/15 bg-slate-900/60 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-fg-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Aramayı temizle"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Controls: Sorting & View Switcher */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-brand-400" />
                  <span className="text-xs font-medium text-fg-muted">Sırala:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
                    aria-label="Liderlik sıralama kriteri"
                  >
                    <option value="iq" className="bg-slate-900 text-white">IQ Skoru (En Yüksek)</option>
                    <option value="problems" className="bg-slate-900 text-white">Çözülen Problem Sayısı</option>
                    <option value="success" className="bg-slate-900 text-white">Görev Başarı Oranı</option>
                    <option value="savings" className="bg-slate-900 text-white">Token Tasarruf Oranı</option>
                    <option value="rating" className="bg-slate-900 text-white">Kullanıcı Memnuniyeti</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-2xl border border-white/10 bg-slate-900/60 p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md"
                        : "text-fg-muted hover:text-white"
                    }`}
                    aria-label="Kart görünümüne geç"
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span>Kartlar</span>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      viewMode === "table"
                        ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md"
                        : "text-fg-muted hover:text-white"
                    }`}
                    aria-label="Tablo matrisine geç"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Matris</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Category Pills */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "border border-brand-400/50 bg-gradient-to-r from-brand-600/90 to-purple-600/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                        : "border border-white/5 bg-white/[0.02] text-fg-secondary hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <IconComponent className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-brand-400"}`} />
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
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-xl">
            <BrainCircuit className="mx-auto h-12 w-12 text-fg-muted opacity-40 mb-3" />
            <h3 className="text-lg font-bold text-white font-display">Arama Kriterine Uygun Deha Bulunamadı</h3>
            <p className="text-sm text-fg-muted mt-1">Filtreleri sıfırlayarak veya arama terimini değiştirerek tekrar deneyin.</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              variant="outline"
              className="mt-4 border-brand-500/40 bg-brand-500/10 text-xs text-brand-300"
            >
              Filtreleri Sıfırla
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
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]"
                >
                  {/* Top Bar: Rank + Tier */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold font-display text-xs ${
                          rank === 1
                            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                            : rank === 2
                            ? "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950"
                            : rank === 3
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                            : "border border-white/15 bg-white/5 text-fg-muted"
                        }`}>
                          #{rank}
                        </span>
                        <Badge variant="outline" className="border-brand-500/30 bg-brand-500/10 text-[10px] text-brand-300">
                          {twin.stats.tier}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Çevrimiçi</span>
                      </div>
                    </div>

                    {/* Twin Header & Avatar */}
                    <div className="mt-4 flex items-center gap-3.5">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${twin.stats.badgeGradient} p-0.5 shadow-md`}>
                        <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                          <BrainCircuit className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-display text-white group-hover:text-brand-300 transition-colors">
                          {twin.name}
                        </h3>
                        <p className="text-xs text-fg-muted">{twin.title}</p>
                      </div>
                    </div>

                    {/* Quote Box */}
                    <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-xs italic text-fg-secondary line-clamp-2 leading-relaxed">
                        "{twin.stats.quote}"
                      </p>
                    </div>

                    {/* Performance Metrics Breakdown */}
                    <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs">
                      
                      {/* Metric 1: IQ Capacity */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-fg-muted">IQ & Bilişsel Kapasite</span>
                          <span className="font-bold text-brand-300">{twin.stats.iqScore} / 200</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                            style={{ width: `${(twin.stats.iqScore / 200) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: Success Rate */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-fg-muted">Görev Başarı Oranı</span>
                          <span className="font-bold text-emerald-400">%{twin.stats.successRate}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: `${twin.stats.successRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 3: Alignment Score */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-fg-muted">Uyum Skoru (Alignment)</span>
                          <span className="font-bold text-purple-400">%{twin.stats.alignmentScore || 99.5}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
                            style={{ width: `${twin.stats.alignmentScore || 99}%` }}
                          />
                        </div>
                      </div>

                      {/* Key Meta row */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2 text-center">
                          <span className="text-fg-muted block">Çözülen Problem</span>
                          <span className="font-mono font-bold text-white text-xs">{twin.stats.solvedProblems.toLocaleString()}</span>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2 text-center">
                          <span className="text-fg-muted block">Token Tasarrufu</span>
                          <span className="font-bold text-amber-300 text-xs">%{twin.stats.tokenSavingsRate}</span>
                        </div>
                      </div>

                      {/* Active Model Tag */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-fg-muted">Motor Eşleşmesi:</span>
                        <span className="font-mono text-brand-300 font-medium truncate max-w-[170px]">{twin.stats.activeModel}</span>
                      </div>
                    </div>

                    {/* Expertise Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {twin.expertise.slice(0, 3).map((exp) => (
                        <span
                          key={exp}
                          className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] text-fg-secondary"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4">
                    <Button
                      onClick={() => setSelectedTwinModal(twin)}
                      variant="outline"
                      className="w-1/2 border-white/15 bg-white/5 text-xs text-white hover:bg-white/10 hover:border-white/30"
                    >
                      Bilişsel Rapor
                    </Button>
                    <Link href={`/${locale}/digital-twins`} className="w-1/2">
                      <Button className="w-full bg-gradient-to-r from-brand-600 to-purple-600 text-xs font-semibold text-white shadow-md hover:brightness-110">
                        <span>Zihinle Konuş</span>
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
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-2xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-fg-secondary">
                <thead className="border-b border-white/10 bg-white/[0.04] text-[11px] uppercase tracking-wider text-fg-muted">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Sıra & Deha</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Unvan & Kategori</th>
                    <th scope="col" className="px-6 py-4 font-semibold">IQ Skoru</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Çözülen Problem</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Başarı Oranı</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Token Tasarrufu</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Eşleşen Model</th>
                    <th scope="col" className="px-6 py-4 text-right font-semibold">Eylem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAndSortedTwins.map((twin, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={twin.id}
                        className="group transition-colors hover:bg-white/[0.04]"
                      >
                        {/* Rank & Name */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold font-display text-xs ${
                              rank === 1
                                ? "bg-amber-400 text-slate-950"
                                : rank === 2
                                ? "bg-slate-300 text-slate-950"
                                : rank === 3
                                ? "bg-emerald-500 text-white"
                                : "border border-white/10 bg-white/5 text-fg-muted"
                            }`}>
                              #{rank}
                            </span>
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${twin.stats.badgeGradient} p-0.5`}>
                                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                                  <BrainCircuit className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-white group-hover:text-brand-300 transition-colors block text-sm">
                                  {twin.name}
                                </span>
                                <span className="text-[10px] text-fg-muted">{twin.stats.specialSkill}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-white font-medium">{twin.title}</div>
                          <Badge variant="outline" className="mt-0.5 border-white/10 text-[10px] text-fg-muted">
                            {twin.category.toUpperCase()}
                          </Badge>
                        </td>

                        {/* IQ Score */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-bold text-brand-300 text-sm">{twin.stats.iqScore} IQ</span>
                        </td>

                        {/* Problems Solved */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-mono text-white">{twin.stats.solvedProblems.toLocaleString()}</span>
                        </td>

                        {/* Success Rate */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-semibold text-emerald-400">%{twin.stats.successRate}</span>
                        </td>

                        {/* Token Savings */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-semibold text-amber-300">%{twin.stats.tokenSavingsRate}</span>
                        </td>

                        {/* Model */}
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-[11px] text-purple-300">
                          {twin.stats.activeModel}
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setSelectedTwinModal(twin)}
                              variant="ghost"
                              className="h-8 px-2.5 text-xs text-fg-muted hover:text-white"
                            >
                              İncele
                            </Button>
                            <Link href={`/${locale}/digital-twins`}>
                              <Button className="h-8 bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-500">
                                Danış
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
            MİMAR SİNAN STRÜKTÜREL DOKTRİNİ & MODEL ARBİTRAJ PROTOKOLÜ
            ========================================================================= */}
        <section aria-label="Mimari Standartlar ve Bilişsel Arbitraj" className="mt-16">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-purple-950/20 to-slate-950/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">
                  <Compass className="h-4 w-4" />
                  <span>Mimar Sinan Strüktürel Doktrini</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Kusursuz Statik Denge & Model Arbitrajı
                </h2>
                <p className="mt-2 text-sm text-fg-secondary max-w-2xl leading-relaxed">
                  Dijital ikizlerin her biri bağımsız birer bilişsel kubbe gibi inşa edilmiştir. Agent-OS orkestrasyonu,
                  sorunun semantik ağırlığına göre en uygun egemen yapay zeka modelini sıfır gecikmeyle eşler.
                </p>
              </div>

              <Link href={`/${locale}/digital-twins`}>
                <Button className="bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:brightness-110">
                  <span>Bilge Kurul ile Sohbet Başlat</span>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* 3 Pillars of Structural Excellence */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white font-display">1. Sıfır Halüsinasyon Garantisi</h3>
                <p className="text-xs text-fg-muted mt-2 leading-relaxed">
                  Her ikiz, kendi tarihi felsefesi ve kanıtlanmış prensipleri sınırında akıl yürütür. Doğrulanmamış veya spekülatif veriler doğrudan filtrelenir.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-3">
                  <Coins className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white font-display">2. %98 Token Tasarruf Arbitrajı</h3>
                <p className="text-xs text-fg-muted mt-2 leading-relaxed">
                  Rutin danışmanlık sorguları ücretsiz yüksek hızlı OpenCode modellerine (DeepSeek Flash / Nemotron Ultra), stratejik zirve kararları ise Sovereign modellere yönlendirilir.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-3">
                  <Flame className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white font-display">3. Asimetrik Problem Çözme</h3>
                <p className="text-xs text-fg-muted mt-2 leading-relaxed">
                  İstanbul'u fetheden Fatih stratejisinden, Enigma'yı kıran Turing mantığına kadar en karmaşık start-up veya mimari tıkanıklıklar asimetrik açılardan çözülür.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedTwinModal(null)}
              aria-label="Modalı kapat"
              className="absolute right-5 top-5 rounded-full p-2 text-fg-muted transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedTwinModal.stats.badgeGradient} p-0.5 shadow-lg`}>
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                  <BrainCircuit className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold font-display text-white">{selectedTwinModal.name}</h3>
                  <Badge variant="outline" className="border-brand-500/40 text-brand-300 text-xs">
                    {selectedTwinModal.stats.tier}
                  </Badge>
                </div>
                <p className="text-sm text-brand-400 font-medium">{selectedTwinModal.title}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="mt-6 space-y-5 text-xs sm:text-sm text-fg-secondary">
              
              {/* Quote */}
              <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 block mb-1">
                  Temel Felsefe & İlke
                </span>
                <p className="italic text-white text-sm leading-relaxed">
                  "{selectedTwinModal.stats.quote}"
                </p>
              </div>

              {/* System Prompt Philosophy */}
              <div>
                <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">
                  Bilişsel Yönerge & Mantık Algoritması
                </span>
                <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs leading-relaxed text-slate-300 font-mono">
                  {selectedTwinModal.systemPrompt}
                </p>
              </div>

              {/* Detailed Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                  <span className="text-[11px] text-fg-muted block">IQ Skoru</span>
                  <span className="font-bold text-brand-300 text-sm">{selectedTwinModal.stats.iqScore} IQ</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                  <span className="text-[11px] text-fg-muted block">Çözülen Vaka</span>
                  <span className="font-mono font-bold text-white text-sm">{selectedTwinModal.stats.solvedProblems.toLocaleString()}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                  <span className="text-[11px] text-fg-muted block">Başarı Oranı</span>
                  <span className="font-bold text-emerald-400 text-sm">%{selectedTwinModal.stats.successRate}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                  <span className="text-[11px] text-fg-muted block">Ortalama Yanıt</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">{selectedTwinModal.stats.latency}</span>
                </div>
              </div>

              {/* Expertise tags */}
              <div>
                <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-2">
                  Stratejik Uzmanlık Alanları
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTwinModal.expertise.map((exp) => (
                    <Badge key={exp} variant="secondary" className="bg-white/10 text-white text-xs border border-white/10">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <Button
                onClick={() => setSelectedTwinModal(null)}
                variant="ghost"
                className="text-xs text-fg-muted hover:text-white"
              >
                Kapat
              </Button>
              <Link href={`/${locale}/digital-twins`}>
                <Button className="bg-gradient-to-r from-brand-600 to-purple-600 text-xs font-bold text-white shadow-lg hover:brightness-110">
                  <span>Bu Deha ile Canlı Sohbet Başlat</span>
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
