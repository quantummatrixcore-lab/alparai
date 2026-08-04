import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Shield, BookOpen, GitCompare, Scale } from "lucide-react";
import { Link } from "@/i18n/routing";

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "methodology" });

  return (
    <Container className="max-w-4xl py-16 text-slate-100">
      <div className="mb-12 flex flex-col space-y-6">
        <div className="flex items-center space-x-3 text-sm font-semibold tracking-wider text-[#00FF88] uppercase">
          <BookOpen className="h-5 w-5" />
          <span>K-BENCHMARK METHODOLOGY</span>
        </div>
        <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
          {t("title")}
        </h1>
        <p className="text-lg leading-relaxed text-slate-400">{t("subtitle")}</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-12">
        {/* Intro */}
        <section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <p className="text-base leading-relaxed text-slate-300">{t("intro")}</p>
        </section>

        {/* Categories Details */}
        <section className="space-y-6">
          <h2 className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-2xl font-bold text-white">
            <Shield className="h-6 w-6 text-[#00FF88]" />
            <span>Evaluation Categories</span>
          </h2>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-slate-700">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k5_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t("k5_desc")}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-slate-700">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k6_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t("k6_desc")}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-slate-700">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k7_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t("k7_desc")}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-slate-700">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k8_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t("k8_desc")}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-slate-700">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k9_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t("k9_desc")}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-slate-700">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k10_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t("k10_desc")}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-slate-700">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k11_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t("k11_desc")}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-slate-700">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k12_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t("k12_desc")}</p>
            </div>
          </div>
        </section>

        {/* Adjudication Engine */}
        <section className="space-y-4">
          <h2 className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-2xl font-bold text-white">
            <GitCompare className="h-6 w-6 text-[#00FF88]" />
            <span>Cross-Model Debate Adjudication</span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">{t("adjudication_text")}</p>
        </section>

        {/* Adjudication Chain Models */}
        <section className="space-y-4">
          <h2 className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-2xl font-bold text-white">
            <GitCompare className="h-6 w-6 text-[#00FF88]" />
            <span>{t("adjudication_title")}</span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">{t("adjudication_intro")}</p>

          <div className="space-y-2">
            {(
              [
                "model_1_label",
                "model_2_label",
                "model_3_label",
                "model_4_label",
                "model_5_label",
              ] as const
            ).map((k) => (
              <div
                key={k}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#00FF88]" />
                <code className="text-sm font-semibold text-[#00FF88]">{t(k)}</code>
              </div>
            ))}
          </div>

          <p className="text-xs leading-relaxed text-slate-500">{t("adjudication_note")}</p>
        </section>

        {/* Statistical Rigor */}
        <section className="space-y-4">
          <h2 className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-2xl font-bold text-white">
            <Scale className="h-6 w-6 text-[#00FF88]" />
            <span>Statistical Rigor</span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Every score published in K-BENCHMARK is accompanied by a Wilson score interval
            representing statistical confidence at a 95% confidence level. Re-evaluation is
            automatically triggered when model providers push updates, ensuring our leaderboard
            reflects the live capability of active models.
          </p>
        </section>

        {/* CTA */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          <Link
            href="/ratings"
            className="rounded-lg bg-[#00FF88] px-6 py-3 font-bold text-slate-950 transition-all hover:bg-[#00e577]"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </Container>
  );
}
