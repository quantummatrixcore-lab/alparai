import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";
import { TakedownForm } from "@/components/legal/takedown-form";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("takedownTitle") };
}

export default async function TakedownPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  return (
    <LegalLayout title={t("takedownTitle")} lastUpdated="2026-08-04">
      <p>{t("takedownIntro", { days: 1, hours: 24 })}</p>
      <p>{t("takedownGdpr")}</p>
      <h2>{t("takedownHowTitle")}</h2>
      <ol>
        <li>{t("takedownHow1")}</li>
        <li>{t("takedownHow2")}</li>
        <li>{t("takedownHow3")}</li>
      </ol>
      <div className="not-prose mt-8">
        <TakedownForm />
      </div>
      <h2>{t("takedownNextTitle")}</h2>
      <ul>
        <li>{t("takedownNext1")}</li>
        <li>{t("takedownNext2")}</li>
        <li>{t("takedownNext3")}</li>
        <li>{t("takedownNext4")}</li>
      </ul>

      <h2>
        {t("appealSectionTitle", { defaultValue: "Appeal Mechanism (Right to Contest Takedown)" })}
      </h2>
      <p>
        {t("appealSectionDesc", {
          defaultValue:
            "To safeguard against false positives resulting from expedited 24-hour review timelines, any party affected by a removal or takedown action may submit a counter-notice appeal.",
        })}
      </p>
      <div className="not-prose my-4">
        <Link
          href={`/${locale}/legal/takedown/appeal`}
          className="bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 border-brand-500/20 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <ShieldAlert className="h-4 w-4" />
          {t("appealActionBtn", { defaultValue: "Submit an Appeal / Counter-Notice" })}
        </Link>
      </div>

      <h2>{t("takedownAbuseTitle")}</h2>
      <p>{t("takedownAbuse")}</p>
      <h2>{t("takedownDirectTitle")}</h2>
      <p>
        {t("takedownDirect")} <a href="mailto:takedown@alparai.com">takedown@alparai.com</a>
      </p>
    </LegalLayout>
  );
}
