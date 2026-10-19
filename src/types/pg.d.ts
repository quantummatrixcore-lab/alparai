/**
 * Minimal ambient declarations for the OPTIONAL `pg` PostgreSQL driver.
 *
 * The driver is loaded lazily at runtime through
 * `src/lib/dehost/pg-transport.ts`, using a webpack-ignored dynamic import so
 * the bundler never resolves it statically.
 * It is intentionally not a hard dependency: the HTTP SQL transport is a valid
 * alternative, and forcing the driver into every install would break the
 * edge build for deployments that do not need it.
 *
 * These declarations let `tsc` typecheck the dynamic import without pulling
 * `@types/pg` into the dependency graph.
 */

declare module "pg" {
  export interface QueryResultRow {
    [column: string]: unknown;
  }

  export interface QueryResult<R extends QueryResultRow = QueryResultRow> {
    rows: R[];
    rowCount: number;
    command: string;
  }

  export interface PoolConfig {
    connectionString?: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean };
    connectionTimeoutMillis?: number;
    idleTimeoutMillis?: number;
    statement_timeout?: number;
    max?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<R extends QueryResultRow = QueryResultRow>(
      sql: string,
      params?: unknown[],
    ): Promise<QueryResult<R>>;
    end(): Promise<void>;
  }
}
