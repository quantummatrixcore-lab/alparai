import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Globe2, ShieldCheck, Zap } from "lucide-react";
import { Link } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "invest" });
  return {
    title: t("meta_title"),
    description: t("meta_desc"),
  };
}

export default async function InvestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "invest" });

  return (
    <div className="selection:bg-bg-elevated min-h-screen bg-bg-primary text-fg-primary">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-4 pb-12 md:pt-8 md:pb-16">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-bg-secondary/50 to-bg-primary" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="border-border-subtle bg-bg-secondary/50 text-fg-secondary mb-8 inline-flex items-center rounded-full border px-3 py-1 text-sm">
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
            {t("badge")}
          </div>
          <h1 className="mb-8 text-5xl font-bold tracking-tight md:text-7xl">
            {t("hero_title_1")}
            <br />
            <span className="text-fg-muted">{t("hero_title_2")}</span>
          </h1>
          <p className="text-fg-muted mb-10 max-w-2xl text-xl leading-relaxed">
            {t("hero_subtitle")}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="mailto:invest@alparai.com"
              className="inline-flex items-center justify-center rounded-lg bg-fg-primary px-8 py-4 text-base font-medium text-bg-primary transition-colors hover:bg-fg-secondary"
            >
              {t("request_deck")}
            </a>
            <Link
              href="/about"
              className="border-border-subtle hover:bg-bg-secondary inline-flex items-center justify-center rounded-lg border bg-transparent px-8 py-4 text-base font-medium text-white transition-colors"
            >
              {t("read_story")}
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-t border-border-subtle px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold">$50B</div>
              <div className="text-fg-muted text-sm">{t("tam_label")}</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">14+</div>
              <div className="text-fg-muted text-sm">{t("providers_label")}</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">142+</div>
              <div className="text-fg-muted text-sm">{t("incidents_label")}</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">AGPL</div>
              <div className="text-fg-muted text-sm">{t("open_source_label")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="bg-bg-primary px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-3xl font-bold md:text-5xl">{t("why_now_title")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-border-subtle bg-bg-secondary/50 rounded-2xl border p-8">
              <Globe2 className="text-fg-muted mb-6 h-10 w-10" />
              <h3 className="mb-4 text-xl font-semibold">{t("eu_act_title")}</h3>
              <p className="text-fg-muted">{t("eu_act_desc")}</p>
            </div>
            <div className="border-border-subtle bg-bg-secondary/50 rounded-2xl border p-8">
              <Zap className="text-fg-muted mb-6 h-10 w-10" />
              <h3 className="mb-4 text-xl font-semibold">{t("enterprise_demand_title")}</h3>
              <p className="text-fg-muted">{t("enterprise_demand_desc")}</p>
            </div>
            <div className="border-border-subtle bg-bg-secondary/50 rounded-2xl border p-8">
              <ShieldCheck className="text-fg-muted mb-6 h-10 w-10" />
              <h3 className="mb-4 text-xl font-semibold">{t("data_moat_title")}</h3>
              <p className="text-fg-muted">{t("data_moat_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-border-subtle px-4 py-16 md:py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold md:text-5xl">{t("join_round_title")}</h2>
          <p className="text-fg-muted mb-10 text-xl">{t("join_round_desc")}</p>
          <a
            href="mailto:invest@alparai.com"
            className="inline-flex items-center justify-center rounded-full bg-fg-primary px-10 py-5 text-lg font-medium text-bg-primary transition-colors hover:bg-fg-secondary"
          >
            {t("contact_founder")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
