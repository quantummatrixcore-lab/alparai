import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wordmark } from "@/components/layout/wordmark";
import {
  Sparkles,
  Users,
  Shield,
  Globe,
  Linkedin,
  Award,
  Mail,
  Database,
  BarChart,
  Scale,
  ShieldAlert,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { FounderStory } from "@/components/marketing/founder-story";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("description"),
    description: t("description"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const tApp = await getTranslations({ locale, namespace: "app" });

  // Fetch dynamic stats
  const supabase = await createServerClient();
  const admin = createAdminClient();
  const [incidentsCountResult, countriesResult, providersResult] = await Promise.all([
    admin.from("incidents").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("incidents")
      .select("location_country")
      .eq("status", "published")
      .not("location_country", "is", null),
    supabase
      .from("incidents")
      .select("ai_provider_id")
      .eq("status", "published")
      .not("ai_provider_id", "is", null),
  ]);

  const totalIncidents = incidentsCountResult.count;
  const countries = new Set((countriesResult.data ?? []).map((r) => r.location_country));
  const totalCountries = countries.size > 0 ? countries.size : null;
  const providers = new Set((providersResult.data ?? []).map((r) => r.ai_provider_id));
  const totalProviders = providers.size > 0 ? providers.size : null;

  return (
    <div>
      {/* Premium Header */}
      <div className="bg-bg-secondary/20 border-border-subtle border-b py-20 text-center">
        <Container>
          <h1 className="sr-only">About ALPAR AI - The Trust Infrastructure for AI</h1>
          <Wordmark size="lg" showTagline />
          <p className="text-fg-secondary mx-auto mt-4 max-w-xl text-lg">{tApp("tagline")}</p>
        </Container>
      </div>

      {/* Dynamic Stats Grid */}
      <Section className="border-border-subtle bg-bg-primary border-b py-12">
        <Container>
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            <div className="space-y-2">
              <span className="text-brand-400 block text-5xl font-black tracking-tight">
                {totalIncidents != null ? `${totalIncidents}+` : "N/A"}
              </span>
              <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
                {t("statsVerified")}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-brand-400 block text-5xl font-black tracking-tight">
                {totalProviders != null ? totalProviders : "N/A"}
              </span>
              <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
                {t("statsProviders")}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-brand-400 block text-5xl font-black tracking-tight">
                {totalCountries != null ? totalCountries : "N/A"}
              </span>
              <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
                {t("statsCountries")}
              </span>
            </div>
          </div>
        </Container>
      </Section>

      {/* Pillars Section */}
      <Section className="bg-bg-primary py-16">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
              {t("principlesTitle")}
            </h2>
            <p className="text-fg-muted mx-auto mt-2 max-w-md text-sm">{t("principlesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card variant="glass" padding="md">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-white">
                  <Sparkles className="text-brand-400 h-5 w-5" />
                  {t("mission")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-secondary text-sm leading-relaxed">
                {t("missionText")}
              </CardContent>
            </Card>

            <Card variant="glass" padding="md">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-white">
                  <Shield className="text-success-500 h-5 w-5" />
                  {t("intermediary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-secondary text-sm leading-relaxed">
                {t("intermediaryText")}
              </CardContent>
            </Card>

            <Card variant="glass" padding="md">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-white">
                  <Users className="text-warning-500 h-5 w-5" />
                  {t("voice")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-secondary text-sm leading-relaxed">
                {t("voiceText")}
              </CardContent>
            </Card>

            <Card variant="glass" padding="md">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-white">
                  <Globe className="text-brand-400 h-5 w-5" />
                  {t("openSource")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-secondary text-sm leading-relaxed">
                {t("openSourceText")}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Founder Story Section */}
      <FounderStory />

      {/* Founder Card Section */}
      <Section className="bg-bg-primary py-16">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
              {t("teamTitle")}
            </h2>
            <p className="text-fg-muted mx-auto mt-2 max-w-2xl text-sm">{t("teamSubtitle")}</p>
          </div>

          <div className="mx-auto max-w-xl">
            <Card variant="glass" padding="md">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="bg-brand-500/10 text-brand-400 border-brand-500/20 flex h-12 w-12 items-center justify-center rounded-full border">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-white">
                      {t("founderName")}
                    </CardTitle>
                    <a
                      href="https://www.linkedin.com/in/ercument-erden?ref=alparai_platform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg-muted hover:text-brand-400 transition-colors"
                      aria-label="Ercüment Erden LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-brand-400 mt-0.5 text-xs font-semibold tracking-wider uppercase">
                    {t("founderRole")}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="text-fg-secondary mt-2 text-sm leading-relaxed">
                {t("founderBio")}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Spatial Glassmorphism Advisory Board Section (Call for Advisors) */}
      <Section className="border-border-subtle bg-bg-primary relative overflow-hidden border-t py-24">
        {/* Spatial background atmospheric glow orbs */}
        <div className="bg-brand-500/10 pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[140px]" />
        <div className="bg-accent-500/10 pointer-events-none absolute right-10 -bottom-40 h-[400px] w-[400px] rounded-full blur-[120px]" />

        <Container className="relative">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md">
              <Sparkles className="text-brand-400 h-3.5 w-3.5 animate-pulse" />
              <span>{t("advisoryBoardBadge")}</span>
            </div>

            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("advisoryBoardTitle")}
            </h2>

            <p className="text-fg-secondary mx-auto max-w-2xl text-base leading-relaxed">
              {t("advisoryBoardSubtitle")}
            </p>
          </div>

          {/* Spatial Glassmorphism Tracks Grid */}
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                titleKey: "advisoryBoardTrack1Title",
                descKey: "advisoryBoardTrack1Desc",
                tag: "Ethics & Safety",
                color: "text-brand-400",
                borderColor: "hover:border-brand-500/40",
              },
              {
                icon: ShieldAlert,
                titleKey: "advisoryBoardTrack2Title",
                descKey: "advisoryBoardTrack2Desc",
                tag: "Audit & Red-Teaming",
                color: "text-accent-400",
                borderColor: "hover:border-accent-400/40",
              },
              {
                icon: Scale,
                titleKey: "advisoryBoardTrack3Title",
                descKey: "advisoryBoardTrack3Desc",
                tag: "Governance & Law",
                color: "text-warning-400",
                borderColor: "hover:border-warning-400/40",
              },
              {
                icon: GraduationCap,
                titleKey: "advisoryBoardTrack4Title",
                descKey: "advisoryBoardTrack4Desc",
                tag: "Enterprise Strategy",
                color: "text-success-400",
                borderColor: "hover:border-success-400/40",
              },
            ].map((track, idx) => {
              const Icon = track.icon;
              return (
                <div
                  key={idx}
                  className={`border-border-subtle bg-bg-secondary/40 group relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 ${track.borderColor} hover:shadow-brand-500/10 hover:-translate-y-1 hover:shadow-2xl`}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                        <Icon className={`h-5 w-5 ${track.color}`} />
                      </div>
                      <span className="border-border-subtle bg-bg-elevated/60 text-fg-muted rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                        {track.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-fg-primary text-base font-bold transition-colors group-hover:text-white">
                        {t(track.titleKey)}
                      </h3>
                      <p className="text-fg-muted mt-2 text-xs leading-relaxed">
                        {t(track.descKey)}
                      </p>
                    </div>
                  </div>

                  <div className="border-border-subtle/50 text-brand-400 relative z-10 mt-6 flex items-center gap-1.5 border-t pt-4 text-xs font-semibold transition-transform group-hover:translate-x-1">
                    <span>{t("advisoryBoardOpenPosition")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call for Advisors Action Card (Spatial Glassmorphic Banner) */}
          <div className="border-brand-500/20 from-brand-950/40 via-bg-secondary/60 to-bg-tertiary/40 relative mt-12 overflow-hidden rounded-2xl border bg-gradient-to-r p-8 shadow-2xl backdrop-blur-2xl md:p-10">
            <div className="bg-brand-500/10 pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
              <div className="max-w-xl space-y-2">
                <h3 className="text-fg-primary text-xl font-bold tracking-tight sm:text-2xl">
                  {t("advisoryBoardBannerTitle")}
                </h3>
                <p className="text-fg-secondary text-xs leading-relaxed sm:text-sm">
                  {t("advisoryBoardBannerDesc")}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
                <a
                  href="mailto:hello@alparai.com?subject=Global%20AI%20Ethics%20%26%20Trust%20Advisory%20Board%20Application"
                  className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/25 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <Mail className="h-4 w-4" />
                  <span>{t("advisoryBoardApplyCTA")}</span>
                </a>
                <Link
                  href="/about/advisory-board"
                  className="border-border-subtle text-fg-secondary inline-flex items-center justify-center gap-2 rounded-xl border bg-white/5 px-5 py-3 text-xs font-semibold backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
                >
                  <span>{t("advisoryBoardLearnMoreCTA")}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Careers & Opportunities Section */}
      <Section className="bg-bg-primary border-border-subtle border-t py-16">
        <Container className="text-center">
          <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
            {t("careersTitle")}
          </h2>
          <p className="text-fg-muted mx-auto mt-2 max-w-xl text-sm leading-relaxed">
            {t("careersSubtitle")}
          </p>
          <div className="mt-6">
            <a
              href="mailto:hello@alparai.com?subject=Careers%20Inquiry"
              className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>{t("careersCTA")}</span>
            </a>
          </div>
        </Container>
      </Section>

      {/* Values Cards */}
      <Section className="bg-bg-secondary/10 border-border-subtle border-t py-16">
        <Container className="space-y-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
              {t("valuesTitle")}
            </h2>
            <p className="text-fg-muted mt-2 text-sm">{t("valuesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {["1", "2", "3"].map((val) => (
              <Card key={val} className="border-border-subtle bg-bg-secondary/40">
                <CardContent className="space-y-3 p-6">
                  <div className="text-brand-400 w-fit rounded-lg bg-white/5 p-3">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="text-fg-primary text-base font-bold">{t(`value_${val}_title`)}</h3>
                  <p className="text-fg-muted text-xs leading-relaxed">{t(`value_${val}_desc`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Data Moat & K-BENCHMARK — Competitive Differentiation (#126) */}
      <Section className="border-border-subtle border-t py-20">
        <Container className="max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
              {t("dataMoatTitle")}
            </h2>
            <p className="text-fg-muted mx-auto mt-3 max-w-2xl text-base">
              {t("dataMoatSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-border-subtle bg-bg-secondary/10">
              <CardHeader>
                <div className="text-brand-400 mb-3 w-fit rounded-lg bg-white/5 p-3">
                  <Database className="h-6 w-6" />
                </div>
                <CardTitle className="text-fg-primary text-lg font-bold">
                  {t("dataMoatMoatTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fg-muted text-sm leading-relaxed">{t("dataMoatMoatDesc")}</p>
              </CardContent>
            </Card>

            <Card className="border-border-subtle bg-bg-secondary/10">
              <CardHeader>
                <div className="text-brand-400 mb-3 w-fit rounded-lg bg-white/5 p-3">
                  <BarChart className="h-6 w-6" />
                </div>
                <CardTitle className="text-fg-primary text-lg font-bold">
                  {t("dataMoatBenchmarkTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fg-muted text-sm leading-relaxed">
                  {t("dataMoatBenchmarkDesc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Contact Cards */}
      <Section className="border-border-subtle border-t py-16">
        <Container className="space-y-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
              {t("contactTitle")}
            </h2>
            <p className="text-fg-muted mt-2 text-sm">{t("contactSubtitle")}</p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { key: "hello", email: "hello@alparai.com" },
              { key: "academy", email: "academy@alparai.com" },
              { key: "security", email: "security@alparai.com" },
            ].map((contact) => (
              <Card key={contact.key} className="border-border-subtle bg-bg-secondary/20">
                <CardContent className="space-y-3 p-6 text-center">
                  <div className="text-brand-400 mx-auto w-fit rounded-full bg-white/5 p-3">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="text-fg-primary text-sm font-bold">
                    {t(`contact_${contact.key}`)}
                  </h3>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-brand-400 block text-xs font-semibold hover:underline"
                  >
                    {contact.email}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
