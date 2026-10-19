import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

import { LemonCheckoutButton } from "@/components/pricing/lemon-checkout-button";

/**
 * ALPAR AI — Pricing Section (server component).
 *
 * Contract:
 *  - Every user-facing string comes from the `pricing` i18n namespace.
 *  - The only purchasable plan is wired to the REAL LemonSqueezy checkout
 *    (POST /api/checkout/lemonsqueezy). The previous implementation rendered
 *    raw `https://alparai.lemonsqueezy.com/checkout/buy/starter-id` links
 *    with placeholder product ids that 404 on every click.
 *  - Plans that are not for sale yet are labelled as such instead of being
 *    advertised with a fabricated price.
 */

interface PricingSectionProps {
  locale: string;
}

export async function PricingSection({ locale }: PricingSectionProps) {
  const t = await getTranslations({ locale, namespace: "pricing" });

  const freeFeatures = [
    t("free_feature_1"),
    t("free_feature_2"),
    t("free_feature_3"),
    t("free_feature_4"),
  ];

  const startupFeatures = [t("startup_feature_1"), t("startup_feature_2"), t("startup_feature_3")];

  const enterpriseFeatures = [
    t("enterprise_feature_1"),
    t("enterprise_feature_2"),
    t("enterprise_feature_3"),
    t("enterprise_feature_4"),
  ];

  return (
    <div className="bg-bg-primary selection:bg-brand-500/30 text-fg-primary min-h-screen px-6 pt-4 pb-12 md:pt-8 md:pb-16">
      <div className="mx-auto max-w-7xl space-y-8 md:space-y-10">
        <div className="space-y-3 text-center">
          <span className="border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-300 inline-block rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            {t("badge")}
          </span>
          <h1 className="text-fg-primary text-3xl font-black tracking-tight text-balance sm:text-4xl md:text-5xl">
            {t("headline")}
          </h1>
          <p className="text-fg-muted mx-auto max-w-2xl text-base md:text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* ---------------- Free ---------------- */}
          <div className="border-border-subtle bg-bg-secondary/70 flex flex-col rounded-2xl border p-8 shadow-sm backdrop-blur-lg dark:bg-white/5">
            <h2 className="text-fg-primary text-2xl font-bold text-balance">{t("free_title")}</h2>
            <div className="mt-4 mb-6 flex items-baseline gap-2">
              <span className="text-fg-primary text-4xl font-bold">{t("free_price")}</span>
              <span className="text-fg-muted">{t("free_period")}</span>
            </div>
            <p className="text-fg-muted mb-8 flex-1 text-sm">{t("free_desc")}</p>
            <ul className="text-fg-secondary mb-8 space-y-3 text-sm">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span aria-hidden="true">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="bg-fg-primary text-bg-primary block w-full rounded-lg py-3 text-center font-semibold transition-opacity hover:opacity-90"
            >
              {t("free_cta")}
            </Link>
          </div>

          {/* ---------------- Startup (purchasable) ---------------- */}
          <div className="border-brand-500/40 bg-bg-secondary/90 shadow-brand-500/5 relative flex flex-col overflow-hidden rounded-2xl border p-8 shadow-xl backdrop-blur-xl dark:bg-white/10">
            <div className="via-brand-500/50 absolute top-0 left-1/2 h-1 w-full -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
            <h2 className="text-fg-primary text-2xl font-bold text-balance">
              {t("startup_title")}
            </h2>
            <div className="mt-4 mb-6 flex items-baseline gap-2">
              <span className="text-fg-primary text-4xl font-bold">{t("startup_price")}</span>
              <span className="text-fg-muted">{t("startup_period")}</span>
            </div>
            <p className="text-fg-muted mb-8 flex-1 text-sm">{t("startup_desc")}</p>
            <ul className="text-fg-secondary mb-8 space-y-3 text-sm">
              {startupFeatures.map((feature, index) => (
                <li
                  key={feature}
                  className={
                    index === 1
                      ? "flex items-center gap-3 font-semibold text-emerald-600 dark:text-emerald-400"
                      : "flex items-center gap-3"
                  }
                >
                  <span aria-hidden="true">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <LemonCheckoutButton
              tier="developer"
              locale={locale}
              className="block w-full rounded-lg bg-emerald-500 py-3 text-center font-semibold text-black transition-colors hover:bg-emerald-400"
              loadingLabel={t("checkout_redirecting")}
              errorLabel={t("checkout_failed")}
            >
              {t("startup_cta")}
            </LemonCheckoutButton>
          </div>

          {/* ---------------- Early Access (not for sale) ---------------- */}
          <div className="border-border-subtle bg-bg-secondary/70 flex flex-col rounded-2xl border p-8 shadow-sm backdrop-blur-lg dark:bg-white/5">
            <h2 className="text-fg-primary text-2xl font-bold text-balance">
              {t("enterprise_title")}
            </h2>
            <div className="mt-4 mb-6 flex items-baseline gap-2">
              <span className="text-fg-primary text-2xl font-bold">{t("enterprise_price")}</span>
              <span className="text-fg-muted">{t("enterprise_period")}</span>
            </div>
            <p className="text-fg-muted mb-8 flex-1 text-sm">{t("enterprise_desc")}</p>
            <ul className="text-fg-secondary mb-8 space-y-3 text-sm">
              {enterpriseFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span aria-hidden="true">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="border-border-strong text-fg-primary hover:border-brand-500 hover:text-brand-400 block w-full rounded-lg border bg-transparent py-3 text-center font-semibold transition-colors"
            >
              {t("enterprise_cta")}
            </Link>
          </div>
        </div>

        <p className="text-fg-muted text-center text-xs">
          {t("neutrality_notice")}{" "}
          <Link href="/legal/neutrality" className="hover:text-brand-400 underline">
            {t("neutrality_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
