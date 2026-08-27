import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ComplianceLeadForm } from "@/components/compliance/compliance-lead-form";
import {
  ShieldAlert,
  Clock,
  Scale,
  FileCheck2,
  Building2,
  Radio,
  FileText,
  AlertTriangle,
  Lock,
  Search,
  CheckCircle,
  Database,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compliance" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CompliancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "compliance" });

  const checklistItems = [
    {
      id: "1",
      icon: Clock,
      title: t("item1_title"),
      desc: t("item1_desc"),
      category: t("cat_mandatory_sla"),
      color: "text-amber-400 border-warning-500/20 bg-amber-500/10",
    },
    {
      id: "2",
      icon: AlertTriangle,
      title: t("item2_title"),
      desc: t("item2_desc"),
      category: t("cat_annex_iii_scope"),
      color: "text-rose-400 border-rose-500/20 bg-rose-500/10",
    },
    {
      id: "3",
      icon: Lock,
      title: t("item3_title"),
      desc: t("item3_desc"),
      category: t("cat_gdpr_pii"),
      color: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    },
    {
      id: "4",
      icon: Database,
      title: t("item4_title"),
      desc: t("item4_desc"),
      category: t("cat_audit_infra"),
      color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    },
    {
      id: "5",
      icon: ShieldAlert,
      title: t("item5_title"),
      desc: t("item5_desc"),
      category: t("cat_regulatory_channel"),
      color: "text-emerald-400 border-success-500/20 bg-emerald-500/10",
    },
    {
      id: "6",
      icon: FileCheck2,
      title: t("item6_title"),
      desc: t("item6_desc"),
      category: t("cat_governance"),
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    },
    {
      id: "7",
      icon: Search,
      title: t("item7_title"),
      desc: t("item7_desc"),
      category: t("cat_forensic_analysis"),
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    },
    {
      id: "8",
      icon: CheckCircle,
      title: t("item8_title"),
      desc: t("item8_desc"),
      category: t("cat_mitigation_safeguards"),
      color: "text-teal-400 border-teal-500/20 bg-teal-500/10",
    },
    {
      id: "9",
      icon: Scale,
      title: t("item9_title"),
      desc: t("item9_desc"),
      category: t("cat_eu_jurisdiction"),
      color: "text-sky-400 border-sky-500/20 bg-sky-500/10",
    },
    {
      id: "10",
      icon: Building2,
      title: t("item10_title"),
      desc: t("item10_desc"),
      category: t("cat_subscriber_protection"),
      color: "text-orange-400 border-orange-500/20 bg-orange-500/10",
    },
    {
      id: "11",
      icon: Radio,
      title: t("item11_title"),
      desc: t("item11_desc"),
      category: t("cat_mlops_retrain"),
      color: "text-violet-400 border-violet-500/20 bg-violet-500/10",
    },
    {
      id: "12",
      icon: FileText,
      title: t("item12_title"),
      desc: t("item12_desc"),
      category: t("cat_10yr_archiving"),
      color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    },
  ];

  const leadFormTranslations = {
    leadFormTitle: t("lead_form_title"),
    leadFormSubtitle: t("lead_form_subtitle"),
    emailPlaceholder: t("form_email_placeholder"),
    orgPlaceholder: t("form_org_placeholder"),
    sectorLabel: t("form_sector_label"),
    sectorBanking: t("form_sector_banking"),
    sectorTelecom: t("form_sector_telecom"),
    sectorEnterprise: t("form_sector_enterprise"),
    submitBtn: t("form_submit"),
    successMsg: t("form_success"),
  };

  return (
    <main className="bg-bg-primary text-fg-primary min-h-screen selection:bg-blue-500/30">
      <div className="relative overflow-hidden pt-4 pb-16 md:pt-8 md:pb-20">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl" />

        <Container>
          <div className="mx-auto max-w-4xl text-center">
            {/* Header Badge */}
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-blue-400 uppercase shadow-sm backdrop-blur-md">
                <ShieldAlert className="h-3.5 w-3.5" />
                {t("header_badge")}
              </span>
            </div>

            {/* Hero Title */}
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("header_title")}
            </h1>

            {/* Hero Subtitle */}
            <p className="text-fg-secondary mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
              {t("header_subtitle")}
            </p>

            {/* Banking & Telecom Sector Callout */}
            <div className="border-border-subtle text-fg-primary mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-white/5 px-6 py-3 text-xs font-medium backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Building2 className="h-4 w-4" />
                <span>{t("sector_banking_callout")}</span>
              </div>
              <span className="text-fg-secondary">•</span>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Radio className="h-4 w-4" />
                <span>{t("sector_telecom_callout")}</span>
              </div>
              <span className="text-fg-secondary">•</span>
              <span className="text-emerald-400">{t("banking_telecom_notice")}</span>
            </div>
          </div>

          {/* Key Stat Cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card className="border-warning-500/20 bg-amber-950/10 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <Clock className="mx-auto mb-3 h-8 w-8 text-amber-400" />
                <div className="text-3xl font-black text-white">{t("stat_window")}</div>
                <div className="mt-1 text-xs font-medium text-amber-200/80">
                  {t("stat_window_label")}
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-500/20 bg-rose-950/10 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <Scale className="mx-auto mb-3 h-8 w-8 text-rose-400" />
                <div className="text-3xl font-black text-white">{t("stat_fine")}</div>
                <div className="mt-1 text-xs font-medium text-rose-200/80">
                  {t("stat_fine_label")}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-950/10 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <Database className="mx-auto mb-3 h-8 w-8 text-blue-400" />
                <div className="text-3xl font-black text-white">{t("stat_retention")}</div>
                <div className="mt-1 text-xs font-medium text-blue-200/80">
                  {t("stat_retention_label")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Magnet Capture Form */}
          <div className="mt-16">
            <ComplianceLeadForm t={leadFormTranslations} />
          </div>

          {/* 12-Point Checklist Grid */}
          <div className="mt-24">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("checklist_section_title")}
              </h2>
              <p className="text-fg-secondary mt-3">{t("checklist_section_desc")}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {checklistItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Card
                    key={item.id}
                    className="group border-border-subtle bg-bg-secondary/70 hover:bg-bg-secondary relative overflow-hidden transition-all hover:border-blue-500/40 hover:shadow-xl"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.color}`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="border-border-subtle text-fg-muted rounded-full border bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-blue-400">
                        {item.title}
                      </h3>

                      <p className="text-fg-muted text-sm leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sector Breakdown: Banking vs Telecom */}
          <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Banking Box */}
            <div className="to-bg-secondary rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 p-8 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{t("banking_section_title")}</h3>
              </div>
              <ul className="text-fg-primary space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    <strong>{t("banking_item1_label")}</strong> {t("banking_item1_text")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    <strong>{t("banking_item2_label")}</strong> {t("banking_item2_text")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    <strong>{t("banking_item3_label")}</strong> {t("banking_item3_text")}
                  </span>
                </li>
              </ul>
            </div>

            {/* Telecom Box */}
            <div className="to-bg-secondary rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 p-8 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Radio className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{t("telecom_section_title")}</h3>
              </div>
              <ul className="text-fg-primary space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong>{t("telecom_item1_label")}</strong> {t("telecom_item1_text")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong>{t("telecom_item2_label")}</strong> {t("telecom_item2_text")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong>{t("telecom_item3_label")}</strong> {t("telecom_item3_text")}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border-border-subtle mt-24 rounded-3xl border bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 p-10 text-center shadow-2xl backdrop-blur-xl">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{t("cta_title")}</h2>
            <p className="text-fg-primary mx-auto mb-8 max-w-2xl text-base">{t("cta_desc")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/enterprise"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-black shadow-lg transition-all hover:bg-gray-200"
              >
                <span>{t("cta_button")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
