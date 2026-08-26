import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ShowcasePageTracker, TrackedLink } from "@/components/analytics/showcase-tracker";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CasesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cases" });

  const featuredCases = [
    {
      id: "001",
      slug: "001-grok-passport",
      titleKey: "case_001_title",
      descKey: "case_001_desc",
      dateKey: "case_001_date",
      provider: "xAI (Grok)",
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      <ShowcasePageTracker pagePath="/cases" />
      <div className="border-border-subtle bg-bg-secondary/20 border-b pt-4 pb-12 text-center md:pt-8 md:pb-16">
        <Container>
          <span className="bg-brand-500/10 text-brand-400 inline-block rounded-full px-3 py-1 text-xs font-semibold">
            {t("badge")}
          </span>
          <h1 className="text-fg-primary mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("headline")}
          </h1>
          <p className="text-fg-muted mx-auto mt-4 max-w-2xl text-base leading-relaxed">
            {t("subtitle")}
          </p>
        </Container>
      </div>

      <Section className="py-16">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCases.map((c) => (
              <TrackedLink
                key={c.id}
                href={`/cases/${c.slug}`}
                pagePath="/cases"
                ctaAction="read_case"
                extraData={{ slug: c.slug, caseId: c.id }}
                className="group block h-full"
              >
                <Card className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/40 hover:shadow-brand-500/10 h-full transition-all hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
                        CASE #{c.id}
                      </span>
                      <span className="border-border-subtle bg-bg-surface text-fg-secondary rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                        {c.provider}
                      </span>
                    </div>
                    <CardTitle className="text-fg-primary text-lg font-bold transition-colors group-hover:text-white">
                      {t(c.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between space-y-4">
                    <p className="text-fg-muted line-clamp-3 text-sm leading-relaxed">
                      {t(c.descKey)}
                    </p>
                    <div className="border-border-subtle/50 text-brand-400 flex items-center gap-1.5 border-t pt-4 text-xs font-semibold transition-transform group-hover:translate-x-1">
                      <span>{t("read_case")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </TrackedLink>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
