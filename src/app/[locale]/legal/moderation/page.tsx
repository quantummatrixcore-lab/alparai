import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("modTitle"),
    description: t("modDesc"),
  };
}

export default async function ModerationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <LegalLayout title={t("modTitle")} lastUpdated="2026-08-14">
      <p>{t("modDesc")}</p>

      <h2>{t("modPublishedTitle")}</h2>
      <p>{t("modPublished")}</p>

      <h2>{t("modRejectedTitle")}</h2>
      <p>{t("modRejected")}</p>

      <h2>{t("modWhoTitle")}</h2>
      <p>{t("modWho")}</p>

      <h2>{t("modAppealTitle")}</h2>
      <p>{t("modAppeal")}</p>
    </LegalLayout>
  );
}
