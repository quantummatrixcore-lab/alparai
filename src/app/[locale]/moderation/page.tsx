import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "moderation" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ModerationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "moderation" });

  const rules = [
    { key: "1", icon: CheckCircle2, color: "text-brand-400" },
    { key: "2", icon: ShieldCheck, color: "text-success-400" },
    { key: "3", icon: Scale, color: "text-warning-400" },
    { key: "4", icon: AlertTriangle, color: "text-danger-400" },
  ];

  return (
    <Container className="space-y-16 py-20">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="border-brand-500/30 bg-brand-500/10 text-brand-400 inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold tracking-wider uppercase">
          {t("badge")}
        </span>
        <h1 className="text-fg-primary mt-6 text-4xl font-black tracking-tight sm:text-5xl">
          {t("headline")}
        </h1>
        <p className="text-fg-secondary mt-4 text-lg leading-relaxed">{t("subtitle")}</p>
      </div>

      {/* Rules Grid */}
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h2 className="text-fg-primary text-2xl font-bold tracking-tight">{t("rules_title")}</h2>
          <p className="text-fg-muted mt-2 text-sm">{t("rules_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {rules.map((rule) => {
            const Icon = rule.icon;
            return (
              <Card key={rule.key} className="border-border-subtle bg-bg-secondary/40">
                <CardContent className="space-y-4 p-6">
                  <div className={`w-fit rounded-lg bg-white/5 p-3 ${rule.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-fg-primary text-lg font-bold">
                    {t(`rule_${rule.key}_title`)}
                  </h3>
                  <p className="text-fg-muted text-xs leading-relaxed">
                    {t(`rule_${rule.key}_desc`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dispute Policy Section */}
      <Card className="border-border-subtle bg-bg-secondary/60 mx-auto max-w-3xl">
        <CardContent className="space-y-4 p-8">
          <div className="flex items-start gap-4">
            <div className="text-brand-400 shrink-0 rounded-xl bg-white/5 p-3">
              <Scale className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-fg-primary text-lg font-bold">{t("dispute_title")}</h2>
              <p className="text-fg-secondary text-xs leading-relaxed">{t("dispute_desc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
