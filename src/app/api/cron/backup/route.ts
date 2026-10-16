let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { uploadToDrive } from "@/lib/gdrive/client";


// This route should only be triggered by DeHost Cron
// You should protect it by checking the Authorization header in a real setup
export async function GET(request: Request) {
  try {
    // Basic protection (DeHost Cron sets this header)
    const authHeader = request.headers.get("authorization");
    if (
      !(vault.read('CRON_SECRET') ?? process.env.CRON_SECRET) ||
      !authHeader ||
      authHeader !== `Bearer ${(vault.read('CRON_SECRET') ?? process.env.CRON_SECRET)}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dehost = createAdminClient();

    // List of tables to backup (add your core tables here)
    const tablesToBackup = ["incidents", "profiles", "incident_votes"];
    const backupData: Record<string, unknown[]> = {};

    for (const table of tablesToBackup) {
      const { data, error } = await dehost.from(table).select("*");
      if (error) {
        console.error(`Failed to backup table ${table}:`, error);
        continue;
      }
      backupData[table] = data;
    }

    // Convert to JSON buffer
    const jsonString = JSON.stringify(backupData);

    // Optional: Encrypt the backup data before uploading to GDrive
    // For now, we upload the plain JSON or you can implement AES-256 here.
    const buffer = Buffer.from(jsonString, "utf-8");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `alparai_db_backup_${timestamp}.json`;

    // Upload to Google Drive
    const fileId = await uploadToDrive(fileName, "application/json", buffer);

    return NextResponse.json({
      success: true,
      message: "Database backup completed successfully",
      fileId,
      timestamp,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Backup Error:", message);
    return new NextResponse(`Backup failed: ${message}`, { status: 500 });
  }
}

