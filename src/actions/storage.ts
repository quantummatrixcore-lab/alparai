"use server";

import { uploadToDrive } from "@/lib/gdrive/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const MAX_STORAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_STORAGE_MIME_TYPES = ["image/png", "image/jpeg", "application/pdf"] as const;

export async function uploadIncidentEvidence(formData: FormData) {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.upload_evidence}:${ip}`);
    if (!rl.ok) {
      return {
        success: false,
        error: `Upload rate limit exceeded. Retry in ${rl.retryAfter ?? 60}s.`,
      };
    }

    const file = formData.get("file") as File;
    const incidentId = formData.get("incidentId") as string;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!incidentId) {
      return { success: false, error: "Incident ID is missing" };
    }

    // Security Gate: 10MB size limit
    if (file.size > MAX_STORAGE_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: "Dosya boyutu 10MB sınırını aşamaz (Maximum 10MB allowed).",
      };
    }

    // Security Gate: MIME type whitelist
    if (
      !ALLOWED_STORAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_STORAGE_MIME_TYPES)[number])
    ) {
      return {
        success: false,
        error: `Geçersiz dosya türü (${file.type}). Yalnızca PNG, JPEG ve PDF formatlarına izin verilmektedir.`,
      };
    }

    // Convert Web File to Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive (Zero-Cost Storage)
    const fileId = await uploadToDrive(file.name, file.type, buffer);

    // Save the fileId to Supabase Database under the specific incidentId
    const supabase = await createClient();

    type IncidentEvidenceTable = { from(t: string): { insert(d: unknown): Promise<{ error: unknown }> } };
    const { error: dbError } = await (supabase as unknown as IncidentEvidenceTable)
      .from("incident_evidence")
      .insert({ incident_id: incidentId, gdrive_file_id: fileId });

    if (dbError) {
      console.error("Storage Error: Failed to save evidence to DB:", dbError);
      // We don't fail the upload entirely, but we should log it
    }

    revalidatePath(`/incidents/${incidentId}`);

    return {
      success: true,
      fileId,
      message: "Kanıt dosyası başarıyla Drive arşivine yüklendi.",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    console.error("Upload Error:", message);
    return { success: false, error: message };
  }
}
