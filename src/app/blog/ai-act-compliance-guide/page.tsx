import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EU AI Act Uyumluluk Rehberi 2026 | AlparAi",
  description:
    "Avrupa BirliÄŸi Yapay Zeka YasasÄ± (EU AI Act) uyumluluk gereksinimleri, risk kategorileri, teknik denetim adÄ±mlarÄ± ve kurumsal yol haritasÄ±.",
  keywords: [
    "EU AI Act",
    "Yapay Zeka YasasÄ±",
    "AI Uyumluluk",
    "AI Denetimi",
    "High-Risk AI",
    "AlparAi",
    "AI Incident Intelligence",
  ],
  openGraph: {
    title: "EU AI Act Uyumluluk Rehberi 2026 | AlparAi",
    description:
      "Avrupa BirliÄŸi Yapay Zeka YasasÄ± (EU AI Act) uyumluluk gereksinimleri, risk kategorileri ve teknik denetim rehberi.",
    type: "article",
    url: "https://alparai.com/blog/ai-act-compliance-guide",
    images: [
      {
        url: "/brand-assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "EU AI Act Uyumluluk Rehberi 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EU AI Act Uyumluluk Rehberi 2026 | AlparAi",
    description:
      "Avrupa BirliÄŸi Yapay Zeka YasasÄ± uyumluluk gereksinimleri ve teknik denetim adÄ±mlarÄ±.",
    images: ["/brand-assets/og-image.png"],
  },
};

export default function AiActComplianceGuidePage() {
  return (
    <article className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-slate-400">
            <li>
              <Link href="/" className="hover:text-cyan-400 transition-colors">
                Ana Sayfa
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-cyan-400 transition-colors">
                Blog
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-200 font-medium">EU AI Act Rehberi</li>
          </ol>
        </nav>

        {/* Header Section */}
        <header className="mb-12 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-4">
            <span className="bg-cyan-950 border border-cyan-800 px-3 py-1 rounded-full">
              Hukuk & Uyumluluk
            </span>
            <span>â€¢</span>
            <time dateTime="2026-09-28">28 EylÃ¼l 2026</time>
            <span>â€¢</span>
            <span>6 dk okuma</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Avrupa BirliÄŸi AI Act Uyumluluk Rehberi 2026: Kurumsal Risk & Denetim Ã‡erÃ§evesi
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
            Avrupa BirliÄŸi Yapay Zeka YasasÄ± (EU AI Act), dÃ¼nya Ã§apÄ±nda yapay zeka sistemlerini 
            dÃ¼zenleyen en kapsamlÄ± yasal Ã§erÃ§evedir. Åirketinizin yasal yaptÄ±rÄ±mlarla karÅŸÄ±laÅŸmamasÄ± 
            ve gÃ¼venilir yapay zeka altyapÄ±sÄ± inÅŸa etmesi iÃ§in bilmeniz gereken tÃ¼m kritik detaylar.
          </p>

          <div className="mt-6 flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs">
                AA
              </span>
              <span>ALPAR AI RegÃ¼lasyon & GÃ¼venlik MasasÄ±</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed text-base sm:text-lg">
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 border-l-4 border-cyan-500 pl-4">
              1. EU AI Act Nedir ve Kimleri Kapsar?
            </h2>
            <p>
              Avrupa BirliÄŸi Yapay Zeka YasasÄ± (EU AI Act), yapay zeka teknolojilerinin insan haklarÄ±na,
              demokrasiye ve hukukun Ã¼stÃ¼nlÃ¼ÄŸÃ¼ne uygun ÅŸekilde geliÅŸtirilmesini ve kullanÄ±lmasÄ±nÄ± zorunlu
              kÄ±lan kÃ¼resel bir yÃ¶netmeliktir.
            </p>
            <p className="mt-3">
              Yasa sadece AB iÃ§inde yerleÅŸik ÅŸirketleri deÄŸil; geliÅŸtirdiÄŸi yapay zeka modelleri,
              API servisleri veya otonom ajanlarÄ± AB vatandaÅŸlarÄ± tarafÄ±ndan kullanÄ±lan tÃ¼m kÃ¼resel
              teknoloji saÄŸlayÄ±cÄ±larÄ±nÄ± doÄŸrudan baÄŸlar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 border-l-4 border-cyan-500 pl-4">
              2. DÃ¶rt Temel Risk Seviyesi ve Hukuki YÃ¼kÃ¼mlÃ¼lÃ¼kler
            </h2>
            <p>
              Yasa, sistemleri risk temelli bir piramitle dÃ¶rt farklÄ± kategoriye ayÄ±rÄ±r:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="bg-red-950/40 border border-red-800/60 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-red-400 mb-2">1. Kabul Edilemez Risk</h3>
                <p className="text-sm text-slate-300">
                  Sosyal puanlama sistemleri, insan davranÄ±ÅŸÄ±nÄ± manipÃ¼le eden bilinÃ§altÄ± teknikler ve
                  kamusal alanlarda biyometrik anlÄ±k takip kesinlikle yasaklanmÄ±ÅŸtÄ±r.
                </p>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-amber-400 mb-2">2. YÃ¼ksek Risk (High-Risk)</h3>
                <p className="text-sm text-slate-300">
                  Kritik altyapÄ±, iÅŸe alÄ±m algoritmalarÄ±, kredi skorlama, adalet ve kolluk kuvveti
                  sistemleri. SÄ±kÄ± audit, ÅŸeffaflÄ±k ve insan gÃ¶zetimi ÅŸarttÄ±r.
                </p>
              </div>

              <div className="bg-blue-950/40 border border-blue-800/60 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-blue-400 mb-2">3. ÅeffaflÄ±k Gerektiren Sistemler</h3>
                <p className="text-sm text-slate-300">
                  Sohbet botlarÄ±, LLM tabanlÄ± asistanlar ve deepfake iÃ§erik Ã¼reticileri. KullanÄ±cÄ±nÄ±n
                  bir yapay zeka ile etkileÅŸime girdiÄŸini aÃ§Ä±kÃ§a bilmesi zorunludur.
                </p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/60 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">4. Minimum / DÃ¼ÅŸÃ¼k Risk</h3>
                <p className="text-sm text-slate-300">
                  Spam filtreleri, video oyunlarÄ±ndaki AI davranÄ±ÅŸlarÄ±. Herhangi bir aÄŸÄ±r regÃ¼lasyon
                  yÃ¼kÃ¼mlÃ¼lÃ¼ÄŸÃ¼ bulunmamaktadÄ±r.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 border-l-4 border-cyan-500 pl-4">
              3. YÃ¼ksek Riskli Sistemler Ä°Ã§in 7 Temel Teknik Gereksinim
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>
                <strong className="text-white">Risk YÃ¶netim Sistemi:</strong> SÃ¼rekli, belgelenmiÅŸ ve 
                dÃ¶ngÃ¼sel risk deÄŸerlendirme prosedÃ¼rleri.
              </li>
              <li>
                <strong className="text-white">Veri YÃ¶netimi & Kalite:</strong> EÄŸitim, doÄŸrulama ve 
                test veri setlerinin tarafsÄ±zlÄ±k ve temsiliyet standartlarÄ±na uygunluÄŸu.
              </li>
              <li>
                <strong className="text-white">Teknik DokÃ¼mantasyon:</strong> DenetÃ§ilere anÄ±nda 
                sunulabilecek ÅŸeffaf sistem mimarisi ve parametre dÃ¶kÃ¼mleri.
              </li>
              <li>
                <strong className="text-white">KayÄ±t Tutma (Audit Logging):</strong> OlaylarÄ±n ve 
                Ã§Ä±ktÄ±larÄ±n geriye dÃ¶nÃ¼k izlenebilirliÄŸi (minimum 6 ay saklama).
              </li>
              <li>
                <strong className="text-white">ÅeffaflÄ±k ve KullanÄ±cÄ± Bilgilendirmesi:</strong> 
                Sistemin sÄ±nÄ±rlarÄ± ve doÄŸruluÄŸu hakkÄ±nda aÃ§Ä±k teknik kÄ±lavuzlar.
              </li>
              <li>
                <strong className="text-white">Ä°nsan GÃ¶zetimi (Human-in-the-Loop):</strong> Modelin 
                Ã§Ä±ktÄ±larÄ±nÄ± anÄ±nda durdurabilecek insan yetkisi ve acil fren mekanizmalarÄ±.
              </li>
              <li>
                <strong className="text-white">Siber GÃ¼venlik & DoÄŸruluk:</strong> HalÃ¼sinasyonlara, 
                adversarial saldÄ±rÄ±lara ve veri zehirlenmesine karÅŸÄ± sarsÄ±lmaz baÄŸÄ±ÅŸÄ±klÄ±k.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 border-l-4 border-cyan-500 pl-4">
              4. 2026 YaptÄ±rÄ±mlarÄ±: Ä°hlal Halinde Ne Olur?
            </h2>
            <p>
              EU AI Act, GDPR&apos;dan Ã§ok daha aÄŸÄ±r mali yaptÄ±rÄ±mlar Ã¶ngÃ¶rmektedir:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 my-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">âš ï¸ YasaklÄ± Uygulama Ä°hlali:</span>
                  <span>35 Milyon Euro veya kÃ¼resel cironun %7&apos;sine varan para cezalarÄ±.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold">âš ï¸ DiÄŸer YÃ¼kÃ¼mlÃ¼lÃ¼k Ä°hlalleri:</span>
                  <span>15 Milyon Euro veya kÃ¼resel cironun %3&apos;Ã¼ne varan para cezalarÄ±.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold">âš ï¸ YanlÄ±ÅŸ Bilgi Bildirimi:</span>
                  <span>7.5 Milyon Euro veya cironun %1.5&apos;i oranÄ±nda idari cezalar.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA Box */}
          <section className="bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-800/80 rounded-xl p-8 my-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-300 mb-3">
              AlparAi Otonom Uyum AnalizÃ¶rÃ¼ ile Sisteminizi DoÄŸrulayÄ±n
            </h2>
            <p className="text-slate-300 mb-6">
              2,880+ yapay zeka vaka geÃ§miÅŸi ve otonom gÃ¼venlik radarÄ±yla AI modellerinizin 
              EU AI Act uyumluluÄŸunu dakikalar iÃ§inde test edin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/compliance"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
              >
                Uyum KontrolÃ¼nÃ¼ BaÅŸlat
              </Link>
              <Link
                href="/contact"
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-slate-700"
              >
                Uzmanla GÃ¶rÃ¼ÅŸ
              </Link>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}

