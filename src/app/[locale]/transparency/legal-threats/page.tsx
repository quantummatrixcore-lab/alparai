export const revalidate = 60;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

interface ReportRow {
  id: string;
  request_type: string;
  requested_by_category: string;
  summary_en: string;
  summary_tr: string;
  action_taken: string;
  requested_at: string;
}

const actionBadge = (action: string, t: (key: string) => string) => {
  switch (action) {
    case "resisted":
      return <Badge variant="success">{t("streisand_resisted")}</Badge>;
    case "partial_compliance":
      return <Badge variant="warning">{t("streisand_partial")}</Badge>;
    case "complied":
      return <Badge variant="danger">{t("streisand_complied")}</Badge>;
    default:
      return <Badge variant="muted">{t("streisand_pending")}</Badge>;
  }
};

export default async function LegalThreatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "transparency" });
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("transparency_reports")
    .select("*")
    .eq("is_published", true)
    .order("requested_at", { ascending: false })
    .limit(50);

  const reports: ReportRow[] = (data as unknown as ReportRow[]) ?? [];

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-3xl">
        <Badge variant="brand" size="sm">
          {t("streisand_title")}
        </Badge>
        <h1 className="text-fg-primary mt-3 text-3xl font-bold tracking-tight">
          {t("streisand_title")}
        </h1>
        <p className="text-fg-muted mt-2 text-sm">{t("streisand_subtitle")}</p>
      </header>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12">
            <ShieldAlert className="text-fg-muted h-10 w-10" />
            <p className="text-fg-muted text-sm">{t("streisand_empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const summary = locale === "tr" ? r.summary_tr : r.summary_en;
            return (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-sm">
                    <span className="text-fg-primary">{t(`streisand_type_${r.request_type}`)}</span>
                    {actionBadge(r.action_taken, t)}
                    <span className="text-fg-muted ml-auto text-xs">
                      {formatDate(r.requested_at, locale)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fg-secondary text-sm">{summary}</p>
                  <p className="text-fg-muted mt-2 text-xs">
                    {t(`streisand_category_${r.requested_by_category}`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
