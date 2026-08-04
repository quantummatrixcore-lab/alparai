import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  ShieldCheck,
  FileText,
  Eye,
  AlertCircle,
  BookOpen,
  Clock,
  Users,
  Database,
  Shield,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { ExpertForm } from "./expert-form";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "academy" });
  return {
    title: `${t("hero_title")} | ALPAR AI`,
    description: t("hero_subtitle"),
  };
}

export default async function AcademyPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "academy" });

  const supabase = await createClient();
  const [{ data: stats }, { count: providersCount }] = await Promise.all([
    supabase.from("transparency_stats").select("total_incidents").single(),
    supabase.from("ai_providers").select("*", { count: "exact", head: true }),
  ]);

  const totalIncidents = stats?.total_incidents ? `${stats.total_incidents}+` : "350+";
  const displayProviders = providersCount ? `${providersCount}+` : "40+";

  return (
    <div className="bg-bg-primary text-fg-primary selection:bg-brand-500/30 min-h-screen">
      {/* SECTION 1 - HERO */}
      <section className="border-border-subtle relative overflow-hidden border-b pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="from-brand-900/20 via-bg-primary to-bg-primary absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]" />
        <Container className="relative">
          <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
            <Badge
              variant="outline"
              className="border-brand-500/30 text-brand-400 bg-brand-500/10 px-4 py-1.5 backdrop-blur-sm"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              {t("hero_badge")}
            </Badge>
            <h1 className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl lg:text-7xl">
              {t("hero_title")}
            </h1>
            <p className="text-fg-muted max-w-2xl text-lg leading-relaxed md:text-xl">
              {t("hero_subtitle")}
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <a
                href="#apply"
                className="bg-brand-500 hover:bg-brand-400 inline-flex h-12 items-center justify-center rounded-md px-8 text-sm font-medium text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                {t("cta_expert")}
              </a>
              <a
                href="#universities"
                className="border-border-strong hover:bg-bg-tertiary inline-flex h-12 items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                {t("cta_universities")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 2 - PARTNERSHIP MODEL */}
      <section className="border-border-subtle bg-bg-secondary/50 border-b py-24">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl md:text-center">
            <h2 className="mb-4 text-3xl font-bold">{t("partnership_title")}</h2>
            <p className="text-fg-muted text-lg">{t("partnership_subtitle")}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            <div className="bg-bg-tertiary border-border-subtle hover:border-brand-500/30 rounded-2xl border p-8 transition-colors">
              <BookOpen className="text-brand-400 mb-6 h-10 w-10" />
              <h3 className="mb-3 text-xl font-semibold">{t("card_curriculum_title")}</h3>
              <p className="text-fg-muted leading-relaxed">{t("card_curriculum_desc")}</p>
            </div>
            <div className="bg-bg-tertiary border-border-subtle hover:border-brand-500/30 rounded-2xl border p-8 transition-colors">
              <Database className="text-brand-400 mb-6 h-10 w-10" />
              <h3 className="mb-3 text-xl font-semibold">{t("card_research_title")}</h3>
              <p className="text-fg-muted leading-relaxed">{t("card_research_desc")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 3 - MISSION & STATS */}
      <section className="border-border-subtle relative overflow-hidden border-b py-24">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-bg-secondary border-border-subtle flex flex-col items-center justify-center rounded-xl border p-8">
              <div className="text-brand-400 mb-2 text-4xl font-bold">{totalIncidents}</div>
              <div className="text-fg-muted text-center font-medium">{t("stat_incidents")}</div>
            </div>
            <div className="bg-bg-secondary border-border-subtle flex flex-col items-center justify-center rounded-xl border p-8">
              <div className="text-brand-400 mb-2 text-4xl font-bold">{displayProviders}</div>
              <div className="text-fg-muted text-center font-medium">{t("stat_providers")}</div>
            </div>
            <div className="bg-brand-500/10 border-brand-500/30 relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-8">
              <div className="mb-2 text-4xl font-bold text-white">100+</div>
              <div className="text-brand-300 text-center font-medium">
                {t("stat_experts_target")}
              </div>
              <div className="text-brand-400/80 mt-1 text-xs">{t("stat_ongoing")}</div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 4 - EXPERT PANEL */}
      <section className="border-border-subtle bg-bg-secondary/30 border-b py-24">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl md:text-center">
            <h2 className="mb-4 text-3xl font-bold">{t("expert_title")}</h2>
            <p className="text-fg-muted text-lg">{t("expert_subtitle")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, titleKey: "expert_legal", descKey: "expert_legal_desc" },
              { icon: AlertCircle, titleKey: "expert_medical", descKey: "expert_medical_desc" },
              { icon: Lock, titleKey: "expert_cyber", descKey: "expert_cyber_desc" },
              { icon: GraduationCap, titleKey: "expert_academic", descKey: "expert_academic_desc" },
              { icon: Users, titleKey: "expert_ethics", descKey: "expert_ethics_desc" },
              { icon: FileText, titleKey: "expert_policy", descKey: "expert_policy_desc" },
            ].map((item, i) => (
              <div key={i} className="bg-bg-tertiary border-border-subtle rounded-xl border p-6">
                <item.icon className="text-brand-400 mb-4 h-8 w-8" />
                <h4 className="mb-2 text-lg font-semibold">{t(item.titleKey)}</h4>
                <p className="text-fg-muted text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 5 - REGULATORY ALIGNMENT */}
      <section className="border-border-subtle border-b py-24">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">{t("regulatory_title")}</h2>
              <p className="text-fg-muted mb-8 text-lg leading-relaxed">
                {t("regulatory_subtitle")}
              </p>
              <ul className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-400 h-6 w-6 shrink-0" />
                    <span className="text-fg-secondary">{t(`reg_${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="from-brand-500/20 absolute inset-0 rounded-full bg-gradient-to-tr to-transparent blur-3xl" />
              <div className="bg-bg-tertiary border-border-subtle relative overflow-hidden rounded-2xl border p-8">
                <ShieldCheck className="text-brand-400/50 absolute -right-4 -bottom-4 h-24 w-24" />
                <h3 className="mb-4 text-xl font-bold">EU AI Act • Article 53</h3>
                <p className="text-fg-muted relative z-10 text-sm leading-relaxed">
                  Providers of general-purpose AI models shall provide... information and
                  documentation to the AI Office and, upon request, to national competent
                  authorities.
                  <br />
                  <br />
                  Our Academy network ensures this documentation is academically verified and
                  stress-tested before regulatory submission.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 6 - SCOPE AREAS */}
      <section className="border-border-subtle bg-bg-secondary/50 border-b py-24">
        <Container>
          <h2 className="mb-12 text-3xl font-bold md:text-center">{t("scope_title")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-border-subtle bg-bg-primary rounded-2xl border p-8">
              <Eye className="text-brand-400 mb-4 h-8 w-8" />
              <h3 className="mb-3 text-xl font-semibold">{t("scope_tech")}</h3>
              <p className="text-fg-muted">{t("scope_tech_desc")}</p>
            </div>
            <div className="border-border-subtle bg-bg-primary rounded-2xl border p-8">
              <Users className="text-brand-400 mb-4 h-8 w-8" />
              <h3 className="mb-3 text-xl font-semibold">{t("scope_ethics")}</h3>
              <p className="text-fg-muted">{t("scope_ethics_desc")}</p>
            </div>
            <div className="border-border-subtle bg-bg-primary rounded-2xl border p-8">
              <FileText className="text-brand-400 mb-4 h-8 w-8" />
              <h3 className="mb-3 text-xl font-semibold">{t("scope_legal")}</h3>
              <p className="text-fg-muted">{t("scope_legal_desc")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 7 - ROADMAP */}
      <section className="border-border-subtle border-b py-24">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl md:text-center">
            <h2 className="mb-4 text-3xl font-bold">{t("roadmap_title")}</h2>
          </div>
          <div className="before:via-border-strong relative mx-auto max-w-4xl before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:to-transparent md:before:mx-auto md:before:translate-x-0">
            {[
              { time: "rm_now", title: "rm_q3_title", desc: "rm_q3_desc", active: true },
              { time: "2026 Q4", title: "rm_q4_title", desc: "rm_q4_desc", active: false },
              { time: "2027 Q1", title: "rm_q1_title", desc: "rm_q1_desc", active: false },
              { time: "2027 Q2", title: "rm_q2_title", desc: "rm_q2_desc", active: false },
            ].map((item, i) => (
              <div
                key={i}
                className="group is-active relative mb-12 flex items-center justify-between last:mb-0 md:justify-normal md:odd:flex-row-reverse"
              >
                <div
                  className={`border-bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${item.active ? "bg-brand-500" : "bg-bg-tertiary"}`}
                >
                  {item.active ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <Clock className="text-fg-muted h-4 w-4" />
                  )}
                </div>
                <div className="border-border-subtle bg-bg-secondary/50 w-[calc(100%-4rem)] rounded-2xl border p-6 md:w-[calc(50%-2.5rem)]">
                  <div
                    className={`mb-2 font-mono text-sm ${item.active ? "text-brand-400" : "text-fg-muted"}`}
                  >
                    {item.time === "rm_now" ? t("rm_now") : item.time}
                  </div>
                  <h4 className="mb-2 text-lg font-bold">{t(item.title)}</h4>
                  <p className="text-fg-secondary text-sm leading-relaxed">{t(item.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 8 - UNIVERSITY TIERS */}
      <section id="universities" className="border-border-subtle bg-bg-secondary/30 border-b py-24">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl md:text-center">
            <h2 className="mb-4 text-3xl font-bold">{t("uni_title")}</h2>
            <p className="text-fg-muted text-lg">{t("uni_subtitle")}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <div className="border-brand-500/30 bg-brand-500/5 rounded-2xl border p-8 text-center">
              <Badge className="bg-brand-500 hover:bg-brand-500 mb-6 text-white">
                {t("tier1_badge")}
              </Badge>
              <div className="space-y-3 font-medium">
                <p>Boğaziçi University</p>
                <p>Middle East Technical University (ODTÜ)</p>
                <p>Istanbul Technical University (İTÜ)</p>
              </div>
            </div>
            <div className="border-border-subtle bg-bg-tertiary rounded-2xl border p-8 text-center">
              <Badge variant="outline" className="mb-6">
                {t("tier2_badge")}
              </Badge>
              <div className="text-fg-secondary space-y-3 font-medium">
                <p>Koç University</p>
                <p>Bilkent University</p>
                <p>Sabancı University</p>
              </div>
            </div>
            <div className="border-border-subtle bg-bg-tertiary rounded-2xl border p-8 text-center">
              <Badge variant="outline" className="mb-6">
                {t("tier3_badge")}
              </Badge>
              <div className="text-fg-muted space-y-3 font-medium">
                <p>TU Munich</p>
                <p>ETH Zurich</p>
                <p>Oxford HAI</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 9 - CALL TO ACTION */}
      <section id="apply" className="relative overflow-hidden py-32">
        <div className="bg-brand-950/20 absolute inset-0" />
        <Container className="relative">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold md:text-5xl">{t("apply_title")}</h2>
              <p className="text-fg-muted mb-12 text-xl">{t("apply_subtitle")}</p>
              <div className="bg-bg-secondary border-border-subtle mb-8 rounded-2xl border p-8">
                <h3 className="mb-4 text-2xl font-semibold text-white">{t("apply_card_title")}</h3>
                <p className="text-fg-secondary mb-6 leading-relaxed">{t("apply_card_desc")}</p>
                <ul className="text-fg-muted space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="text-brand-400 h-4 w-4" /> {t("apply_note")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="text-brand-400 h-4 w-4" /> {t("apply_verification")}
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-bg-primary border-border-subtle relative rounded-2xl border p-6 shadow-2xl sm:p-8">
                <div className="via-brand-500 absolute -top-px left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
                <ExpertForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
