import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Shield, Code, BarChart3, Lock } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "team" });
  return { title: t("meta_title", { defaultValue: "Team — ALPAR AI" }) };
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "team" });

  return (
    <Container className="py-20">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-black text-white">{t("title")}</h1>
        <p className="text-fg-muted mx-auto max-w-2xl text-lg">{t("subtitle")}</p>
      </div>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-8">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">{t("mission_title")}</h2>
          </div>
          <p className="text-fg-muted">{t("mission_desc")}</p>
        </div>
        <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-8">
          <div className="mb-4 flex items-center gap-3">
            <Lock className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">{t("privacy_title")}</h2>
          </div>
          <p className="text-fg-muted">{t("privacy_desc")}</p>
        </div>
        <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-8">
          <div className="mb-4 flex items-center gap-3">
            <Code className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">{t("opensource_title")}</h2>
          </div>
          <p className="text-fg-muted">{t("opensource_desc")}</p>
        </div>
        <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-8">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">{t("advisory_title")}</h2>
          </div>
          <p className="text-fg-muted">{t("advisory_desc")}</p>
        </div>
      </div>
    </Container>
  );
}
