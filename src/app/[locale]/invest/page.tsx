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
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-8 pb-16 md:pt-14 md:pb-24">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-zinc-900/50 to-black" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mb-8 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-300">
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
            {t("badge")}
          </div>
          <h1 className="mb-8 text-5xl font-bold tracking-tight md:text-7xl">
            {t("hero_title_1")}
            <br />
            <span className="text-zinc-500">{t("hero_title_2")}</span>
          </h1>
          <p className="mb-10 max-w-2xl text-xl leading-relaxed text-zinc-400">
            {t("hero_subtitle")}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="mailto:invest@alparai.com"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-medium text-black transition-colors hover:bg-zinc-200"
            >
              {t("request_deck")}
            </a>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-transparent px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-900"
            >
              {t("read_story")}
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-t border-zinc-900 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold">$50B</div>
              <div className="text-sm text-zinc-500">{t("tam_label")}</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">14+</div>
              <div className="text-sm text-zinc-500">{t("providers_label")}</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">142+</div>
              <div className="text-sm text-zinc-500">{t("incidents_label")}</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">AGPL</div>
              <div className="text-sm text-zinc-500">{t("open_source_label")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="bg-zinc-950 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-3xl font-bold md:text-5xl">{t("why_now_title")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <Globe2 className="mb-6 h-10 w-10 text-zinc-400" />
              <h3 className="mb-4 text-xl font-semibold">{t("eu_act_title")}</h3>
              <p className="text-zinc-400">{t("eu_act_desc")}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <Zap className="mb-6 h-10 w-10 text-zinc-400" />
              <h3 className="mb-4 text-xl font-semibold">{t("enterprise_demand_title")}</h3>
              <p className="text-zinc-400">{t("enterprise_demand_desc")}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <ShieldCheck className="mb-6 h-10 w-10 text-zinc-400" />
              <h3 className="mb-4 text-xl font-semibold">{t("data_moat_title")}</h3>
              <p className="text-zinc-400">{t("data_moat_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-zinc-900 px-4 py-32 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold md:text-5xl">{t("join_round_title")}</h2>
          <p className="mb-10 text-xl text-zinc-400">{t("join_round_desc")}</p>
          <a
            href="mailto:invest@alparai.com"
            className="inline-flex items-center justify-center rounded-full bg-white px-10 py-5 text-lg font-medium text-black transition-colors hover:bg-zinc-200"
          >
            {t("contact_founder")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
