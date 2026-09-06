import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Shield, Zap, Lock, Code } from "lucide-react";
import { ShowcasePageTracker, TrackedCtaButton } from "@/components/analytics/showcase-tracker";
import { Link } from "@/i18n/routing";
import { getGlobalMetrics } from "@/lib/services/metrics-service";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `ARS API | AlparAI`,
    description: `Autonomous Risk Scoring and incident evaluation API for AI systems`,
    openGraph: {
      title: `ARS API | AlparAI`,
      description: `Autonomous Risk Scoring and incident evaluation API for AI systems`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `ARS API | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function ArsApiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "products.ars_api_page" });
  const metrics = await getGlobalMetrics();

  return (
    <div className="pt-4 pb-16 md:pt-8 md:pb-20">
      <ShowcasePageTracker pagePath="/products/ars-api" />
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="border-danger-500/30 bg-danger-500/10 text-danger-400 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              <Shield className="h-3.5 w-3.5" />
              <span>{t("badge")}</span>
            </div>
          </div>
          <h1 className="text-fg-primary mb-4 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="text-fg-secondary text-base leading-relaxed sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-glass border-border-subtle/50 rounded-2xl border p-6 shadow-xl">
            <Zap className="text-warning-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">{t("telemetry_title")}</h3>
            <p className="text-fg-secondary text-sm">{t("telemetry_desc")}</p>
          </div>
          <div className="bg-glass border-border-subtle/50 rounded-2xl border p-6 shadow-xl">
            <Lock className="text-brand-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">{t("precision_title")}</h3>
            <p className="text-fg-secondary text-sm">
              {t("precision_desc", { count: metrics.totalIncidents })}
            </p>
          </div>
          <div className="bg-glass border-border-subtle/50 rounded-2xl border p-6 shadow-xl">
            <Code className="text-success-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">{t("dev_first_title")}</h3>
            <p className="text-fg-secondary text-sm">{t("dev_first_desc")}</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-glass border-border-subtle/50 inline-block rounded-2xl border p-8 shadow-2xl">
            <h2 className="text-fg-primary text-2xl mb-4 font-bold">
              {t("early_access_title")}
            </h2>
            <p className="text-fg-secondary mb-6 max-w-md">{t("early_access_desc")}</p>
            <TrackedCtaButton pagePath="/products/ars-api" ctaAction="request_api_access" asChild>
              <Link
                href="/contact"
                className="bg-brand-600 hover:bg-brand-500 inline-flex h-12 items-center justify-center rounded-md px-8 text-sm font-bold text-white transition-all hover:scale-105"
              >
                {t("request_access")}
              </Link>
            </TrackedCtaButton>
          </div>
        </div>
      </Container>
    </div>
  );
}

