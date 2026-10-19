import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Script from "next/script";

import { PricingSection } from "@/components/marketing/pricing-section";
import { constructPageMetadata } from "@/lib/seo/metadata";
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
    keywords: [
      "AI pricing",
      "AI compliance plans",
      "incident registry pricing",
      "AI safety audit cost",
      "EU AI Act compliance pricing",
    ],
  });
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pricing" });

  // The JSON-LD advertises ONLY the plan that is actually purchasable.
  // Previously it published three fake $49/$199/$999 offers pointing at
  // placeholder LemonSqueezy product ids ("starter-id", "pro-id", "ent-id").
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "ALPAR AI Plans",
    itemListElement: [
      {
        "@type": "Offer",
        name: t("free_title"),
        price: "0",
        priceCurrency: "USD",
        description: t("free_desc"),
        url: `${APP_URL}/${locale}/pricing`,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: t("startup_title"),
        price: "990",
        priceCurrency: "TRY",
        description: t("startup_desc"),
        url: `${APP_URL}/${locale}/pricing`,
        availability: "https://schema.org/InStock",
      },
    ],
  };

  return (
    <>
      <Script
        id="pricing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <PricingSection locale={locale} />
      </main>
    </>
  );
}
