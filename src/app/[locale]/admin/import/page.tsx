import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { ImportQueueClient, type ImportedIncident } from "@/components/admin/import-queue-client";
import { CsvUploadForm } from "@/components/admin/csv-upload-form";
import { Container } from "@/components/ui/layout";
import { logger } from "@/lib/utils/logger";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: `${t("import_q_title")} | ALPAR AI Admin`,
  };
}

export default async function AdminImportPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireAdmin();

  const admin = createAdminClient();

  const { data: pendingIncidents, error } = await admin
    .from("incidents")
    .select(
      "id, title, description, category, severity, incident_date, incident_source, import_external_id, import_attribution, source_url",
    )
    .eq("status", "pending_review")
    .in("incident_source", ["aiaaic_import", "aiid_import", "news_curated"])
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(
      "Failed to load imported incidents",
      undefined,
      error instanceof Error ? error : undefined,
    );
  }

  return (
    <Container className="space-y-10 py-8">
      <CsvUploadForm locale={locale} />
      <ImportQueueClient
        initialIncidents={(pendingIncidents as unknown as ImportedIncident[]) || []}
        locale={locale}
      />
    </Container>
  );
}
