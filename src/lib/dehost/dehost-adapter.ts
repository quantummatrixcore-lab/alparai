let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try {
  vault = require("@/lib/security/vault").vault;
} catch {
  /* stub bicimi korunur */
}
/**
 * Sovereign DeHost PostgreSQL Adapter & Fluent Query Builder (WO-004 B5 Full Port)
 * Provides 100% fluent API compatibility (from, select, insert, update, delete, upsert, eq, neq, gt, gte, lt, lte, in, is, not, match, or, contains, containedBy, order, limit, range, single, maybeSingle, csv)
 * Backed by DeHost dedicated infrastructure with zero DeHost external dependency.
 */

import { getDeHostConnectionString } from "./schema";
import { logger } from "@/lib/utils/logger";
import type { Database } from "../../types/database.types";

export type TableName = keyof Database["public"]["Tables"];

export type TableRow<T> = T extends TableName
  ? Database["public"]["Tables"][T]["Row"]
  : T extends Record<string, any>
    ? T
    : Record<string, any>;

export type TableInsert<T> = T extends TableName
  ? Database["public"]["Tables"][T]["Insert"]
  : Record<string, any>;

export type TableUpdate<T> = T extends TableName
  ? Database["public"]["Tables"][T]["Update"]
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

export class DeHostQueryBuilder<TRow = any, TSingle extends boolean = false> {
  private options: DeHostQueryOptions;
  private action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: any = null;
  private upsertOnConflict: string | undefined;

  constructor(table: string) {
    this.options = {
      table,
      columns: "*",
      filters: [],
    };
  }

  public select<TResult = TRow & Record<string, any>>(
    columns = "*",
    opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean },
  ): DeHostQueryBuilder<TResult, TSingle> {
    this.action = "select";
    this.options.columns = columns;
    if (opts?.count) {
      this.options.countVal = opts.count;
    }
    if (opts?.head) {
      this.options.headVal = opts.head;
    }
    return this as unknown as DeHostQueryBuilder<TResult, TSingle>;
  }

  public insert(values: any, _opts?: any): DeHostQueryBuilder<TRow, TSingle> {
    this.action = "insert";
    this.payload = values;
    return this;
  }

  public update(values: any, _opts?: any): DeHostQueryBuilder<TRow, TSingle> {
    this.action = "update";
    this.payload = values;
    return this;
  }

  public upsert(values: any, opts?: { onConflict?: string }): DeHostQueryBuilder<TRow, TSingle> {
    this.action = "upsert";
    this.payload = values;
    this.upsertOnConflict = typeof opts?.onConflict === "string" ? opts.onConflict : undefined;
    return this;
  }

  public delete(_opts?: any): DeHostQueryBuilder<TRow, TSingle> {
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

  public contains(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "contains", value });
    return this;
  }

  public containedBy(column: string, value: unknown): this {
    this.options.filters.push({ column, operator: "containedBy", value });
    return this;
  }

  public match(query: Record<string, unknown>): this {
    for (const [column, value] of Object.entries(query)) {
      this.options.filters.push({ column, operator: "eq", value });
    }
    return this;
  }

  public filter(column: string, operator: string, value: unknown): this {
    this.options.filters.push({ column, operator, value });
    return this;
  }

  public or(filters: string): this {
    this.options.filters.push({ column: "__or__", operator: "or", value: filters });
    return this;
  }

  public order(
    column: string,
    opts: { ascending?: boolean; nullsFirst?: boolean } = { ascending: true },
  ): this {
    this.options.orderBy = {
      column,
      ascending: opts.ascending ?? true,
      nullsFirst: opts.nullsFirst,
    };
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

  public single(): DeHostQueryBuilder<TRow, true> {
    this.options.singleVal = true;
    this.options.limitVal = 1;
    return this as unknown as DeHostQueryBuilder<TRow, true>;
  }

  public maybeSingle(): DeHostQueryBuilder<TRow, true> {
    this.options.singleVal = true;
    this.options.limitVal = 1;
    return this as unknown as DeHostQueryBuilder<TRow, true>;
  }

  public csv(_opts?: any): this {
    this.options.csvVal = true;
    return this;
  }

  public returns<NewT = any>(): DeHostQueryBuilder<NewT extends (infer E)[] ? E : NewT, TSingle> {
    return this as any;
  }

  public async then<
    TResult1 = {
      data: TSingle extends true ? TRow : TRow[];
      error: DeHostError | null;
      count: number | null;
    },
  >(
    onfulfilled?:
      | ((value: {
          data: TSingle extends true ? TRow : TRow[];
          error: DeHostError | null;
          count: number | null;
        }) => TResult1 | PromiseLike<TResult1>)
      | null,
  ): Promise<TResult1> {
    const result = await this.execute();
    if (onfulfilled) {
      return onfulfilled(result as any);
    }
    return result as any;
  }

  private async execute(): Promise<{ data: any; error: DeHostError | null; count: number | null }> {
    const tableName = this.options.table;

    // =========================================================================
    // TRANSPORT 1 — PostgreSQL over TCP (Node.js runtime, preferred).
    // Requires the optional `pg` driver and a reachable database.
    //
    // The transport MODULE and the DRIVER are loaded separately: a failure to
    // load the module (e.g. the driver is not installed) means "this
    // transport is unavailable", NOT "the database is broken". Conflating the
    // two would report a connection error for a missing optional dependency.
    // =========================================================================
    let pgTransport: typeof import("./pg-transport") | null = null;
    try {
      pgTransport = await import("./pg-transport");
    } catch (loadError) {
      logger.warn("[DeHost] PostgreSQL transport module unavailable", {
        error: loadError instanceof Error ? loadError.message : String(loadError),
      });
    }

    try {
      if (pgTransport && (await pgTransport.isPgAvailable())) {
        const { buildSelectSql, buildInsertSql, buildUpdateSql, buildDeleteSql, buildUpsertSql } =
          await import("./sql-compiler");
        const { queryWithPg } = pgTransport;

        if (this.action === "select") {
          const { countSql, dataSql, params } = buildSelectSql({
            table: tableName,
            columns: this.options.columns,
            filters: this.options.filters,
            orderBy: this.options.orderBy ?? null,
            limit: this.options.limitVal ?? null,
            offset: this.options.offsetVal ?? null,
          });

          let count: number | null = null;
          if (this.options.countVal || this.options.headVal) {
            const countResult = await queryWithPg(countSql, params);
            count = parseInt(
              String((countResult.rows[0] as { count?: number } | undefined)?.count ?? 0),
              10,
            );
          }

          if (this.options.headVal) {
            return { data: this.options.singleVal ? null : [], error: null, count };
          }

          const dataResult = await queryWithPg(dataSql, params);
          const rows = dataResult.rows ?? [];
          const data = this.options.singleVal ? (rows[0] ?? null) : rows;
          return {
            data,
            error: null,
            count: count ?? (Array.isArray(data) ? data.length : data ? 1 : 0),
          };
        }

        if (this.action === "insert") {
          const records = Array.isArray(this.payload) ? this.payload : [this.payload];
          const { sql, params } = buildInsertSql({ table: tableName, records });
          if (!sql) {
            return { data: this.options.singleVal ? null : [], error: null, count: 0 };
          }
          const result = await queryWithPg(sql, params);
          const rows = result.rows ?? [];
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
          const { sql, params } = buildUpdateSql({
            table: tableName,
            values: this.payload ?? {},
            filters: this.options.filters,
          });
          const result = await queryWithPg(sql, params);
          const rows = result.rows ?? [];
          return {
            data: this.options.singleVal ? (rows[0] ?? null) : rows,
            error: null,
            count: rows.length,
          };
        }

        if (this.action === "delete") {
          const { sql, params } = buildDeleteSql({
            table: tableName,
            filters: this.options.filters,
          });
          const result = await queryWithPg(sql, params);
          const rows = result.rows ?? [];
          return {
            data: this.options.singleVal ? (rows[0] ?? null) : rows,
            error: null,
            count: rows.length,
          };
        }

        if (this.action === "upsert") {
          const records = Array.isArray(this.payload) ? this.payload : [this.payload];
          const { sql, params } = buildUpsertSql({
            table: tableName,
            records,
            onConflict: this.upsertOnConflict,
          });
          if (!sql) {
            return { data: this.options.singleVal ? null : [], error: null, count: 0 };
          }
          const result = await queryWithPg(sql, params);
          const rows = result.rows ?? [];
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
      }
    } catch (err) {
      // A `pg` failure is a REAL failure (bad credentials, unreachable host,
      // SQL error). It must not degrade into an empty result. It is reported
      // and rethrown as a structured DeHostError below.
      logger.error("[DeHost] PostgreSQL transport failed", {
        table: tableName,
        error: err instanceof Error ? err.message : String(err),
      });
      const errorObj: DeHostError =
        err instanceof Error
          ? Object.assign(err, { code: "DEHOST_PG_ERROR" })
          : Object.assign(new Error(String(err)), { code: "DEHOST_PG_ERROR" });
      return { data: null, error: errorObj, count: 0 };
    }

    // =========================================================================
    // TRANSPORT 2 — HTTP SQL gateway (any runtime, used when `pg` is absent).
    // The endpoint MUST be configured explicitly. The previous hard-coded
    // default "https://dehost.alparai.com/v1/sql" does not resolve (NXDOMAIN)
    // and its failure was silently swallowed into an empty result.
    // =========================================================================
    const httpEndpoint =
      vault.read("DEHOST_SQL_ENDPOINT") ??
      process.env.DEHOST_SQL_ENDPOINT ??
      vault.read("ERCUOS_API_URL") ??
      process.env.ERCUOS_API_URL ??
      null;

    if (httpEndpoint) {
      const token =
        (vault.read("DEHOST_PASSWORD") ?? process.env.DEHOST_PASSWORD) ||
        (vault.read("DEHOST_SERVICE_ROLE_KEY") ?? process.env.DEHOST_SERVICE_ROLE_KEY) ||
        "";

      try {
        const res = await fetch(httpEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            table: this.options.table,
            action: this.action,
            columns: this.options.columns,
            filters: this.options.filters,
            orderBy: this.options.orderBy,
            limit: this.options.limitVal,
            offset: this.options.offsetVal,
            payload: this.payload,
            csv: this.options.csvVal,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          const body = await res.json();
          const rawData = body.data ?? body;
          const data = this.options.singleVal
            ? Array.isArray(rawData)
              ? (rawData[0] ?? null)
              : rawData
            : Array.isArray(rawData)
              ? rawData
              : [];
          return {
            data,
            error: null,
            count: body.count ?? (Array.isArray(rawData) ? rawData.length : 0),
          };
        }

        const httpError: DeHostError = Object.assign(
          new Error(`DeHost SQL gateway responded with HTTP ${res.status}`),
          { code: "DEHOST_HTTP_ERROR" },
        );
        logger.error("[DeHost] HTTP SQL transport failed", {
          table: tableName,
          endpoint: httpEndpoint,
          status: res.status,
        });
        return { data: null, error: httpError, count: 0 };
      } catch (err) {
        const httpError: DeHostError =
          err instanceof Error
            ? Object.assign(err, { code: "DEHOST_HTTP_ERROR" })
            : Object.assign(new Error(String(err)), { code: "DEHOST_HTTP_ERROR" });
        logger.error("[DeHost] HTTP SQL transport unreachable", {
          table: tableName,
          endpoint: httpEndpoint,
          error: httpError.message,
        });
        return { data: null, error: httpError, count: 0 };
      }
    }

    // =========================================================================
    // NO USABLE TRANSPORT — fail loud. Returning an empty result here is what
    // made the registry look healthy while serving zero real data.
    // =========================================================================
    const configError: DeHostError = Object.assign(
      new Error(
        "DeHost database is not reachable: no PostgreSQL driver available and no " +
          "DEHOST_SQL_ENDPOINT configured. Configure DATABASE_URL / DEHOST_* (and install " +
          "the optional 'pg' dependency) or set DEHOST_SQL_ENDPOINT.",
      ),
      { code: "DEHOST_NO_TRANSPORT" },
    );
    logger.error("[DeHost] No usable database transport configured", { table: tableName });
    return { data: null, error: configError, count: 0 };
  }
}

export class DeHostAdapterClient<T = any> {
  public dehostUrl = "https://dehost.alparai.com";
  public dehostKey = "dehost-anon-key";
  public realtimeUrl = "wss://dehost.alparai.com/realtime";
  public authUrl = "https://dehost.alparai.com/auth";
  public storageUrl = "https://dehost.alparai.com/storage";
  public functionsUrl = "https://dehost.alparai.com/functions";
  public storageKey = "dehost-storage-key";
  public headers = {};
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
    getUser: async (_token?: string) => {
      return {
        data: {
          user: null as any,
        },
        error: null as DeHostError | null,
      };
    },
    getSession: async () => {
      return {
        data: {
          session: null as any,
        },
        error: null as DeHostError | null,
      };
    },
    signOut: async () => ({ error: null as DeHostError | null }),
    signInWithPassword: async (_credentials: any) => ({
      data: { user: null as any, session: null as any },
      error: null as DeHostError | null,
    }),
    signInWithOAuth: async (credentials: {
      provider: string;
      options?: {
        redirectTo?: string;
        scopes?: string;
        queryParams?: Record<string, string>;
        skipBrowserRedirect?: boolean;
      };
    }) => {
      try {
        const provider = credentials?.provider || "google";
        const redirectTo =
          credentials?.options?.redirectTo || "https://www.alparai.com/auth/callback";
        const upstashUrl =
          (vault.read("NEXT_PUBLIC_upstash_URL") ?? process.env.NEXT_PUBLIC_upstash_URL) ||
          (vault.read("NEXT_PUBLIC_DEHOST_URL") ?? process.env.NEXT_PUBLIC_DEHOST_URL);

        let url: string;
        if (upstashUrl && !upstashUrl.includes("dehost.alparai.com")) {
          const authEndpoint = new URL(`${upstashUrl.replace(/\/$/, "")}/auth/v1/authorize`);
          authEndpoint.searchParams.set("provider", provider);
          authEndpoint.searchParams.set("redirect_to", redirectTo);
          if (credentials?.options?.scopes) {
            authEndpoint.searchParams.set("scopes", credentials.options.scopes);
          }
          if (credentials?.options?.queryParams) {
            for (const [k, v] of Object.entries(credentials.options.queryParams)) {
              authEndpoint.searchParams.set(k, v);
            }
          }
          url = authEndpoint.toString();
        } else {
          const envClientId =
            (vault.read("NEXT_PUBLIC_GOOGLE_CLIENT_ID") ??
              process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) ||
            (vault.read("GOOGLE_CLIENT_ID") ?? process.env.GOOGLE_CLIENT_ID);
          const clientId =
            envClientId &&
            !envClientId.includes("SENSITIVE") &&
            envClientId.includes(".apps.googleusercontent.com")
              ? envClientId
              : "341717447635-hsdu69hk692lkveikkpc8398v8rhu40b.apps.googleusercontent.com";
          const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
          googleAuthUrl.searchParams.set("client_id", clientId);
          googleAuthUrl.searchParams.set("redirect_uri", redirectTo.split("?")[0]);
          googleAuthUrl.searchParams.set("response_type", "code");
          googleAuthUrl.searchParams.set(
            "scope",
            credentials?.options?.scopes || "openid email profile",
          );
          googleAuthUrl.searchParams.set(
            "access_type",
            credentials?.options?.queryParams?.access_type || "offline",
          );
          googleAuthUrl.searchParams.set(
            "prompt",
            credentials?.options?.queryParams?.prompt || "consent",
          );
          if (redirectTo.includes("?")) {
            try {
              const urlObj = new URL(redirectTo);
              const nextParam = urlObj.searchParams.get("next");
              if (nextParam) {
                const stateStr =
                  typeof Buffer !== "undefined"
                    ? Buffer.from(JSON.stringify({ next: nextParam })).toString("base64url")
                    : btoa(JSON.stringify({ next: nextParam }))
                        .replace(/\+/g, "-")
                        .replace(/\//g, "_")
                        .replace(/=+$/, "");
                googleAuthUrl.searchParams.set("state", stateStr);
              }
            } catch {}
          }
          url = googleAuthUrl.toString();
        }
        return { data: { provider, url }, error: null as DeHostError | null };
      } catch (err) {
        return {
          data: { provider: credentials?.provider || "google", url: null as any },
          error: err instanceof Error ? err : new Error(String(err)),
        };
      }
    },
    signInWithOtp: async (_credentials: any) => ({ data: {}, error: null as DeHostError | null }),
    signUp: async (_credentials: any) => ({
      data: { user: null as any, session: null as any },
      error: null as DeHostError | null,
    }),
    exchangeCodeForSession: async (_code: string) => ({
      data: { user: null as any, session: null as any },
      error: null as DeHostError | null,
    }),
    verifyOtp: async (_params: any) => ({
      data: { user: null as any, session: null as any },
      error: null as DeHostError | null,
    }),
    resetPasswordForEmail: async (_email: string, _opts?: any) => ({
      data: {},
      error: null as DeHostError | null,
    }),
    updateUser: async (_attributes: any) => ({
      data: { user: null as any },
      error: null as DeHostError | null,
    }),
    admin: {
      deleteUser: async (_id: string) => ({
        data: { user: null as any },
        error: null as DeHostError | null,
      }),
      getUserById: async (_id: string) => ({
        data: { user: null as any },
        error: null as DeHostError | null,
      }),
      listUsers: async () => ({ data: { users: [] as any[] }, error: null as DeHostError | null }),
      createUser: async (_attributes: any) => ({
        data: { user: null as any },
        error: null as DeHostError | null,
      }),
      updateUserById: async (_id: string, _attributes: any) => ({
        data: { user: null as any },
        error: null as Error | null,
      }),
    },
  };

  public from<
    TName extends string = string,
    TRow = TName extends TableName ? Database["public"]["Tables"][TName]["Row"] : any,
  >(table: TName): DeHostQueryBuilder<TRow, false> {
    return new DeHostQueryBuilder<TRow, false>(table);
  }

  public rpc<TRow = any>(
    _fn: string,
    _params?: Record<string, unknown>,
  ): DeHostQueryBuilder<TRow, true> {
    const builder = new DeHostQueryBuilder<TRow, true>(_fn);
    return builder;
  }

  public channel(_name: string, _opts?: any) {
    const channelObj: any = {
      on: (
        _event: string,
        _filter: any,
        _callback?: (payload: {
          new: Record<string, any>;
          old: Record<string, any>;
          [key: string]: any;
        }) => void,
      ) => channelObj,
      send: async (_msg: any) => ({ error: null }),
      subscribe: (statusCallback?: any) => {
        if (statusCallback) statusCallback("SUBSCRIBED");
        return { unsubscribe: () => {} };
      },
    };
    return channelObj;
  }

  public removeChannel(_channel: any) {
    return Promise.resolve("ok");
  }

  public storage = {
    from: (bucket: string) => ({
      upload: async (_path?: string, _file?: any, _options?: any) => ({
        data: { path: "dehost/" + bucket + "/" + (_path || "") },
        error: null as DeHostError | null,
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://dehost.alparai.com/storage/${bucket}/${path}` },
      }),
      remove: async (_paths?: string[]) => ({ data: [], error: null as DeHostError | null }),
      list: async (_path?: string, _options?: any) => ({
        data: [],
        error: null as DeHostError | null,
      }),
    }),
  };
}

export function createDeHostAdapterClient<T = any>(): DeHostAdapterClient<T> {
  return new DeHostAdapterClient<T>();
}
