export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { runExternalFetchTask } from "@/lib/services/external-fetcher";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export const maxDuration = 60;

export async function POST(_req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim (Unauthorized)" },
        { status: 403 },
      );
    }

    const data = await runExternalFetchTask();

    // Yolları yeniden doğrula (tüm diller için çalışması adına path string olarak veriliyor)
    revalidatePath("/[locale]/admin/ecosystem", "page");

    return NextResponse.json({
      success: true,
      message: `Tamamlandı: ${data.total_fetched || 0} potansiyel olay, ${data.positive_inserted || 0} olumlu gelişme, ${data.ai_verified_published || 0} otomatik yayınlandı`,
    });
  } catch (err) {
    logger.error(
      "[API EcosystemFetch] Execution failed",
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
