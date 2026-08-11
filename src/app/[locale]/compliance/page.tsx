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
      category: "Mandatory SLA",
      color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    },
    {
      id: "2",
      icon: AlertTriangle,
      title: t("item2_title"),
      desc: t("item2_desc"),
      category: "Annex III Scope",
      color: "text-rose-400 border-rose-500/20 bg-rose-500/10",
    },
    {
      id: "3",
      icon: Lock,
      title: t("item3_title"),
      desc: t("item3_desc"),
      category: "GDPR & PII",
      color: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    },
    {
      id: "4",
      icon: Database,
      title: t("item4_title"),
      desc: t("item4_desc"),
      category: "Audit Infrastructure",
      color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    },
    {
      id: "5",
      icon: ShieldAlert,
      title: t("item5_title"),
      desc: t("item5_desc"),
      category: "Regulatory Channel",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    },
    {
      id: "6",
      icon: FileCheck2,
      title: t("item6_title"),
      desc: t("item6_desc"),
      category: "Governance",
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    },
    {
      id: "7",
      icon: Search,
      title: t("item7_title"),
      desc: t("item7_desc"),
      category: "Forensic Analysis",
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    },
    {
      id: "8",
      icon: CheckCircle,
      title: t("item8_title"),
      desc: t("item8_desc"),
      category: "Mitigation & Safeguards",
      color: "text-teal-400 border-teal-500/20 bg-teal-500/10",
    },
    {
      id: "9",
      icon: Scale,
      title: t("item9_title"),
      desc: t("item9_desc"),
      category: "EU Jurisdiction",
      color: "text-sky-400 border-sky-500/20 bg-sky-500/10",
    },
    {
      id: "10",
      icon: Building2,
      title: t("item10_title"),
      desc: t("item10_desc"),
      category: "Subscriber Protection",
      color: "text-orange-400 border-orange-500/20 bg-orange-500/10",
    },
    {
      id: "11",
      icon: Radio,
      title: t("item11_title"),
      desc: t("item11_desc"),
      category: "MLOps Retrain Pipeline",
      color: "text-violet-400 border-violet-500/20 bg-violet-500/10",
    },
    {
      id: "12",
      icon: FileText,
      title: t("item12_title"),
      desc: t("item12_desc"),
      category: "10-Year Archiving",
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
      <div className="relative overflow-hidden pt-28 pb-20">
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
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium text-gray-300 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Building2 className="h-4 w-4" />
                <span>Banking (EBA/ECB)</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Radio className="h-4 w-4" />
                <span>Telecom (BEREC/GDPR)</span>
              </div>
              <span className="text-gray-600">•</span>
              <span className="text-emerald-400">{t("banking_telecom_notice")}</span>
            </div>
          </div>

          {/* Key Stat Cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card className="border-amber-500/20 bg-amber-950/10 backdrop-blur-md">
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
                EU AI Act Article 73 Implementation Checklist
              </h2>
              <p className="text-fg-secondary mt-3">
                12 operational steps required for banking and telecom compliance departments under
                Annex III high-risk AI rules.
              </p>
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
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-gray-400">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-blue-400">
                        {item.title}
                      </h3>

                      <p className="text-sm leading-relaxed text-gray-400">{item.desc}</p>
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
                <h3 className="text-xl font-bold text-white">Banking & Financial Services</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    <strong>Credit Scoring AI (Annex III §5b):</strong> Mandatory incident logging
                    and 72h NCA reporting for biased credit denial algorithms.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    <strong>Fraud Detection:</strong> Real-time PII masking before passing
                    transaction telemetry to regulatory audit trails.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    <strong>Algorithmic Trading & Risk Models:</strong> 10-year immutable record
                    retention aligned with EBA/ECB AI guidelines.
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
                <h3 className="text-xl font-bold text-white">Telecommunications & Networks</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong>Network Traffic Optimization:</strong> Immediate circuit-breakers for
                    autonomous routing incidents affecting critical infrastructure.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong>Subscriber Care & Chatbots:</strong> Automated detection and logging of
                    hallucinations or unauthorized data disclosures under Art. 52.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong>GDPR & BEREC Alignment:</strong> Subscriber notification workflows
                    integrated with national telecom regulator channels.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 p-10 text-center shadow-2xl backdrop-blur-xl">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{t("cta_title")}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-base text-gray-300">{t("cta_desc")}</p>
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
