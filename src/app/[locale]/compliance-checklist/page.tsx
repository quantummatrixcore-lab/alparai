import { setRequestLocale, getTranslations } from "next-intl/server";
import { ShieldAlert, Clock, Scale, Database, Building2, Radio } from "lucide-react";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  ComplianceChecklistClient,
  type ChecklistItemData,
} from "@/components/compliance/compliance-checklist-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing_complianceChecklist" });

  const title = t("meta_title");
  const description = t("meta_desc");

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

export default async function ComplianceChecklistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "marketing_complianceChecklist" });

  const checklistItems: ChecklistItemData[] = [
    {
      id: "1",
      article: t("item1_article"),
      title: t("item1_title"),
      desc: t("item1_desc"),
      sector: "both",
      category: t("cat_threshold_assessment"),
    },
    {
      id: "2",
      article: t("item2_article"),
      title: t("item2_title"),
      desc: t("item2_desc"),
      sector: "both",
      category: t("cat_sla_reporting_window"),
    },
    {
      id: "3",
      article: t("item3_article"),
      title: t("item3_title"),
      desc: t("item3_desc"),
      sector: "banking",
      category: t("cat_pii_banking_secrecy"),
    },
    {
      id: "4",
      article: t("item4_article"),
      title: t("item4_title"),
      desc: t("item4_desc"),
      sector: "both",
      category: t("cat_audit_log_trail"),
    },
    {
      id: "5",
      article: t("item5_article"),
      title: t("item5_title"),
      desc: t("item5_desc"),
      sector: "telecom",
      category: t("cat_post_market_surveillance"),
    },
    {
      id: "6",
      article: t("item6_article"),
      title: t("item6_title"),
      desc: t("item6_desc"),
      sector: "banking",
      category: t("cat_cro_ethics_escalation"),
    },
    {
      id: "7",
      article: t("item7_article"),
      title: t("item7_title"),
      desc: t("item7_desc"),
      sector: "both",
      category: t("cat_forensic_rca"),
    },
    {
      id: "8",
      article: t("item8_article"),
      title: t("item8_title"),
      desc: t("item8_desc"),
      sector: "telecom",
      category: t("cat_circuit_breakers"),
    },
    {
      id: "9",
      article: t("item9_article"),
      title: t("item9_title"),
      desc: t("item9_desc"),
      sector: "both",
      category: t("cat_eu_cross_border"),
    },
    {
      id: "10",
      article: t("item10_article"),
      title: t("item10_title"),
      desc: t("item10_desc"),
      sector: "telecom",
      category: t("cat_subscriber_notice"),
    },
    {
      id: "11",
      article: t("item11_article"),
      title: t("item11_title"),
      desc: t("item11_desc"),
      sector: "banking",
      category: t("cat_mlops_retrain_loop"),
    },
    {
      id: "12",
      article: t("item12_article"),
      title: t("item12_title"),
      desc: t("item12_desc"),
      sector: "both",
      category: t("cat_10yr_dossier_retention"),
    },
  ];

  const clientTranslations = {
    badge: t("badge"),
    heroTitle: t("hero_title"),
    heroSubtitle: t("hero_subtitle"),
    ctaPrimary: t("cta_primary"),
    ctaSecondary: t("cta_secondary"),
    bankingTab: t("banking_tab"),
    telecomTab: t("telecom_tab"),
    bankingTitle: t("banking_title"),
    bankingDesc: t("banking_desc"),
    telecomTitle: t("telecom_title"),
    telecomDesc: t("telecom_desc"),
    checklistHeading: t("checklist_heading"),
    checklistSubheading: t("checklist_subheading"),
    statWindow: t("stat_window"),
    statWindowLabel: t("stat_window_label"),
    statFine: t("stat_fine"),
    statFineLabel: t("stat_fine_label"),
    statRetention: t("stat_retention"),
    statRetentionLabel: t("stat_retention_label"),
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
    bottomCtaTitle: t("bottom_cta_title"),
    bottomCtaDesc: t("bottom_cta_desc"),
    bottomCtaButton: t("bottom_cta_button"),
  };

  return (
    <main className="bg-bg-primary text-fg-primary min-h-screen selection:bg-blue-500/30">
      <div className="relative overflow-hidden pt-4 pb-16 md:pt-8 md:pb-20">
        {/* Background Ambient Glows */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-full max-w-7xl -translate-x-1/2 bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent blur-3xl" />

        <Container>
          {/* Hero Header Section */}
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-blue-400 uppercase shadow-sm backdrop-blur-md">
                <ShieldAlert className="h-3.5 w-3.5" />
                {t("badge")}
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("hero_title")}
            </h1>

            <p className="text-fg-secondary mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
              {t("hero_subtitle")}
            </p>

            <div className="border-border-subtle text-fg-primary mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-white/5 px-6 py-3 text-xs font-medium backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Building2 className="h-4 w-4" />
                <span>{t("callout_banking")}</span>
              </div>
              <span className="text-fg-secondary">•</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Radio className="h-4 w-4" />
                <span>{t("callout_telecom")}</span>
              </div>
              <span className="text-fg-secondary">•</span>
              <span className="text-amber-400">{t("callout_standard")}</span>
            </div>
          </div>

          {/* Key Stat Highlights */}
          <div className="mt-14 mb-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
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

          {/* Interactive Client Component */}
          <ComplianceChecklistClient t={clientTranslations} items={checklistItems} />
        </Container>
      </div>
    </main>
  );
}
