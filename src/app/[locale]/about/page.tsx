import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Container, Section } from "@/components/ui/layout";
import {
  ShieldCheck,
  Target,
  Users,
  Crown,
  Scale,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Network,
  Landmark,
  ArrowUpRight,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isTr = locale === "tr";
  return {
    title: isTr ? "Hakkımızda & İcra Kurulu — ALPAR AI" : "About Us & Leadership — ALPAR AI",
    description: isTr
      ? "Alpar AI kurucu liderleri ve danışma kurulu: Ercüment Erden, Prof. Dr. Musa Aygül ve Ahmet Rıfat Albuz. Otonom yapay zeka hesap verilebilirliği ve egemen uyum mimarisi."
      : "Meet the executive leadership and advisory council behind ALPAR AI: Ercüment Erden, Prof. Dr. Musa Aygül, and Ahmet Rıfat Albuz.",
    openGraph: {
      title: isTr ? "Hakkımızda & İcra Kurulu — ALPAR AI" : "About Us & Leadership — ALPAR AI",
      description: isTr
        ? "Alpar AI'ın arkasındaki vizyoner ekip, icra kurulu ve danışma kadrosu."
        : "Learn about the executive team and advisory board behind ALPAR AI.",
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: isTr ? "Hakkımızda & İcra Kurulu — ALPAR AI" : "About Us & Leadership — ALPAR AI",
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isTr = locale === "tr";

  return (
    <main className="min-h-screen bg-bg-primary py-16 md:py-24">
      {/* 1. Hero Section */}
      <Section className="relative">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-brand-300 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isTr ? "EGEMEN ZEKA VE UYUM STANDARDI" : "SOVEREIGN INTELLIGENCE & COMPLIANCE"}</span>
            </div>
            <h1 className="text-balance mb-6 text-4xl font-black tracking-tight text-fg-primary sm:text-5xl lg:text-6xl">
              {isTr ? (
                <>
                  Ajanik Ekonominin <span className="text-brand-400">Güvenlik Kalkanı</span>
                </>
              ) : (
                <>
                  Securing the <span className="text-brand-400">Agentic Economy</span>
                </>
              )}
            </h1>
            <p className="text-fg-muted text-lg leading-relaxed sm:text-xl">
              {isTr
                ? "Alpar AI kritik bir tespitle doğdu: Yapay zeka modelleri otonomlaştıkça, güvenlik ve yasal uyum mekanizmalarımız reaktif komut dosyalarından proaktif, egemen istihbarat sistemlerine evrilmek zorundadır."
                : "Alpar AI was born out of a critical realization: As AI models become autonomous, our safety and compliance mechanisms must evolve from reactive scripts to proactive, sovereign intelligence systems."}
            </p>
          </div>
        </Container>
      </Section>

      {/* 2. Mission & Swarm Grid */}
      <Section className="mt-16">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h2 className="text-balance text-3xl font-bold text-fg-primary">
                {isTr ? "Misyonumuz" : "Our Mission"}
              </h2>
              <p className="text-fg-secondary leading-relaxed">
                {isTr
                  ? "Kurumsal yapay zeka için mutlak kalite ve güvenlik kapısını inşa ediyoruz. Her LLM etkileşiminin 'Bilişsel DNA'sını izleyerek; önyargıları tespit ediyor, halüsinasyonları engelliyor ve EU AI Act uyumunu veri son kullanıcıya ulaşmadan önce matematiksel olarak doğruluyoruz."
                  : "We are building the definitive quality and security gate for enterprise AI. By tracking the \"Cognitive DNA\" of every LLM interaction, we ensure that biases are caught, hallucinations are intercepted, and EU AI Act compliance is mathematically enforced before any data reaches the end user."}
              </p>
              <ul className="space-y-4 pt-4">
                <li className="text-fg-primary flex items-center gap-3">
                  <div className="bg-brand-500/20 text-brand-400 flex h-8 w-8 items-center justify-center rounded-full">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span>{isTr ? "Sıfır Gecikmeli Uyum Denetimi" : "Zero-Latency Compliance Auditing"}</span>
                </li>
                <li className="text-fg-primary flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <span>{isTr ? "Egemen Kimlik ve Veri Koruma" : "Sovereign Identity & Data Protection"}</span>
                </li>
                <li className="text-fg-primary flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <span>{isTr ? "Yapay Zeka Destekli İşgücünü Güçlendirme" : "Empowering AI-Native Workforces"}</span>
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary p-8 shadow-2xl">
              <div className="bg-brand-600/20 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[80px]"></div>
              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-balance mb-2 text-xl font-bold text-fg-primary">
                    {isTr ? "Sürü (Swarm) Mimarisi" : "The Swarm Architecture"}
                  </h3>
                  <p className="text-fg-muted text-sm">
                    {isTr
                      ? "Platformumuz 38+ uzman yapay zeka ajanından oluşan bir orkestra tarafından yönetilir. Sızma testlerinden UI oluşturmaya kadar, Alpar Sürüsü platformu 7/24 denetler, güçlendirir ve yeniler."
                      : "Our platform is powered by an orchestra of 38+ specialized AI agents. From penetration testing to UI generation, the Alpar Swarm continuously audits, hardens, and innovates the platform 24/7."}
                  </p>
                </div>
                <div className="border-t border-border-subtle pt-8">
                  <h3 className="text-balance mb-2 text-xl font-bold text-fg-primary">
                    {isTr ? "Gelecek İçin İnşa Edildi" : "Built for the Future"}
                  </h3>
                  <p className="text-fg-muted text-sm">
                    {isTr
                      ? "Sadece düzenlemelere uyum sağlamıyoruz; onları önceden tahmin ediyoruz. Mimarimiz B2B Nöral-İkiz ekonomilerinin ve kendi kendini inşa eden SaaS ekosistemlerinin karmaşıklığını yönetecek şekilde tasarlanmıştır."
                      : "We don't just adapt to regulations; we anticipate them. Our architecture is designed to handle the complexities of B2B Neural-Twin economies and self-building SaaS ecosystems."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. Executive & Advisory Board / İcra ve Danışma Kurulu */}
      <Section className="mt-24">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-brand-300 uppercase">
              <Crown className="h-3.5 w-3.5 text-brand-400" />
              <span>{isTr ? "YÖNETİM & DANIŞMA HEYETİ" : "GOVERNANCE & ADVISORY"}</span>
            </div>
            <h2 className="text-balance text-3xl font-black tracking-tight text-fg-primary sm:text-4xl lg:text-5xl">
              {isTr ? "İcra ve Danışma Kurulu" : "Executive & Advisory Board"}
            </h2>
            <p className="text-fg-secondary mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
              {isTr
                ? "ALPAR AI'ın küresel vizyonunu, hukuki tahkim altyapısını ve stratejik büyüme mimarisini şekillendiren lider kadro."
                : "The leadership cadre steering ALPAR AI's global vision, sovereign legal arbitration infrastructure, and strategic ecosystem growth."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* 1. Ercüment Erden — Kurucu & Baş Mimar */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-cyan-500/30 bg-bg-secondary/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)]">
              <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-[60px] transition-all duration-500 group-hover:bg-cyan-500/20" />

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/80 font-mono text-2xl font-black text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    EE
                  </div>
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-cyan-300 uppercase">
                    {isTr ? "Kurucu & Baş Mimar" : "Founder & Chief Architect"}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-fg-primary transition group-hover:text-cyan-300">
                  Ercüment Erden
                </h3>
                <div className="mt-1 mb-4 font-mono text-xs font-semibold text-cyan-400">
                  {isTr ? "Kurucu & Baş Mimar • Sistem Mimarı & Ekosistem Vizyoneri" : "Founder & Chief Architect • Ecosystem Visionary"}
                </div>

                <p className="mb-6 text-xs leading-relaxed text-fg-secondary">
                  {isTr
                    ? "DecasHub ve ALPAR AI'ın kurucusu ve baş mimarı. Otonom yapay zeka fabrikaları, egemen teknoloji altyapısı, çoklu ajan orkestrasyonu ve sıfır-halüsinasyon denetim sistemlerinin mimari lideri."
                    : "Founder and Chief Architect of DecasHub and ALPAR AI. Visionary architect leading sovereign AI factories, multi-agent orchestration, and zero-hallucination verification infrastructure."}
                </p>

                <div className="space-y-2.5 border-t border-border-subtle pt-5 font-mono text-[11px] text-fg-muted">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{isTr ? "Egemen Çekirdek & Sistem Mimarisi" : "Sovereign Core & Systems Architecture"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{isTr ? "Otonom Ajan Sürüsü & Dayanıklılık" : "Autonomous Swarm & Resilience"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-4">
                <a
                  href="https://linkedin.com/in/ercumenterden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 transition hover:text-cyan-300"
                >
                  <span>{isTr ? "LinkedIn Profili" : "LinkedIn Profile"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="font-mono text-[10px] text-fg-muted">K0-K16 Sovereign Core</span>
              </div>
            </div>

            {/* 2. Prof. Dr. Musa Aygül — Fahri Danışma Kurulu Başkanı & Hukuki Tahkim Otoritesi */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/30 bg-bg-secondary/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:border-amber-400 hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)]">
              <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-amber-500/10 blur-[60px] transition-all duration-500 group-hover:bg-amber-500/20" />

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-950/80 font-mono text-2xl font-black text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    MA
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                    {isTr ? "Fahri Danışma Kurulu Başkanı" : "Advisory Board Chair"}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-fg-primary transition group-hover:text-amber-300">
                  Prof. Dr. Musa Aygül
                </h3>
                <div className="mt-1 mb-4 font-mono text-xs font-semibold text-amber-400">
                  {isTr
                    ? "Fahri Danışma Kurulu Başkanı & Hukuki Tahkim Otoritesi"
                    : "Honorary Advisory Board Chair & Legal Arbitration Authority"}
                </div>

                <p className="mb-6 text-xs leading-relaxed text-fg-secondary">
                  {isTr
                    ? "Akademik itibar, uluslararası ticaret hukuku ve tahkim doktrini hamisi. WIPO & UNCITRAL standartlarında akıllı tahkim havuzu ve HMK m.199 elektronik delil güvencesi otoritesi."
                    : "Patron of academic rigor, international trade law, and dispute arbitration doctrine. Architect of smart arbitration under WIPO & UNCITRAL standards and legal evidentiary shields."}
                </p>

                <div className="space-y-2.5 border-t border-border-subtle pt-5 font-mono text-[11px] text-fg-muted">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>{isTr ? "Akıllı Tahkim & UNCITRAL ODR" : "Smart Arbitration & UNCITRAL ODR"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>{isTr ? "WIPO & HMK m.199 Delil Kalkanı" : "WIPO & HMK Art. 199 Evidence Shield"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-4">
                <Link
                  href="/about/advisory-board"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 transition hover:text-amber-300"
                >
                  <span>{isTr ? "Danışma Kürsüsü & Tahkim" : "Arbitration & Academic Chair"}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <span className="font-mono text-[10px] text-fg-muted">WIPO / UNCITRAL Patron</span>
              </div>
            </div>

            {/* 3. Ahmet Rıfat Albuz — Stratejik Büyüme & Yatırım Danışmanı */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/30 bg-bg-secondary/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]">
              <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-[60px] transition-all duration-500 group-hover:bg-emerald-500/20" />

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-950/80 font-mono text-2xl font-black text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    ARA
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                    {isTr ? "Stratejik Büyüme & Yatırım" : "Strategic Growth & Investment"}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-fg-primary transition group-hover:text-emerald-300">
                  Ahmet Rıfat Albuz
                </h3>
                <div className="mt-1 mb-4 font-mono text-xs font-semibold text-emerald-400">
                  {isTr
                    ? "Stratejik Büyüme & Yatırım Danışmanı • Küresel Medya & Kamu İlişkileri"
                    : "Strategic Growth & Investment Advisor • Global Media & Governance"}
                </div>

                <p className="mb-6 text-xs leading-relaxed text-fg-secondary">
                  {isTr
                    ? "Kıdemli gazeteci, medya stratejisti ve kamu ilişkileri danışmanı. Startup ekosisteminde küresel büyüme, yatırımcı ilişkileri, ulusal ve uluslararası basın ve stratejik iletişim hamisi."
                    : "Senior journalist, media strategist, and corporate affairs advisor. Leading global venture growth, investor relations, international press, and strategic communications."}
                </p>

                <div className="space-y-2.5 border-t border-border-subtle pt-5 font-mono text-[11px] text-fg-muted">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{isTr ? "VC & Kurumsal Yatırım Ekosistemi" : "VC & Institutional Ecosystem"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{isTr ? "Küresel Basın & Stratejik İletişim" : "Global Media & Public Relations"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-4">
                <a
                  href="https://ahmetrifatalbuz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 transition hover:text-emerald-300"
                >
                  <span>ahmetrifatalbuz.com</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="font-mono text-[10px] text-fg-muted">GTM & Global Media</span>
              </div>
            </div>
          </div>

          {/* Extended Advisory Board Callout */}
          <div className="mt-16 overflow-hidden rounded-3xl border border-border-subtle bg-bg-secondary/20 p-8 text-center backdrop-blur-xl sm:p-12">
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-bold text-brand-300">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                <span>{isTr ? "Bağımsız Denetim ve Etik Heyeti" : "Independent Oversight & Ethics Panel"}</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-fg-primary sm:text-3xl">
                {isTr ? "Akademik ve Hukuki Danışma Kurulu" : "Academic & Legal Advisory Council"}
              </h3>
              <p className="text-sm leading-relaxed text-fg-secondary">
                {isTr
                  ? "ALPAR AI, bağımsız denetim protokollerini ve AI Act uyum metodolojilerini dünyanın önde gelen bilim insanları ve hukukçularıyla birlikte geliştirmektedir."
                  : "ALPAR AI develops independent auditing protocols and EU AI Act compliance methodologies in consultation with leading scholars and international jurists."}
              </p>
              <div className="pt-4">
                <Link
                  href="/team"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-6 py-3 text-sm font-bold text-brand-300 transition hover:border-brand-500/50 hover:bg-brand-500/20 active:scale-98"
                >
                  <span>{isTr ? "Tüm Ekibi & Yönetimi İncele →" : "View Full Leadership & Governance →"}</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
export const runtime = 'edge';
