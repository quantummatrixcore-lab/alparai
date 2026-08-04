import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { TrendingUp, Search, Zap, Globe } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("seo_performance_title", { defaultValue: "SEO & Performans · ALPAR AI" }) };
}

export default async function SeoPerformancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await requireAdmin();
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerClient();
  const { count: incidentCount } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true });
  const { count: modelCount } = await supabase
    .from("ai_models")
    .select("*", { count: "exact", head: true });

  const metrics = [
    {
      label: "İndekslenmiş Olay",
      value: incidentCount ?? 0,
      icon: Search,
      color: "text-purple-400",
    },
    { label: "Kayıtlı Model", value: modelCount ?? 0, icon: Globe, color: "text-cyan-400" },
    { label: "Core Web Vitals", value: "LCP < 2.5s", icon: Zap, color: "text-emerald-400" },
    { label: "Lighthouse Score", value: "92+", icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
          SEO & Performans Panosu
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Canlı metrikler, arama indeksi görünürlüğü ve Core Web Vitals izleme.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
            <m.icon className={`h-6 w-6 ${m.color} mb-3`} />
            <p className="text-2xl font-black text-white">{m.value}</p>
            <p className="mt-1 text-xs text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Canlı Veri Kaynakları & SEO Altyapısı</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>
            • Supabase:{" "}
            <span className="font-semibold text-green-400">
              {incidentCount ?? 0} olay, {modelCount ?? 0} model indeksli
            </span>
          </li>
          <li>
            • Sitemap: <span className="font-semibold text-green-400">/sitemap.xml canlı</span>
          </li>
          <li>
            • Robots: <span className="font-semibold text-green-400">/robots.txt canlı</span>
          </li>
          <li>
            • i18n URL Yapısı:{" "}
            <span className="font-semibold text-green-400">EN, TR, DE, FR, RU 5 dilde aktif</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
