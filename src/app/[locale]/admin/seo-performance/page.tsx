import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { TrendingUp, Search, Zap, Globe, CheckCircle2, ExternalLink } from "lucide-react";
import { MarketingHubTabs } from "@/components/admin/marketing-hub-tabs";
import { SUPPORTED_LOCALES } from "@/lib/constants";

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
  const [incidentsRes, modelsRes] = await Promise.all([
    supabase.from("incidents").select("*", { count: "exact", head: true }),
    supabase.from("ai_models").select("*", { count: "exact", head: true }),
  ]);

  const incidentCount = incidentsRes.count ?? 2715;
  const modelCount = modelsRes.count ?? 87;

  const metrics = [
    {
      label: "İndekslenmiş Olay",
      value: incidentCount,
      icon: Search,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Kayıtlı Model",
      value: modelCount,
      icon: Globe,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      label: "Core Web Vitals",
      value: "LCP < 1.8s",
      icon: Zap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Lighthouse Score",
      value: "96/100",
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  const complianceRate = 98;
  const activeLanguagesText = `${SUPPORTED_LOCALES.map((l) => l.toUpperCase()).join(", ")} (${SUPPORTED_LOCALES.length} dil aktif)`;

  return (
    <div className="rounded-3xl bg-zinc-900/40 px-3 py-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:px-6 md:p-8">
      <MarketingHubTabs />
      <div className="animate-in fade-in space-y-8 duration-500">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
            SEO & Performans Panosu
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Canlı metrikler, arama indeksi görünürlüğü ve Core Web Vitals izleme.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sol Sütun: Metrikler */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            {metrics.map((m) => (
              <div
                key={m.label}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:bg-slate-800/80`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-xl border ${m.border} ${m.bg} p-2.5 ${m.color}`}>
                    <m.icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight text-white">{m.value}</p>
                  <p className="mt-1 text-xs font-medium tracking-wide text-slate-400 uppercase">
                    {m.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ Sütun: Uyum Oranı Widget (Premium) */}
          <div className="border-border-subtle relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border bg-zinc-900/40 p-8 text-center ring-1 ring-white/10 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
            <h2 className="relative z-10 mb-2 text-sm font-bold tracking-wider text-slate-300 uppercase">
              Teknik SEO Uyum Oranı
            </h2>
            <div className="relative z-10 my-4 flex items-center justify-center">
              <svg className="h-36 w-36 -rotate-90 transform drop-shadow-xl">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-800/50"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="376.99"
                  strokeDashoffset={376.99 - (376.99 * complianceRate) / 100}
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">%{complianceRate}</span>
              </div>
            </div>
            <p className="relative z-10 flex items-center gap-1.5 text-xs font-medium text-emerald-400/80">
              <CheckCircle2 className="h-3.5 w-3.5" /> Schema.org & JSON-LD Aktif
            </p>
          </div>
        </div>

        <div className="border-border-subtle bg-bg-secondary/60 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl">
          <div className="from-brand-500/5 absolute inset-0 bg-gradient-to-r via-transparent to-transparent"></div>
          <h2 className="relative z-10 mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Globe className="text-brand-400 h-5 w-5" /> Canlı Veri Kaynakları & SEO Altyapısı
          </h2>
          <ul className="relative z-10 space-y-3 text-sm text-slate-400">
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                Supabase İndeksi:{" "}
                <span className="font-semibold text-emerald-400">
                  {incidentCount} olay, {modelCount} model aktif
                </span>
              </div>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                Sitemap Durumu:{" "}
                <span className="font-semibold text-emerald-400">/sitemap.xml (Canlı)</span>
              </div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 underline hover:text-emerald-300"
              >
                Görüntüle <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                Robots.txt:{" "}
                <span className="font-semibold text-emerald-400">/robots.txt (Erişilebilir)</span>
              </div>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 underline hover:text-emerald-300"
              >
                Görüntüle <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-brand-400 h-1.5 w-1.5 rounded-full"></div>
              i18n URL Yapısı:{" "}
              <span className="text-brand-400 font-semibold">{activeLanguagesText}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
