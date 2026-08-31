import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Target, CheckCircle2, FileText, Settings } from "lucide-react";
import { ShowcasePageTracker, TrackedCtaButton } from "@/components/analytics/showcase-tracker";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `EU AI Act Compliance | AlparAI`,
    description: `Automated compliance auditing and readiness assessment for EU AI Act obligations`,
    openGraph: {
      title: `EU AI Act Compliance | AlparAI`,
      description: `Automated compliance auditing and readiness assessment for EU AI Act obligations`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `EU AI Act Compliance | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function EuAiActPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "products.eu_ai_act_page" });

  return (
    <div className="pt-4 pb-16 md:pt-8 md:pb-20">
      <ShowcasePageTracker pagePath="/products/eu-ai-act" />
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="border-brand-500/30 bg-brand-500/10 text-brand-400 inline-flex items-center gap-2 rounded-sm border px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase">
              <Target className="h-4 w-4" />
              <span>{t("badge")}</span>
            </div>
          </div>
          <h1 className="text-fg-primary mb-6 text-5xl font-black tracking-tight lg:text-6xl">
            {t("title")}
          </h1>
          <p className="text-fg-secondary text-lg leading-relaxed">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-glass border-border-subtle/50 rounded-2xl border p-6 shadow-xl">
            <CheckCircle2 className="text-success-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">{t("art73_title")}</h3>
            <p className="text-fg-secondary text-sm">{t("art73_desc")}</p>
          </div>
          <div className="bg-glass border-border-subtle/50 rounded-2xl border p-6 shadow-xl">
            <FileText className="text-brand-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">{t("audit_trails_title")}</h3>
            <p className="text-fg-secondary text-sm">{t("audit_trails_desc")}</p>
          </div>
          <div className="bg-glass border-border-subtle/50 rounded-2xl border p-6 shadow-xl">
            <Settings className="text-warning-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">{t("risk_cat_title")}</h3>
            <p className="text-fg-secondary text-sm">{t("risk_cat_desc")}</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-glass border-border-subtle/50 inline-block rounded-2xl border p-8 shadow-2xl">
            <h2 className="text-fg-primary text-2xl mb-4 font-bold">
              {t("join_beta_title")}
            </h2>
            <p className="text-fg-secondary mb-6 max-w-md">{t("join_beta_desc")}</p>
            <TrackedCtaButton
              pagePath="/products/eu-ai-act"
              ctaAction="join_waitlist"
              href="mailto:contact@alparai.com?subject=EU AI Act Beta Access"
              className="bg-brand-600 hover:bg-brand-500 inline-flex h-12 items-center justify-center rounded-md px-8 text-sm font-bold text-white transition-all hover:scale-105"
            >
              {t("join_waitlist")}
            </TrackedCtaButton>
          </div>
        </div>
      </Container>
    </div>
  );
}

