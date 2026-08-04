import { withCronLogger } from "@/lib/utils/cron-logger";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

async function getHandler(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = await createServerClient();

    // Pivot-check: evaluate usage 30 days post-launch (Sept 1)
    const launchDate = new Date("2026-08-02T00:00:00Z");

    const [{ count: userCount }, { count: incidentCount }, { count: verifiedIncidents }] =
      await Promise.all([
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .gte("created_at", launchDate.toISOString()),
        supabase
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .gte("created_at", launchDate.toISOString()),
        supabase
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .gte("created_at", launchDate.toISOString())
          .eq("status", "published"),
      ]);

    logger.info(
      `[Day-30 Pivot-Check] Users: ${userCount}, Incidents: ${incidentCount}, Verified: ${verifiedIncidents}`,
    );

    return NextResponse.json({
      ok: true,
      users: userCount,
      incidents: incidentCount,
      verified: verifiedIncidents,
    });
  } catch (err: unknown) {
    logger.error("Pivot-check failed", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("pivot-check", getHandler);
