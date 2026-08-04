import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { StripeCheckoutButton } from "@/components/pricing/stripe-checkout-button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pricing" });

  const tiers = [
    {
      key: "free",
      price: t("free_price"),
      period: t("free_period"),
      features: [
        t("free_feature_1"),
        t("free_feature_2"),
        t("free_feature_3"),
        t("free_feature_4"),
      ],
      cta: t("free_cta"),
      href: "/submit",
      variant: "outline" as const,
      popular: false,
    },
    {
      key: "pro",
      price: t("pro_price"),
      period: t("pro_period"),
      features: [t("pro_feature_1"), t("pro_feature_2"), t("pro_feature_3"), t("pro_feature_4")],
      cta: t("pro_cta"),
      variant: "outline" as const,
      popular: true,
      checkout: true,
    },
    {
      key: "portal",
      price: t("portal_price"),
      period: t("portal_period"),
      features: [
        t("portal_feature_1"),
        t("portal_feature_2"),
        t("portal_feature_3"),
        t("portal_feature_4"),
      ],
      cta: t("portal_cta"),
      href: "/contact?subject=portal-inquiry",
      variant: "primary" as const,
      popular: false,
    },
    {
      key: "enterprise",
      price: t("enterprise_price"),
      period: t("enterprise_period"),
      features: [
        t("enterprise_feature_1"),
        t("enterprise_feature_2"),
        t("enterprise_feature_3"),
        t("enterprise_feature_4"),
      ],
      cta: t("enterprise_cta"),
      href: "/contact?subject=enterprise-inquiry",
      variant: "outline" as const,
      popular: false,
    },
  ];

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="border-brand-500/30 bg-brand-500/10 text-brand-400 inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold tracking-wider uppercase">
          {t("badge")}
        </span>
        <h1 className="text-fg-primary mt-6 text-4xl font-black tracking-tight sm:text-5xl">
          {t("headline")}
        </h1>
        <p className="text-fg-secondary mt-4 text-lg leading-relaxed">{t("subtitle")}</p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Card
            key={tier.key}
            className={`relative flex flex-col justify-between overflow-hidden border-t-4 transition-all duration-300 hover:-translate-y-1 ${
              tier.popular
                ? "border-t-brand-500 shadow-[0_0_30px_rgba(0,255,136,0.1)]"
                : "border-t-border-subtle"
            }`}
          >
            {tier.popular && (
              <span className="bg-brand-500 absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-black uppercase">
                POPULAR
              </span>
            )}
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div>
                <h3 className="text-fg-primary text-xl font-bold">{t(`${tier.key}_title`)}</h3>
                <p className="text-fg-muted mt-2 min-h-[40px] text-xs">{t(`${tier.key}_desc`)}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-fg-primary text-4xl font-black tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-fg-muted text-xs font-semibold">/{tier.period}</span>
                </div>

                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="text-brand-400 mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-fg-secondary text-xs leading-normal font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {"checkout" in tier && tier.checkout ? (
                  <StripeCheckoutButton variant={tier.variant} className="w-full">
                    {tier.cta}
                  </StripeCheckoutButton>
                ) : (
                  <Link
                    href={"href" in tier && tier.href ? tier.href : "/"}
                    className="block w-full"
                  >
                    <Button variant={tier.variant} className="w-full">
                      {tier.cta}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-fg-muted mt-16 text-center text-xs">
        {t("neutrality_notice")}{" "}
        <Link href="/legal/neutrality" className="text-brand-400 font-medium hover:underline">
          {t("neutrality_link")}
        </Link>
      </div>
    </Container>
  );
}
