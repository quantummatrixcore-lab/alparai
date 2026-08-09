import { getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { CheckCircle2, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing_complianceChecklist" });
  return {
    title: t("meta_title"),
    description: t("meta_desc"),
  };
}

export default async function ComplianceChecklistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing_complianceChecklist" });

  const checklistItems = [
    {
      title: t("item1_title"),
      description: t("item1_desc"),
    },
    {
      title: t("item2_title"),
      description: t("item2_desc"),
    },
    {
      title: t("item3_title"),
      description: t("item3_desc"),
    },
    {
      title: t("item4_title"),
      description: t("item4_desc"),
    },
    {
      title: t("item5_title"),
      description: t("item5_desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="from-primary/10 dark:from-primary/5 absolute inset-0 bg-gradient-to-b to-transparent"></div>
        <div className="bg-primary/20 pointer-events-none absolute top-0 left-1/2 h-64 w-full max-w-3xl -translate-x-1/2 rounded-full blur-[120px]"></div>

        <Container className="relative z-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/50 px-3 py-1.5 text-sm font-medium text-blue-800 backdrop-blur-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            <span>{t("badge")}</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
            {t("hero_title")}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 md:text-xl dark:text-slate-300">
            {t("hero_subtitle")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 inline-flex h-12 items-center justify-center gap-2 rounded-lg px-8 font-medium shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <FileText className="h-5 w-5" />
              {t("cta_primary")}
            </Link>
            <Link
              href="/ai-act"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-8 font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              {t("cta_secondary")}
            </Link>
          </div>
        </Container>
      </section>

      {/* Checklist Content */}
      <Section className="py-12 md:py-16">
        <Container className="max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-10 dark:border-slate-800/50 dark:bg-slate-900/50">
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
                {t("checklist_heading")}
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{t("checklist_subheading")}</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {checklistItems.map((item, i) => (
                <div
                  key={i}
                  className="group flex gap-4 p-6 transition-colors hover:bg-slate-50 md:gap-6 md:p-8 dark:hover:bg-slate-800/30"
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 transition-transform group-hover:scale-110 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 md:text-xl dark:text-white">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-6 sm:flex-row md:p-8 dark:border-slate-800 dark:bg-slate-800/20">
              <div>
                <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">
                  {t("bottom_cta_title")}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t("bottom_cta_desc")}</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-2 rounded-md bg-slate-900 px-6 font-medium text-white transition-transform hover:scale-105 dark:bg-white dark:text-slate-900"
              >
                {t("bottom_cta_button")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
