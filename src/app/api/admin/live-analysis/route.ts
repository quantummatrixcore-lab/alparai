export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { runLiveSystemAnalysis } from "@/actions/admin/live-analysis";
import { logger } from "@/lib/utils/logger";

export async function POST(_req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim (Unauthorized)" },
        { status: 403 },
      );
    }

    const result = await runLiveSystemAnalysis();
    return NextResponse.json(result);
  } catch (err) {
    logger.error(
      "[API LiveAnalysis] Execution failed",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Bilinmeyen hata oluştu",
      },
      { status: 500 },
    );
  }
}
