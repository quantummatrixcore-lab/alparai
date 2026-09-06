export const revalidate = 60;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

interface VersionRow {
  id: string;
  version: string;
  published_at: string;
  summary_en: string;
  summary_tr: string;
  changes_en: string[];
  changes_tr: string[];
  is_retraction: boolean;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return { title: t("corrections_title"), description: t("corrections_subtitle") };
}

export default async function MethodologyCorrectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "methodology" });
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("methodology_versions")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(50);

  const versions: VersionRow[] = (data as unknown as VersionRow[]) ?? [];

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-3xl">
        <Badge variant="brand" size="sm" className="mb-3">
          {t("corrections_title")}
        </Badge>
        <h1 className="text-fg-primary mb-3 text-3xl font-bold tracking-tight">
          {t("corrections_title")}
        </h1>
        <p className="text-fg-muted text-sm">{t("corrections_subtitle")}</p>
      </header>

      {versions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12">
            <FileText className="text-fg-muted h-10 w-10" />
            <p className="text-fg-muted text-sm">{t("corrections_no_data")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {versions.map((v) => {
            const summary = locale === "tr" ? v.summary_tr : v.summary_en;
            const changes = locale === "tr" ? v.changes_tr : v.changes_en;
            return (
              <Card key={v.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs">{v.version}</span>
                    {v.is_retraction && (
                      <Badge variant="danger" size="sm">
                        {t("corrections_retraction")}
                      </Badge>
                    )}
                    <span className="text-fg-muted ml-auto text-xs">
                      {formatDate(v.published_at, locale)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-fg-secondary">{summary}</p>
                  {changes.length > 0 && (
                    <ul className="list-disc space-y-1 pl-4">
                      {changes.map((c: string, i: number) => (
                        <li key={i} className="text-fg-muted text-xs">
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
