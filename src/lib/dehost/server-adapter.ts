/**
 * Sovereign DeHost PostgreSQL Server Adapter (Node.js Server Runtime Only)
 * Executes fluent queries directly against local PostgreSQL database using pg.Pool.
 */

import "server-only";
import pg from "pg";
const { Pool } = pg;
import { getDeHostConnectionString } from "./schema";
import type { Database } from "../../types/database.types";

let pgPoolInstance: InstanceType<typeof Pool> | null = null;

export function getDeHostPgPool(): InstanceType<typeof Pool> {
  if (!pgPoolInstance) {
    if (process.env.DATABASE_URL) {
      pgPoolInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    } else {
      pgPoolInstance = new Pool({
        host: process.env.DEHOST_HOST || "127.0.0.1",
        port: Number(process.env.DEHOST_PORT) || (process.env.NODE_ENV === "production" ? 6543 : 5432),
        user: process.env.DEHOST_USER || "postgres",
        password: process.env.DEHOST_PASSWORD || undefined,
        database: process.env.DEHOST_DB || "alparai_prod",
      });
    }
  }
  return pgPoolInstance;
}

function sanitizeIdentifier(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9_.]/g, "");
}

function compileColumns(columnsStr: string, tableName: string): string {
  if (!columnsStr || columnsStr.trim() === "*") return "*";

  const parts: string[] = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < columnsStr.length; i++) {
    const ch = columnsStr[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  return parts
    .map((part) => {
      const embeddedMatch = part.match(/^([a-zA-Z0-9_]+):([a-zA-Z0-9_]+)\(([^)]+)\)$/);
      if (embeddedMatch && embeddedMatch[1] && embeddedMatch[2] && embeddedMatch[3]) {
        const alias = embeddedMatch[1];
        const foreignTable = embeddedMatch[2];
        const subcols = embeddedMatch[3].split(",").map((c) => c.trim());
        const jsonFields = subcols
          .map((c) => `'${c}', ${foreignTable}.${sanitizeIdentifier(c)}`)
          .join(", ");
        const fkCandidate1 = `${alias}_id`;
        const fkCandidate2 = `${foreignTable.replace(/s$/, "")}_id`;
        return `(SELECT json_build_object(${jsonFields}) FROM ${foreignTable} WHERE ${foreignTable}.id = ${tableName}.${fkCandidate1} OR ${foreignTable}.id = ${tableName}.${fkCandidate2} LIMIT 1) AS ${alias}`;
      }
      return sanitizeIdentifier(part);
    })
    .join(", ");
}

function compileWhereClause(filters: DeHostFilter[], params: any[]): string {
  if (!filters || filters.length === 0) return "";
  const clauses: string[] = [];

  for (const f of filters) {
    const col = sanitizeIdentifier(f.column);
    const op = f.operator;
    const val = f.value;

    if (op === "or" || col === "__or__") {
      if (typeof val === "string") {
        const orParts = val.split(",");
        const subClauses: string[] = [];
        for (const part of orParts) {
          const m = part.trim().match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.(.*)$/);
          if (m && m[1] && m[2] && m[3] !== undefined) {
            const subCol = sanitizeIdentifier(m[1]);
            const subOp = m[2];
            const subVal = m[3];
            if (subOp === "eq") {
              params.push(subVal);
              subClauses.push(`${subCol} = $${params.length}`);
            } else if (subOp === "ilike") {
              params.push(subVal);
              subClauses.push(`${subCol} ILIKE $${params.length}`);
            } else if (subOp === "like") {
              params.push(subVal);
              subClauses.push(`${subCol} LIKE $${params.length}`);
            }
          }
        }
        if (subClauses.length > 0) {
          clauses.push(`(${subClauses.join(" OR ")})`);
        }
      }
      continue;
    }

    if (op === "eq") {
      params.push(val);
      clauses.push(`${col} = $${params.length}`);
    } else if (op === "neq") {
      params.push(val);
      clauses.push(`${col} != $${params.length}`);
    } else if (op === "gt") {
      params.push(val);
      clauses.push(`${col} > $${params.length}`);
    } else if (op === "gte") {
      params.push(val);
      clauses.push(`${col} >= $${params.length}`);
    } else if (op === "lt") {
      params.push(val);
      clauses.push(`${col} < $${params.length}`);
    } else if (op === "lte") {
      params.push(val);
      clauses.push(`${col} <= $${params.length}`);
    } else if (op === "like") {
      params.push(val);
      clauses.push(`${col} LIKE $${params.length}`);
    } else if (op === "ilike") {
      params.push(val);
      clauses.push(`${col} ILIKE $${params.length}`);
    } else if (op === "not.ilike") {
      params.push(val);
      clauses.push(`${col} NOT ILIKE $${params.length}`);
    } else if (op === "not.like") {
      params.push(val);
      clauses.push(`${col} NOT LIKE $${params.length}`);
    } else if (op === "is") {
      if (val === null) {
        clauses.push(`${col} IS NULL`);
      } else {
        params.push(val);
        clauses.push(`${col} IS $${params.length}`);
      }
    } else if (op === "not.is") {
      if (val === null) {
        clauses.push(`${col} IS NOT NULL`);
      } else {
        params.push(val);
        clauses.push(`${col} IS NOT $${params.length}`);
      }
    } else if (op === "in") {
      const arr = Array.isArray(val) ? val : [val];
      if (arr.length === 0) {
        clauses.push("1 = 0");
      } else {
        params.push(arr);
        clauses.push(`${col} = ANY($${params.length})`);
      }
    } else if (op === "not.in") {
      const arr = Array.isArray(val) ? val : [val];
      if (arr.length === 0) {
        clauses.push("1 = 1");
      } else {
        params.push(arr);
        clauses.push(`NOT (${col} = ANY($${params.length}))`);
      }
    }
  }

  return clauses.length > 0 ? ` WHERE ${clauses.join(" AND ")}` : "";
}

export type TableName = keyof Database["public"]["Tables"];

export type TableRow<T> = T extends TableName
  ? Database["public"]["Tables"][T]["Row"]
  : T extends Record<string, any>
  ? T
  : Record<string, any>;

export interface DeHostFilter {
  column: string;
  operator: string;
  value: unknown;
}

export interface DeHostQueryOptions {
  table: string;
  columns: string;
  filters: DeHostFilter[];
  orderBy?: { column: string; ascending: boolean; nullsFirst?: boolean };
  limitVal?: number;
  offsetVal?: number;
  singleVal?: boolean;
  countVal?: "exact" | "planned" | "estimated";
  headVal?: boolean;
  csvVal?: boolean;
}

export interface DeHostError extends Error {
  code?: string;
  message: string;
}

export class DeHostServerQueryBuilder<TRow = any, TSingle extends boolean = false> {
  private options: DeHostQueryOptions;
  private action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: any = null;

  constructor(table: string) {
    this.options = {
      table,
      columns: "*",
      filters: [],
    };
  }

  public select<TResult = TRow & Record<string, any>>(
    columns = "*",
    opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }
  ): DeHostServerQueryBuilder<TResult, TSingle> {
    this.action = "select";
    this.options.columns = columns;
    if (opts?.count) {
      this.options.countVal = opts.count;
    }
    if (opts?.head) {
      this.options.headVal = opts.head;
    }
    return this as unknown as DeHostServerQueryBuilder<TResult, TSingle>;
  }

  public insert(values: any, _opts?: any): DeHostServerQueryBuilder<TRow, TSingle> {
    this.action = "insert";
    this.payload = values;
    return this;
  }

  public update(values: any, _opts?: any): DeHostServerQueryBuilder<TRow, TSingle> {
    this.action = "update";
    this.payload = values;
    return this;
  }

  public upsert(values: any, _opts?: any): DeHostServerQueryBuilder<TRow, TSingle> {
    this.action = "upsert";
    this.payload = values;
    return this;
  }

  public delete(_opts?: any): DeHostServerQueryBuilder<TRow, TSingle> {
    this.action = "delete";
    return this;
  }

  public eq(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "eq", value });
    return this;
  }

  public neq(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "neq", value });
    return this;
  }

  public gt(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "gt", value });
    return this;
  }

  public gte(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "gte", value });
    return this;
  }

  public lt(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "lt", value });
    return this;
  }

  public lte(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "lte", value });
    return this;
  }

  public like(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "like", value });
    return this;
  }

  public ilike(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "ilike", value });
    return this;
  }

  public in(column: string, values: unknown[]): this {
    this.options.filters.push({ column, operator: "in", value: values });
    return this;
  }

  public is(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "is", value });
    return this;
  }

  public not(column: string, operator: string, value: unknown): this {
    this.options.filters.push({ column, operator: `not.${operator}`, value });
    return this;
  }

  public match(query: Record<string, unknown>): this {
    for (const [column, value] of Object.entries(query)) {
      this.options.filters.push({ column, operator: "eq", value });
    }
    return this;
  }

  public or(filters: string): this {
    this.options.filters.push({ column: "__or__", operator: "or", value: filters });
    return this;
  }

  public order(column: string, opts: { ascending?: boolean; nullsFirst?: boolean } = { ascending: true }): this {
    this.options.orderBy = { column, ascending: opts.ascending ?? true, nullsFirst: opts.nullsFirst };
    return this;
  }

  public limit(count: number): this {
    this.options.limitVal = count;
    return this;
  }

  public range(from: number, to: number): this {
    this.options.offsetVal = from;
    this.options.limitVal = to - from + 1;
    return this;
  }

  public single(): DeHostServerQueryBuilder<TRow, true> {
    this.options.singleVal = true;
    this.options.limitVal = 1;
    return this as unknown as DeHostServerQueryBuilder<TRow, true>;
  }

  public maybeSingle(): DeHostServerQueryBuilder<TRow, true> {
    this.options.singleVal = true;
    this.options.limitVal = 1;
    return this as unknown as DeHostServerQueryBuilder<TRow, true>;
  }

  public returns<NewT = any>(): DeHostServerQueryBuilder<NewT extends (infer E)[] ? E : NewT, TSingle> {
    return this as any;
  }

  public csv(_opts?: any): this {
    this.options.csvVal = true;
    return this;
  }

  public async then<
    TResult1 = {
      data: TSingle extends true ? TRow : TRow[];
      error: DeHostError | null;
      count: number | null;
    }
  >(
    onfulfilled?:
      | ((value: {
          data: TSingle extends true ? TRow : TRow[];
          error: DeHostError | null;
          count: number | null;
        }) => TResult1 | PromiseLike<TResult1>)
      | null
  ): Promise<TResult1> {
    const result = await this.execute();
    if (onfulfilled) {
      return onfulfilled(result as any);
    }
    return result as any;
  }

  private async execute(): Promise<{ data: any; error: DeHostError | null; count: number | null }> {
    try {
      const pool = getDeHostPgPool();
      const tableName = sanitizeIdentifier(this.options.table);

      if (this.action === "select") {
        const whereParams: any[] = [];
        const whereClause = compileWhereClause(this.options.filters, whereParams);

        let countResult: number | null = null;
        if (this.options.countVal || this.options.headVal) {
          const countSql = `SELECT COUNT(*)::int AS count FROM ${tableName}${whereClause}`;
          const cRes = await pool.query(countSql, whereParams);
          countResult = parseInt(cRes.rows[0]?.count ?? "0", 10);
        }

        if (this.options.headVal) {
          return {
            data: this.options.singleVal ? null : [],
            error: null,
            count: countResult,
          };
        }

        const compiledCols = compileColumns(this.options.columns, tableName);
        let orderClause = "";
        if (this.options.orderBy) {
          const col = sanitizeIdentifier(this.options.orderBy.column);
          const dir = this.options.orderBy.ascending ? "ASC" : "DESC";
          const nulls =
            this.options.orderBy.nullsFirst !== undefined
              ? this.options.orderBy.nullsFirst
                ? " NULLS FIRST"
                : " NULLS LAST"
              : "";
          orderClause = ` ORDER BY ${col} ${dir}${nulls}`;
        }

        let limitClause = "";
        if (typeof this.options.limitVal === "number") {
          limitClause = ` LIMIT ${Math.max(0, this.options.limitVal)}`;
        }

        let offsetClause = "";
        if (typeof this.options.offsetVal === "number") {
          offsetClause = ` OFFSET ${Math.max(0, this.options.offsetVal)}`;
        }

        const dataSql = `SELECT ${compiledCols} FROM ${tableName}${whereClause}${orderClause}${limitClause}${offsetClause}`;
        const dRes = await pool.query(dataSql, whereParams);
        const rows = dRes.rows ?? [];

        const data = this.options.singleVal ? (rows[0] ?? null) : rows;
        const finalCount =
          countResult !== null
            ? countResult
            : Array.isArray(data)
              ? data.length
              : data
                ? 1
                : 0;

        return { data, error: null, count: finalCount };
      }

      if (this.action === "insert") {
        const records = Array.isArray(this.payload) ? this.payload : [this.payload];
        if (records.length === 0) {
          return { data: this.options.singleVal ? null : [], error: null, count: 0 };
        }
        const keys = Object.keys(records[0] || {});
        const cols = keys.map((k) => sanitizeIdentifier(k)).join(", ");
        const insertParams: any[] = [];
        const valueRows: string[] = [];
        for (const rec of records) {
          const valPlaceholders: string[] = [];
          for (const k of keys) {
            insertParams.push(rec[k]);
            valPlaceholders.push(`$${insertParams.length}`);
          }
          valueRows.push(`(${valPlaceholders.join(", ")})`);
        }
        const insertSql = `INSERT INTO ${tableName} (${cols}) VALUES ${valueRows.join(", ")} RETURNING *`;
        const iRes = await pool.query(insertSql, insertParams);
        const rows = iRes.rows ?? [];
        return {
          data: this.options.singleVal
            ? (rows[0] ?? null)
            : Array.isArray(this.payload)
              ? rows
              : (rows[0] ?? null),
          error: null,
          count: rows.length,
        };
      }

      if (this.action === "update") {
        const updates = this.payload || {};
        const setKeys = Object.keys(updates);
        const updateParams: any[] = [];
        const setClauses = setKeys.map((k) => {
          updateParams.push(updates[k]);
          return `${sanitizeIdentifier(k)} = $${updateParams.length}`;
        });
        const whereClause = compileWhereClause(this.options.filters, updateParams);
        const updateSql = `UPDATE ${tableName} SET ${setClauses.join(", ")}${whereClause} RETURNING *`;
        const uRes = await pool.query(updateSql, updateParams);
        const rows = uRes.rows ?? [];
        return {
          data: this.options.singleVal ? (rows[0] ?? null) : rows,
          error: null,
          count: rows.length,
        };
      }

      if (this.action === "delete") {
        const deleteParams: any[] = [];
        const whereClause = compileWhereClause(this.options.filters, deleteParams);
        const deleteSql = `DELETE FROM ${tableName}${whereClause} RETURNING *`;
        const delRes = await pool.query(deleteSql, deleteParams);
        const rows = delRes.rows ?? [];
        return {
          data: this.options.singleVal ? (rows[0] ?? null) : rows,
          error: null,
          count: rows.length,
        };
      }

      const emptyData = this.options.singleVal ? null : [];
      return { data: emptyData, error: null, count: 0 };
    } catch (err) {
      const errorObj: DeHostError =
        err instanceof Error
          ? Object.assign(err, { code: "DEHOST_ERROR" })
          : Object.assign(new Error(String(err)), { code: "DEHOST_ERROR" });
      return { data: this.options.singleVal ? null : [], error: errorObj, count: 0 };
    }
  }
}

export class DeHostServerClient<T = any> {
  public dehostUrl = "https://dehost.alparai.com";
  public dehostKey = "dehost-service-key";
  public schema = "public";
  public rest = {};
  public functions = {
    invoke: async () => ({ data: null, error: null as DeHostError | null }),
  };
  public realtime = {
    setAuth: () => {},
  };

  public getChannels() {
    return [];
  }

  public auth = {
    getUser: async (_token?: string) => ({
      data: { user: null as any },
      error: null as DeHostError | null,
    }),
    getSession: async () => ({
      data: { session: null as any },
      error: null as DeHostError | null,
    }),
    signOut: async () => ({ error: null as DeHostError | null }),
    signInWithPassword: async (_credentials: any) => ({ data: { user: null as any, session: null as any }, error: null as DeHostError | null }),
    signInWithOAuth: async (_credentials: any) => ({ data: { provider: "google", url: "https://dehost.alparai.com/auth" }, error: null as DeHostError | null }),
    signInWithOtp: async (_credentials: any) => ({ data: {}, error: null as DeHostError | null }),
    signUp: async (_credentials: any) => ({ data: { user: null as any, session: null as any }, error: null as DeHostError | null }),
    exchangeCodeForSession: async (_code: string) => ({ data: { user: null as any, session: null as any }, error: null as DeHostError | null }),
    verifyOtp: async (_params: any) => ({ data: { user: null as any, session: null as any }, error: null as DeHostError | null }),
    resetPasswordForEmail: async (_email: string, _opts?: any) => ({ data: {}, error: null as DeHostError | null }),
    updateUser: async (_attributes: any) => ({ data: { user: null as any }, error: null as DeHostError | null }),
    admin: {
      deleteUser: async (_id: string) => ({ data: { user: null as any }, error: null as DeHostError | null }),
      getUserById: async (_id: string) => ({ data: { user: null as any }, error: null as DeHostError | null }),
      listUsers: async () => ({ data: { users: [] as any[] }, error: null as DeHostError | null }),
      createUser: async (_attributes: any) => ({ data: { user: null as any }, error: null as DeHostError | null }),
      updateUserById: async (_id: string, _attributes: any) => ({ data: { user: null as any }, error: null as Error | null }),
    },
  };

  public channel(_name: string) {
    const channelObj: any = {
      on: (_event: string, _filter: any, _callback?: (payload: { new: Record<string, any>; old: Record<string, any>; [key: string]: any }) => void) => channelObj,
      subscribe: (statusCallback?: any) => {
        if (statusCallback) statusCallback('SUBSCRIBED');
        return { unsubscribe: () => {} };
      },
    };
    return channelObj;
  }

  public removeChannel(_channel: any) {
    return Promise.resolve('ok');
  }

  public storage = {
    from: (bucket: string) => ({
      upload: async (_path?: string, _file?: any, _options?: any) => ({ data: { path: "dehost/" + bucket + "/" + (_path || "") }, error: null as DeHostError | null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://dehost.alparai.com/storage/${bucket}/${path}` } }),
      remove: async (_paths?: string[]) => ({ data: [], error: null as DeHostError | null }),
      list: async (_path?: string, _options?: any) => ({ data: [], error: null as DeHostError | null }),
    }),
  };

  public from<
    TName extends string = string,
    TRow = TName extends TableName ? Database["public"]["Tables"][TName]["Row"] : any
  >(table: TName): DeHostServerQueryBuilder<TRow, false> {
    return new DeHostServerQueryBuilder<TRow, false>(table);
  }

  public rpc<TRow = any>(_fn: string, _params?: Record<string, unknown>): DeHostServerQueryBuilder<TRow, true> {
    return new DeHostServerQueryBuilder<TRow, true>(_fn);
  }
}

export function createDeHostServerClient<T = any>(): DeHostServerClient<T> {
  return new DeHostServerClient<T>();
}
