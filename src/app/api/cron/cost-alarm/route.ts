import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/email/resend";
import { Redis } from "@upstash/redis";
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

  try {
    const admin = createAdminClient();
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    // 1. Fetch current monthly costs
    const { data: monthlyCosts, error: monthlyError } = await admin
      .from("finance_monthly_costs" as never)
      .select("amount_usd, service")
      .eq("month", currentMonth);

    if (monthlyError) {
      throw new Error(`Failed to fetch monthly costs: ${monthlyError.message}`);
    }

    const typedMonthlyCosts = (monthlyCosts || []) as {
      amount_usd?: number | string;
      service?: string;
    }[];
    const totalInfrastructureMonthly = typedMonthlyCosts.reduce(
      (acc: number, curr) => acc + Number(curr.amount_usd || 0),
      0,
    );

    // Fetch total monthly LLM cost from cross_audit_runs (O3)
    let totalLlmMonthly = 0;
    try {
      const monthStart = new Date().toISOString().slice(0, 7) + "-01T00:00:00.000Z";
      const { data: llmRuns } = await admin
        .from("cross_audit_runs")
        .select("cost_usd")
        .gte("created_at", monthStart);

      if (llmRuns) {
        totalLlmMonthly = llmRuns.reduce((acc, curr) => acc + Number(curr.cost_usd || 0), 0);
      }
    } catch (e) {
      logger.error("Failed to query monthly LLM costs", {}, e instanceof Error ? e : undefined);
    }

    const totalMonthly = totalInfrastructureMonthly + totalLlmMonthly;

    // Fetch daily LLM cost from cross_audit_runs (O3)
    let estimatedDailyCost = 0;
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: llmDaily } = await admin
        .from("cross_audit_runs")
        .select("cost_usd")
        .gte("created_at", oneDayAgo);

      if (llmDaily) {
        estimatedDailyCost = llmDaily.reduce((acc, curr) => acc + Number(curr.cost_usd || 0), 0);
      }
    } catch (e) {
      logger.error("Failed to query daily LLM costs", {}, e instanceof Error ? e : undefined);
    }

    // Read API vendor quotas and compute utilization alerts
    const { data: vendorQuotas, error: quotasError } = await admin
      .from("vendor_quotas" as never)
      .select("vendor, metric, limit_value, used_value, unit")
      .not("limit_value", "is", null)
      .eq("source", "api");

    if (quotasError) {
      throw new Error(`Failed to fetch vendor_quotas: ${quotasError.message}`);
    }

    const typedQuotas = (vendorQuotas || []) as {
      vendor?: string;
      metric?: string;
      limit_value?: number | string | null;
      used_value?: number | string | null;
      unit?: string;
    }[];

    const warningVendors: string[] = [];
    const criticalVendors: string[] = [];
    const exhaustedVendors: string[] = [];

    for (const row of typedQuotas) {
      const limit = Number(row.limit_value);
      const used = Number(row.used_value || 0);
      if (!Number.isFinite(limit) || limit <= 0 || !row.vendor) continue;
      const ratio = used / limit;

      if (ratio >= 1) {
        exhaustedVendors.push(row.vendor);
        logger.error(`AUTONOMOUS BRAKE: quota exhausted for ${row.vendor}`, {
          vendor: row.vendor,
          metric: row.metric,
          used,
          limit,
          ratio: Number(ratio.toFixed(4)),
        });
      } else if (ratio >= 0.9) {
        criticalVendors.push(row.vendor);
        logger.critical(`AUTONOMOUS BRAKE: quota at 90%+ for ${row.vendor}`, {
          vendor: row.vendor,
          metric: row.metric,
          used,
          limit,
          ratio: Number(ratio.toFixed(4)),
        });
      } else if (ratio >= 0.75) {
        warningVendors.push(row.vendor);
      }
    }

    // Single admin email when any vendor reaches 75%+ utilization
    const vendorsOver75 = [
      ...new Set([...warningVendors, ...criticalVendors, ...exhaustedVendors]),
    ];
    if (vendorsOver75.length > 0) {
      try {
        const resend = getResendClient();
        if (resend) {
          const rowsHtml = typedQuotas
            .filter((r) => r.vendor && vendorsOver75.includes(r.vendor))
            .map((r) => {
              const limit = Number(r.limit_value);
              const used = Number(r.used_value || 0);
              const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
              return `<li>${r.vendor} (${r.metric}): ${used} / ${limit} ${r.unit || ""} (${pct}%)</li>`;
            })
            .join("");

          await resend.emails.send({
            from: "ALPAR AI Alerts <alerts@alparai.com>",
            to: process.env.ADMIN_ALERT_EMAIL || "quantum.matrix.core@gmail.com",
            subject: `[ALERT] Vendor quota ≥75% for ${vendorsOver75.length} vendor(s)`,
            html: `
              <p>ALPAR AI autonomous cost guard detected vendor quota utilization of ≥75%.</p>
              <ul>${rowsHtml}</ul>
              <p>90%+ triggers an AUTONOMOUS BRAKE CRITICAL log; 100%+ triggers an AUTONOMOUS BRAKE ERROR log.</p>
              <p>Best regards,<br/>ALPAR AI Cost Alarm</p>
            `,
          });
          logger.info(`[CostAlarm] Quota warning email sent for: ${vendorsOver75.join(", ")}`);
        } else {
          logger.warn("[CostAlarm] Quota ≥75% detected but RESEND_API_KEY not configured", {
            vendorsOver75,
          });
        }
      } catch (emailErr) {
        logger.error(
          "Failed to send quota warning email",
          {},
          emailErr instanceof Error ? emailErr : undefined,
        );
      }
    }

    // Default defaults for cost thresholds (configurable via env)
    const dailyWarningThreshold = Number(process.env.COST_WARNING_DAILY ?? 50); // >$50 warning
    const dailyLimitThreshold = Number(process.env.COST_LIMIT_DAILY ?? 100); // >$100 auto-throttle / kill-switch
    const monthlyLimitThreshold = Number(process.env.COST_LIMIT_MONTHLY ?? 500); // >$500 monthly limit / kill-switch

    let killSwitchActive = false;
    let alarmReason = "";

    if (totalMonthly >= monthlyLimitThreshold) {
      killSwitchActive = true;
      alarmReason = `Monthly cost ($${totalMonthly.toFixed(2)}) exceeded limit ($${monthlyLimitThreshold})`;
    } else if (estimatedDailyCost >= dailyLimitThreshold) {
      killSwitchActive = true;
      alarmReason = `Daily cost ($${estimatedDailyCost.toFixed(2)}) exceeded limit ($${dailyLimitThreshold})`;
    }

    // Persist kill switch status to Redis if Redis credentials exist
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        if (killSwitchActive) {
          await redis.set("cost_kill_switch", "true");
          logger.error(`[CostAlarm] COST_KILL_SWITCH ACTIVATED: ${alarmReason}`);
        } else {
          // If under limit, ensure it's not locked (or let admin unlock manually)
          // We won't auto-unlock if previously locked to prevent oscillating, but let's keep it safe
          const currentSwitch = await redis.get("cost_kill_switch");
          if (
            currentSwitch === "true" &&
            totalMonthly < monthlyLimitThreshold &&
            estimatedDailyCost < dailyLimitThreshold
          ) {
            // Auto unlock if under budget
            await redis.del("cost_kill_switch");
            logger.info("[CostAlarm] COST_KILL_SWITCH automatically cleared (under budget)");
          }
        }
      } catch (redisErr) {
        logger.error(
          "Failed to update cost_kill_switch in Redis",
          {},
          redisErr instanceof Error ? redisErr : undefined,
        );
      }
    }

    // Warn if daily cost is high
    if (estimatedDailyCost >= dailyWarningThreshold && !killSwitchActive) {
      logger.warn(
        `[CostAlarm] High daily cost warning: $${estimatedDailyCost.toFixed(2)} spent in the last 24h.`,
      );
    }

    return NextResponse.json({
      success: true,
      totalMonthly: Number(totalMonthly.toFixed(2)),
      estimatedDailyCost: Number(estimatedDailyCost.toFixed(2)),
      killSwitchActive,
      reason: alarmReason || "Under limits",
      quotaAlerts: {
        warningVendors,
        criticalVendors,
        exhaustedVendors,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during cost alarm cron";
    logger.error("Cost alarm cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withCronLogger("cost-alarm", getHandler);
