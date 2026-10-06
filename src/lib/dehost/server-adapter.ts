/**
 * Sovereign DeHost SQLite Server Adapter (Node.js 22.5+ Native SQLite)
 * Executes queries directly against local SQLite database using built-in node:sqlite.
 * ULTIMATE ZERO-DEPENDENCY.
 */

import "server-only";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteInstance: any = null;

export function getDeHostPgPool() {
  if (!sqliteInstance) {
    try {
      // Dynamic require to prevent bundling node:sqlite on Edge runtime
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { DatabaseSync } = require("node:sqlite");
      const dbPath = path.join(process.cwd(), "alparai_data.db");
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
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null })
    },
    from: (_table: string) => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) })
    })
  };
}
