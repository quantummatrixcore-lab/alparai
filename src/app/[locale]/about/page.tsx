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
} from "lucide-react";
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

      {/* Data Moat & Benchmark Section */}
      <Section className="bg-bg-secondary/10 border-border-subtle border-y py-16">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
              {t("dataMoatTitle")}
            </h2>
            <p className="text-fg-muted mx-auto mt-2 max-w-2xl text-sm">{t("dataMoatSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-border-subtle bg-bg-primary">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-white">
                  <Database className="text-brand-400 h-5 w-5" />
                  {t("dataMoatMoatTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-secondary text-sm leading-relaxed">
                {t("dataMoatMoatDesc")}
              </CardContent>
            </Card>

            <Card className="border-border-subtle bg-bg-primary">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-white">
                  <BarChart className="text-brand-400 h-5 w-5" />
                  {t("dataMoatBenchmarkTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-secondary text-sm leading-relaxed">
                {t("dataMoatBenchmarkDesc")}
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
                      href="https://www.linkedin.com/in/ercument-erden"
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
