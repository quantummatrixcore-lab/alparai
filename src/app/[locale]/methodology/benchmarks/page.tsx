import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Shield, BookOpen, GitCompare, Scale } from "lucide-react";
import { Link } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return {
    title: `${t("title")} | ALPAR AI`,
    description: t("desc"),
  };
}

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "methodology" });

  return (
    <Container className="text-fg-primary max-w-4xl py-16">
      <div className="mb-12 flex flex-col space-y-6">
        <div className="text-emerald-accent flex items-center space-x-3 text-sm font-semibold tracking-wider uppercase">
          <BookOpen className="h-5 w-5" />
          <span>{t("methodology_badge")}</span>
        </div>
        <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
          {t("title")}
        </h1>
        <p className="text-fg-muted text-lg leading-relaxed">{t("subtitle")}</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-12">
        {/* Intro */}
        <section className="border-border-subtle bg-bg-secondary rounded-xl border p-6">
          <p className="text-fg-primary text-base leading-relaxed">{t("intro")}</p>
        </section>

        {/* Categories Details */}
        <section className="space-y-6">
          <h2 className="border-border-subtle text-2xl flex items-center space-x-2 border-b pb-3 font-bold text-white">
            <Shield className="text-emerald-accent h-6 w-6" />
            <span>{t("categoriesTitle")}</span>
          </h2>

          <div className="space-y-6">
            <div className="border-border-subtle bg-bg-secondary hover:border-border-strong rounded-xl border p-6 transition-all">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k5_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("k5_desc")}</p>
            </div>

            <div className="border-border-subtle bg-bg-secondary hover:border-border-strong rounded-xl border p-6 transition-all">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k6_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("k6_desc")}</p>
            </div>

            <div className="border-border-subtle bg-bg-secondary hover:border-border-strong rounded-xl border p-6 transition-all">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k7_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("k7_desc")}</p>
            </div>

            <div className="border-border-subtle bg-bg-secondary hover:border-border-strong rounded-xl border p-6 transition-all">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k8_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("k8_desc")}</p>
            </div>

            <div className="border-border-subtle bg-bg-secondary hover:border-border-strong rounded-xl border p-6 transition-all">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k9_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("k9_desc")}</p>
            </div>

            <div className="border-border-subtle bg-bg-secondary hover:border-border-strong rounded-xl border p-6 transition-all">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k10_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("k10_desc")}</p>
            </div>

            <div className="border-border-subtle bg-bg-secondary hover:border-border-strong rounded-xl border p-6 transition-all">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k11_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("k11_desc")}</p>
            </div>

            <div className="border-border-subtle bg-bg-secondary hover:border-border-strong rounded-xl border p-6 transition-all">
              <h3 className="mb-2 text-lg font-bold text-white">{t("k12_title")}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{t("k12_desc")}</p>
            </div>
          </div>
        </section>

        {/* Adjudication Engine */}
        <section className="space-y-4">
          <h2 className="border-border-subtle text-2xl flex items-center space-x-2 border-b pb-3 font-bold text-white">
            <GitCompare className="text-emerald-accent h-6 w-6" />
            <span>{t("adjudication_heading")}</span>
          </h2>
          <p className="text-fg-muted text-sm leading-relaxed">{t("adjudication_text")}</p>
        </section>

        {/* Adjudication Chain Models */}
        <section className="space-y-4">
          <h2 className="border-border-subtle text-2xl flex items-center space-x-2 border-b pb-3 font-bold text-white">
            <GitCompare className="text-emerald-accent h-6 w-6" />
            <span>{t("adjudication_title")}</span>
          </h2>
          <p className="text-fg-muted text-sm leading-relaxed">{t("adjudication_intro")}</p>

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
                className="border-border-subtle bg-bg-secondary flex items-center gap-3 rounded-lg border px-4 py-3"
              >
                <span className="bg-emerald-accent h-2 w-2 shrink-0 rounded-full" />
                <code className="text-emerald-accent text-sm font-semibold">{t(k)}</code>
              </div>
            ))}
          </div>

          <p className="text-fg-muted text-xs leading-relaxed">{t("adjudication_note")}</p>
        </section>

        {/* Statistical Rigor */}
        <section className="space-y-4">
          <h2 className="border-border-subtle text-2xl flex items-center space-x-2 border-b pb-3 font-bold text-white">
            <Scale className="text-emerald-accent h-6 w-6" />
            <span>{t("statistical_rigor_title")}</span>
          </h2>
          <p className="text-fg-muted text-sm leading-relaxed">{t("statistical_rigor_desc")}</p>
        </section>

        {/* CTA */}
        <div className="border-border-subtle flex items-center justify-between border-t pt-6">
          <Link
            href="/ratings"
            className="bg-emerald-accent hover:bg-emerald-accent/90 rounded-lg px-6 py-3 font-bold text-slate-950 transition-all"
          >
            {t("view_leaderboard")}
          </Link>
        </div>
      </div>
    </Container>
  );
}
