import { getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { ComplianceLeadForm } from "@/components/compliance/compliance-lead-form";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  ArrowRight,
  Landmark,
  Radio,
  AlertTriangle,
  Clock,
  Lock,
  Cpu,
  Sparkles,
} from "lucide-react";
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
      article: t("item1_article"),
      title: t("item1_title"),
      description: t("item1_desc"),
      icon: AlertTriangle,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      article: t("item2_article"),
      title: t("item2_title"),
      description: t("item2_desc"),
      icon: Clock,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      article: t("item3_article"),
      title: t("item3_title"),
      description: t("item3_desc"),
      icon: Lock,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      article: t("item4_article"),
      title: t("item4_title"),
      description: t("item4_desc"),
      icon: Cpu,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      article: t("item5_article"),
      title: t("item5_title"),
      description: t("item5_desc"),
      icon: ShieldCheck,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  const leadFormTranslations = {
    leadFormTitle: t("leadFormTitle"),
    leadFormSubtitle: t("leadFormSubtitle"),
    emailPlaceholder: t("emailPlaceholder"),
    orgPlaceholder: t("orgPlaceholder"),
    sectorLabel: t("sectorLabel"),
    sectorBanking: t("sectorBanking"),
    sectorTelecom: t("sectorTelecom"),
    sectorEnterprise: t("sectorEnterprise"),
    submitBtn: t("submitBtn"),
    successMsg: t("successMsg"),
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-full max-w-4xl -translate-x-1/2 rounded-full bg-blue-500/10 blur-[130px]"></div>

        <Container className="relative z-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-400 uppercase backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            <span>{t("badge")}</span>
          </div>

          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            {t("hero_title")}
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#lead-magnet-form"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="h-5 w-5" />
              {t("cta_primary")}
            </a>
            <Link
              href={`/${locale}/documentation`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
              {t("cta_secondary")}
            </Link>
          </div>
        </Container>
      </section>

      {/* Sector Frameworks Section */}
      <Section className="border-b border-white/5 bg-slate-900/40 py-16 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            {/* Banking Card */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900/60 p-8 shadow-xl backdrop-blur-md transition-all hover:border-blue-500/40">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Landmark className="h-6 w-6" />
              </div>
              <span className="mb-2 block text-xs font-bold tracking-widest text-blue-400 uppercase">
                {t("banking_tab")}
              </span>
              <h3 className="mb-3 text-2xl font-bold text-white">{t("banking_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{t("banking_desc")}</p>
            </div>

            {/* Telecom Card */}
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8 shadow-xl backdrop-blur-md transition-all hover:border-cyan-500/40">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                <Radio className="h-6 w-6" />
              </div>
              <span className="mb-2 block text-xs font-bold tracking-widest text-cyan-400 uppercase">
                {t("telecom_tab")}
              </span>
              <h3 className="mb-3 text-2xl font-bold text-white">{t("telecom_title")}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{t("telecom_desc")}</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Checklist Content */}
      <Section className="py-16 md:py-24">
        <Container className="max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t("checklist_heading")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-400">
              {t("checklist_subheading")}
            </p>
          </div>

          <div className="space-y-6">
            {checklistItems.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-6 transition-all hover:border-white/20 hover:bg-slate-900 md:p-8"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${item.color}`}
                    >
                      <IconComp className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <span className="rounded-md border border-white/10 bg-white/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-blue-300">
                          {item.article}
                        </span>
                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300 md:text-base">
                        {item.description}
                      </p>
                    </div>

                    <div className="self-start md:self-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400/80 transition-colors group-hover:text-emerald-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Lead Magnet Form Section */}
      <Section
        id="lead-magnet-form"
        className="border-t border-b border-white/5 bg-slate-900/60 py-16 md:py-20"
      >
        <Container className="max-w-4xl">
          <ComplianceLeadForm t={leadFormTranslations} />
        </Container>
      </Section>

      {/* Bottom CTA */}
      <Section className="py-16 md:py-24">
        <Container className="max-w-4xl text-center">
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-10 shadow-2xl backdrop-blur-xl md:p-14">
            <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              {t("bottom_cta_title")}
            </h3>
            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-slate-300">
              {t("bottom_cta_desc")}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 font-bold text-slate-950 shadow-xl transition-all hover:scale-105 hover:bg-slate-100 active:scale-95"
            >
              <span>{t("bottom_cta_button")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </Section>
    </div>
  );
}
