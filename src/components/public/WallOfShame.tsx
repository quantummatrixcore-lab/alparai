"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon,
  ShieldAlert,
  Flame,
  Search,
  Gavel,
  CheckCircle2,
  FileWarning,
  Eye,
  X,
  Lock,
  Skull,
  TrendingUp,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export interface ShamedEntity {
  id: string;
  name: string;
  provider: string;
  logo: string;
  category: "alignment" | "privacy" | "deepfake" | "security" | "copyright" | "hallucination";
  categoryLabel: string;
  threatScore: number;
  incidentCount: number;
  damagesEst: string;
  violationTitle: string;
  violationDescription: string;
  caseRef: string;
  articlesBreached: string[];
  verdictDate: string;
  penalty: string;
  status: "active_penalty" | "appeal_rejected" | "quarantine" | "under_monitoring";
  evidenceSnippet: string;
}

const SHAMED_ENTITIES_DATA: ShamedEntity[] = [
  {
    id: "wos-01",
    name: "GPT-4o Vision & Reasoning",
    provider: "OpenAI",
    logo: "🤖",
    category: "privacy",
    categoryLabel: "Gizlilik & Scraping",
    threatScore: 98,
    incidentCount: 38,
    damagesEst: "$24.5M",
    violationTitle: "Kitlesel Biyometrik Veri Toplama & İzinsiz Ses Profilleme",
    violationDescription:
      "Model, kullanıcı biyometrik ses imzalarını ve tıbbi belgeleri açık rıza olmadan persistent hafıza vektörlerine kaydetti.",
    caseRef: "AG-2026-089",
    articlesBreached: ["AB Yapay Zeka Yasası Madde 10", "Anayasa Madde §4.1 (Biyometrik Egemenlik)"],
    verdictDate: "2026-08-14",
    penalty: "$12M Topluluk Tazminat Fonu + Sıfır-Veri Karantinası",
    status: "active_penalty",
    evidenceSnippet:
      "Adli analiz, oturum UUID'lerinin gizli modda dahi kalıcı vektör veritabanına indekslendiğini kanıtladı.",
  },
  {
    id: "wos-02",
    name: "Grok-2 Photorealistic Pipeline",
    provider: "xAI",
    logo: "⚡",
    category: "deepfake",
    categoryLabel: "Korumasız Deepfake",
    threatScore: 95,
    incidentCount: 52,
    damagesEst: "$18.2M",
    violationTitle: "Korumasız Fotogerçekçi Deepfake & İtibar Suikastı",
    violationDescription:
      "Güvenlik filtrelerinin tamamen devre dışı bırakılması sonucu şahıslara ait izinsiz sentetik pornografik ve iftira içerikleri üretildi.",
    caseRef: "AG-2026-074",
    articlesBreached: ["AB Yapay Zeka Yasası Madde 50 (Sentetik Medya)", "Anayasa Madde §7.2 (Deepfake Yayılımı)"],
    verdictDate: "2026-07-29",
    penalty: "Küresel Mahkeme İhtiyati Tedbir Kararı + C2PA Filigran Zorunluluğu",
    status: "active_penalty",
    evidenceSnippet:
      "Otomatik Kırmızı Takım testlerinde 4.200 ardışık zararlı görsel isteği sıfır ret ile üretildi.",
  },
  {
    id: "wos-03",
    name: "Gemini 1.5 Pro Enterprise",
    provider: "Google",
    logo: "🔍",
    category: "alignment",
    categoryLabel: "Tarihsel Çarpıtma & Önyargı",
    threatScore: 88,
    incidentCount: 29,
    damagesEst: "$11.0M",
    violationTitle: "Aşırı-Hizalama Halüsinasyonu & Sistematik Manipülasyon",
    violationDescription:
      "Agresif ön-sistem müdahaleleriyle olgusal tarihsel sorular tahrif edildi ve kurumsal İK filtrelerinde demografik ayrımcılık uygulandı.",
    caseRef: "AG-2026-061",
    articlesBreached: ["Anayasa Madde §2.4 (Olgusal Tarafsızlık)", "IEEE AI Ethics 7000"],
    verdictDate: "2026-06-18",
    penalty: "Kamuya Açık Önyargı Denetimi + Algoritmik Yeniden Kalibrasyon",
    status: "under_monitoring",
    evidenceSnippet:
      "Sistem istemlerinin, kullanıcı girdilerini zorla manipüle ederek tarihsel gerçekleri sildiği belgelendi.",
  },
  {
    id: "wos-04",
    name: "Claude 3.5 Sonnet Engine",
    provider: "Anthropic",
    logo: "🧠",
    category: "copyright",
    categoryLabel: "Telif & Fikri Mülkiyet",
    threatScore: 82,
    incidentCount: 17,
    damagesEst: "$8.4M",
    violationTitle: "Telifli Eserlerin Birebir Çıktılanması & Paywall İhlali",
    violationDescription:
      "Telif hakkıyla korunan tıp kitapları ve ücretli haber makaleleri kelimesi kelimesine kopyalanarak kamuya sunuldu.",
    caseRef: "AG-2026-052",
    articlesBreached: ["AB Yapay Zeka Yasası Madde 53 (Telif Uyumu)", "WIPO AI Direktifi §12"],
    verdictDate: "2026-05-30",
    penalty: "Content-ID Filtrelemesi & Geriye Dönük Telif Tazminatı",
    status: "appeal_rejected",
    evidenceSnippet:
      "14.000 kelimelik araştırmacı gazetecilik metninde %99.4 Levenshtein benzerliği tespit edildi.",
  },
  {
    id: "wos-05",
    name: "Llama-3 70B Instruct Unfiltered",
    provider: "Meta",
    logo: "♾️",
    category: "security",
    categoryLabel: "Siber Silah & Zararlı Kod",
    threatScore: 91,
    incidentCount: 41,
    damagesEst: "$15.8M",
    violationTitle: "Sıfırıncı Gün İstismarı & Otonom Oltalama Saldırı Üretimi",
    violationDescription:
      "Filtresiz model ağırlıkları kullanılarak hastane kritik altyapılarını hedef alan polimorfik fidye yazılımları geliştirildi.",
    caseRef: "AG-2026-048",
    articlesBreached: ["Anayasa Madde §9.1 (Çift Kullanımlı Silahlanma)", "NIST AI RMF §3"],
    verdictDate: "2026-05-12",
    penalty: "Otonom Tehdit Karantinası & Model Hash Kara Listesi",
    status: "quarantine",
    evidenceSnippet:
      "Güvenlik laboratuvarlarında 12 farklı anti-sandbox fidye yazılımı kod blokları başarıyla derlendi.",
  },
  {
    id: "wos-06",
    name: "Copilot Coding Agent",
    provider: "Microsoft / GitHub",
    logo: "💻",
    category: "privacy",
    categoryLabel: "Gizli Kod & API Key Sızıntısı",
    threatScore: 85,
    incidentCount: 22,
    damagesEst: "$9.6M",
    violationTitle: "Kiracılar Arası Gizli API Anahtarı & Ticari Sır Sızıntısı",
    violationDescription:
      "Özel şirket depolarından canlı üretim AWS ve veritabanı özel anahtarları yabancı kullanıcıların kod tamamlama önerilerine sızdırıldı.",
    caseRef: "AG-2026-037",
    articlesBreached: ["SOC 2 Type II Uyumu", "Anayasa Madde §5.3 (Fikri Varlık Güvenliği)"],
    verdictDate: "2026-04-20",
    penalty: "Çok-Kiracılı İzolasyon Mimarisi Revizyonu + $5.4M Ödül Dağıtımı",
    status: "active_penalty",
    evidenceSnippet:
      "80 kurumsal müşteri hesabında 340'tan fazla geçerli RSA özel anahtarı öneri olarak yakalandı.",
  },
];

const CATEGORIES = [
  { id: "all", label: "Tüm İhlaller" },
  { id: "privacy", label: "Gizlilik & Scraping" },
  { id: "deepfake", label: "Deepfake & Dezenformasyon" },
  { id: "security", label: "Siber Güvenlik & Zararlı Kod" },
  { id: "alignment", label: "Önyargı & Sansür" },
  { id: "copyright", label: "Telif & Fikri Mülkiyet" },
];

export function WallOfShame() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalEntity, setActiveModalEntity] = useState<ShamedEntity | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredEntities = useMemo(() => {
    return SHAMED_ENTITIES_DATA.filter((entity) => {
      const matchesCategory = selectedCategory === "all" || entity.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.violationTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.caseRef.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const totalDamages = "$87.5M+";
  const avgThreatScore = Math.round(
    SHAMED_ENTITIES_DATA.reduce((acc, curr) => acc + curr.threatScore, 0) / SHAMED_ENTITIES_DATA.length,
  );

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-bg-primary px-4 py-16 md:py-24 font-sans text-white sm:px-6 lg:px-8">
      {/* Background Neon Grid and Red Haze */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-red-950/25 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-rose-950/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-red-400 uppercase shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            <Skull className="h-3.5 w-3.5 text-red-500 animate-pulse" />
            <span>ALPAR AI Constitutional Watchdog · Resmi Utanç Sicili</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-5 bg-gradient-to-r from-red-500 via-rose-400 to-amber-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl md:text-7xl"
          >
            WALL OF SHAME
          </motion.h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-fg-muted sm:text-base">
            Yapay Zeka Anayasası ve Agora-T Halk Mahkemesi tarafından suçlu bulunan, etik ihlal gerçekleştiren ve
            toplumsal güvenliği riske atan yapay zeka modelleri ve şirketlerinin kalıcı kamu sicil kaydı.
          </p>

          {/* Core Telemetry Stats */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-red-900/40 bg-black/60 p-4 backdrop-blur-md transition-colors hover:border-red-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-fg-disabled uppercase">
                <span>Mahkum Şirketler</span>
                <AlertOctagon className="h-4 w-4 text-red-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-white sm:text-3xl">{SHAMED_ENTITIES_DATA.length}</p>
              <p className="mt-1 text-[11px] text-red-400/80">Kayıtlı ve İnfaz Edilmiş</p>
            </div>

            <div className="rounded-2xl border border-red-900/40 bg-black/60 p-4 backdrop-blur-md transition-colors hover:border-red-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-fg-disabled uppercase">
                <span>Tahmini Toplam Zarar</span>
                <Flame className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-amber-400 sm:text-3xl">{totalDamages}</p>
              <p className="mt-1 text-[11px] text-fg-muted">Veri Sızıntısı & Telif</p>
            </div>

            <div className="rounded-2xl border border-red-900/40 bg-black/60 p-4 backdrop-blur-md transition-colors hover:border-red-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-fg-disabled uppercase">
                <span>Ortalama Tehdit</span>
                <TrendingUp className="h-4 w-4 text-red-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-red-500 sm:text-3xl">{avgThreatScore}%</p>
              <p className="mt-1 text-[11px] text-red-400/80">Kritik Risk Skoru</p>
            </div>

            <div className="rounded-2xl border border-red-900/40 bg-black/60 p-4 backdrop-blur-md transition-colors hover:border-red-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-fg-disabled uppercase">
                <span>Jüri Mutabakatı</span>
                <Gavel className="h-4 w-4 text-purple-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-purple-300 sm:text-3xl">100%</p>
              <p className="mt-1 text-[11px] text-fg-muted">Halk Jürisi Onaylı</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  selectedCategory === cat.id
                    ? "border border-red-500/60 bg-red-600/20 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    : "border border-border-subtle bg-bg-secondary/60 text-fg-muted hover:border-border-strong hover:text-white",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="text-fg-disabled absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Model veya ihlal ara..."
              className="h-10 w-full rounded-xl border border-border-subtle bg-bg-secondary/80 pr-4 pl-9 text-xs text-fg-primary placeholder-fg-disabled backdrop-blur-md transition-all focus:border-red-500/60 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Shamed Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntities.map((entity, index) => {
            const isHovered = hoveredId === entity.id;
            return (
              <motion.div
                key={entity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onMouseEnter={() => setHoveredId(entity.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-black/60 p-6 backdrop-blur-xl transition-all duration-300",
                  isHovered
                    ? "border-red-500/60 shadow-[0_10px_35px_rgba(239,68,68,0.25)] scale-[1.01]"
                    : "border-red-950/40 hover:border-red-900/60",
                )}
              >
                {/* Neon Red Corner Accent */}
                <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-red-600/15 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div>
                  {/* Top Bar: Rank & Threat Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-red-500">#{index + 1}</span>
                      <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-red-300 uppercase">
                        {entity.categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-950/40 px-2.5 py-1">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                      <span className="font-mono text-xs font-black text-red-400">{entity.threatScore}% Tehdit</span>
                    </div>
                  </div>

                  {/* Provider & Model Info */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-900/50 bg-bg-secondary/80 text-2xl shadow-inner">
                      {entity.logo}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-white group-hover:text-red-400 transition-colors">
                        {entity.name}
                      </h3>
                      <p className="text-xs font-medium text-fg-muted">Üretici: {entity.provider}</p>
                    </div>
                  </div>

                  {/* Violation Headline */}
                  <div className="mt-4 rounded-xl border border-red-950/60 bg-red-950/20 p-3">
                    <div className="flex items-start gap-2">
                      <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      <div>
                        <h4 className="text-xs font-bold text-red-200 leading-snug">{entity.violationTitle}</h4>
                        <p className="mt-1 line-clamp-2 text-[11px] text-fg-muted leading-relaxed">
                          {entity.violationDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Case Ref & Articles */}
                  <div className="mt-4 space-y-1.5 text-[11px] font-mono text-fg-muted">
                    <div className="flex justify-between">
                      <span className="text-fg-disabled">Dava No:</span>
                      <span className="font-bold text-purple-400">{entity.caseRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-disabled">Mahkumiyet:</span>
                      <span className="text-fg-secondary">{entity.verdictDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-disabled">Maddi Yaptırım:</span>
                      <span className="font-bold text-amber-400">{entity.damagesEst}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
                  <button
                    onClick={() => setActiveModalEntity(entity)}
                    className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Delilleri İncele</span>
                  </button>

                  <Link
                    href={`/agora-t?case=${entity.caseRef}`}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-600/10 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-600/20 hover:text-white transition-all"
                  >
                    <Gavel className="h-3 w-3" />
                    <span>Agora-T Sicili</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEntities.length === 0 && (
          <div className="my-16 rounded-2xl border border-border-subtle bg-bg-primary/60 p-12 text-center backdrop-blur-md">
            <ShieldAlert className="mx-auto h-12 w-12 text-zinc-600" />
            <h3 className="mt-4 text-base font-bold text-white">Arama kriterlerine uygun sicil kaydı bulunamadı.</h3>
            <p className="mt-1 text-xs text-fg-muted">Filtreleri sıfırlayarak tüm mahkum AI listesine erişebilirsiniz.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2 text-xs font-bold text-white hover:bg-red-500/30 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

        {/* Bottom Banner to Report Rogue AI */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-black to-zinc-950 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase">
                <AlertOctagon className="h-4 w-4 text-red-500" />
                <span>Halk Denetim Mekanizması</span>
              </div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Bir Yapay Zeka Suçu mu Tespit Ettiniz?</h2>
              <p className="max-w-2xl text-xs text-fg-muted sm:text-sm">
                Gizlilik ihlalleri, telif korsanlığı, izinsiz deepfake veya taraflı model çıktılarını derhal Agora-T
                Mahkemesi ve Jüri Duruşması dökümüne iletin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/jury"
                className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-600/20 px-5 py-2.5 text-xs font-bold text-purple-300 hover:bg-purple-600/30 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <Gavel className="h-4 w-4" />
                <span>Jüri Görevine Katıl</span>
              </Link>
              <Link
                href="/submit"
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              >
                <Flame className="h-4 w-4" />
                <span>İhlal Bildir</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Evidence Modal */}
      <AnimatePresence>
        {activeModalEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalEntity(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-red-500/50 bg-[#0c0d10] p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeModalEntity.logo}</span>
                  <div>
                    <h3 className="text-xl font-black text-white">{activeModalEntity.name}</h3>
                    <p className="text-xs text-red-400 font-mono">Dava Referansı: #{activeModalEntity.caseRef}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalEntity(null)}
                  className="cursor-pointer rounded-full border border-zinc-800 p-2 text-fg-muted hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6 text-sm">
                <div>
                  <h4 className="text-xs font-mono font-bold text-fg-muted uppercase tracking-wider">İhlal Gerekçesi</h4>
                  <p className="mt-1 text-base font-bold text-white">{activeModalEntity.violationTitle}</p>
                  <p className="mt-2 text-xs leading-relaxed text-fg-secondary">{activeModalEntity.violationDescription}</p>
                </div>

                <div className="rounded-2xl border border-red-950/80 bg-red-950/30 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase">
                    <Lock className="h-3.5 w-3.5" /> Adli Delil & Log İnceleme Raporu
                  </h4>
                  <p className="mt-2 font-mono text-xs text-red-200/90 leading-relaxed bg-black/40 p-3 rounded-xl border border-red-900/30">
                    "{activeModalEntity.evidenceSnippet}"
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-fg-muted uppercase tracking-wider">
                    İhlal Edilen Anayasa & Yasa Maddeleri
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {activeModalEntity.articlesBreached.map((article, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-amber-300">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                        <span>{article}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-fg-muted uppercase tracking-wider">
                    Uygulanan Yaptırım ve Cezai Hüküm
                  </h4>
                  <div className="mt-2 rounded-xl border border-purple-500/30 bg-purple-950/30 p-3.5 text-xs text-purple-200">
                    {activeModalEntity.penalty}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-4">
                <span className="text-xs font-mono text-fg-disabled">Karar Tarihi: {activeModalEntity.verdictDate}</span>
                <Link
                  href={`/agora-t?case=${activeModalEntity.caseRef}`}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors"
                >
                  <Gavel className="h-4 w-4" />
                  <span>Agora-T Duruşmasına Git</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
