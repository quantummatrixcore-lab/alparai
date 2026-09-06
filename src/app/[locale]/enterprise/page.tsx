import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Shield, Lock, Code, Building, CheckCircle, Calculator, PhoneCall } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ShowcasePageTracker, TrackedCtaButton } from "@/components/analytics/showcase-tracker";
import { Link } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `Enterprise Solutions | AlparAI`,
    description: `Enterprise AI safety, compliance auditing, and governance solutions`,
    openGraph: {
      title: `Enterprise Solutions | AlparAI`,
      description: `Enterprise AI safety, compliance auditing, and governance solutions`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Enterprise Solutions | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function EnterprisePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "enterprise" });

  return (
    <div className="bg-bg-primary pt-4 pb-16 md:pt-8 md:pb-20">
      <ShowcasePageTracker pagePath="/enterprise" />
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="border-warning-500/30 bg-warning-500/10 text-warning-400 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase">
              <Building className="h-4 w-4" />
              <span>{t("title")}</span>
            </div>
          </div>
          <h1 className="text-fg-primary mb-6 text-5xl font-black tracking-tight lg:text-7xl">
            {t("hero_title")}
          </h1>
          <p className="text-fg-secondary text-lg leading-relaxed lg:text-xl">{t("subtitle")}</p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="border-border-subtle bg-bg-secondary hover:border-brand-500/30 shadow-2xl transition-colors">
            <CardContent className="p-8">
              <Shield className="text-brand-400 mb-6 h-10 w-10" />
              <h3 className="text-fg-primary mb-3 text-xl font-bold">
                {t("features.vraas.title")}
              </h3>
              <p className="text-fg-secondary">{t("features.vraas.desc")}</p>
            </CardContent>
          </Card>

          <Card className="border-border-subtle bg-bg-secondary hover:border-success-500/30 shadow-2xl transition-colors">
            <CardContent className="p-8">
              <Code className="text-success-400 mb-6 h-10 w-10" />
              <h3 className="text-fg-primary mb-3 text-xl font-bold">{t("features.api.title")}</h3>
              <p className="text-fg-secondary">{t("features.api.desc")}</p>
            </CardContent>
          </Card>

          <Card className="border-border-subtle bg-bg-secondary hover:border-accent-500/30 shadow-2xl transition-colors">
            <CardContent className="p-8">
              <Lock className="text-accent-400 mb-6 h-10 w-10" />
              <h3 className="text-fg-primary mb-3 text-xl font-bold">
                {t("features.compliance.title")}
              </h3>
              <p className="text-fg-secondary">{t("features.compliance.desc")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-32">
          <div className="border-border-subtle/50 mx-auto max-w-4xl rounded-3xl border bg-gradient-to-b from-[#0F1E2E] to-[#060E17] p-8 shadow-2xl lg:p-12">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div>
                <Calculator className="text-brand-400 mb-6 h-12 w-12" />
                <h2 className="text-fg-primary mb-4 text-3xl font-bold">{t("risk_calc_title")}</h2>
                <p className="text-fg-secondary mb-8">{t("risk_calc_desc")}</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-success-500 h-5 w-5" />
                    <span className="text-fg-primary text-sm font-medium">
                      {t("features_analysis")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-success-500 h-5 w-5" />
                    <span className="text-fg-primary text-sm font-medium">
                      {t("features_liability")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-success-500 h-5 w-5" />
                    <span className="text-fg-primary text-sm font-medium">
                      {t("features_alerts")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-bg-primary border-border-subtle/50 rounded-2xl border p-8 text-center">
                <div className="mb-6">
                  <p className="text-fg-muted mb-2 text-sm font-medium">
                    {t("pricing_starting_at")}
                  </p>
                  <p className="text-fg-primary text-4xl font-black">
                    $50,000
                    <span className="text-fg-muted text-lg font-normal">
                      {t("pricing_per_year")}
                    </span>
                  </p>
                </div>

                <TrackedCtaButton pagePath="/enterprise" ctaAction="book_demo" asChild>
                  <Link
                    href="/contact"
                    className="bg-brand-600 hover:bg-brand-500 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-8 text-sm font-bold text-white shadow-[0_0_20px_rgba(231,76,60,0.3)] transition-all hover:shadow-[0_0_30px_rgba(231,76,60,0.5)]"
                  >
                    <PhoneCall className="h-4 w-4" />
                    {t("book_demo")}
                  </Link>
                </TrackedCtaButton>
                <p className="text-fg-muted mt-4 text-xs">{t("pricing_includes")}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

