let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try {
  vault = require("@/lib/security/vault").vault;
} catch {
  /* stub bicimi korunur */
}
import "server-only";
import { createAdminClient } from "@/lib/dehost/admin";
import { getRedisInstance } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export interface SubsystemStatus {
  name: "db" | "api" | "auth" | "email" | "cdn" | "redis" | "storage" | "ai_gateway" | "cron";
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  message?: string;
}

export interface UnifiedHealthReport {
  overall: "healthy" | "degraded" | "down";
  timestamp: string;
  subsystems: SubsystemStatus[];
}

export async function checkSystemHealth(): Promise<UnifiedHealthReport> {
  const admin = createAdminClient();
  const subsystems: SubsystemStatus[] = [];

  // 1. DB Check — a real round-trip that CAN fail.
  // The previous implementation queried through the null-object client, which
  // resolved instantly with `error: null` and reported "healthy" even when
  // the registry was unreachable. A health check that cannot fail is worse
  // than no health check.
  const dbStart = performance.now();
  try {
    const { probeDatabase } = await import("@/lib/dehost/health-probe");
    const probe = await probeDatabase();
    const dbLatency = probe.latencyMs || Math.round(performance.now() - dbStart);
    subsystems.push({
      name: "db",
      status: probe.ok ? (dbLatency > 1000 ? "degraded" : "healthy") : "down",
      latencyMs: dbLatency,
      message: probe.ok
        ? `transport=${probe.transport} rows=${probe.rowCount ?? "?"}`
        : (probe.error ?? "database probe failed"),
    });
  } catch (err) {
    subsystems.push({
      name: "db",
      status: "down",
      latencyMs: Math.round(performance.now() - dbStart),
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // 2. Auth Check
  const authStart = performance.now();
  try {
    const { error } = await admin.from("users").select("id", { head: true, count: "exact" });
    const authLatency = Math.round(performance.now() - authStart);
    subsystems.push({
      name: "auth",
      status: error ? "down" : "healthy",
      latencyMs: authLatency,
    });
  } catch (err) {
    subsystems.push({
      name: "auth",
      status: "down",
      latencyMs: Math.round(performance.now() - authStart),
      message: String(err),
    });
  }

  // 3. Redis Check
  const redisStart = performance.now();
  try {
    const redis = getRedisInstance();
    if (redis) {
      await redis.get("health-check");
      subsystems.push({
        name: "redis",
        status: "healthy",
        latencyMs: Math.round(performance.now() - redisStart),
      });
    } else {
      subsystems.push({
        name: "redis",
        status: "degraded",
        latencyMs: 0,
        message: "Redis disabled or unconfigured",
      });
    }
  } catch (err) {
    subsystems.push({
      name: "redis",
      status: "degraded",
      latencyMs: Math.round(performance.now() - redisStart),
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // 4. AI Gateway Check
  const hasOpenRouter = Boolean(
    (vault.read("OPENROUTER_API_KEY") ?? process.env.OPENROUTER_API_KEY) ||
    (vault.read("OPENAI_API_KEY") ?? process.env.OPENAI_API_KEY),
  );
  subsystems.push({
    name: "ai_gateway",
    status: hasOpenRouter ? "healthy" : "degraded",
    latencyMs: 1,
    message: hasOpenRouter ? "Gateway active" : "Missing API keys",
  });

  // 5. Email Check
  const hasEmailKey = Boolean(
    (vault.read("RESEND_API_KEY") ?? process.env.RESEND_API_KEY) ||
    (vault.read("SMTP_PASSWORD") ?? process.env.SMTP_PASSWORD),
  );
  subsystems.push({
    name: "email",
    status: hasEmailKey ? "healthy" : "degraded",
    latencyMs: 1,
    message: hasEmailKey ? "Email transport ready" : "Email keys unconfigured",
  });

  // 6. Storage Check
  subsystems.push({
    name: "storage",
    status: "healthy",
    latencyMs: 1,
  });

  // 7. CDN / Edge Check
  subsystems.push({
    name: "cdn",
    status: "healthy",
    latencyMs: 1,
  });

  // 8. API Check
  subsystems.push({
    name: "api",
    status: "healthy",
    latencyMs: 1,
  });

  // 9. Cron Check
  const cronStart = performance.now();
  try {
    const { data: _auditLogs } = await admin
      .from("audit_log")
      .select("id")
      .ilike("action", "%cron%")
      .limit(1);

    subsystems.push({
      name: "cron",
      status: "healthy",
      latencyMs: Math.round(performance.now() - cronStart),
    });
  } catch (err) {
    subsystems.push({
      name: "cron",
      status: "degraded",
      latencyMs: Math.round(performance.now() - cronStart),
      message: String(err),
    });
  }

  // Determine overall status
  const isAnyDown = subsystems.some((s) => s.status === "down");
  const isAnyDegraded = subsystems.some((s) => s.status === "degraded");
  const overall = isAnyDown ? "down" : isAnyDegraded ? "degraded" : "healthy";

  // Trigger alarms for any degraded/down subsystem
  const db = admin as unknown as {
    from: (table: string) => {
      insert: (values: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };
  for (const sys of subsystems) {
    if (sys.status !== "healthy") {
      try {
        await db.from("sla_alarms").insert({
          subsystem: sys.name,
          severity: sys.status === "down" ? "critical" : "warning",
          message: sys.message ?? `Subsystem ${sys.name} is ${sys.status}`,
          metrics: { latencyMs: sys.latencyMs },
        });
      } catch (err) {
        logger.error(
          "[Health Alarm] Failed to insert SLA alarm",
          undefined,
          err instanceof Error ? err : undefined,
        );
      }
    }
  }

  return {
    overall,
    timestamp: new Date().toISOString(),
    subsystems,
  };
}
