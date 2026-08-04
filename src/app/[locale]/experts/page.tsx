import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpertsForm } from "@/components/marketing/experts-form";
import {
  GraduationCap,
  Scale,
  Stethoscope,
  ShieldCheck,
  Landmark,
  ShieldAlert,
  Award,
  Search,
  FileText,
  Sliders,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experts" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function ExpertsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "experts" });

  const whoItems = [
    {
      key: "academics",
      icon: GraduationCap,
    },
    {
      key: "legal",
      icon: Scale,
    },
    {
      key: "medical",
      icon: Stethoscope,
    },
    {
      key: "ethics",
      icon: ShieldCheck,
    },
    {
      key: "policy",
      icon: Landmark,
    },
    {
      key: "security",
      icon: ShieldAlert,
    },
  ];

  const benefits = [
    {
      key: "benefit_badge",
      icon: Award,
    },
    {
      key: "benefit_analysis",
      icon: Search,
    },
    {
      key: "benefit_report",
      icon: FileText,
    },
    {
      key: "benefit_methodology",
      icon: Sliders,
    },
  ];

  return (
    <div className="bg-bg-primary text-fg-primary min-h-screen">
      {/* Section 1: Hero */}
      <div className="bg-bg-secondary/30 border-border-subtle relative overflow-hidden border-b py-20 lg:py-28">
        <div className="absolute inset-0 z-0">
          <div className="bg-success-500/5 absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]" />
        </div>
        <Container className="relative z-10 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="text-success-400 text-xs font-black tracking-[0.2em] uppercase">
              {t("hero_eyebrow")}
            </span>
            <h1 className="text-fg-primary mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero_title")}
            </h1>
            <p className="text-fg-secondary mx-auto mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
              {t("hero_subtitle")}
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="#apply-form"
                className="bg-success-500 hover:bg-success-600 hover:shadow-success-500/25 inline-flex h-12 items-center justify-center rounded-md px-6 font-bold text-white shadow-lg transition-colors"
              >
                {t("form_title")}
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Section 2: Who Can Join */}
      <Section className="py-16">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
              {t("who_title")}
            </h2>
            <p className="text-fg-muted mx-auto mt-3 max-w-xl text-sm md:text-base">
              {t("who_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whoItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.key}
                  variant="glass"
                  className="hover:border-success-500/30 transition-all duration-300"
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="bg-success-500/10 border-success-500/20 text-success-400 rounded-lg border p-2.5">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-base font-bold text-white">
                      {t(`who_${item.key}`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-fg-secondary text-sm leading-relaxed">
                      {t(`who_${item.key}_desc`)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Section 3: What You Get */}
      <Section className="bg-bg-secondary/40 border-border-subtle border-y py-16">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
                {t("benefits_title")}
              </h2>
              <p className="text-fg-muted mt-3 text-base leading-relaxed">
                {t("benefits_subtitle")}
              </p>

              <div className="mt-8 space-y-4">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.key} className="flex items-start gap-3">
                      <div className="bg-brand-500/10 text-brand-400 mt-1 shrink-0 rounded-full p-1">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-fg-secondary text-base font-medium">
                        {t(benefit.key)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decorative Card Stack or graphic */}
            <div className="from-success-500/5 to-brand-500/5 border-border-subtle flex flex-col items-center justify-center rounded-2xl border bg-gradient-to-br p-8 text-center">
              <Award className="text-success-400 h-16 w-16 animate-pulse" />
              <h3 className="mt-4 text-xl font-bold text-white">{t("badge_title")}</h3>
              <p className="text-fg-muted mt-2 max-w-xs text-sm">{t("badge_description")}</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Section 4: Application Form */}
      <Section id="apply-form" className="py-16">
        <Container className="max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
              {t("form_title")}
            </h2>
            <p className="text-fg-muted mt-2 text-sm">{t("form_subtitle")}</p>
          </div>

          <Card
            variant="elevated"
            className="border-border-subtle bg-bg-secondary/40 border shadow-xl backdrop-blur-md"
          >
            <CardContent className="p-6 sm:p-8">
              <ExpertsForm />
            </CardContent>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
