/**
 * ALPAR AI — DeHost PostgreSQL Transport
 * ============================================================================
 * Node.js runtime transport for the DeHost registry database.
 *
 * `pg` is loaded lazily so that:
 *  - edge bundles never pull a raw-TCP driver into the worker graph,
 *  - the build does not hard-fail when the optional driver is absent,
 *  - a missing driver produces an explicit, actionable error instead of a
 *    silent empty result.
 *
 * The driver is an OPTIONAL peer: when it is unavailable the caller falls back
 * to the HTTP SQL transport. When neither transport is usable the query fails
 * loudly — it never resolves to an empty result.
 * ============================================================================
 */

import { logger } from "@/lib/utils/logger";

export interface PgQueryResult {
  rows: unknown[];
}

interface PgPoolLike {
  query(sql: string, params?: unknown[]): Promise<PgQueryResult>;
  end?(): Promise<void>;
}

let poolPromise: Promise<PgPoolLike | null> | null = null;
let driverLoadError: string | null = null;

/**
 * Loads the `pg` driver without letting the bundler resolve it statically.
 *
 * The module specifier is held in a variable on purpose: a literal
 * `import("pg")` is resolved by Vite/webpack at transform time and turns a
 * missing OPTIONAL dependency into a hard build/test failure. Here the
 * resolution happens at runtime through Node's own resolver, so an absent
 * driver simply means "this transport is unavailable".
 */
async function loadPgDriver(): Promise<{ Pool: new (config: unknown) => PgPoolLike } | null> {
  try {
    const specifier = "pg";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import(/* @vite-ignore */ /* webpackIgnore: true */ specifier);
    const Pool = mod?.default?.Pool ?? mod?.Pool;
    if (typeof Pool !== "function") {
      driverLoadError = "pg module loaded but does not expose a Pool constructor";
      return null;
    }
    return { Pool };
  } catch (error) {
    driverLoadError = error instanceof Error ? error.message : String(error);
    return null;
  }
}

function buildPoolConfig(): Record<string, unknown> {
  const env = process.env;
  const isProduction = env.NODE_ENV === "production";

  if (env.DATABASE_URL) {
    const isLocal =
      env.DATABASE_URL.includes("127.0.0.1") ||
      env.DATABASE_URL.includes("localhost") ||
      env.DATABASE_URL.includes("sslmode=disable");
    return {
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      statement_timeout: 15000,
      idleTimeoutMillis: 30000,
      max: 10,
      ssl: isProduction && !isLocal ? { rejectUnauthorized: false } : undefined,
    };
  }

  const isLocalHost =
    !env.DEHOST_HOST ||
    env.DEHOST_HOST === "127.0.0.1" ||
    env.DEHOST_HOST.includes("localhost");

  return {
    host: env.DEHOST_HOST || "127.0.0.1",
    port: Number(env.DEHOST_PORT) || 5432,
    user: env.DEHOST_USER || "postgres",
    password: env.DEHOST_PASSWORD || undefined,
    database: env.DEHOST_DB || "alparai_prod",
    connectionTimeoutMillis: 5000,
    statement_timeout: 15000,
    idleTimeoutMillis: 30000,
    max: 10,
    ssl: isProduction && !isLocalHost ? { rejectUnauthorized: false } : undefined,
  };
}

/**
 * Returns the shared pool, or `null` when the driver is unavailable.
 */
export async function getPgPool(): Promise<PgPoolLike | null> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const driver = await loadPgDriver();
      if (!driver) {
        logger.warn("[DeHost/pg] Driver unavailable, falling back to HTTP SQL transport", {
          reason: driverLoadError ?? "unknown",
        });
        return null;
      }
      const { Pool } = driver;
      return new Pool(buildPoolConfig());
    })();
  }
  return poolPromise;
}

/**
 * True when the `pg` driver could be loaded in this runtime.
 */
export async function isPgAvailable(): Promise<boolean> {
  return (await getPgPool()) !== null;
}

/**
 * Executes a parameterised statement over the `pg` transport.
 * Throws when the driver is unavailable or the statement fails.
 */
export async function queryWithPg(sql: string, params: unknown[]): Promise<{ rows: unknown[] }> {
  const pool = await getPgPool();
  if (!pool) {
    throw new Error(
      `[DeHost/pg] Driver not available: ${driverLoadError ?? "pg could not be loaded"}. ` +
        "Install the optional 'pg' dependency or configure the HTTP SQL transport.",
    );
  }
  const result = await pool.query(sql, params);
  return { rows: result.rows ?? [] };
}
