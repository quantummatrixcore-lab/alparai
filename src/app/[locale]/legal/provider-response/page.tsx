import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { ShieldCheck, Clock, MessageSquare, AlertCircle } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: t("provider_response_title", { defaultValue: "Sağlayıcı Yanıt Protokolü · ALPAR AI" }),
  };
}

export default async function ProviderResponseProtocolPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
            Şeffaflık & Yanıt Standartları
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl">Sağlayıcı Yanıt Protokolü</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400">
            Yapay zeka model sağlayıcıları için resmî 30 günlük yanıt penceresi ve kamusal hesap
            verebilirlik ilkeleri.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <Clock className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">1. 30 Günlük Bildirim Penceresi</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              Platforma kaydedilen doğrulanmış olaylar için ilgili YZ model sağlayıcısına resmi
              bildirim iletilir ve 30 günlük yanıt süresi tanınır.
            </p>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <MessageSquare className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">2. Kamusal Yanıt Yayınlama</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              Sağlayıcı tarafından iletilen resmî açıklama ve düzeltme adımları doğrudan olay detay
              sayfasında tarafsız olarak yayınlanır.
            </p>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <AlertCircle className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">3. Yanıtsızlık Kaydı</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              30 günlük süre içerisinde yanıt verilmemesi durumunda olay sayfasında olgusal dille
              "Yanıt Verilmedi" durumu kamuya açık etikete dönüşür.
            </p>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">4. Tarafsız Tarafsızlık İlkesi</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              Tüm süreç tarafsız denetim ilkelerine tabidir; editoryal müdahale yapılmaz ve kanıtlar
              doğrudan saklanır.
            </p>
          </div>
        </section>
      </div>
    </Container>
  );
}
