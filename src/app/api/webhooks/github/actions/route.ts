import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

interface WorkflowRunPayload {
  action: string;
  workflow_run: {
    id: number;
    name: string;
    head_branch: string;
    created_at: string;
    updated_at: string;
    run_started_at: string;
    conclusion: string | null;
    status: string;
    event: string;
    head_commit?: {
      timestamp?: string;
    };
  };
}

interface DoraMetricRow {
  deployment_frequency?: number;
  change_failure_rate?: number;
  mttr_seconds?: number;
}

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event");

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    if (event !== "workflow_run") {
      return NextResponse.json({ status: "ignored", reason: "not_workflow_run_event" });
    }

    const payload = JSON.parse(rawBody) as WorkflowRunPayload;

    if (payload.action !== "completed") {
      return NextResponse.json({ status: "ignored", reason: "not_completed" });
    }

    const run = payload.workflow_run;
    const isDeployEvent =
      run.event === "push" && (run.head_branch === "master" || run.head_branch === "main");

    if (!isDeployEvent) {
      return NextResponse.json({ status: "ignored", reason: "not_deploy_event" });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const db = createAdminClient();

    const startedAt = new Date(run.run_started_at).getTime();
    const finishedAt = new Date(run.updated_at).getTime();
    const leadTimeSec = run.head_commit?.timestamp
      ? Math.round((finishedAt - new Date(run.head_commit.timestamp).getTime()) / 1000)
      : Math.round((finishedAt - startedAt) / 1000);

    const { data: existing } = await db
      .from("dora_metrics" as never)
      .select("deployment_frequency, change_failure_rate, mttr_seconds")
      .eq("metric_date" as never, todayStr)
      .maybeSingle();

    const existingRow = existing as DoraMetricRow | null;
    const isFailed = run.conclusion === "failure" || run.conclusion === "cancelled";
    const prevDeployCount = existingRow?.deployment_frequency ?? 0;
    const prevFailCount =
      prevDeployCount > 0
        ? Math.round(((existingRow?.change_failure_rate ?? 0) * prevDeployCount) / 100)
        : 0;

    const newDeployCount = prevDeployCount + 1;
    const newFailCount = prevFailCount + (isFailed ? 1 : 0);
    const changeFailureRate = Number(((newFailCount / newDeployCount) * 100).toFixed(2));
    const mttrSeconds = existingRow?.mttr_seconds ?? 0;

    await db.from("dora_metrics" as never).upsert(
      {
        metric_date: todayStr,
        deployment_frequency: newDeployCount,
        lead_time_seconds: leadTimeSec,
        change_failure_rate: changeFailureRate,
        mttr_seconds: mttrSeconds,
        metadata: {
          last_run_id: run.id,
          last_run_name: run.name,
          last_run_conclusion: run.conclusion,
          source: "github-webhook",
        },
      } as never,
      { onConflict: "metric_date" } as never,
    );

    logger.info("[DORA Webhook] Metrics updated", {
      date: todayStr,
      deploys: newDeployCount,
      leadTimeSec,
      changeFailureRate,
    });

    return NextResponse.json({ status: "ok", date: todayStr, deploys: newDeployCount });
  } catch (error: unknown) {
    logger.error("[DORA Webhook] Exception", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
