import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import type { Metadata } from "next";
import { constructPageMetadata } from "@/lib/seo/metadata";
import { PricingProductJsonLd, BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  return constructPageMetadata({
    locale,
    pathname: "/pricing",
    title: `${t("headline")} — ALPAR AI`,
    description: t("subtitle"),
    keywords: ["AI pricing", "AI compliance plans", "incident registry pricing", "AI safety audit cost"],
  });
}

export default function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = useLocale();
  const t = useTranslations("pricing");

  return (
    <div className="bg-bg-primary selection:bg-brand-500/30 min-h-screen px-6 pt-4 pb-12 text-white md:pt-8 md:pb-16">
      <div className="mx-auto max-w-7xl space-y-8 md:space-y-10">
        <div className="space-y-3 text-center">
          <span className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-block rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            {t("badge")}
          </span>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t("headline")}
          </h1>
          <p className="text-fg-muted mx-auto max-w-2xl text-base md:text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Free Tier */}
          <div className="border-border-subtle flex flex-col rounded-2xl border bg-white/5 p-8 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-white">{t("free_title")}</h2>
            <div className="mt-4 mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{t("free_price")}</span>
              <span className="text-fg-muted">{t("free_period")}</span>
            </div>
            <p className="text-fg-muted mb-8 flex-1 text-sm">{t("free_desc")}</p>
            <ul className="mb-8 space-y-3 text-sm">
              <li className="flex items-center gap-3">✓ {t("free_feature_1")}</li>
              <li className="flex items-center gap-3">✓ {t("free_feature_2")}</li>
              <li className="flex items-center gap-3">✓ {t("free_feature_3")}</li>
              <li className="flex items-center gap-3">✓ {t("free_feature_4")}</li>
            </ul>
            <button className="w-full rounded-lg bg-white py-3 font-medium text-black transition-colors hover:bg-zinc-200">
              {t("free_cta")}
            </button>
          </div>

          {/* Startup Tier */}
          <div className="border-border-strong relative flex flex-col overflow-hidden rounded-2xl border bg-white/10 p-8 shadow-2xl shadow-white/5 backdrop-blur-xl">
            <div className="absolute top-0 left-1/2 h-1 w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <h2 className="text-2xl font-bold text-white">{t("startup_title")}</h2>
            <div className="mt-4 mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{t("startup_price")}</span>
              <span className="text-fg-muted">{t("startup_period")}</span>
            </div>
            <p className="text-fg-muted mb-8 flex-1 text-sm">{t("startup_desc")}</p>
            <ul className="mb-8 space-y-3 text-sm">
              <li className="flex items-center gap-3">✓ {t("startup_feature_1")}</li>
              <li className="flex items-center gap-3 text-emerald-400">
                ✓ {t("startup_feature_2")}
              </li>
              <li className="flex items-center gap-3">✓ {t("startup_feature_3")}</li>
            </ul>
            <button className="border-border-strong w-full rounded-lg border bg-white/10 py-3 font-medium text-white transition-colors hover:bg-white/20">
              {t("startup_cta")}
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="border-border-subtle flex flex-col rounded-2xl border bg-white/5 p-8 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-white">{t("enterprise_title")}</h2>
            <div className="mt-4 mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{t("enterprise_price")}</span>
            </div>
            <p className="text-fg-muted mb-8 flex-1 text-sm">{t("enterprise_desc")}</p>
            <ul className="mb-8 space-y-3 text-sm">
              <li className="flex items-center gap-3">✓ {t("enterprise_feature_1")}</li>
              <li className="flex items-center gap-3 text-emerald-400">
                ✓ {t("enterprise_feature_compliance")}
              </li>
              <li className="flex items-center gap-3">✓ {t("enterprise_feature_3")}</li>
              <li className="flex items-center gap-3">✓ {t("enterprise_feature_4")}</li>
            </ul>
            <button className="border-border-subtle w-full rounded-lg border bg-white/5 py-3 font-medium text-white transition-colors hover:bg-white/10">
              {t("enterprise_cta")}
            </button>
          </div>
        </div>

        <div className="text-fg-muted pt-8 text-center text-sm">
          <p>
            {t("neutrality_notice")}{" "}
            <a href="#" className="underline">
              {t("neutrality_link")}
            </a>
          </p>
        </div>

        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: `${APP_URL}/${locale}` },
            { name: "Pricing", url: `${APP_URL}/${locale}/pricing` },
          ]}
        />
        <PricingProductJsonLd
          url={`${APP_URL}/${locale}/pricing`}
          plans={[
            {
              name: "Community",
              description: "Free community tier for public incident searches and reporting.",
              price: "0",
              currency: "USD",
            },
            {
              name: "Startup & SME",
              description: "Full AI risk monitoring, API integration, and compliance dashboards.",
              price: "49",
              currency: "USD",
            },
            {
              name: "Enterprise & Government",
              description: "Custom AI Act auditing, automated provider defense filing, and dedicated SLAs.",
              price: "499",
              currency: "USD",
            },
          ]}
        />
        <FAQJsonLd
          items={[
            {
              question: "Is incident reporting and search free on ALPAR AI?",
              answer: "Yes, public searches and incident reports submitted by individuals are 100% free and open access.",
            },
            {
              question: "What is included in the Enterprise compliance plan?",
              answer: "Enterprise includes automated EU AI Act compliance checks, provider response workflows, SLA guarantees, and API data feeds.",
            },
          ]}
        />
      </div>
    </div>
  );
}
