export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { runQuestionnaire } from "@/actions/strategy-questionnaire";
import { logger } from "@/lib/utils/logger";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const role = user?.role as string | undefined;
    if (
      !user ||
      (role !== "admin" && role !== "ceo" && role !== "moderator" && role !== "advisor")
    ) {
      return NextResponse.json(
        { ok: false, error: "Yetkisiz erişim (Unauthorized)" },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const result = await runQuestionnaire(body.selectedModels);
    return NextResponse.json(result);
  } catch (err) {
    logger.error(
      "[API Questionnaire] Execution failed",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sunucu hatası" },
      { status: 500 },
    );
  }
}
