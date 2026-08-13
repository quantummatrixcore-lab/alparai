import dynamic from "next/dynamic";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { type ImportedIncident } from "@/components/admin/import-queue-client";
const ImportQueueClient = dynamic(() =>
  import("@/components/admin/import-queue-client").then((m) => m.ImportQueueClient),
);

import { CsvUploadForm } from "@/components/admin/csv-upload-form";
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
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <CsvUploadForm locale={locale} />
        <ImportQueueClient
          initialIncidents={(pendingIncidents as unknown as ImportedIncident[]) || []}
          locale={locale}
        />
      </div>
    </div>
  );
}
