import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("cookiesTitle"),
    description: t("cookiesDesc"),
  };
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  return (
    <LegalLayout title={t("cookiesTitle")} lastUpdated="2026-06-01">
      <h2>{t("cookiesWhatTitle")}</h2>
      <p>{t("cookiesWhatText")}</p>

      <h2>{t("cookiesUsedTitle")}</h2>
      <table>
        <caption className="sr-only">{t("cookiesTableCaption")}</caption>
        <thead>
          <tr>
            <th>{t("cookiesColName")}</th>
            <th>{t("cookiesColPurpose")}</th>
            <th>{t("cookiesColType")}</th>
            <th>{t("cookiesColDuration")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sb-*-auth-token</code>
            </td>
            <td>{t("cookiesAuthSession")}</td>
            <td>{t("cookiesEssential")}</td>
            <td>{t("cookiesSession")}</td>
          </tr>
          <tr>
            <td>
              <code>alpar_cookie_consent</code>
            </td>
            <td>{t("cookiesConsentStore")}</td>
            <td>{t("cookiesEssential")}</td>
            <td>{t("cookies1Year")}</td>
          </tr>
        </tbody>
      </table>
      <p>{t("cookiesNoTrackText")}</p>

      <h2>{t("cookiesChoicesTitle")}</h2>
      <p>{t("cookiesChoicesText")}</p>

      <h2>{t("cookiesThirdPartyTitle")}</h2>
      <p>
        {t("cookiesThirdPartyText")}{" "}
        <a
          href="https://policies.google.com/technologies/cookies"
          target="_blank"
          rel="noreferrer noopener"
        >
          {t("cookiesGooglePolicy")}
        </a>
        .
      </p>
    </LegalLayout>
  );
}
