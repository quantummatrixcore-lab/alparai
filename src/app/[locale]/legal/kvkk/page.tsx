import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kvkk" });
  return {
    title: `${t("title")} | ALPAR AI`,
    description: t("subtitle"),
  };
}

export default async function KvkkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kvkk" });

  return (
    <LegalLayout title={t("title")} lastUpdated="2026-07-12">
      <p className="text-fg-secondary mb-6 text-sm leading-relaxed">{t("subtitle")}</p>

      <h2>{t("data_controller_title")}</h2>
      <p>{t("data_controller_text")}</p>

      <h2>{t("purpose_title")}</h2>
      <p>{t("purpose_text")}</p>

      <h2>{t("transfer_title")}</h2>
      <p>{t("transfer_text")}</p>

      <h2>{t("rights_title")}</h2>
      <p>{t("rights_intro")}</p>
      <ol>
        <li>{t("rights_1")}</li>
        <li>{t("rights_2")}</li>
        <li>{t("rights_3")}</li>
        <li>{t("rights_4")}</li>
        <li>{t("rights_5")}</li>
        <li>{t("rights_6")}</li>
        <li>{t("rights_7")}</li>
        <li>{t("rights_8")}</li>
        <li>{t("rights_9")}</li>
      </ol>

      <div className="border-border-primary/20 mt-8 border-t pt-6">
        <p className="text-sm font-semibold">{t("contact_text")}</p>
      </div>
    </LegalLayout>
  );
}
