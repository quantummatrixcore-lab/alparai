import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/legal-layout";
import { TakedownAppealForm } from "@/components/legal/takedown-appeal-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("appealPageTitle", { defaultValue: "Takedown Decision Appeal" }) };
}

export default async function TakedownAppealPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <LegalLayout
      title={t("appealPageTitle", { defaultValue: "Takedown Decision Appeal" })}
      lastUpdated="2026-08-04"
    >
      <div className="not-prose mb-6">
        <Link
          href={`/${locale}/legal/takedown`}
          className="text-brand-400 inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToTakedownPolicy", { defaultValue: "Back to Takedown Policy" })}
        </Link>
      </div>

      <p>
        {t("appealIntro", {
          defaultValue:
            "If a takedown request or removal decision was applied to your content or report, and you believe the action was taken in error or without sufficient grounds, you may submit a formal appeal below. Our 24-hour SLA applies to appeal reviews.",
        })}
      </p>

      <h2>{t("appealRightsTitle", { defaultValue: "Your Right to Appeal & Counter-Notice" })}</h2>
      <p>
        {t("appealRightsDesc", {
          defaultValue:
            "Under Article 14 of the EU E-Commerce Directive and KVKK regulations, affected parties have the right to present counter-evidence when a removal decision is rendered. All submitted appeals undergo expedited review by our Moderation Board.",
        })}
      </p>

      <div className="not-prose my-8">
        <TakedownAppealForm />
      </div>

      <h2>{t("appealNextStepsTitle", { defaultValue: "What Happens Next?" })}</h2>
      <ul>
        <li>
          {t("appealNextStep1", {
            defaultValue:
              "Your appeal is assigned a reference tracking ID and queued for moderation review.",
          })}
        </li>
        <li>
          {t("appealNextStep2", {
            defaultValue:
              "Our team evaluates the original takedown notice alongside your submitted counter-evidence.",
          })}
        </li>
        <li>
          {t("appealNextStep3", {
            defaultValue:
              "If the appeal is upheld, the affected content or status is restored immediately.",
          })}
        </li>
      </ul>
    </LegalLayout>
  );
}
