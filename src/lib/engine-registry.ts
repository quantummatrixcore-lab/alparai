import { readFile } from "fs/promises";
import { join } from "path";
import { logger } from "@/lib/utils/logger";

export interface ServiceRecord {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  type: "api" | "cron" | "agent" | "mcp" | "ai" | "db";
  lastHeartbeat: string | null;
  lastError: string | null;
  uptime: number | null;
  healthEndpoint: string | null;
}

export interface BreakerSnapshot {
  serviceId: string;
  state: "closed" | "open" | "half_open";
  failureCount: number;
  threshold: number;
  cooldownMs: number;
  lastFailure: string | null;
}

export interface RegistryReport {
  services: ServiceRecord[];
  breakers: BreakerSnapshot[];
  lastUpdated: string;
  healthyCount: number;
  totalCount: number;
}

const HEARTBEATS: Map<string, { lastSeen: number; lastError: string | null }> = new Map();
const BREAKERS: Map<string, BreakerSnapshot> = new Map();

export const SERVICE_DEFINITIONS: ServiceRecord[] = [
  {
    id: "supabase",
    name: "Supabase DB",
    status: "unknown",
    type: "db",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "redis",
    name: "Upstash Redis",
    status: "unknown",
    type: "db",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "gemini",
    name: "Gemini API",
    status: "unknown",
    type: "ai",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "anthropic",
    name: "Anthropic API",
    status: "unknown",
    type: "ai",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "openrouter",
    name: "OpenRouter Gateway",
    status: "unknown",
    type: "ai",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "resend",
    name: "Resend Email",
    status: "unknown",
    type: "api",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "sentry",
    name: "Sentry Monitoring",
    status: "unknown",
    type: "api",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "vercel",
    name: "Vercel Deploy",
    status: "unknown",
    type: "api",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "cron-cost-alarm",
    name: "Cron: Cost Alarm",
    status: "unknown",
    type: "cron",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "cron-import-aiaaic",
    name: "Cron: Import AIAAIC",
    status: "unknown",
    type: "cron",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "cron-import-aiid",
    name: "Cron: Import AIID",
    status: "unknown",
    type: "cron",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "cron-generate-marketing",
    name: "Cron: Marketing",
    status: "unknown",
    type: "cron",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "cron-retro-audit",
    name: "Cron: Retro Audit",
    status: "unknown",
    type: "cron",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "cron-pivot-check",
    name: "Cron: Pivot Check",
    status: "unknown",
    type: "cron",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "cron-moderation-sla",
    name: "Cron: Moderation SLA",
    status: "unknown",
    type: "cron",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "cron-newsletter",
    name: "Cron: Newsletter",
    status: "unknown",
    type: "cron",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "agent-autopilot",
    name: "Agent: Autopilot",
    status: "unknown",
    type: "agent",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "agent-marketing",
    name: "Agent: Marketing",
    status: "unknown",
    type: "agent",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "agent-sentinel",
    name: "Agent: Sentinel",
    status: "unknown",
    type: "agent",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "mcp-github",
    name: "MCP: GitHub",
    status: "unknown",
    type: "mcp",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "mcp-vercel",
    name: "MCP: Vercel",
    status: "unknown",
    type: "mcp",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "mcp-context7",
    name: "MCP: Context7",
    status: "unknown",
    type: "mcp",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
  {
    id: "mcp-playwright",
    name: "MCP: Playwright",
    status: "unknown",
    type: "mcp",
    lastHeartbeat: null,
    lastError: null,
    uptime: null,
    healthEndpoint: null,
  },
];

export function recordHeartbeat(serviceId: string, error?: string): void {
  HEARTBEATS.set(serviceId, { lastSeen: Date.now(), lastError: error || null });
}

export function recordBreakerChange(
  serviceId: string,
  state: BreakerSnapshot["state"],
  failureCount: number,
  threshold: number,
  cooldownMs: number,
): void {
  BREAKERS.set(serviceId, {
    serviceId,
    state,
    failureCount,
    threshold,
    cooldownMs,
    lastFailure: failureCount > 0 ? new Date().toISOString() : null,
  });
}

export async function listRecentRuns(limit = 20): Promise<
  {
    id: string;
    name: string;
    lastRun: string | null;
    durationMs: number | null;
    ok: boolean;
    error: string | null;
  }[]
> {
  const runs: {
    id: string;
    name: string;
    lastRun: string | null;
    durationMs: number | null;
    ok: boolean;
    error: string | null;
  }[] = [];
  for (const [id, hb] of HEARTBEATS) {
    const svc = SERVICE_DEFINITIONS.find((s) => s.id === id);
    runs.push({
      id,
      name: svc?.name || id,
      lastRun: hb.lastSeen ? new Date(hb.lastSeen).toISOString() : null,
      durationMs: null,
      ok: !hb.lastError,
      error: hb.lastError,
    });
  }
  runs.sort((a, b) => (b.lastRun || "").localeCompare(a.lastRun || ""));
  return runs.slice(0, limit);
}

export function getRegistryReport(): RegistryReport {
  const services = SERVICE_DEFINITIONS.map((s) => {
    const hb = HEARTBEATS.get(s.id);
    const breaker = BREAKERS.get(s.id);
    if (hb) {
      const age = Date.now() - hb.lastSeen;
      const status: ServiceRecord["status"] =
        age < 60000 ? "healthy" : age < 300000 ? "degraded" : "down";
      return {
        ...s,
        status,
        lastHeartbeat: new Date(hb.lastSeen).toISOString(),
        lastError: hb.lastError,
        uptime: age,
      };
    }
    return {
      ...s,
      status: (breaker
        ? breaker.state === "open"
          ? "down"
          : "degraded"
        : "unknown") as ServiceRecord["status"],
    };
  });
  const healthyCount = services.filter((s) => s.status === "healthy").length;
  return {
    services,
    breakers: [...BREAKERS.values()],
    lastUpdated: new Date().toISOString(),
    healthyCount,
    totalCount: services.length,
  };
}

export function isServiceHealthy(serviceId: string): boolean {
  return getRegistryReport().services.some((s) => s.id === serviceId && s.status === "healthy");
}

const vercelCronRoutes: { path: string; schedule: string }[] = [];

export async function loadCronRoutes(): Promise<{ path: string; schedule: string }[]> {
  if (vercelCronRoutes.length > 0) return vercelCronRoutes;
  try {
    const raw = await readFile(join(process.cwd(), "vercel.json"), "utf-8");
    const config = JSON.parse(raw);
    if (config.crons) {
      vercelCronRoutes.push(...config.crons);
    }
  } catch (err) {
    logger.error(
      "[EngineRegistry] Failed to load vercel.json crons",
      undefined,
      err instanceof Error ? err : undefined,
    );
  }
  return vercelCronRoutes;
}

export async function getCronStatus(): Promise<
  { path: string; schedule: string; lastRun: string | null; ok: boolean; id: string }[]
> {
  const routes = await loadCronRoutes();
  return routes.map((r) => {
    const id = r.path.replace("/api/cron/", "cron-").replace(/[?&]/g, "-");
    const hb = HEARTBEATS.get(id);
    return {
      ...r,
      lastRun: hb?.lastSeen ? new Date(hb.lastSeen).toISOString() : null,
      ok: !hb?.lastError,
      id,
    };
  });
}
