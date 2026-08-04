import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("neutralityTitle"),
    description: t("neutralityDesc"),
  };
}

export default async function NeutralityCharterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <LegalLayout title={t("neutralityTitle")} lastUpdated="2026-07-04">
      <p className="text-fg-secondary mb-8 text-lg leading-relaxed font-medium">
        {t("neutralitySubtitle")}
      </p>

      <h2>{t("nCore")}</h2>
      <p>{t("nCoreText")}</p>

      <h2>{t("nPinned")}</h2>
      <p>{t("nPinnedText")}</p>

      <h2>{t("nTransparency")}</h2>
      <p>{t("nTransparencyText")}</p>

      <h2>{t("nIntermediary")}</h2>
      <p>{t("nIntermediaryText")}</p>

      <h2>{t("nRightOfReply")}</h2>
      <p>{t("nRightOfReplyText")}</p>

      <h2>{t("nDonations")}</h2>

      <h3>{t("nDonationsWho")}</h3>
      <p>{t("nDonationsWhoText")}</p>

      <h3>{t("nDonationsRegister")}</h3>
      <p>{t("nDonationsRegisterText")}</p>

      <h3>{t("nDonationsInfluence")}</h3>
      <p>{t("nDonationsInfluenceText")}</p>

      <h3>{t("nDonationsCaps")}</h3>
      <p>{t("nDonationsCapsText")}</p>
    </LegalLayout>
  );
}
