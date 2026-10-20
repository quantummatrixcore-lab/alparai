import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EU AI Act Uyumluluk Rehberi 2026 | AlparAi",
  description:
    "Avrupa Birliği Yapay Zeka Yasası (EU AI Act) uyumluluk gereksinimleri, risk kategorileri, teknik denetim adımları ve kurumsal yol haritası.",
  keywords: [
    "EU AI Act",
    "Yapay Zeka Yasası",
    "AI Uyumluluk",
    "AI Denetimi",
    "High-Risk AI",
    "AlparAi",
    "AI Incident Intelligence",
  ],
  openGraph: {
    title: "EU AI Act Uyumluluk Rehberi 2026 | AlparAi",
    description:
      "Avrupa Birliği Yapay Zeka Yasası (EU AI Act) uyumluluk gereksinimleri, risk kategorileri ve teknik denetim rehberi.",
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
      "Avrupa Birliği Yapay Zeka Yasası uyumluluk gereksinimleri ve teknik denetim adımları.",
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
            <time dateTime="2026-09-28">28 Eylül 2026</time>
            <span>â€¢</span>
            <span>6 dk okuma</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Avrupa Birliği AI Act Uyumluluk Rehberi 2026: Kurumsal Risk & Denetim Çerçevesi
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
            Avrupa Birliği Yapay Zeka Yasası (EU AI Act), dünya çapında yapay zeka sistemlerini 
            düzenleyen en kapsamlı yasal çerçevedir. Åirketinizin yasal yaptırımlarla karşılaşmaması 
            ve güvenilir yapay zeka altyapısı inşa etmesi için bilmeniz gereken tüm kritik detaylar.
          </p>

          <div className="mt-6 flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs">
                AA
              </span>
              <span>ALPAR AI Regülasyon & Güvenlik Masası</span>
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
              Avrupa Birliği Yapay Zeka Yasası (EU AI Act), yapay zeka teknolojilerinin insan haklarına,
              demokrasiye ve hukukun üstünlüğüne uygun şekilde geliştirilmesini ve kullanılmasını zorunlu
              kılan küresel bir yönetmeliktir.
            </p>
            <p className="mt-3">
              Yasa sadece AB içinde yerleşik şirketleri değil; geliştirdiği yapay zeka modelleri,
              API servisleri veya otonom ajanları AB vatandaşları tarafından kullanılan tüm küresel
              teknoloji sağlayıcılarını doğrudan bağlar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 border-l-4 border-cyan-500 pl-4">
              2. Dört Temel Risk Seviyesi ve Hukuki Yükümlülükler
            </h2>
            <p>
              Yasa, sistemleri risk temelli bir piramitle dört farklı kategoriye ayırır:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="bg-red-950/40 border border-red-800/60 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-red-400 mb-2">1. Kabul Edilemez Risk</h3>
                <p className="text-sm text-slate-300">
                  Sosyal puanlama sistemleri, insan davranışını manipüle eden bilinçaltı teknikler ve
                  kamusal alanlarda biyometrik anlık takip kesinlikle yasaklanmıştır.
                </p>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-amber-400 mb-2">2. Yüksek Risk (High-Risk)</h3>
                <p className="text-sm text-slate-300">
                  Kritik altyapı, işe alım algoritmaları, kredi skorlama, adalet ve kolluk kuvveti
                  sistemleri. Sıkı audit, şeffaflık ve insan gözetimi şarttır.
                </p>
              </div>

              <div className="bg-blue-950/40 border border-blue-800/60 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-blue-400 mb-2">3. Åeffaflık Gerektiren Sistemler</h3>
                <p className="text-sm text-slate-300">
                  Sohbet botları, LLM tabanlı asistanlar ve deepfake içerik üreticileri. Kullanıcının
                  bir yapay zeka ile etkileşime girdiğini açıkça bilmesi zorunludur.
                </p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/60 p-5 rounded-lg">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">4. Minimum / Düşük Risk</h3>
                <p className="text-sm text-slate-300">
                  Spam filtreleri, video oyunlarındaki AI davranışları. Herhangi bir ağır regülasyon
                  yükümlülüğü bulunmamaktadır.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 border-l-4 border-cyan-500 pl-4">
              3. Yüksek Riskli Sistemler İçin 7 Temel Teknik Gereksinim
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>
                <strong className="text-white">Risk Yönetim Sistemi:</strong> Sürekli, belgelenmiş ve 
                döngüsel risk değerlendirme prosedürleri.
              </li>
              <li>
                <strong className="text-white">Veri Yönetimi & Kalite:</strong> Eğitim, doğrulama ve 
                test veri setlerinin tarafsızlık ve temsiliyet standartlarına uygunluğu.
              </li>
              <li>
                <strong className="text-white">Teknik Dokümantasyon:</strong> Denetçilere anında 
                sunulabilecek şeffaf sistem mimarisi ve parametre dökümleri.
              </li>
              <li>
                <strong className="text-white">Kayıt Tutma (Audit Logging):</strong> Olayların ve 
                çıktıların geriye dönük izlenebilirliği (minimum 6 ay saklama).
              </li>
              <li>
                <strong className="text-white">Åeffaflık ve Kullanıcı Bilgilendirmesi:</strong> 
                Sistemin sınırları ve doğruluğu hakkında açık teknik kılavuzlar.
              </li>
              <li>
                <strong className="text-white">İnsan Gözetimi (Human-in-the-Loop):</strong> Modelin 
                çıktılarını anında durdurabilecek insan yetkisi ve acil fren mekanizmaları.
              </li>
              <li>
                <strong className="text-white">Siber Güvenlik & Doğruluk:</strong> Halüsinasyonlara, 
                adversarial saldırılara ve veri zehirlenmesine karşı sarsılmaz bağışıklık.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 border-l-4 border-cyan-500 pl-4">
              4. 2026 Yaptırımları: İhlal Halinde Ne Olur?
            </h2>
            <p>
              EU AI Act, GDPR&apos;dan çok daha ağır mali yaptırımlar öngörmektedir:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 my-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">âš ï¸ Yasaklı Uygulama İhlali:</span>
                  <span>35 Milyon Euro veya küresel cironun %7&apos;sine varan para cezaları.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold">âš ï¸ Diğer Yükümlülük İhlalleri:</span>
                  <span>15 Milyon Euro veya küresel cironun %3&apos;üne varan para cezaları.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold">âš ï¸ Yanlış Bilgi Bildirimi:</span>
                  <span>7.5 Milyon Euro veya cironun %1.5&apos;i oranında idari cezalar.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA Box */}
          <section className="bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-800/80 rounded-xl p-8 my-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-300 mb-3">
              AlparAi Otonom Uyum Analizörü ile Sisteminizi Doğrulayın
            </h2>
            <p className="text-slate-300 mb-6">
              2,880+ yapay zeka vaka geçmişi ve otonom güvenlik radarıyla AI modellerinizin 
              EU AI Act uyumluluğunu dakikalar içinde test edin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/compliance"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
              >
                Uyum Kontrolünü Başlat
              </Link>
              <Link
                href="/contact"
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-slate-700"
              >
                Uzmanla Görüş
              </Link>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
export const runtime = 'edge';
