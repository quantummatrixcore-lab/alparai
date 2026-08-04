import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dmca" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function DmcaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dmca" });

  const steps = ["1", "2", "3", "4", "5", "6"];

  return (
    <Container className="space-y-16 py-20">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="border-danger-500/30 bg-danger-500/10 text-danger-400 inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold tracking-wider uppercase">
          {t("badge")}
        </span>
        <h1 className="text-fg-primary mt-6 text-4xl font-black tracking-tight sm:text-5xl">
          {t("headline")}
        </h1>
        <p className="text-fg-secondary mt-4 text-lg leading-relaxed">{t("subtitle")}</p>
      </div>

      {/* Procedure Steps */}
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h2 className="text-fg-primary text-2xl font-bold tracking-tight">
            {t("procedure_title")}
          </h2>
          <p className="text-fg-muted mt-2 text-sm">{t("procedure_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <Card key={step} className="border-border-subtle bg-bg-secondary/40">
              <CardContent className="space-y-3 p-6">
                <h3 className="text-fg-primary text-base font-bold">{t(`step_${step}_title`)}</h3>
                <p className="text-fg-muted text-xs leading-relaxed">
                  {t(`step_${step}_desc`)}{" "}
                  {step === "6" && (
                    <a
                      href="mailto:hello@alparai.com"
                      className="text-brand-400 font-bold hover:underline"
                    >
                      hello@alparai.com
                    </a>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Counter-Notification Section */}
      <Card className="border-border-subtle bg-bg-secondary/60 mx-auto max-w-3xl">
        <CardContent className="space-y-4 p-8">
          <div className="flex items-start gap-4">
            <div className="text-brand-400 shrink-0 rounded-xl bg-white/5 p-3">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-fg-primary text-lg font-bold">{t("counter_title")}</h2>
              <p className="text-fg-secondary text-xs leading-relaxed">{t("counter_desc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
