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

    // Task #199: HN/Reddit launch is pending.
    // Set to true only when the actual launch is executed.
    const isLaunched = process.env.NEXT_PUBLIC_APP_LAUNCHED === "true";

    if (!isLaunched) {
      logger.info("[Day-7 Kill-Metric] N/A — not launched");
      return NextResponse.json({
        ok: true,
        launched: false,
        users: "N/A — not launched",
        incidents: "N/A — not launched",
        article73_pending_72h: "N/A — not launched",
      });
    }

    const supabase = await createServerClient();

    // Kill-metric: check user acquisition and incident count since launch (Aug 2)
    const launchDate = new Date("2026-08-02T00:00:00Z");

    const [{ count: userCount }, { count: incidentCount }, { count: pending72hCount }] =
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
          .gte("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
          .eq("status", "pending_review"),
      ]);

    // Send this metric to Slack / Email or DB
    logger.info(
      `[Day-7 Kill-Metric] Users: ${userCount ?? 0}, Incidents: ${incidentCount ?? 0}, Article 73 Pending 72h: ${pending72hCount ?? 0}`,
    );

    return NextResponse.json({
      ok: true,
      launched: true,
      users: userCount ?? 0,
      incidents: incidentCount ?? 0,
      article73_pending_72h: pending72hCount ?? 0,
    });
  } catch (err: unknown) {
    logger.error("Kill-metric failed", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("kill-metric", getHandler);
