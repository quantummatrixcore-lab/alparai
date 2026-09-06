import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { ShieldAlert, Calendar, User, Building, FileText, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IncidentJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });
  const title = `${t("case_001_title")} | ALPAR AI Case Audit`;
  const description = t("case_001_desc");
  const url = `${APP_URL}/${locale}/cases/001-grok-passport`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${APP_URL}/en/cases/001-grok-passport`,
        tr: `${APP_URL}/tr/cases/001-grok-passport`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Case001Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "case_001" });
  const tCases = await getTranslations({ locale, namespace: "cases" });

  const timelineEvents = [
    { id: 1, text: t("timeline_1") },
    { id: 2, text: t("timeline_2") },
    { id: 3, text: t("timeline_3") },
    { id: 4, text: t("timeline_4") },
    { id: 5, text: t("timeline_5") },
    { id: 6, text: t("timeline_6"), highlight: true },
  ];

  const evidenceFiles = [
    { text: t("evidence_1"), icon: FileText },
    { text: t("evidence_2"), icon: FileText },
    { text: t("evidence_3"), icon: FileText },
  ];

  const legalActions = [
    { text: t("legal_2"), icon: Clock, active: false },
    { text: t("legal_3"), icon: Clock, active: false },
    { text: t("legal_4"), icon: Clock, active: false },
    { text: t("legal_5"), icon: Clock, active: false },
  ];

  return (
    <div className="min-h-screen pb-20">
      <IncidentJsonLd
        title={tCases("case_001_title")}
        description={tCases("case_001_desc")}
        dateOccurred="2024-08-01"
        url={`${APP_URL}/${locale}/cases/001-grok-passport`}
        severity="critical"
        provider="xAI"
        modelName="Grok-2"
        category="Privacy & Identity Leaks"
        locale={locale}
        breadcrumbs={[
          { name: "ALPAR AI", url: `${APP_URL}/${locale}` },
          { name: locale === "tr" ? "Vaka İncelemeleri" : "Case Studies", url: `${APP_URL}/${locale}/cases` },
          { name: tCases("case_001_title"), url: `${APP_URL}/${locale}/cases/001-grok-passport` },
        ]}
      />
      {/* Header */}
      <div className="border-border-subtle bg-bg-secondary/20 border-b py-20 text-center">
        <Container>
          <span className="bg-danger-500/10 text-danger-400 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            <ShieldAlert className="h-4 w-4" />
            CASE #001
          </span>
          <h1 className="text-fg-primary mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {tCases("case_001_title")}
          </h1>
          <p className="text-fg-muted mx-auto mt-4 max-w-2xl text-base leading-relaxed">
            {tCases("case_001_desc")}
          </p>
        </Container>
      </div>

      <Container className="mt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main Content (Timeline) */}
          <div className="lg:col-span-2">
            <h2 className="text-fg-primary text-2xl mb-8 font-bold">
              {t("timeline_title")}
            </h2>
            <div className="before:via-border-subtle relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:to-transparent md:before:mx-auto md:before:translate-x-0">
              {timelineEvents.map((event) => (
                <div
                  key={event.id}
                  className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
                >
                  <div className="border-border-subtle bg-bg-surface z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <span className="text-fg-secondary text-xs font-bold">{event.id}</span>
                  </div>
                  <div
                    className={`w-[calc(100%-4rem)] rounded-xl border p-4 md:w-[calc(50%-2.5rem)] ${event.highlight ? "border-danger-500/50 bg-danger-500/5" : "border-border-subtle bg-bg-surface/50"} shadow-sm`}
                  >
                    <p
                      className={`text-sm ${event.highlight ? "text-danger-400 font-bold" : "text-fg-primary font-medium"}`}
                    >
                      {event.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card variant="glass">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-brand-400 h-5 w-5" />
                  <div>
                    <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                      Date
                    </p>
                    <p className="text-fg-primary font-medium">{t("date")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="text-brand-400 h-5 w-5" />
                  <div>
                    <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                      Reporter
                    </p>
                    <p className="text-fg-primary font-medium">{t("reporter")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="text-brand-400 h-5 w-5" />
                  <div>
                    <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                      Provider
                    </p>
                    <p className="text-fg-primary font-medium">{t("provider")}</p>
                  </div>
                </div>
                <div className="border-border-subtle border-t pt-4">
                  <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                    Severity
                  </p>
                  <p className="text-danger-400 font-bold">{t("severity")}</p>
                </div>
                <div className="border-border-subtle border-t pt-4">
                  <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                    Status
                  </p>
                  <p className="text-warning-400 font-medium">{t("status")}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-fg-primary text-lg font-bold">{t("evidence_title")}</h3>
              <div className="space-y-2">
                {evidenceFiles.map((evidence, idx) => (
                  <div
                    key={idx}
                    className="bg-bg-surface border-border-subtle flex items-center gap-3 rounded-lg border p-3"
                  >
                    <evidence.icon className="text-brand-400 h-5 w-5" />
                    <span className="text-fg-secondary text-sm font-medium">{evidence.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-fg-primary text-lg font-bold">{t("legal_title")}</h3>
              <div className="space-y-3">
                {legalActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <action.icon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${action.active ? "text-success-500" : "text-fg-muted"}`}
                    />
                    <span
                      className={`text-sm ${action.active ? "text-fg-primary font-medium" : "text-fg-muted"}`}
                    >
                      {action.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
