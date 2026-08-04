"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertOctagon,
  Lightbulb,
  Coins,
  TrendingUp,
  Settings,
  Mail,
  PieChart,
  Users,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideData {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  bulletPoints: string[];
  metrics?: { label: string; value: string }[];
  highlight?: string;
}

const slideDataTR: SlideData[] = [
  {
    title: "ALPAR AI",
    subtitle: "Yapay Zeka Sorumluluğu İçin Güven Altyapısı",
    icon: Shield,
    bulletPoints: [
      "Yapay zeka hatalarını ve ihlallerini belgeleyen ilk merkeziyetsiz platform.",
      "Yapay zeka sağlayıcıları için bağımsız risk ve şeffaflık derecelendirmesi.",
      "AGPL-3.0 lisanslı açık kaynak kod tabanı ile topluluk denetimi.",
    ],
    highlight: "Sorgulanmayan yapay zeka sistemleri asla daha iyiye gitmez.",
  },
  {
    title: "1. PROBLEM",
    subtitle: "Yapay Zeka Hataları ve Güven Boşluğu",
    icon: AlertOctagon,
    bulletPoints: [
      "Üretken yapay zeka entegrasyonları katlanarak artıyor, ancak risk yönetimi eksik.",
      "Hallüsinasyonlar, veri sızıntıları ve önyargılar şirketler için milyarlarca dolar risk yaratıyor.",
      "AI sistemlerinin kamuya açık bağımsız bir denetim ve hata takip mekanizması yok.",
    ],
    metrics: [
      { label: "AI İhlalleri Artışı", value: "+%320" },
      { label: "Yasal Ceza Riski", value: "$10M+" },
    ],
  },
  {
    title: "2. ÇÖZÜM",
    subtitle: "Topluluk Güdümlü Olay Kaydı ve Güven Skoru",
    icon: Lightbulb,
    bulletPoints: [
      "Doğrulanmış Olay Raporlama: Topluluk tarafından bildirilen ve doğrulanan AI vakaları.",
      "Dinamik Güven Skoru (Trust Score): Sağlayıcıların şeffaflık ve yanıt hızını ölçen 0-100 arası endeks.",
      "PII Guardian Entegrasyonu: Kişisel verilerin otomatik maskelenmesi ile tam KVKK/GDPR uyumu.",
    ],
    highlight: "Güven, şeffaflık ve hesap verebilirlik ile inşa edilir.",
  },
  {
    title: "3. PAZAR FIRSATI",
    subtitle: "AI Uyum ve Risk Yönetimi (TAM / SAM / SOM)",
    icon: PieChart,
    bulletPoints: [
      "AB Yapay Zeka Yasası (EU AI Act) uyumluluk pazarını zorunlu hale getiriyor.",
      "Büyük işletmeler yapay zeka risklerini sigortalamak ve yönetmek zorunda.",
      "Platformumuz, yapay zeka sigortası (AI Insurance) için birincil veri sağlayıcısı olmayı hedefliyor.",
    ],
    metrics: [
      { label: "Toplam Pazar (TAM)", value: "$15 Milyar" },
      { label: "Hedeflenen Pazar (SOM)", value: "$250 Milyon" },
    ],
  },
  {
    title: "4. ÜRÜN VE TEKNOLOJİ",
    subtitle: "Kendini İyileştiren ve Güvenli Altyapı",
    icon: Settings,
    bulletPoints: [
      "Autopilot Modülü: Sunucu eylemleri için circuit breaker, otomatik hata yönetimi ve retry mekanizmaları.",
      "Supabase ve Next.js tabanlı yüksek hızlı sunucusuz (serverless) mimari.",
      "Veri Bütünlüğü: IPFS ve şeffaf veritabanı kayıtları ile kanıt zinciri oluşturma.",
    ],
  },
  {
    title: "5. GELİR MODELİ",
    subtitle: "Veri ve Kurumsal Lisanslama",
    icon: Coins,
    bulletPoints: [
      "Sağlayıcı Portal Abonelikleri: AI üreticileri için resmi yanıt ve düzeltme paneli.",
      "Aktüeryal Veri Satışı: Sigorta şirketlerine AI risk prim analizi için veri akışı.",
      "Kurumsal API Lisansı: Şirketlerin iç AI sistemleri için gerçek zamanlı hata denetim API'si.",
    ],
    metrics: [
      { label: "Pilot Gelir Hedefi", value: "$1.2M ARR" },
      { label: "Brüt Kar Marjı", value: "%85" },
    ],
  },
  {
    title: "6. YOL HARİTASI",
    subtitle: "Büyüme ve Çekiş gücü (Traction)",
    icon: TrendingUp,
    bulletPoints: [
      "Q3 2026: 50+ gerçek veri seti ile soğuk başlangıç aşamasının tamamlanması.",
      "Q4 2026: Lloyd's ve önde gelen AI sigortacıları ile veri ortaklığı pilot çalışması.",
      "Q2 2027: Enterprise API v1 lansmanı ve ilk 10 B2B lisanslı müşterinin kazanılması.",
    ],
    metrics: [
      { label: "Hedeflenen Olay Kaydı", value: "10,000+" },
      { label: "Aktif Kullanıcı Hedefi", value: "100K MAU" },
    ],
  },
  {
    title: "7. EKİP VE HİKAYE",
    subtitle: "Pasaport Skandalından Doğan Fikir",
    icon: Users,
    bulletPoints: [
      "Kurucular, Grok AI'ın pasaport verilerini yanlış yorumlaması krizini bizzat yönetti.",
      "Bu olay, yapay zekanın hesap verebilirliği için bağımsız bir altyapının olmadığını kanıtladı.",
      "Siber güvenlik, hukuk teknolojileri ve yapay zeka etiği alanında deneyimli çekirdek ekip.",
    ],
  },
  {
    title: "8. YATIRIM TALEBİ (THE ASK)",
    subtitle: "Tohum Yatırım Turu (Seed Round)",
    icon: Compass,
    bulletPoints: [
      "18 aylık ürün geliştirme ve pazar genişlemesi için $500K tohum yatırım.",
      "Hedefler: Lloyds veri ortaklığını tamamlamak, 10k doğrulanmış vaka barajını aşmak.",
      "Teklif detayları ve SAFE sözleşmeleri için yatırımcı ekibimizle iletişime geçin.",
    ],
    metrics: [
      { label: "Yatırım Hedefi", value: "$500,000" },
      { label: "Runway (Süre)", value: "18 Ay" },
    ],
  },
  {
    title: "9. İLETİŞİM",
    subtitle: "Geleceğin Yapay Zeka Güvenliğini Birlikte İnşa Edelim",
    icon: Mail,
    bulletPoints: [
      "Detaylı finansal projeksiyonlar ve pitch deck PDF'i için bize ulaşın.",
      "E-posta: invest@alparai.com",
      "Merkez: Frankfurt, Almanya (fra1)",
    ],
    highlight: "Yapay zeka devriminin güven katmanında yerinizi alın.",
  },
];

const slideDataEN: SlideData[] = [
  {
    title: "ALPAR AI",
    subtitle: "Trust Infrastructure for AI Accountability",
    icon: Shield,
    bulletPoints: [
      "The first decentralized platform documenting AI incidents and failures.",
      "Independent risk and transparency rating (Trust Score) for AI providers.",
      "AGPL-3.0 licensed open-source codebase for community audit.",
    ],
    highlight: "AI systems that are never questioned never get better.",
  },
  {
    title: "1. THE PROBLEM",
    subtitle: "AI Incidents and the Trust Deficit",
    icon: AlertOctagon,
    bulletPoints: [
      "Generative AI integrations are growing exponentially, but risk management is lagging.",
      "Hallucinations, data leaks, and biases cost enterprises billions in liability.",
      "There is no independent, public audit and issue tracking mechanism for AI systems.",
    ],
    metrics: [
      { label: "AI Incident Growth", value: "+320%" },
      { label: "Liability Risk", value: "$10M+" },
    ],
  },
  {
    title: "2. THE SOLUTION",
    subtitle: "Community-driven Incident Registry & Trust Score",
    icon: Lightbulb,
    bulletPoints: [
      "Verified Incident Reporting: AI failures reported and validated by the community.",
      "Dynamic Trust Score: A 0-100 index measuring providers' responsiveness and safety.",
      "PII Guardian: Auto-masking of sensitive data for complete GDPR/KVKK compliance.",
    ],
    highlight: "Trust is built with transparency and accountability.",
  },
  {
    title: "3. MARKET OPPORTUNITY",
    subtitle: "AI Compliance and Risk Management (TAM / SAM / SOM)",
    icon: PieChart,
    bulletPoints: [
      "The EU AI Act mandates compliance and audit trails for high-risk AI applications.",
      "Enterprises must insure and manage their operational AI liability risks.",
      "ALPAR AI aims to be the primary actuarial data provider for AI insurance.",
    ],
    metrics: [
      { label: "Total Addressable Market", value: "$15 Billion" },
      { label: "Target Market (SOM)", value: "$250 Million" },
    ],
  },
  {
    title: "4. PRODUCT & TECH",
    subtitle: "Self-healing & Secure Architecture",
    icon: Settings,
    bulletPoints: [
      "Autopilot Module: Circuit breaker, automatic error propagation, and retry mechanics.",
      "High-speed serverless architecture built on Next.js and Supabase.",
      "Chain of Evidence: IPFS and transparent database records for absolute integrity.",
    ],
  },
  {
    title: "5. BUSINESS MODEL",
    subtitle: "Data & Enterprise Licensing",
    icon: Coins,
    bulletPoints: [
      "Provider Portal: Subscriptions for AI creators to claim and officially respond to incidents.",
      "Actuarial Data Feed: Premium risk data licensing for cyber and AI liability insurers.",
      "Enterprise API: Real-time model safety and incident audit APIs for internal corporate usage.",
    ],
    metrics: [
      { label: "Target ARR", value: "$1.2M ARR" },
      { label: "Gross Margin", value: "85%" },
    ],
  },
  {
    title: "6. ROADMAP",
    subtitle: "Growth & Traction Milestones",
    icon: TrendingUp,
    bulletPoints: [
      "Q3 2026: Out-of-stealth launch with 50+ seed incidents.",
      "Q4 2026: Actuarial data partnership pilot with Lloyd's and cyber insurers.",
      "Q2 2027: Enterprise API v1 release and first 10 B2B licensed customers.",
    ],
    metrics: [
      { label: "Target Incidents", value: "10,000+" },
      { label: "Active Users Target", value: "100K MAU" },
    ],
  },
  {
    title: "7. TEAM & FOUNDING STORY",
    subtitle: "Born Out of the Grok Passport Incident",
    icon: Users,
    bulletPoints: [
      "Founders directly managed the crisis when Grok AI misread passport details.",
      "This proved the urgent need for a public, independent registry for AI accountability.",
      "Core team with deep background in cyber security, legal tech, and AI ethics.",
    ],
  },
  {
    title: "8. THE ASK",
    subtitle: "Seed Investment Round",
    icon: Compass,
    bulletPoints: [
      "$500K seed round to fund 18 months of product development and partnership growth.",
      "Milestones: Finalize Lloyd's data partnership, reach 10k verified incidents.",
      "Contact our investment team for deal terms and SAFE agreements.",
    ],
    metrics: [
      { label: "Investment Target", value: "$500,000" },
      { label: "Runway", value: "18 Months" },
    ],
  },
  {
    title: "9. CONTACT",
    subtitle: "Join the Future of AI Accountability",
    icon: Mail,
    bulletPoints: [
      "Reach out to request financial projections and pitch deck PDF.",
      "Email: invest@alparai.com",
      "HQ: Frankfurt, Germany (fra1)",
    ],
    highlight: "Secure your place in the trust layer of the AI revolution.",
  },
];

export function InvestPresentation({ locale }: { locale: string }) {
  const slides = locale === "tr" ? slideDataTR : slideDataEN;
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = useCallback(() => {
    setCurrentSlide((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrentSlide((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  const slide = slides[currentSlide];
  if (!slide) return null;
  const Icon = slide.icon;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Pitch Deck Card */}
      <div className="bg-glass border-brand-500/20 relative flex min-h-[500px] flex-col justify-between overflow-hidden rounded-2xl border p-8 shadow-2xl backdrop-blur-lg sm:p-12">
        {/* Decorative background glow */}
        <div className="from-brand-500/10 to-brand-500/0 absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br blur-3xl" />
        <div className="from-accent-500/5 to-accent-500/0 absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr blur-3xl" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 flex-1 space-y-6"
          >
            {/* Slide Header */}
            <div className="flex items-center gap-4">
              <div className="bg-brand-500/10 border-brand-500/30 text-brand-400 flex h-14 w-14 items-center justify-center rounded-2xl border">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <span className="text-brand-400 text-xs font-bold tracking-widest uppercase">
                  {locale === "tr"
                    ? `SLAYT ${currentSlide + 1} / ${slides.length}`
                    : `SLIDE ${currentSlide + 1} / ${slides.length}`}
                </span>
                <h2 className="text-fg-primary text-2xl font-black tracking-tight sm:text-3xl">
                  {slide.title}
                </h2>
              </div>
            </div>

            {/* Slide Subtitle */}
            <p className="text-brand-400/90 text-sm font-semibold tracking-wide uppercase sm:text-base">
              {slide.subtitle}
            </p>

            {/* Bullet Points */}
            <ul className="space-y-3 pt-2">
              {slide.bulletPoints.map((point, index) => (
                <li
                  key={index}
                  className="text-fg-secondary flex items-start gap-3 text-sm leading-relaxed sm:text-base"
                >
                  <span className="bg-brand-400 mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Highlights or Metrics */}
            {slide.highlight && (
              <div className="border-brand-500/30 bg-brand-500/5 rounded-r-md border-l-2 py-2.5 pr-2 pl-4">
                <p className="text-fg-primary text-sm italic sm:text-base">"{slide.highlight}"</p>
              </div>
            )}

            {slide.metrics && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {slide.metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="border-border-subtle bg-bg-secondary/40 rounded-xl border p-4 text-center"
                  >
                    <p className="text-fg-muted text-xs font-semibold uppercase">{metric.label}</p>
                    <p className="text-brand-400 mt-1 text-2xl font-black">{metric.value}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="border-border-subtle/50 relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          {/* Progress Indicators */}
          <div className="flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-brand-500 w-6"
                    : "bg-bg-tertiary hover:bg-fg-muted/40 w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prev}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              {locale === "tr" ? "Geri" : "Back"}
            </Button>
            <Button variant="secondary" size="sm" onClick={next}>
              {locale === "tr" ? "İleri" : "Next"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <p className="text-fg-muted text-center text-xs">
        {locale === "tr"
          ? "Slaytları değiştirmek için yön tuşlarını (← / →) kullanabilirsiniz."
          : "You can use keyboard arrows (← / →) to navigate the slides."}
      </p>
    </div>
  );
}
