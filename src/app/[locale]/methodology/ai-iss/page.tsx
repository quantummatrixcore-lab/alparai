import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { ShieldAlert, Activity, Scale, Zap, FileText } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return {
    title: `${t("aiIssTitle")} · ALPAR AI`,
    description: t("aiIssDesc"),
  };
}

export default async function AiIssMethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "methodology" });

  const scoreBands = [
    {
      band: t("aiIssBandLow"),
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      desc: t("aiIssBandLowDesc"),
    },
    {
      band: t("aiIssBandMedium"),
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      desc: t("aiIssBandMediumDesc"),
    },
    {
      band: t("aiIssBandHigh"),
      color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
      desc: t("aiIssBandHighDesc"),
    },
    {
      band: t("aiIssBandCritical"),
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      desc: t("aiIssBandCriticalDesc"),
    },
  ];

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-400">
            <ShieldAlert className="h-4 w-4" />
            {t("aiIssBadge")}
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl">{t("aiIssHeading")}</h1>
          <p className="text-fg-muted mx-auto max-w-2xl text-base">{t("aiIssSubheading")}</p>
        </header>

        <section className="border-border-subtle bg-bg-secondary space-y-4 rounded-2xl border p-8">
          <h2 className="text-2xl flex items-center gap-3 font-bold text-white">
            <FileText className="h-6 w-6 text-purple-400" />
            {t("aiIssWhatIsTitle")}
          </h2>
          <p className="text-fg-primary text-sm leading-relaxed">{t("aiIssWhatIsText")}</p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border-border-subtle bg-bg-secondary space-y-2 rounded-xl border p-6">
            <Activity className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">{t("aiIssImpactTitle")}</h3>
            <p className="text-fg-muted text-xs">{t("aiIssImpactDesc")}</p>
          </div>
          <div className="border-border-subtle bg-bg-secondary space-y-2 rounded-xl border p-6">
            <Scale className="h-6 w-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">{t("aiIssScopeTitle")}</h3>
            <p className="text-fg-muted text-xs">{t("aiIssScopeDesc")}</p>
          </div>
          <div className="border-border-subtle bg-bg-secondary space-y-2 rounded-xl border p-6">
            <Zap className="h-6 w-6 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{t("aiIssExploitabilityTitle")}</h3>
            <p className="text-fg-muted text-xs">{t("aiIssExploitabilityDesc")}</p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">{t("aiIssBandsTitle")}</h2>
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
