export const revalidate = 3600; // 1 hour ISR cache

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Info } from "lucide-react";
import { getWeightClassAnalysis } from "@/actions/insights/weight-class-analysis";
import type { ModelWeightClass } from "@/actions/insights/weight-class-analysis";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insights" });
  return {
    title: t("openVsClosedMetaTitle"),
    description: t("openVsClosedMetaDescription"),
  };
}

const CLASS_ORDER: ModelWeightClass[] = ["open", "closed", "unknown"];

export default async function OpenVsClosedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "insights" });

  const analysis = await getWeightClassAnalysis();

  const counts = new Map<ModelWeightClass, number>();
  if (!analysis.insufficient_data) {
    for (const row of analysis.rows) {
      counts.set(row.weight_class, row.incident_count);
    }
  }

  return (
    <Container className="py-12">
      <header className="mb-10 space-y-3 text-center">
        <Badge variant="brand" size="sm">
          {t("openVsClosedTitle")}
        </Badge>
        <h1 className="text-fg-primary text-3xl font-bold tracking-tight">
          {t("openVsClosedTitle")}
        </h1>
        <p className="text-fg-muted mx-auto max-w-2xl text-sm">{t("openVsClosedDescription")}</p>
      </header>

      {analysis.insufficient_data ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="bg-warning-500/10 flex h-12 w-12 items-center justify-center rounded-full">
              <Info className="text-warning-500 h-6 w-6" />
            </div>
            <h2 className="text-fg-primary text-xl font-bold">{t("insufficientTitle")}</h2>
            <p className="text-fg-muted max-w-md text-sm">{t("insufficientDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-sm">
                <Scale className="text-brand-400 h-4 w-4" />
                {t("openVsClosedTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-border-subtle overflow-hidden rounded-xl border">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-bg-tertiary">
                    <tr>
                      <th className="text-fg-secondary p-4 text-xs font-bold tracking-wider uppercase">
                        {t("weightClassHeader")}
                      </th>
                      <th className="text-fg-secondary p-4 text-right text-xs font-bold tracking-wider uppercase">
                        {t("incidentsHeader")}
                      </th>
                      <th className="text-fg-secondary p-4 text-right text-xs font-bold tracking-wider uppercase">
                        {t("shareHeader")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLASS_ORDER.map((weightClass) => {
                      const count = counts.get(weightClass) ?? 0;
                      const share =
                        analysis.total_incidents > 0
                          ? ((count / analysis.total_incidents) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <tr
                          key={weightClass}
                          className="border-border-subtle border-t first:border-t-0"
                        >
                          <td className="text-fg-primary p-4 font-medium">{t(weightClass)}</td>
                          <td className="text-fg-primary p-4 text-right font-semibold">{count}</td>
                          <td className="text-fg-muted p-4 text-right">{share}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-fg-muted mt-4 text-right text-xs">
                {t("totalIncidents")}: {analysis.total_incidents}
              </p>
            </CardContent>
          </Card>

          <Card className="mx-auto mt-8 max-w-3xl">
            <CardHeader>
              <CardTitle className="text-sm">{t("methodologyTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-fg-muted text-sm">{t("methodologyDesc")}</p>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}
