import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Shield, Code, BarChart3, Lock } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return { title: t("team_title", { defaultValue: "Ekip — ALPAR AI" }) };
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Container className="py-20">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-black text-white">Ekip & Şeffaflık</h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          ALPAR AI, yapay zeka hesap verebilirliği alanında çalışan bağımsız bir ekip tarafından
          inşa edilmektedir.
        </p>
      </div>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Misyon</h2>
          </div>
          <p className="text-slate-400">
            Kara-kutu yapay zeka sistemleri için bağımsız denetim, şeffaflık ve güven altyapısı
            kurmak.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <div className="mb-4 flex items-center gap-3">
            <Lock className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Gizlilik & Güvenlik</h2>
          </div>
          <p className="text-slate-400">
            AGPL-3.0 lisanslı açık kaynak proje. Tüm veri işleme süreçleri KVKK uyumlu ve
            denetlenebilir şekilde belgelenmiştir.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <div className="mb-4 flex items-center gap-3">
            <Code className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Açık Kaynak</h2>
          </div>
          <p className="text-slate-400">
            Kod tabanı şeffaf; katkıda bulunmak isteyenler için CONTRIBUTING.md ve topluluk
            kılavuzları mevcuttur.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Danışma Kurulu</h2>
          </div>
          <p className="text-slate-400">
            Sektör danışma kurulu pozisyonları açıktır. İlgilenen uzmanlar hello@alparai.com
            adresinden iletişime geçebilir.
          </p>
        </div>
      </div>
    </Container>
  );
}
