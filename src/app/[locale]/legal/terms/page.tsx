import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LegalLayout } from "@/components/legal/legal-layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("termsTitle"),
    description: t("termsDesc"),
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  return (
    <LegalLayout title={t("termsTitle")} lastUpdated="2026-06-01">
      <h2>{t("tAcceptance")}</h2>
      <p>{t("tAcceptanceText")}</p>

      <h2>{t("tRole")}</h2>
      <p>{t("tRoleP1")}</p>
      <p>{t("tRoleP2")}</p>

      <h2>{t("tEligibility")}</h2>
      <p>{t("tEligibilityText")}</p>

      <h2>{t("tSubmissions")}</h2>
      <p>{t("tSubmissionsIntro")}</p>
      <ol>
        <li>{t("tSub1")}</li>
        <li>{t("tSub2")}</li>
        <li>{t("tSub3")}</li>
        <li>{t("tSub4")}</li>
        <li>{t("tSub5")}</li>
      </ol>

      <h2>{t("tProhibited")}</h2>
      <p>{t("tProhibitedIntro")}</p>
      <ul>
        <li>{t("tPro1")}</li>
        <li>{t("tPro2")}</li>
        <li>{t("tPro3")}</li>
        <li>{t("tPro4")}</li>
        <li>{t("tPro5")}</li>
      </ul>

      <h2>{t("tTakedown")}</h2>
      <p>
        {t("tTakedownText")}{" "}
        <Link href="/legal/takedown" className="text-brand-400 hover:underline">
          /legal/takedown
        </Link>
        .
      </p>

      <h2>{t("tTermination")}</h2>
      <p>{t("tTerminationText")}</p>

      <h2>{t("tResponse")}</h2>
      <p>{t("tResponseText")}</p>

      <h2>{t("tNoWarranty")}</h2>
      <p>{t("tNoWarrantyText")}</p>

      <h2>{t("tLiability")}</h2>
      <p>{t("tLiabilityText")}</p>

      <h2>{t("tGoverning")}</h2>
      <p>{t("tGoverningText")}</p>

      <h2>{t("tContact")}</h2>
      <p>
        <a href="mailto:legal@alparai.com">legal@alparai.com</a>
      </p>
    </LegalLayout>
  );
}
