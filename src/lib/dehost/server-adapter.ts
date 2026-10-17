/**
 * Sovereign DeHost SQLite Server Adapter (Node.js 22.5+ Native SQLite)
 * Executes queries directly against local SQLite database using built-in node:sqlite.
 * ULTIMATE ZERO-DEPENDENCY.
 */

import "server-only";
import { createDeHostAdapterClient } from "./dehost-adapter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteInstance: any = null;

export function getDeHostPgPool() {
  if (!sqliteInstance) {
    try {
      // Dynamic require to prevent bundling node:sqlite and path on Edge runtime
      const req = typeof require !== "undefined" ? require : null;
      if (!req) return null;
      const { DatabaseSync } = req("node" + ":sqlite");
      const pathModule = req("path");
      const dbPath = pathModule.join(process.cwd(), "alparai_data.db");
      sqliteInstance = new DatabaseSync(dbPath);
      sqliteInstance.exec('PRAGMA journal_mode = WAL;');
      
      // Polyfill for pg.Pool interface compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sqliteInstance as any).query = async (text: string, params: any[]) => {
        // Convert $1, $2 to ? for sqlite
        const sqliteQuery = text.replace(/\$\d+/g, '?');
        const stmt = sqliteInstance.prepare(sqliteQuery);
        try {
          if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
            const rows = stmt.all(...(params || []));
            return { rows, rowCount: rows.length };
          } else {
            const info = stmt.run(...(params || []));
            return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
          }
        } catch (e) {
          console.error('SQLite Error:', e);
          throw e;
        }
      };
    } catch (e) {
      console.warn('node:sqlite unavailable in current runtime:', e);
      return null;
    }
  }
  return sqliteInstance;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DeHostServerClient = any;
export function createDeHostServerClient(): DeHostServerClient {
  // Null-object query builder: every chainable resolves { data: null } so
  // pages fall back to canonical constants instead of crashing. No fake data.
  const terminal = async () => ({ data: null, error: null });
  const chain: any = new Proxy({}, {
    get: (_t, prop) => {
      if (prop === 'then') return (res: any) => res({ data: null, error: null });
      if (prop === 'single' || prop === 'maybeSingle') return terminal;
      return (..._a: any[]) => chain;
    },
  });
  const adapterAuth = createDeHostAdapterClient().auth;
  return {
    auth: {
      ...adapterAuth,
      getUser: async () => ({ data: { user: null }, error: null })
    },
    from: (_table: string) => ({
      select: (..._a: any[]) => chain,
      insert: (..._a: any[]) => chain,
      update: (..._a: any[]) => chain,
      delete: (..._a: any[]) => chain,
      upsert: (..._a: any[]) => chain,
    })
  };
}
