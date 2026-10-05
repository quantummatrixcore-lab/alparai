import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("dmcaTitle"),
    description: t("dmcaDesc"),
  };
}

export default async function DmcaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <LegalLayout title={t("dmcaTitle")} lastUpdated="2026-08-14">
      <p>{t("dmcaDesc")}</p>

      <h2>{t("dmcaNoticeTitle")}</h2>
      <p>{t("dmcaNotice")}</p>
      <ul>
        <li>{t("dmcaNotice1")}</li>
        <li>{t("dmcaNotice2")}</li>
        <li>{t("dmcaNotice3")}</li>
        <li>{t("dmcaNotice4")}</li>
        <li>{t("dmcaNotice5")}</li>
        <li>{t("dmcaNotice6")}</li>
      </ul>

      <h2>{t("dmcaContactTitle")}</h2>
      <p>{t("dmcaContact")}</p>

      <h2>{t("dmcaCounterTitle")}</h2>
      <p>{t("dmcaCounter")}</p>

      <h2>{t("dmcaTimelinesTitle")}</h2>
      <p>{t("dmcaTimelines")}</p>
    </LegalLayout>
  );
}
