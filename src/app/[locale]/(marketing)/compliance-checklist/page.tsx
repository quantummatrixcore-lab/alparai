import { Suspense } from "react";
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
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium mb-6 border border-blue-200 dark:border-blue-800/50 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("badge")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            {t("hero_title")}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
            {t("hero_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
            >
              <FileText className="w-5 h-5" />
              {t("cta_primary")}
            </Link>
            <Link
              href="/ai-act"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            >
              {t("cta_secondary")}
            </Link>
          </div>
        </Container>
      </section>

      {/* Checklist Content */}
      <Section className="py-12 md:py-16">
        <Container className="max-w-4xl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {t("checklist_heading")}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {t("checklist_subheading")}
              </p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {checklistItems.map((item, i) => (
                <div
                  key={i}
                  className="p-6 md:p-8 flex gap-4 md:gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {t("bottom_cta_title")}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("bottom_cta_desc")}
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium transition-transform hover:scale-105 flex-shrink-0"
              >
                {t("bottom_cta_button")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
