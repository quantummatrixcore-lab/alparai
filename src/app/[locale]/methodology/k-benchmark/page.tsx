import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return { title: t("title"), description: t("desc") };
}

export default async function KBenchmarkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "methodology" });

  return (
    <Container className="py-12">
      <h1 className="text-fg-primary mb-2 text-3xl font-bold">{t("heading")}</h1>
      <p className="text-fg-muted mb-8 max-w-2xl">{t("subheading")}</p>

      <Section>
        <h2 className="text-fg-primary mb-4 text-2xl font-semibold">{t("whatIsTitle")}</h2>
        <p className="text-fg-muted mb-6 leading-relaxed">{t("whatIsText")}</p>
      </Section>

      <Section>
        <h2 className="text-fg-primary mb-4 text-2xl font-semibold">{t("categoriesTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(["K5", "K6", "K7", "K8", "K9", "K10", "K11", "K12"] as const).map((cat) => (
            <Card key={cat}>
              <CardHeader>
                <CardTitle className="text-base">{t(`cat_${cat}_title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fg-muted text-sm">{t(`cat_${cat}_desc`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="text-fg-primary mb-4 text-2xl font-semibold">{t("scoringTitle")}</h2>
        <p className="text-fg-muted mb-4 leading-relaxed">{t("scoringText")}</p>
        <div className="border-border-subtle bg-bg-elevated rounded-lg border p-4">
          <pre className="text-fg-muted overflow-x-auto text-sm" tabIndex={0}>
            Wilson score = (p + z²/2n - z√(p(1-p)/n + z²/4n²)) / (1 + z²/n)
          </pre>
        </div>
        <p className="text-fg-muted mt-4 text-sm">{t("wilsonNote")}</p>
      </Section>

      <Section>
        <h2 className="text-fg-primary mb-4 text-2xl font-semibold">{t("pipelineTitle")}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {["submission", "pii_guard", "cross_audit", "scoring", "review"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="border-brand-400 bg-bg-elevated rounded-lg border px-4 py-2">
                <p className="text-sm font-medium">{t(`step_${step}`)}</p>
              </div>
              {i < 4 && <span className="text-fg-muted text-lg">→</span>}
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="text-fg-primary mb-4 text-2xl font-semibold">{t("dataSourcesTitle")}</h2>
        <p className="text-fg-muted leading-relaxed">{t("dataSourcesText")}</p>
      </Section>

      <p className="text-fg-muted mt-8 border-t pt-4 text-xs italic">{t("disclaimer")}</p>
    </Container>
  );
}
