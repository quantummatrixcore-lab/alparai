import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCostsData } from "@/lib/services/costs";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "ceo")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const data = await getCostsData();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Costs API error", undefined, err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch costs data" },
      { status: err.message === "FORBIDDEN" || err.message === "UNAUTHORIZED" ? 403 : 500 },
    );
  }
}
