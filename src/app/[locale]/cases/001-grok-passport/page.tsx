import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { ShieldAlert, Calendar, User, Building, FileText, Clock, ExternalLink, CheckCircle2, FileCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });
  return {
    title: t("case_001_title"),
    description: t("case_001_desc"),
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
    { text: t("evidence_1"), icon: FileText, href: "#" },
    { text: t("evidence_2"), icon: FileText, href: "/evidence/akim_grok_basvuru_delil.png", external: true },
    { text: t("evidence_3"), icon: FileCheck, href: "https://turkinform.com.tr/turk-girisimcinin-yasadigi-grok-skandali-kisisel-verilerimiz-risk-altinda-mi", external: true },
    { text: t("evidence_akim", { defaultValue: "AKİM Resmi Başvuru Tutanağı (#ALP-2026-001)" }), icon: FileCheck, href: "/evidence/akim_grok_basvuru_delil.png", external: true },
    { text: t("evidence_sms", { defaultValue: "AKİM Resmi SMS Onayı (Başvuru No: #593663)" }), icon: FileCheck, href: "/evidence/akim_sms_onay_593663.jpg", external: true },
  ];

  const legalActions = [
    { text: "AKİM / Sanayi ve Teknoloji Bakanlığı & KVKK — Resmi Başvuru No: #593663 (Kayıt Altına Alındı)", icon: CheckCircle2, active: true },
    { text: t("legal_2"), icon: Clock, active: false },
    { text: t("legal_3"), icon: Clock, active: false },
    { text: t("legal_4"), icon: Clock, active: false },
    { text: t("legal_5"), icon: Clock, active: false },
  ];

  return (
    <div className="min-h-screen pb-20">
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
          {/* Main Content (Timeline & Evidence Showcase) */}
          <div className="space-y-12 lg:col-span-2">
            <div>
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

            {/* Official Government & Regulatory Evidence Showcase */}
            <div className="space-y-6 rounded-xl border border-emerald-500/30 bg-zinc-950/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col justify-between gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-mono text-base font-bold text-zinc-100">
                      {t("official_filing_title", { defaultValue: "Resmi Devlet & Regülasyon Başvuru Kaydı" })}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Sanayi ve Teknoloji Bakanlığı & KVKK koordinasyonunda AKİM resmi şikayet kaydı (Takip No: <span className="font-mono font-bold text-emerald-400">#593663</span>).
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Resmi Kayıt Altında</span>
                </div>
              </div>

              {/* 2-Column Evidence Grid: Web Filing + SMS Confirmation */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Column 1: Web Application Screenshot */}
                <div className="space-y-2 rounded-lg border border-white/10 bg-zinc-900/80 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                    <span>AKİM Başvuru Formu</span>
                    <a
                      href="/evidence/akim_grok_basvuru_delil.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="group relative overflow-hidden rounded-md border border-white/5 bg-black">
                    <a href="/evidence/akim_grok_basvuru_delil.png" target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/evidence/akim_grok_basvuru_delil.png"
                        alt="AKİM Başvuru Tutanağı"
                        className="h-64 w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-full bg-cyan-600 px-3 py-1 font-mono text-[11px] font-bold text-white shadow">
                          Büyüt & İncele
                        </span>
                      </div>
                    </a>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400">
                    Resmi Başvuru Tutanağı (#ALP-2026-001)
                  </p>
                </div>

                {/* Column 2: Official SMS Confirmation Screenshot */}
                <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-zinc-900/80 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                    <span>AKİM Resmi SMS Onayı (#593663)</span>
                    <a
                      href="/evidence/akim_sms_onay_593663.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="group relative overflow-hidden rounded-md border border-white/5 bg-black">
                    <a href="/evidence/akim_sms_onay_593663.jpg" target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/evidence/akim_sms_onay_593663.jpg"
                        alt="AKİM SMS Başvuru Onayı #593663"
                        className="h-64 w-full object-cover object-bottom transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-full bg-emerald-600 px-3 py-1 font-mono text-[11px] font-bold text-white shadow">
                          Büyüt & İncele
                        </span>
                      </div>
                    </a>
                  </div>
                  <p className="font-mono text-[10px] text-emerald-400/80">
                    Resmi Başvuru Takip No: #593663
                  </p>
                </div>
              </div>

              {/* Bottom Press & Trust Attribution */}
              <div className="flex flex-col justify-between gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center">
                <a
                  href="https://turkinform.com.tr/turk-girisimcinin-yasadigi-grok-skandali-kisisel-verilerimiz-risk-altinda-mi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-300 transition-colors hover:text-cyan-300"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span>TurkInform Basın Araştırması & Röportajı</span>
                  <ExternalLink className="h-3 w-3 text-zinc-500" />
                </a>
                <span className="font-mono text-[11px] font-semibold text-emerald-400">
                  ✓ Resmi Tescil (#593663)
                </span>
              </div>
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
                  <a
                    key={idx}
                    href={evidence.href}
                    target={evidence.external ? "_blank" : undefined}
                    rel={evidence.external ? "noopener noreferrer" : undefined}
                    className="bg-bg-surface border-border-subtle hover:border-cyan-500/40 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <evidence.icon className="text-brand-400 h-5 w-5" />
                      <span className="text-fg-secondary text-sm font-medium">{evidence.text}</span>
                    </div>
                    {evidence.external && <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-fg-primary text-lg font-bold">{t("legal_title")}</h3>
              <div className="space-y-3">
                {legalActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <action.icon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${action.active ? "text-emerald-400" : "text-fg-muted"}`}
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
