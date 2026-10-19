/**
 * ALPAR AI — DeHost Database Health Probe
 * ============================================================================
 * A probe that can actually FAIL.
 *
 * The previous implementation reused the query client to run
 * `select("id", { head: true })` and treated a `null` error as "healthy".
 * Because the client was a null-object, the probe resolved instantly with
 * `error: null` and reported `db: healthy` even when the registry was
 * completely unreachable. That masked a 13-day production regression.
 *
 * This probe issues a real round-trip against the database and reports the
 * measured latency, the row count and the concrete failure reason.
 * ============================================================================
 */

import { logger } from "@/lib/utils/logger";

export interface DbHealthResult {
  ok: boolean;
  latencyMs: number;
  /** Concrete reason for the failure. `null` when healthy. */
  error: string | null;
  /** Row count returned by the probe query, when it could be measured. */
  rowCount: number | null;
  /** Which transport answered the probe. */
  transport: "pg" | "http" | "none";
}

const PROBE_TABLE = "incidents";
const PROBE_TIMEOUT_MS = 8000;

/**
 * Probes the registry database with a real query.
 */
export async function probeDatabase(): Promise<DbHealthResult> {
  const startedAt = performance.now();
  const timeout = AbortSignal.timeout(PROBE_TIMEOUT_MS);

  // Transport 1: PostgreSQL over TCP.
  try {
    const { isPgAvailable, queryWithPg } = await import("./pg-transport");
    if (await isPgAvailable()) {
      const result = await queryWithPg(`SELECT COUNT(*)::int AS count FROM ${PROBE_TABLE}`, []);
      const count = (result.rows[0] as { count?: number } | undefined)?.count ?? null;
      return {
        ok: true,
        latencyMs: Math.round(performance.now() - startedAt),
        error: null,
        rowCount: typeof count === "number" ? count : null,
        transport: "pg",
      };
    }
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startedAt);
    const message = error instanceof Error ? error.message : String(error);
    logger.error("[DeHost/health] PostgreSQL probe failed", { error: message });
    return { ok: false, latencyMs, error: message, rowCount: null, transport: "pg" };
  }

  // Transport 2: HTTP SQL gateway.
  const endpoint = process.env.DEHOST_SQL_ENDPOINT ?? process.env.ERCUOS_API_URL ?? null;

  if (endpoint) {
    try {
      const token = process.env.DEHOST_PASSWORD ?? process.env.DEHOST_SERVICE_ROLE_KEY ?? "";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ table: PROBE_TABLE, action: "select", columns: "id" }),
        signal: timeout,
      });
      const latencyMs = Math.round(performance.now() - startedAt);
      if (!res.ok) {
        const message = `DeHost SQL gateway responded with HTTP ${res.status}`;
        logger.error("[DeHost/health] HTTP probe failed", { endpoint, status: res.status });
        return { ok: false, latencyMs, error: message, rowCount: null, transport: "http" };
      }
      const body = (await res.json()) as { data?: unknown[]; count?: number };
      const rows = Array.isArray(body.data) ? body.data.length : 0;
      return {
        ok: true,
        latencyMs,
        error: null,
        rowCount: typeof body.count === "number" ? body.count : rows,
        transport: "http",
      };
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startedAt);
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[DeHost/health] HTTP probe unreachable", { endpoint, error: message });
      return { ok: false, latencyMs, error: message, rowCount: null, transport: "http" };
    }
  }

  // No transport at all: this MUST be unhealthy.
  const latencyMs = Math.round(performance.now() - startedAt);
  return {
    ok: false,
    latencyMs,
    error:
      "No database transport configured: install the optional 'pg' dependency with " +
      "DATABASE_URL / DEHOST_* credentials, or set DEHOST_SQL_ENDPOINT.",
    rowCount: null,
    transport: "none",
  };
}
