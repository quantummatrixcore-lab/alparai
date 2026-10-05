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
        { success: false, message: "Yetkisiz eriÃ…Å¸im (Unauthorized)" },
        { status: 403 },
      );
    }

    const data = await runExternalFetchTask();

    // YollarÃ„Â± yeniden doÃ„Å¸rula (tÃƒÂ¼m diller iÃƒÂ§in ÃƒÂ§alÃ„Â±Ã…Å¸masÃ„Â± adÃ„Â±na path string olarak veriliyor)
    revalidatePath("/[locale]/admin/ecosystem", "page");

    return NextResponse.json({
      success: true,
      message: `TamamlandÃ„Â±: ${data.total_fetched || 0} potansiyel olay, ${data.positive_inserted || 0} olumlu geliÃ…Å¸me, ${data.ai_verified_published || 0} otomatik yayÃ„Â±nlandÃ„Â±`,
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
        message: err instanceof Error ? err.message : "Bilinmeyen hata oluÃ…Å¸tu",
      },
      { status: 500 },
    );
  }
}
export const runtime = 'edge';
