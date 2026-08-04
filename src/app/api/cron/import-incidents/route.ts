import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { parseIncidentCSV } from "@/lib/import/csv-parser";
import { importIncidents } from "@/lib/import/incident-importer";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

async function getHandler(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    process.env.NODE_ENV !== "production";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sourceParam = searchParams.get("source");

  const aiaaicUrl = process.env.AIAAIC_FEED_URL;
  const aiidUrl = process.env.AIID_FEED_URL;

  const results: Record<string, unknown> = {};

  try {
    // -------------------------------------------------------------------------
    // 1. AIAAIC Import
    // -------------------------------------------------------------------------
    if ((!sourceParam || sourceParam === "aiaaic") && aiaaicUrl) {
      logger.info("Starting cron import for AIAAIC", { url: aiaaicUrl });
      const res = await fetch(aiaaicUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch AIAAIC feed: ${res.statusText}`);
      }
      const csvText = await res.text();
      const { rows, errors: parseErrors } = parseIncidentCSV(csvText, "aiaaic_import");

      if (rows.length > 0) {
        const importRes = await importIncidents(rows, "aiaaic_import");
        results.aiaaic = {
          success: true,
          parsed: rows.length,
          parseErrors: parseErrors.length,
          inserted: importRes.inserted,
          skipped: importRes.skipped,
          errors: importRes.errors,
        };
      } else {
        results.aiaaic = {
          success: false,
          error: "No valid rows parsed from AIAAIC CSV",
          parseErrors: parseErrors.length,
        };
      }
    }

    // -------------------------------------------------------------------------
    // 2. AIID Import
    // -------------------------------------------------------------------------
    if ((!sourceParam || sourceParam === "aiid") && aiidUrl) {
      logger.info("Starting cron import for AIID", { url: aiidUrl });
      const res = await fetch(aiidUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch AIID feed: ${res.statusText}`);
      }
      const csvText = await res.text();
      const { rows, errors: parseErrors } = parseIncidentCSV(csvText, "aiid_import");

      if (rows.length > 0) {
        const importRes = await importIncidents(rows, "aiid_import");
        results.aiid = {
          success: true,
          parsed: rows.length,
          parseErrors: parseErrors.length,
          inserted: importRes.inserted,
          skipped: importRes.skipped,
          errors: importRes.errors,
        };
      } else {
        results.aiid = {
          success: false,
          error: "No valid rows parsed from AIID CSV",
          parseErrors: parseErrors.length,
        };
      }
    }

    const hasExecuted = Object.keys(results).length > 0;
    if (!hasExecuted) {
      return NextResponse.json({
        message: "No feeds executed. Ensure AIAAIC_FEED_URL and/or AIID_FEED_URL are set.",
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during cron import";
    logger.error("Cron import failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withCronLogger("import-incidents", getHandler);
