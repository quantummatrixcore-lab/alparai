import { NextResponse } from "next/server";
import { requireCEO } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

interface DBMonthlyCost {
  month: string;
  service: string;
  amount_usd: number;
  budget_usd: number;
}

interface DBApiUsage {
  id: string;
  service: string;
  metric_name: string;
  value: number;
  unit: string;
  recorded_at: string;
}

export async function GET() {
  try {
    // 1. Auth check
    await requireCEO();

    const supabase = createAdminClient();

    // 2. Fetch monthly costs from DB
    const { data: dbCostsData, error: costsError } = await supabase
      .from("finance_monthly_costs" as never)
      .select("*")
      .order("month", { ascending: true });

    if (costsError) {
      throw costsError;
    }

    const dbCosts = (dbCostsData || []) as unknown as DBMonthlyCost[];

    // 3. Fetch API usage from DB
    const { data: dbUsageData, error: usageError } = await supabase
      .from("finance_api_usage" as never)
      .select("*")
      .order("recorded_at", { ascending: false });

    if (usageError) {
      throw usageError;
    }

    const dbUsage = (dbUsageData || []) as unknown as DBApiUsage[];

    // 4. Construct response data
    // Default fallback values based on July 2026 if DB empty, but DB has seeds.
    const currentMonth = "2026-07-01";
    const currentCosts = dbCosts.filter((c) => c.month === currentMonth);

    // Dynamic external API fetches (Vercel billing as example)
    let vercelLiveCost: number | null = null;
    const vercelToken = process.env.VERCEL_TOKEN || process.env.VERCEL_OIDC_TOKEN;
    if (vercelToken) {
      try {
        const res = await fetch("https://api.vercel.com/v1/billing/charges", {
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          // Calculate sum from FOCUS v1.3 JSONL if needed, or get raw total
          // Just a mock parsing for safety
          if (data && data.charges) {
            vercelLiveCost = (data.charges as { amount?: number }[]).reduce(
              (acc: number, curr) => acc + (curr.amount || 0),
              0,
            );
          }
        }
      } catch (e) {
        logger.error(
          "Vercel Billing API failed, using DB fallback",
          undefined,
          e instanceof Error ? e : undefined,
        );
      }
    }

    const services = [
      {
        name: "vercel",
        currentCost:
          vercelLiveCost ??
          Number(currentCosts.find((c) => c.service === "vercel")?.amount_usd ?? 0.0),
        budgetLimit: Number(currentCosts.find((c) => c.service === "vercel")?.budget_usd ?? 20.0),
        percentUsed: 0,
        trend: "up",
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "supabase",
        currentCost: Number(currentCosts.find((c) => c.service === "supabase")?.amount_usd ?? 0.0),
        budgetLimit: Number(currentCosts.find((c) => c.service === "supabase")?.budget_usd ?? 0.0),
        percentUsed: 0,
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "gemini",
        currentCost: Number(currentCosts.find((c) => c.service === "gemini")?.amount_usd ?? 0.0),
        budgetLimit: Number(currentCosts.find((c) => c.service === "gemini")?.budget_usd ?? 20.0),
        percentUsed: 0,
        trend: "up",
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "anthropic",
        currentCost: Number(currentCosts.find((c) => c.service === "anthropic")?.amount_usd ?? 0.0),
        budgetLimit: Number(
          currentCosts.find((c) => c.service === "anthropic")?.budget_usd ?? 20.0,
        ),
        percentUsed: 0,
        trend: "up",
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "resend",
        currentCost: Number(currentCosts.find((c) => c.service === "resend")?.amount_usd ?? 0.0),
        budgetLimit: Number(currentCosts.find((c) => c.service === "resend")?.budget_usd ?? 0.0),
        percentUsed: 0,
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "upstash",
        currentCost: Number(currentCosts.find((c) => c.service === "upstash")?.amount_usd ?? 0.0),
        budgetLimit: Number(currentCosts.find((c) => c.service === "upstash")?.budget_usd ?? 5.0),
        percentUsed: 0,
        trend: "up",
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "buffer",
        currentCost: Number(currentCosts.find((c) => c.service === "buffer")?.amount_usd ?? 0.0),
        budgetLimit: Number(currentCosts.find((c) => c.service === "buffer")?.budget_usd ?? 6.0),
        percentUsed: 0,
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      },
    ].map((s) => {
      s.percentUsed = s.budgetLimit > 0 ? Math.round((s.currentCost / s.budgetLimit) * 100) : 0;
      return s;
    });

    const totalMonthly = services.reduce((acc, curr) => acc + curr.currentCost, 0);
    const totalBudget = services.reduce((acc, curr) => acc + curr.budgetLimit, 0);

    // Group costs by month for Recharts trend
    const months = Array.from(new Set(dbCosts.map((c) => c.month)));
    const trends = months.map((m) => {
      const monthLabel = new Date(m).toLocaleDateString("tr-TR", { month: "long" });
      const monthCosts = dbCosts.filter((c) => c.month === m);
      const dataPoint: Record<string, string | number> = { name: monthLabel };
      let sum = 0;
      monthCosts.forEach((c) => {
        const val = Number(c.amount_usd);
        dataPoint[c.service] = val;
        sum += val;
      });
      dataPoint["Toplam"] = sum;
      return dataPoint;
    });

    // Anomaly alerts
    const alerts: string[] = [];
    services.forEach((s) => {
      if (s.percentUsed >= 90 && s.budgetLimit > 0) {
        alerts.push(
          `${s.name.toUpperCase()} bütçesi limitine ulaştı (${s.percentUsed}% kullanıldı).`,
        );
      } else if (s.percentUsed >= 80 && s.budgetLimit > 0) {
        alerts.push(
          `${s.name.toUpperCase()} bütçesi kritik sınıra yaklaşıyor (${s.percentUsed}% kullanıldı).`,
        );
      }
    });

    return NextResponse.json({
      services,
      totalMonthly: Number(totalMonthly.toFixed(2)),
      totalBudget: Number(totalBudget.toFixed(2)),
      trends,
      usage: dbUsage,
      alerts,
    });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Costs API error", undefined, err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch costs data" },
      { status: err.message === "FORBIDDEN" || err.message === "UNAUTHORIZED" ? 403 : 500 },
    );
  }
}
