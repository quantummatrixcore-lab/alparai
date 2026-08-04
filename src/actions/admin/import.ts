"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";
import { parseIncidentCSV } from "@/lib/import/csv-parser";
import { importIncidents } from "@/lib/import/incident-importer";
import type { IncidentSource } from "@/lib/import/csv-parser";

const importSourceSchema = z.enum(["aiaaic_import", "aiid_import", "news_curated"]);

export interface ImportIncidentsResult {
  ok: boolean;
  inserted?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
  parseErrors?: { row: number; message: string }[];
  error?: string;
}

export async function importIncidentsAction(formData: FormData): Promise<ImportIncidentsResult> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  const rawSource = formData.get("source") as string | null;

  if (!file || file.size === 0) {
    return { ok: false, error: "No file provided." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "File too large. Maximum 5 MB." };
  }

  const sourceResult = importSourceSchema.safeParse(rawSource);
  if (!sourceResult.success) {
    return {
      ok: false,
      error: "Invalid source. Must be aiaaic_import, aiid_import, or news_curated.",
    };
  }

  const source = sourceResult.data as IncidentSource;
  const csvText = await file.text();

  const { rows, errors: parseErrors, total } = parseIncidentCSV(csvText, source);

  logger.info("Import CSV parsed", {
    total,
    validRows: rows.length,
    parseErrors: parseErrors.length,
    source,
  });

  if (rows.length === 0) {
    return {
      ok: false,
      error: `No valid rows found (${total} rows parsed, ${parseErrors.length} errors).`,
      parseErrors,
    };
  }

  const importResult = await importIncidents(rows, source);

  revalidatePath("/[locale]/admin/import", "layout");

  return {
    ok: importResult.errors.length === 0,
    inserted: importResult.inserted,
    updated: importResult.updated,
    skipped: importResult.skipped,
    errors: importResult.errors,
    parseErrors,
  };
}
