import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReportFlaggingForm from "./ReportFlaggingForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reportFlagging" });
  return {
    title: `${t("title")} — ALPAR AI`,
    description: t("description"),
    openGraph: {
      title: `${t("title")} — ALPAR AI`,
      description: t("description"),
      url: "https://alparai.com/report-flagging",
    },
  };
}

export default async function ReportFlaggingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reportFlagging" });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[--color-background]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(260 80% 18% / 0.7) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, hsl(220 70% 14% / 0.5) 0%, transparent 60%)",
        }}
      />

      <section className="mx-auto max-w-3xl px-4 pt-4 pb-20 sm:px-6 md:pt-8 md:pb-24">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(260_60%_60%_/_0.3)] bg-[hsl(260_60%_30%_/_0.15)] px-4 py-1.5 text-sm font-medium text-[hsl(260_80%_80%)]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[hsl(260_80%_70%)]" />
            {t("badge")}
          </span>
          <h1 className="mt-4 bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-fg-muted mt-4 text-lg leading-relaxed">{t("subtitle")}</p>
        </div>

        <div className="border-border-subtle relative rounded-2xl border bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-px -z-10 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, hsl(260 60% 40% / 0.08) 0%, transparent 60%)",
            }}
          />
          <ReportFlaggingForm />
        </div>

        <p className="text-fg-muted mt-10 text-center text-sm leading-relaxed italic">
          &ldquo;{t("tagline")}&rdquo;
        </p>
      </section>
    </main>
  );
}
