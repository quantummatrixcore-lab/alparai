import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("imprintTitle") };
}

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <LegalLayout title={t("imprintTitle")} lastUpdated="2026-06-22">
      <h2>{t("imprintOperator")}</h2>
      <p>{t("imprintOperatorText")}</p>

      <h2>{t("imprintContact")}</h2>
      <p>
        <strong>{t("imprintEmail")}</strong>
      </p>
      <p>{t("imprintAddress")}</p>

      <h2>{t("imprintRepresentation")}</h2>
      <p>{t("imprintRepresentationText")}</p>

      <h2>{t("imprintDisclaimer")}</h2>
      <p>{t("imprintDisclaimerText")}</p>

      <h2>{t("imprintJurisdiction")}</h2>
      <p>{t("imprintJurisdictionText")}</p>
    </LegalLayout>
  );
}
