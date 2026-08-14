"use server";

import { uploadToDrive } from "@/lib/gdrive/client";
import { revalidatePath } from "next/cache";

export async function uploadIncidentEvidence(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const incidentId = formData.get("incidentId") as string;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!incidentId) {
      return { success: false, error: "Incident ID is missing" };
    }

    // Convert Web File to Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive (Zero-Cost Storage)
    const fileId = await uploadToDrive(file.name, file.type, buffer);

    // TODO: Save the fileId to your Supabase Database under the specific incidentId
    // e.g., await supabase.from('incident_evidence').insert({ incident_id: incidentId, gdrive_file_id: fileId })

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
