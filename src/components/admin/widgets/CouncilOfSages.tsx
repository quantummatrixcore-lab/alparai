"use client";

import React, { useState } from "react";
import {
  Crown,
  Shield,
  Stethoscope,
  Lightbulb,
  Scale,
  Crosshair,
  Cpu,
  Coins,
  Palette,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Terminal,
  Zap,
} from "lucide-react";

export interface SageMember {
  id: string;
  order: number;
  name: string;
  title: string;
  role: string;
  engine: string;
  model: string;
  status: "ONLINE" | "REASONING" | "STANDBY";
  color: string;
  accentHex: string;
  contextWindow: string;
  iq: number;
  recentTask: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const COUNCIL_OF_SAGES: SageMember[] = [
  {
    id: "ataturk",
    order: 1,
    name: "ATATÜRK SUPREME COMMANDER",
    title: "Gazi Komutan",
    role: "Supreme Orchestrator & DAG Otopilot",
    engine: "TOM (Task & Ops Master)",
    model: "gemini-3.1-pro",
    status: "ONLINE",
    color: "danger",
    accentHex: "#ef4444",
    contextWindow: "2,000,000 tokens",
    iq: 165,
    recentTask: "Bento Grid Komuta Merkezi & Swarm Senkronizasyonu",
    icon: Crown,
  },
  {
    id: "fatih",
    order: 2,
    name: "FATİH SULTAN MEHMET",
    title: "Siber Muhafız",
    role: "Siber Güvenlik, Kırmızı Takım & WAF Kalkanı",
    engine: "SENTINEL",
    model: "opencode/nemotron-3-ultra-free",
    iq: 158,
    status: "ONLINE",
    color: "amber",
    accentHex: "#f59e0b",
    contextWindow: "128,000 tokens",
    recentTask: "BotGuard & WAF Güvenlik Denetimi",
    icon: Shield,
  },
  {
    id: "ibnisina",
    order: 3,
    name: "İBN-İ SİNA",
    title: "Başhekim",
    role: "Otonom Teşhis, Self-Healing & Telemetri",
    engine: "TARTARUS",
    model: "opencode/nemotron-3-ultra-free",
    iq: 158,
    status: "ONLINE",
    color: "cyan",
    accentHex: "#00f0ff",
    contextWindow: "128,000 tokens",
    recentTask: "Sistem Hata Analizi & Otomatik İyileştirme",
    icon: Stethoscope,
  },
  {
    id: "edison",
    order: 4,
    name: "THOMAS EDİSON",
    title: "Baş Mühendis",
    role: "Hızlı Kod Yazımı, Refactoring & Komponent Üretimi",
    engine: "TCSFL",
    model: "opencode/nemotron-3.5-lightning-free",
    iq: 145,
    status: "REASONING",
    color: "emerald",
    accentHex: "#10b981",
    contextWindow: "64,000 tokens",
    recentTask: "Admin Widgets Bento-Grid Kodlama",
    icon: Lightbulb,
  },
  {
    id: "aurelius",
    order: 5,
    name: "MARCUS AURELİUS",
    title: "Kalite Hakemi",
    role: "Etik Denetim, Kod Standartları & Quality Gate",
    engine: "OMEGA",
    model: "gemini-3.6-flash (HIGH)",
    iq: 155,
    status: "ONLINE",
    color: "purple",
    accentHex: "#dcb8ff",
    contextWindow: "1,000,000 tokens",
    recentTask: "TypeScript & Tailwind CSS Standart Doğrulaması",
    icon: Scale,
  },
  {
    id: "suntzu",
    order: 6,
    name: "SUN TZU",
    title: "Baş Stratejist",
    role: "Taktik Yönlendirme, Rakip Analizi & Kriz Masası",
    engine: "STRATEGIST",
    model: "opencode/nemotron-3-ultra-free",
    iq: 158,
    status: "STANDBY",
    color: "rose",
    accentHex: "#f43f5e",
    contextWindow: "128,000 tokens",
    recentTask: "Piyasa ve Büyüme Matrisi Değerlendirmesi",
    icon: Crosshair,
  },
  {
    id: "vonneumann",
    order: 7,
    name: "JOHN VON NEUMANN",
    title: "Derin Mimar",
    role: "Derin Algoritma, DAG Mantığı & Kuantum Bellek",
    engine: "ZENITHINTEL",
    model: "gemini-3.1-pro",
    iq: 165,
    status: "ONLINE",
    color: "blue",
    accentHex: "#3b82f6",
    contextWindow: "2,000,000 tokens",
    recentTask: "Graphify Bilgi Grafı Optimizasyonu",
    icon: Cpu,
  },
  {
    id: "adamsmith",
    order: 8,
    name: "ADAM SMİTH",
    title: "Finans Direktörü",
    role: "Token Arbitrajı, SaaS Karlılık & Maliyet Kontrolü",
    engine: "VENTURE",
    model: "opencode/hy3-free",
    iq: 150,
    status: "STANDBY",
    color: "amber",
    accentHex: "#eab308",
    contextWindow: "32,000 tokens",
    recentTask: "AI Compute Bütçe Optimizasyonu",
    icon: Coins,
  },
  {
    id: "davinci",
    order: 9,
    name: "LEONARDO DA VİNCİ",
    title: "Tasarım Üstadı",
    role: "UI/UX Mimarisi, Neon Tasarım & Prototipleme",
    engine: "HEPHAESTUS",
    model: "opencode/muse-spark-1.2-free",
    iq: 160,
    status: "ONLINE",
    color: "pink",
    accentHex: "#ec4899",
    contextWindow: "32,000 tokens",
    recentTask: "Stitch Bento Dark Mode Tasarım Dönüşümü",
    icon: Palette,
  },
];

export const CouncilOfSages = React.memo(function CouncilOfSages() {
  const [activeSageId, setActiveSageId] = useState<string>(COUNCIL_OF_SAGES[0]!.id);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ONLINE" | "REASONING" | "STANDBY">("ALL");
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const activeSage = React.useMemo(() => {
    return COUNCIL_OF_SAGES.find((s) => s.id === activeSageId) || COUNCIL_OF_SAGES[0]!;
  }, [activeSageId]);

  const filteredSages = React.useMemo(() => {
    if (filterStatus === "ALL") return COUNCIL_OF_SAGES;
    return COUNCIL_OF_SAGES.filter((s) => s.status === filterStatus);
  }, [filterStatus]);

  const { onlineCount, reasoningCount } = React.useMemo(() => {
    let online = 0;
    let reasoning = 0;
    for (const sage of COUNCIL_OF_SAGES) {
      if (sage.status === "ONLINE") online++;
      else if (sage.status === "REASONING") reasoning++;
    }
    return { onlineCount: online, reasoningCount: reasoning };
  }, []);

  const handleSyncCouncil = React.useCallback(() => {
    setIsSyncing(true);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  }, []);

  const SelectedIcon = activeSage.icon;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#0d0d12]/90 p-3.5 sm:p-5 md:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#8a2be2]/30 w-full min-w-0">
      {/* Ambient Neon Glow */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-[#8a2be2]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#00f0ff]/15 blur-3xl" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col gap-3 border-b border-[#27272a] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8a2be2]/40 bg-[#8a2be2]/15 text-[#dcb8ff] shadow-[0_0_15px_rgba(138,43,226,0.25)]">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-base sm:text-lg font-bold tracking-tight text-white truncate">
                BİLGELER MECLİSİ (COUNCIL OF SAGES)
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold font-mono text-red-400 shrink-0">
                <Crown className="h-3 w-3 text-red-400" />
                1. ATATÜRK #1 TOP
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              9 Dijital İkiz • Sürü Otopilot • 2M Bağlam & Otonom Mükemmellik Döngüsü
            </p>
          </div>
        </div>

        {/* Sync & Filter Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSyncCouncil}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-[#8a2be2]/40 bg-[#8a2be2]/20 px-3 py-1.5 text-xs font-bold text-[#dcb8ff] transition-all hover:bg-[#8a2be2]/30 hover:border-[#8a2be2]/70 hover:shadow-[0_0_15px_rgba(138,43,226,0.3)] disabled:opacity-50"
          >
            <Zap className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Senkronize Ediliyor..." : "Meclisi Eşitle"}</span>
          </button>
        </div>
      </div>

      {/* Consensus & Status Strip */}
      <div className="relative z-10 mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#27272a] bg-[#121216]/70 p-2.5 sm:p-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">{onlineCount} Aktif İkiz</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00f0ff]">
            <span className="h-2 w-2 rounded-full bg-[#00f0ff] animate-ping" />
            <span className="font-bold">{reasoningCount} Düşünce Modunda</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[#dcb8ff]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sürü Uyumu: %99.4</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(["ALL", "ONLINE", "REASONING", "STANDBY"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-mono font-semibold transition-all shrink-0 ${
                filterStatus === filter
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid: Sages Cards & Active Sage Details */}
      <div className="relative z-10 mt-4 sm:mt-5 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        {/* Sages Grid (7 cols on lg) */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-7 xl:grid-cols-3">
          {filteredSages.map((sage) => {
            const SageIcon = sage.icon;
            const isSelected = activeSage.id === sage.id;
            const isOnline = sage.status === "ONLINE";
            const isReasoning = sage.status === "REASONING";

            return (
              <div
                key={sage.id}
                onClick={() => setActiveSageId(sage.id)}
                className={`group cursor-pointer relative flex flex-col justify-between rounded-xl border p-3 transition-all duration-300 min-w-0 ${
                  isSelected
                    ? "border-[#00f0ff] bg-[#1a1a24] shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    : "border-[#27272a] bg-[#121216]/80 hover:border-white/20 hover:bg-[#16161e]"
                }`}
                style={{
                  borderTopColor: sage.accentHex,
                  borderTopWidth: isSelected ? "3px" : "2px",
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                        style={{
                          backgroundColor: `${sage.accentHex}20`,
                          color: sage.accentHex,
                        }}
                      >
                        <SageIcon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-300">
                        #{sage.order}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isOnline
                            ? "bg-emerald-400 shadow-[0_0_6px_#10b981]"
                            : isReasoning
                            ? "bg-[#00f0ff] animate-pulse shadow-[0_0_6px_#00f0ff]"
                            : "bg-amber-400/80"
                        }`}
                      />
                      <span
                        style={{
                          color: isOnline ? "#34d399" : isReasoning ? "#00f0ff" : "#fbbf24",
                        }}
                      >
                        {sage.status}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2.5 min-w-0">
                    <h4 className="text-xs font-bold tracking-tight text-white group-hover:text-[#00f0ff] transition-colors truncate">
                      {sage.name}
                    </h4>
                    <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">{sage.role}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#27272a]/60 pt-2 text-[10px] font-mono text-slate-400">
                  <span className="truncate max-w-[50%]">{sage.engine}</span>
                  <span className="text-slate-300 truncate max-w-[50%] text-right">{sage.model.split("/").pop()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Sage Focus Inspection Card (5 cols on lg) */}
        <div className="rounded-xl border border-[#27272a] bg-[#121216]/90 p-3.5 sm:p-4 backdrop-blur-md lg:col-span-5 flex flex-col justify-between min-w-0">
          <div className="space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3 min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div
                  className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${activeSage.accentHex}25`,
                    color: activeSage.accentHex,
                    border: `1px solid ${activeSage.accentHex}40`,
                    boxShadow: `0 0 15px ${activeSage.accentHex}30`,
                  }}
                >
                  <SelectedIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{activeSage.name}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">{activeSage.title} • #{activeSage.order}</p>
                </div>
              </div>

              <span
                className="font-mono text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: `${activeSage.accentHex}15`,
                  color: activeSage.accentHex,
                  border: `1px solid ${activeSage.accentHex}30`,
                }}
              >
                {activeSage.engine}
              </span>
            </div>

            {/* Spec breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-lg border border-[#27272a] bg-[#18181b]/50 p-2 min-w-0">
                <div className="text-[10px] text-slate-400">YAPAY ZEKA MODELİ</div>
                <div className="mt-0.5 font-bold text-white truncate">{activeSage.model}</div>
              </div>
              <div className="rounded-lg border border-[#27272a] bg-[#18181b]/50 p-2 min-w-0">
                <div className="text-[10px] text-slate-400">BAĞLAM PENCERESİ</div>
                <div className="mt-0.5 font-bold text-emerald-400 truncate">{activeSage.contextWindow}</div>
              </div>
            </div>

            {/* Role & Objective */}
            <div className="rounded-lg border border-[#27272a] bg-[#18181b]/40 p-2.5 sm:p-3 space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Stratejik Görev & Yetki Alanı
              </div>
              <p className="text-xs text-slate-200 leading-relaxed break-words">{activeSage.role}</p>
            </div>

            {/* Live Terminal Log for Active Sage */}
            <div className="rounded-lg border border-[#27272a] bg-[#0a0a0f] p-2.5 sm:p-3 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <Terminal className="h-3 w-3 text-[#00f0ff] shrink-0" />
                  SON OTONOM GÖREV İZİ
                </span>
                <span className="text-emerald-400 shrink-0 font-bold">TAMAMLANDI</span>
              </div>
              <p className="font-mono text-xs text-[#00f0ff] break-words">{activeSage.recentTask}</p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#27272a] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="truncate">Otonom Protokol Aktif</span>
            </span>
            <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold text-white hover:bg-white/10 transition-colors shrink-0">
              Görev Ata
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

export default CouncilOfSages;
