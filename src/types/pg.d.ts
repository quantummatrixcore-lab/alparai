declare module "pg" {
  export interface QueryResultRow {
    [column: string]: any;
  }

  export interface QueryResult<R extends QueryResultRow = any> {
    rows: R[];
    fields: any[];
    rowCount: number | null;
    command: string;
    oid: number;
  }

  export interface PoolConfig {
    connectionString?: string;
    user?: string;
    database?: string;
    password?: string | (() => string | Promise<string>);
    port?: number;
    host?: string;
    ssl?: boolean | any;
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<R extends QueryResultRow = any, I extends any[] = any[]>(
      queryTextOrConfig: string | { text: string; values?: I },
      values?: I
    ): Promise<QueryResult<R>>;
    end(): Promise<void>;
  }

  const pg: {
    Pool: typeof Pool;
  };

  export default pg;
}
