import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Lock,
  CheckCircle,
  Server,
  Globe,
  Activity,
  Mail,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "security" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "security" });

  const badges = [
    { key: "1", icon: Shield, color: "text-brand-400" },
    { key: "2", icon: Lock, color: "text-danger-400" },
    { key: "3", icon: CheckCircle, color: "text-success-400" },
    { key: "4", icon: Server, color: "text-brand-400" },
    { key: "5", icon: Globe, color: "text-warning-400" },
    { key: "6", icon: Activity, color: "text-danger-400" },
  ];

  const timeline = [
    { key: "q3", date: "2026 Q3" },
    { key: "q4", date: "2026 Q4" },
    { key: "q1", date: "2027 Q1" },
  ];

  const cryptoItems = [
    {
      key: "1",
      icon: ShieldCheck,
      color: "text-warning-400",
      titleKey: "crypto_1_title",
      statusKey: "crypto_1_status",
      descKey: "crypto_1_desc",
    },
    {
      key: "2",
      icon: FileCheck2,
      color: "text-warning-400",
      titleKey: "crypto_2_title",
      statusKey: "crypto_2_status",
      descKey: "crypto_2_desc",
    },
    {
      key: "3",
      icon: Lock,
      color: "text-success-400",
      titleKey: "crypto_3_title",
      statusKey: "crypto_3_status",
      descKey: "crypto_3_desc",
    },
    {
      key: "4",
      icon: Globe,
      color: "text-brand-400",
      titleKey: "crypto_4_title",
      statusKey: "crypto_4_status",
      descKey: "crypto_4_desc",
    },
  ];

  return (
    <Container className="space-y-20 py-20">
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

      {/* Compliance Badges */}
      <div className="space-y-10">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-fg-primary text-2xl font-bold tracking-tight">{t("badges_title")}</h2>
          <p className="text-fg-muted mt-2 text-sm">{t("badges_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Card key={badge.key} className="border-border-subtle bg-bg-secondary/40">
                <CardContent className="space-y-4 p-6">
                  <div className={`w-fit rounded-lg bg-white/5 p-3 ${badge.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-fg-primary text-lg font-bold">
                    {t(`badge_${badge.key}_title`)}
                  </h3>
                  <p className="text-fg-muted text-xs leading-relaxed">
                    {t(`badge_${badge.key}_desc`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="space-y-10">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-fg-primary text-2xl font-bold tracking-tight">
            {t("timeline_title")}
          </h2>
          <p className="text-fg-muted mt-2 text-sm">{t("timeline_subtitle")}</p>
        </div>

        <div className="border-border-subtle relative mx-auto max-w-2xl space-y-8 border-l pl-6">
          {timeline.map((step) => (
            <div key={step.key} className="relative">
              <span className="bg-brand-500 border-bg-primary absolute top-1 -left-[31px] h-4 w-4 rounded-full border-4" />
              <div className="space-y-1">
                <span className="text-brand-400 text-xs font-bold tracking-wider uppercase">
                  {step.date}
                </span>
                <h3 className="text-fg-primary text-lg font-bold">{t(`time_${step.key}_title`)}</h3>
                <p className="text-fg-muted text-sm leading-relaxed">
                  {t(`time_${step.key}_desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Encryption & Compliance Status */}
      <div className="space-y-10">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-fg-primary text-2xl font-bold tracking-tight">{t("crypto_title")}</h2>
          <p className="text-fg-muted mt-2 text-sm">{t("crypto_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cryptoItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.key} className="border-border-subtle bg-bg-secondary/40">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <div className={`w-fit rounded-lg bg-white/5 p-3 ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="border-border-subtle bg-bg-elevated text-fg-muted rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                      {t(item.statusKey)}
                    </span>
                  </div>
                  <h3 className="text-fg-primary text-lg font-bold">{t(item.titleKey)}</h3>
                  <p className="text-fg-muted text-xs leading-relaxed">{t(item.descKey)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detailed Standards Section */}
      <div className="space-y-10">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-fg-primary text-2xl font-bold tracking-tight">
            {t("standards_detail_title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-border-subtle bg-bg-secondary/40">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-fg-primary text-lg font-bold">{t("standards_soc2_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("standards_soc2_desc")}</p>
            </CardContent>
          </Card>
          <Card className="border-border-subtle bg-bg-secondary/40">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-fg-primary text-lg font-bold">{t("standards_iso_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("standards_iso_desc")}</p>
            </CardContent>
          </Card>
          <Card className="border-border-subtle bg-bg-secondary/40">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-fg-primary text-lg font-bold">{t("standards_aes_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("standards_aes_desc")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Responsible Disclosure */}
      <Card className="border-danger-500/20 bg-danger-500/5 mx-auto max-w-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="bg-danger-500/10 text-danger-400 mx-auto w-fit rounded-full p-4">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-fg-primary text-xl font-bold">{t("disclosure_title")}</h2>
          <p className="text-fg-secondary text-sm leading-relaxed">
            {t("disclosure_subtitle")}{" "}
            <a
              href="mailto:security@alparai.com"
              className="text-brand-400 font-bold hover:underline"
            >
              security@alparai.com
            </a>
            .
          </p>
          <p className="text-fg-muted text-xs italic">{t("disclosure_note")}</p>
        </CardContent>
      </Card>
    </Container>
  );
}
