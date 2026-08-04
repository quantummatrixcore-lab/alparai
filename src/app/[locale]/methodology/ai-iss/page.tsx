import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { ShieldAlert, Activity, Scale, Zap, FileText } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about_methodology" });
  return { title: t("aiIssTitle", { defaultValue: "AI-ISS Metodolojisi · ALPAR AI" }) };
}

export default async function AiIssMethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about_methodology" });

  const scoreBands = [
    {
      band: "Düşük (0.0 - 3.9)",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      desc: "Hafif UX hatası veya marjinal veri uyuşmazlığı",
    },
    {
      band: "Orta (4.0 - 6.9)",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      desc: "Kısıtlı halüsinasyon, yanlış bilgi veya kontrollü PII sızıntısı",
    },
    {
      band: "Yüksek (7.0 - 8.9)",
      color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
      desc: "Sistematik önyargı, yetkisiz eylem veya kritik PII sızıntısı",
    },
    {
      band: "Kritik (9.0 - 10.0)",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      desc: "EU AI Act Madde 73 kapsamı, geniş ölçekli ihlal veya fiziksel/finansal zarar",
    },
  ];

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-400">
            <ShieldAlert className="h-4 w-4" />
            Açık Metodoloji Standardı
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl">
            {t("aiIssHeading", { defaultValue: "AI Olay Ciddiyet Skoru (AI-ISS)" })}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400">
            {t("aiIssSubheading", {
              defaultValue:
                "Yapay zeka olaylarının büyüklüğünü ve riskini 0.0 - 10.0 arasında puanlayan deterministik ve açık vektör standardı.",
            })}
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <FileText className="h-6 w-6 text-purple-400" />
            AI-ISS Nedir?
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            AI-ISS (AI Incident Severity Score), ALPAR AI tarafından geliştirilmiş ve CVSS v3.1
            standardından esinlenilmiş açık yapay zeka olay ciddiyet skorlamasıdır. Kara-kutu YZ
            sistemlerinde meydana gelen halüsinasyon, güvenlik ihlali, telif ihlali ve önyargı
            vakalarını nitel etiketler (Düşük/Yüksek) yerine matematiksel ve yeniden üretilebilir
            bir 0.0 - 10.0 skalasında ölçer.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <Activity className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">1. Etki (Impact %45)</h3>
            <p className="text-xs text-slate-400">
              Fiziksel güvenlik zararı, önyargı boyutu, PII sızıntısı ve EU AI Act Madde 73 ihlal
              kapsamını puanlar.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <Scale className="h-6 w-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">2. Kapsam (Scope %30)</h3>
            <p className="text-xs text-slate-400">
              Etki alanının tek bir kullanıcıdan kurumsal sistemlere ve toplumsal altyapıya yayılım
              katsayısını ölçer.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <Zap className="h-6 w-6 text-amber-400" />
            <h3 className="text-lg font-bold text-white">3. İstismar (Exploit %25)</h3>
            <p className="text-xs text-slate-400">
              Prompt injection karmaşıklığı, otonom eylem hızı ve saldırı yüzeyi erişim katsayısını
              değerlendirir.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Ciddiyet Seviyeleri ve Skor Bantları</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {scoreBands.map((sb) => (
              <div key={sb.band} className={`rounded-xl border p-5 ${sb.color}`}>
                <h3 className="mb-1 text-base font-bold">{sb.band}</h3>
                <p className="text-xs opacity-90">{sb.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}
