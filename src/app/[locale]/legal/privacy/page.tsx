import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("privacyTitle"),
    description: t("privacyDesc"),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  return (
    <LegalLayout title={t("privacyTitle")} lastUpdated="2026-06-01">
      <h2>{t("privacyWhoTitle")}</h2>
      <p>{t("privacyWho")}</p>

      <h2>{t("privacyCollectTitle")}</h2>
      <ul>
        <li>{t("privacyCollectAccount")}</li>
        <li>{t("privacyCollectSubmissions")}</li>
        <li>{t("privacyCollectTech")}</li>
        <li>{t("privacyCollectCookies")}</li>
      </ul>

      <h2>{t("privacyNotTitle")}</h2>
      <ul>
        <li>{t("privacyNot1")}</li>
        <li>{t("privacyNot2")}</li>
        <li>{t("privacyNot3")}</li>
      </ul>

      <h2>{t("privacyPiiTitle")}</h2>
      <p>{t("privacyPii")}</p>

      <h2>{t("privacyRightsTitle")}</h2>
      <p>{t("privacyRightsIntro")}</p>
      <ul>
        <li>{t("privacyRights1")}</li>
        <li>{t("privacyRights2")}</li>
        <li>{t("privacyRights3")}</li>
        <li>{t("privacyRights4")}</li>
        <li>{t("privacyRights5")}</li>
        <li>{t("privacyRights6")}</li>
      </ul>
      <p>
        <a href="mailto:privacy@alparai.com">privacy@alparai.com</a>
      </p>

      <h2>{t("privacyBasisTitle")}</h2>
      <p>{t("privacyBasis")}</p>

      <h2>{t("privacyRetentionTitle")}</h2>
      <ul>
        <li>{t("privacyRetentionAccount")}</li>
        <li>{t("privacyRetentionIncidents")}</li>
        <li>{t("privacyRetentionRejected")}</li>
        <li>{t("privacyRetentionAudit")}</li>
        <li>{t("privacyRetentionBackups")}</li>
      </ul>

      <h2>{t("privacySubprocessorsTitle")}</h2>
      <ul>
        <li>{t("privacySub1")}</li>
        <li>{t("privacySub2")}</li>
        <li>{t("privacySub3")}</li>
        <li>{t("privacySub4")}</li>
      </ul>

      <h2>{t("privacyTransfersTitle")}</h2>
      <p>{t("privacyTransfers")}</p>

      <h2>{t("privacyChildrenTitle")}</h2>
      <p>{t("privacyChildren")}</p>

      <h2>{t("privacyChangesTitle")}</h2>
      <p>{t("privacyChanges")}</p>

      <h2>{t("privacyContactTitle")}</h2>
      <p>
        <a href="mailto:dpo@alparai.com">dpo@alparai.com</a>
      </p>
      <p>{t("privacyPostal")}</p>
    </LegalLayout>
  );
}
