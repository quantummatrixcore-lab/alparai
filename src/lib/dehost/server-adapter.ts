/**
 * Sovereign DeHost Server Adapter (Node.js runtime)
 * ============================================================================
 * Exposes the real DeHost query builder to Server Components, Route Handlers
 * and Server Actions.
 *
 * HISTORY / WHY THIS FILE WAS REWRITTEN
 * ------------------------------------
 * Until commit ffecd4f4 ("max speed deploy", 2026-10-06) this adapter used a
 * real `pg.Pool` against the DeHost PostgreSQL instance. That commit removed
 * the `pg` dependency and replaced the implementation with a `node:sqlite`
 * shim; a later commit ("zero-mock pipeline") degraded it further into a
 * null-object proxy whose every query resolved to `{ data: null, error: null }`.
 *
 * The null-object made the registry look healthy while serving ZERO real data:
 *   - `/api/v1/stats` returned `total_incidents: 0`
 *   - `/api/health/unified` reported `db: healthy` in ~0ms
 *   - pages silently fell back to hard-coded canonical constants
 *
 * This file now delegates to the real adapter, whose transport chain is:
 *   1. PostgreSQL over TCP (`pg`, Node runtime)  — preferred
 *   2. HTTP SQL gateway (`DEHOST_SQL_ENDPOINT`) — any runtime
 *   3. otherwise the query FAILS LOUDLY. It never resolves to an empty result.
 * ============================================================================
 */

import "server-only";

import {
  createDeHostAdapterClient,
  type DeHostAdapterClient,
  type DeHostQueryBuilder,
  type TableRow,
} from "./dehost-adapter";

export interface DeHostServerClient extends Omit<DeHostAdapterClient, "from" | "rpc"> {
  from<
    TName extends string = string,
    TRow = TableRow<TName>,
  >(table: TName): DeHostQueryBuilder<TRow, false>;
  rpc<TRow = unknown>(
    fn: string,
    params?: Record<string, unknown>,
  ): DeHostQueryBuilder<TRow, true>;
}

/**
 * Kept for API compatibility with call sites that probe the pool directly.
 * The real pool lives in `pg-transport.ts` and is loaded lazily.
 */
export async function getDeHostPgPool(): Promise<unknown | null> {
  try {
    const { getPgPool } = await import("./pg-transport");
    return await getPgPool();
  } catch {
    return null;
  }
}

export function createDeHostServerClient(): DeHostServerClient {
  const adapter = createDeHostAdapterClient();

  const client = Object.create(adapter);
  Object.assign(client, {
    from: <
      TName extends string = string,
      TRow = TableRow<TName>,
    >(table: TName) => adapter.from<TName, TRow>(table),
    rpc: <TRow = unknown>(fn: string, params?: Record<string, unknown>) =>
      adapter.rpc<TRow>(fn, params),
    auth: {
      ...adapter.auth,
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  });

  return client as DeHostServerClient;
}
