import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: `${t("title")} | ALPAR AI`,
    description: t("subtitle"),
  };
}

export default async function EnterprisePricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  return (
    <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-6 pb-20 md:pt-10">
      {/* Background decoration */}
      <div className="bg-accent-soft/10 pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
      <div className="bg-accent-glow/10 pointer-events-none absolute right-1/4 bottom-10 h-[400px] w-[400px] rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="from-fg-primary via-fg-secondary to-accent mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
            {t("title")}
          </h1>
          <p className="text-fg-secondary mx-auto max-w-2xl text-lg leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto mb-16 grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <div className="bg-bg-secondary/30 border-border-primary/50 hover:border-border-primary relative flex flex-col justify-between rounded-3xl border p-8 backdrop-blur-md transition-all duration-300">
            <div>
              <h3 className="text-fg-primary mb-2 text-xl font-bold">{t("free_title")}</h3>
              <p className="text-fg-secondary mb-6 text-sm leading-relaxed">
                {t("free_desc")}
              </p>
              <div className="mb-8 flex items-baseline">
                <span className="text-fg-primary text-4xl font-extrabold">{t("free_price")}</span>
                <span className="text-fg-secondary ml-2 text-sm">/ {t("free_period")}</span>
              </div>
            </div>
            <button className="bg-bg-secondary border-border-primary text-fg-primary hover:bg-bg-secondary/80 w-full rounded-2xl border px-6 py-4 font-medium transition-all duration-200">
              {t("free_cta")}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-bg-secondary/40 border-accent-soft/50 shadow-accent-soft/5 relative flex flex-col justify-between rounded-3xl border-2 p-8 shadow-xl backdrop-blur-md transition-all duration-300">
            <div className="bg-accent-soft text-bg-primary absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold tracking-wider uppercase">
              Popular
            </div>
            <div>
              <h3 className="text-fg-primary mb-2 text-xl font-bold">{t("enterprise_title")}</h3>
              <p className="text-fg-secondary mb-6 text-sm leading-relaxed">
                {t("enterprise_desc")}
              </p>
              <div className="mb-8 flex items-baseline">
                <span className="text-fg-primary text-4xl font-extrabold">
                  {t("enterprise_price")}
                </span>
                <span className="text-fg-secondary ml-2 text-sm">
                  / {t("enterprise_period")}
                </span>
              </div>

              {/* Features List */}
              <div className="border-border-primary/40 mb-8 border-t pt-6">
                <h4 className="text-fg-primary mb-4 text-sm font-bold">{t("enterprise_feature_compliance")}</h4>
                <ul className="text-fg-secondary space-y-3 text-sm">
                  <li className="flex items-center space-x-3">
                    <svg
                      className="text-accent-soft h-5 w-5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("enterprise_feature_1")}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg
                      className="text-accent-soft h-5 w-5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("enterprise_feature_2")}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg
                      className="text-accent-soft h-5 w-5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("enterprise_feature_3")}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg
                      className="text-accent-soft h-5 w-5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("enterprise_feature_4")}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <Link
                href="/contact"
                className="bg-accent-soft hover:bg-accent-soft/90 text-bg-primary mb-4 block w-full rounded-2xl px-6 py-4 text-center font-semibold transition-all duration-200"
              >
                {t("enterprise_cta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
