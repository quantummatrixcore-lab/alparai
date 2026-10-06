/**
 * Sovereign DeHost SQLite Server Adapter (Node.js 22.5+ Native SQLite)
 * Executes queries directly against local SQLite database using built-in node:sqlite.
 * ULTIMATE ZERO-DEPENDENCY.
 */

import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "path";

let sqliteInstance = null;

export function getDeHostPgPool() {
  if (!sqliteInstance) {
    const dbPath = path.join(process.cwd(), "alparai_data.db");
    sqliteInstance = new DatabaseSync(dbPath);
    sqliteInstance.exec('PRAGMA journal_mode = WAL;');
    
    // Polyfill for pg.Pool interface compatibility
    sqliteInstance.query = async (text, params) => {
      // Convert ,  to ? for sqlite
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
  }
  return sqliteInstance;
}
