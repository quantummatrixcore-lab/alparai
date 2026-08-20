import { type ServiceRecord, type BreakerSnapshot, type RegistryReport } from "./types";
import { HEARTBEATS, BREAKERS, SERVICE_DEFINITIONS } from "./state";

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
  const runs = [];
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
