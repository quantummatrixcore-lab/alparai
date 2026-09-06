import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Database, Download, FileJson, Scale } from "lucide-react";
import { ShowcasePageTracker, TrackedCtaButton } from "@/components/analytics/showcase-tracker";
import { Link } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `Datasets & Benchmarks | AlparAI`,
    description: `Standardized datasets and benchmarks for AI incident evaluation and safety testing`,
    openGraph: {
      title: `Datasets & Benchmarks | AlparAI`,
      description: `Standardized datasets and benchmarks for AI incident evaluation and safety testing`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Datasets & Benchmarks | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function DatasetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "products.datasets" });

  return (
    <div className="pt-4 pb-16 md:pt-8 md:pb-20">
      <ShowcasePageTracker pagePath="/products/datasets" />
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="border-success-500/30 bg-success-500/10 text-success-400 inline-flex items-center gap-2 rounded-sm border px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase">
              <Database className="h-4 w-4" />
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
            <FileJson className="text-brand-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">
              {t("features.exports.title")}
            </h3>
            <p className="text-fg-secondary text-sm">{t("features.exports.desc")}</p>
          </div>
          <div className="bg-glass border-border-subtle/50 rounded-2xl border p-6 shadow-xl">
            <Scale className="text-danger-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">
              {t("features.taxonomy.title")}
            </h3>
            <p className="text-fg-secondary text-sm">{t("features.taxonomy.desc")}</p>
          </div>
          <div className="bg-glass border-border-subtle/50 rounded-2xl border p-6 shadow-xl">
            <Download className="text-success-400 mb-4 h-8 w-8" />
            <h3 className="text-fg-primary mb-2 text-xl font-bold">
              {t("features.license.title")}
            </h3>
            <p className="text-fg-secondary text-sm">{t("features.license.desc")}</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-glass border-border-subtle/50 inline-block rounded-2xl border p-8 shadow-2xl">
            <h2 className="text-fg-primary text-2xl mb-4 font-bold">{t("cta.title")}</h2>
            <p className="text-fg-secondary mb-6 max-w-md">{t("cta.desc")}</p>
            <TrackedCtaButton
              pagePath="/products/datasets"
              ctaAction="request_dataset_access"
              asChild
            >
              <Link
                href="/contact"
                className="bg-brand-600 hover:bg-brand-500 inline-flex h-12 items-center justify-center rounded-md px-8 text-sm font-bold text-white transition-all hover:scale-105"
              >
                {t("cta.button")}
              </Link>
            </TrackedCtaButton>
          </div>
        </div>
      </Container>
    </div>
  );
}

