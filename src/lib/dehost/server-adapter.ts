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

import { createDeHostAdapterClient } from "./dehost-adapter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DeHostServerClient = any;

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

  return {
    // Own instance properties (urls, auth, rest, functions, realtime).
    ...adapter,
    /**
     * `from` and `rpc` live on the adapter PROTOTYPE, so an object spread
     * does not copy them. They must be bound explicitly or the fluent query
     * surface disappears and every call site breaks.
     */
    from: (table: string) => adapter.from(table),
    rpc: (fn: string, params?: Record<string, unknown>) => adapter.rpc(fn, params),
    auth: {
      ...adapter.auth,
      /**
       * The adapter's own `getUser` is a stub (the DeHost auth service is not
       * reachable from this runtime). The authoritative session is the
       * HMAC-signed `alparai_session` cookie, which is resolved by
       * `src/lib/dehost/server.ts` and injected into this client there.
       * Returning `null` here is a truthful "no session" — never a fake user.
       */
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  };
}
