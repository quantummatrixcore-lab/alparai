/**
 * ALPAR AI — DeHost SQL Compiler
 * ============================================================================
 * Pure, side-effect free translation of the fluent DeHost query builder
 * options into parameterised PostgreSQL statements.
 *
 * Safety contract:
 *  - Every identifier passes through `sanitizeIdentifier` (alphanumeric, dot, underscore only).
 *  - Every value is bound as a `$n` placeholder. No string interpolation of values.
 *  - No I/O, no imports. Fully unit-testable.
 *
 * Restored from the `pg`-backed adapter that shipped in production until
 * commit ffecd4f4 ("max speed deploy") replaced it with a null-object.
 * ============================================================================
 */

export interface DeHostFilter {
  column: string;
  operator: string;
  value: unknown;
}

export interface DeHostOrderBy {
  column: string;
  ascending: boolean;
  nullsFirst?: boolean;
}

export function sanitizeIdentifier(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9_.]/g, "");
}

/**
 * Compiles a PostgREST-style column list into a SQL column list.
 *
 * Supports embedded resource syntax `alias:table(col_a,col_b)` which is
 * translated into a correlated `json_build_object` subquery — this is how the
 * registry exposes `ai_providers(name)` style joins.
 */
export function compileColumns(columnsStr: string, tableName: string): string {
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
      // Syntax A — `alias:table(col_a,col_b)` (PostgREST with an alias).
      const aliasedMatch = part.match(/^([a-zA-Z0-9_]+):([a-zA-Z0-9_]+)\(([^)]+)\)$/);
      // Syntax B — `table(col_a,col_b)` (the syntax used across this codebase,
      // e.g. `ai_providers(name)`). Without this branch the sanitizer would
      // flatten it to `ai_providersname` and the query would fail at runtime.
      const plainMatch = part.match(/^([a-zA-Z0-9_]+)\(([^)]+)\)$/);

      const alias = aliasedMatch?.[1] ?? plainMatch?.[1];
      const foreignTable = aliasedMatch?.[2] ?? plainMatch?.[1];
      const rawCols = aliasedMatch?.[3] ?? plainMatch?.[2];

      if (alias && foreignTable && rawCols) {
        const subcols = rawCols
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
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

/**
 * Compiles the filter list into a parameterised WHERE clause.
 */
export function compileWhereClause(filters: DeHostFilter[], params: unknown[]): string {
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

    switch (op) {
      case "eq":
        params.push(val);
        clauses.push(`${col} = $${params.length}`);
        break;
      case "neq":
        params.push(val);
        clauses.push(`${col} != $${params.length}`);
        break;
      case "gt":
        params.push(val);
        clauses.push(`${col} > $${params.length}`);
        break;
      case "gte":
        params.push(val);
        clauses.push(`${col} >= $${params.length}`);
        break;
      case "lt":
        params.push(val);
        clauses.push(`${col} < $${params.length}`);
        break;
      case "lte":
        params.push(val);
        clauses.push(`${col} <= $${params.length}`);
        break;
      case "like":
        params.push(val);
        clauses.push(`${col} LIKE $${params.length}`);
        break;
      case "ilike":
        params.push(val);
        clauses.push(`${col} ILIKE $${params.length}`);
        break;
      case "not.ilike":
        params.push(val);
        clauses.push(`${col} NOT ILIKE $${params.length}`);
        break;
      case "not.like":
        params.push(val);
        clauses.push(`${col} NOT LIKE $${params.length}`);
        break;
      case "not.eq":
        params.push(val);
        clauses.push(`${col} != $${params.length}`);
        break;
      case "in": {
        const values = Array.isArray(val) ? val : [val];
        if (values.length === 0) {
          clauses.push("FALSE");
          break;
        }
        const placeholders = values.map((v) => {
          params.push(v);
          return `$${params.length}`;
        });
        clauses.push(`${col} IN (${placeholders.join(", ")})`);
        break;
      }
      case "is": {
        if (val === null) {
          clauses.push(`${col} IS NULL`);
        } else if (val === "not_null") {
          clauses.push(`${col} IS NOT NULL`);
        } else {
          params.push(val);
          clauses.push(`${col} IS $${params.length}`);
        }
        break;
      }
      case "not.is": {
        if (val === null) {
          clauses.push(`${col} IS NOT NULL`);
        } else {
          params.push(val);
          clauses.push(`${col} IS NOT $${params.length}`);
        }
        break;
      }
      case "contains": {
        params.push(val);
        clauses.push(`${col} @> $${params.length}`);
        break;
      }
      case "contained_by": {
        params.push(val);
        clauses.push(`${col} <@ $${params.length}`);
        break;
      }
      case "match": {
        params.push(val);
        clauses.push(`${col} @@ $${params.length}`);
        break;
      }
      default: {
        params.push(val);
        clauses.push(`${col} = $${params.length}`);
      }
    }
  }

  if (clauses.length === 0) return "";
  return ` WHERE ${clauses.join(" AND ")}`;
}

export interface CompiledSelect {
  countSql: string;
  dataSql: string;
  params: unknown[];
}

/**
 * Builds a SELECT statement (plus its COUNT companion) from builder options.
 */
export function buildSelectSql(options: {
  table: string;
  columns: string;
  filters: DeHostFilter[];
  orderBy?: DeHostOrderBy | null;
  limit?: number | null;
  offset?: number | null;
}): CompiledSelect {
  const tableName = sanitizeIdentifier(options.table);
  const params: unknown[] = [];
  const whereClause = compileWhereClause(options.filters ?? [], params);

  let orderClause = "";
  if (options.orderBy) {
    const col = sanitizeIdentifier(options.orderBy.column);
    const dir = options.orderBy.ascending ? "ASC" : "DESC";
    const nulls =
      options.orderBy.nullsFirst !== undefined
        ? options.orderBy.nullsFirst
          ? " NULLS FIRST"
          : " NULLS LAST"
        : "";
    orderClause = ` ORDER BY ${col} ${dir}${nulls}`;
  }

  const limitClause =
    typeof options.limit === "number" ? ` LIMIT ${Math.max(0, Math.trunc(options.limit))}` : "";
  const offsetClause =
    typeof options.offset === "number" ? ` OFFSET ${Math.max(0, Math.trunc(options.offset))}` : "";

  const compiledCols = compileColumns(options.columns, tableName);

  return {
    countSql: `SELECT COUNT(*)::int AS count FROM ${tableName}${whereClause}`,
    dataSql: `SELECT ${compiledCols} FROM ${tableName}${whereClause}${orderClause}${limitClause}${offsetClause}`,
    params,
  };
}

/**
 * Builds an INSERT statement with RETURNING *.
 */
export function buildInsertSql(options: { table: string; records: Record<string, unknown>[] }): {
  sql: string;
  params: unknown[];
} {
  const tableName = sanitizeIdentifier(options.table);
  const params: unknown[] = [];
  if (options.records.length === 0) {
    return { sql: "", params };
  }
  const keys = Object.keys(options.records[0] ?? {});
  const cols = keys.map((k) => sanitizeIdentifier(k)).join(", ");
  const valueRows = options.records.map((rec) => {
    const placeholders = keys.map((k) => {
      params.push(rec[k]);
      return `$${params.length}`;
    });
    return `(${placeholders.join(", ")})`;
  });
  return {
    sql: `INSERT INTO ${tableName} (${cols}) VALUES ${valueRows.join(", ")} RETURNING *`,
    params,
  };
}

/**
 * Builds an UPDATE statement with RETURNING *.
 */
export function buildUpdateSql(options: {
  table: string;
  values: Record<string, unknown>;
  filters: DeHostFilter[];
}): { sql: string; params: unknown[] } {
  const tableName = sanitizeIdentifier(options.table);
  const params: unknown[] = [];
  const setKeys = Object.keys(options.values ?? {});
  const setClauses = setKeys.map((k) => {
    params.push(options.values[k]);
    return `${sanitizeIdentifier(k)} = $${params.length}`;
  });
  const whereClause = compileWhereClause(options.filters ?? [], params);
  return {
    sql: `UPDATE ${tableName} SET ${setClauses.join(", ")}${whereClause} RETURNING *`,
    params,
  };
}

/**
 * Builds an UPSERT statement with RETURNING *.
 *
 * `onConflict` accepts a comma separated column list (e.g. "id" or
 * "incident_id,ai_provider_id"). When omitted the primary key is used.
 */
export function buildUpsertSql(options: {
  table: string;
  records: Record<string, unknown>[];
  onConflict?: string;
}): { sql: string; params: unknown[] } {
  const tableName = sanitizeIdentifier(options.table);
  const params: unknown[] = [];
  if (options.records.length === 0) {
    return { sql: "", params };
  }
  const keys = Object.keys(options.records[0] ?? {});
  const cols = keys.map((k) => sanitizeIdentifier(k)).join(", ");
  const valueRows = options.records.map((rec) => {
    const placeholders = keys.map((k) => {
      params.push(rec[k]);
      return `$${params.length}`;
    });
    return `(${placeholders.join(", ")})`;
  });

  const conflictColumns = (options.onConflict ?? "id")
    .split(",")
    .map((c) => sanitizeIdentifier(c))
    .filter(Boolean)
    .join(", ");

  const setClauses = keys
    .filter((k) => sanitizeIdentifier(k) !== conflictColumns)
    .map((k) => `${sanitizeIdentifier(k)} = EXCLUDED.${sanitizeIdentifier(k)}`);

  const conflictClause = setClauses.length
    ? `ON CONFLICT (${conflictColumns}) DO UPDATE SET ${setClauses.join(", ")}`
    : `ON CONFLICT (${conflictColumns}) DO NOTHING`;

  return {
    sql: `INSERT INTO ${tableName} (${cols}) VALUES ${valueRows.join(", ")} ${conflictClause} RETURNING *`,
    params,
  };
}

/**
 * Builds a DELETE statement with RETURNING *.
 */
export function buildDeleteSql(options: { table: string; filters: DeHostFilter[] }): {
  sql: string;
  params: unknown[];
} {
  const tableName = sanitizeIdentifier(options.table);
  const params: unknown[] = [];
  const whereClause = compileWhereClause(options.filters ?? [], params);
  return { sql: `DELETE FROM ${tableName}${whereClause} RETURNING *`, params };
}
