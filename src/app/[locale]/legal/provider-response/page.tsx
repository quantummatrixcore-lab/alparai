import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { ShieldCheck, Clock, MessageSquare, AlertCircle } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: `${t("providerResponseTitle")} · ALPAR AI`,
    description: t("providerResponseDesc"),
  };
}

export default async function ProviderResponseProtocolPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
            {t("prBadge")}
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl">
            {t("providerResponseTitle")}
          </h1>
          <p className="text-fg-muted mx-auto max-w-2xl text-base">{t("providerResponseDesc")}</p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border-border-subtle bg-bg-secondary space-y-3 rounded-xl border p-6">
            <Clock className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">{t("prWindowTitle")}</h2>
            <p className="text-fg-muted text-xs leading-relaxed">{t("prWindowText")}</p>
          </div>
          <div className="border-border-subtle bg-bg-secondary space-y-3 rounded-xl border p-6">
            <MessageSquare className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">{t("prBadgeVerifiedTitle")}</h2>
            <p className="text-fg-muted text-xs leading-relaxed">{t("prBadgeVerifiedText")}</p>
          </div>
          <div className="border-border-subtle bg-bg-secondary space-y-3 rounded-xl border p-6">
            <AlertCircle className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">{t("prBadgeNoResponseTitle")}</h2>
            <p className="text-fg-muted text-xs leading-relaxed">{t("prBadgeNoResponseText")}</p>
          </div>
          <div className="border-border-subtle bg-bg-secondary space-y-3 rounded-xl border p-6">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">{t("prNeutralityTitle")}</h2>
            <p className="text-fg-muted text-xs leading-relaxed">{t("prNeutralityText")}</p>
          </div>
        </section>
      </div>
    </Container>
  );
}
