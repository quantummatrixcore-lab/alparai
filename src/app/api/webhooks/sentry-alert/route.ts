import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

const VERCEL_PROJECT_ID = "prj_REYJORnuYOT4tk28iMXnKZBCGkjL";
const VERCEL_TEAM_ID = "team_g1woIK466hduGfKkuZN6LpkV";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");

    // 1. Secret authorization check
    if (secret !== process.env.SENTRY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    logger.info("Received Sentry alert webhook", { payload });

    // 2. Extract alert name / details
    // Sentry alert payload formats differ, but usually contain:
    // { event: 'action', action: 'triggered', data: { event: { ... } } }
    // or { message: '...', project_name: '...', rule_name: '...' }
    const ruleName = payload.data?.incident?.title || payload.rule_name || "Unknown Rule";
    const is5xxSpike =
      ruleName.toLowerCase().includes("5xx") || ruleName.toLowerCase().includes("rollback");

    if (!is5xxSpike) {
      logger.info("Alert does not match rollback criteria", { ruleName });
      return NextResponse.json({ status: "ignored", reason: "not_5xx_spike" });
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      logger.error("VERCEL_TOKEN is not defined in environment variables");
      return NextResponse.json({ error: "configuration_error" }, { status: 500 });
    }

    // 3. Fetch recent deployments from Vercel
    const deploymentsUrl = `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_TEAM_ID}&limit=10`;
    const listRes = await fetch(deploymentsUrl, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (!listRes.ok) {
      const errorText = await listRes.text();
      logger.error("Failed to fetch deployments from Vercel", { error: errorText });
      return NextResponse.json({ error: "vercel_fetch_failed" }, { status: 502 });
    }

    const listData = await listRes.json();
    const deployments = listData.deployments || [];

    // Find the current production deployment (usually the first one that is READY and is currently active)
    // and the target rollback deployment (the first READY deployment before the current one).
    const readyDeployments = deployments.filter((d: { state: string }) => d.state === "READY");

    if (readyDeployments.length < 2) {
      logger.warn("Not enough ready deployments to perform rollback");
      return NextResponse.json({ error: "insufficient_deployments" }, { status: 400 });
    }

    // Rollback target is the second ready deployment
    const targetDeployment = readyDeployments[1];
    const targetId = targetDeployment.id;
    const targetUrl = targetDeployment.url;

    logger.info("Triggering Vercel rollback", { targetId, targetUrl });

    // 4. Trigger the rollback
    const rollbackUrl = `https://api.vercel.com/v1/projects/${VERCEL_PROJECT_ID}/rollback/${targetId}?teamId=${VERCEL_TEAM_ID}`;
    const rollbackRes = await fetch(rollbackUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!rollbackRes.ok) {
      const errorText = await rollbackRes.text();
      logger.error("Vercel rollback API call failed", { error: errorText });
      return NextResponse.json(
        { error: "vercel_rollback_failed", details: errorText },
        { status: 502 },
      );
    }

    const rollbackData = await rollbackRes.json();
    logger.info("Vercel rollback triggered successfully", { rollbackData });

    return NextResponse.json({
      status: "success",
      rollback_target: {
        id: targetId,
        url: targetUrl,
      },
      data: rollbackData,
    });
  } catch (error: unknown) {
    logger.error(
      "Sentry alert webhook exception",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json(
      {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
