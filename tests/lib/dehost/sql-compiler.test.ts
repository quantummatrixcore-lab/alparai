import { describe, it, expect } from "vitest";

import {
  sanitizeIdentifier,
  compileColumns,
  compileWhereClause,
  buildSelectSql,
  buildInsertSql,
  buildUpdateSql,
  buildDeleteSql,
  buildUpsertSql,
} from "@/lib/dehost/sql-compiler";

describe("DeHost SQL compiler", () => {
  describe("1. Identifier sanitization", () => {
    it("strips anything that is not a letter, digit, dot or underscore", () => {
      expect(sanitizeIdentifier("incidents")).toBe("incidents");
      expect(sanitizeIdentifier("ai_providers")).toBe("ai_providers");
      expect(sanitizeIdentifier("incidents; DROP TABLE users--")).toBe("incidentsDROPTABLEusers");
      expect(sanitizeIdentifier("public.incidents")).toBe("public.incidents");
    });
  });

  describe("2. Column compilation", () => {
    it("returns * for a wildcard selection", () => {
      expect(compileColumns("*", "incidents")).toBe("*");
    });

    it("sanitizes a plain column list", () => {
      expect(compileColumns("id, title_masked, severity", "incidents")).toBe(
        "id, title_masked, severity",
      );
    });

    it("compiles an embedded resource into a json_build_object subquery", () => {
      const sql = compileColumns("id, ai_providers(name)", "incidents");
      expect(sql).toContain("json_build_object('name', ai_providers.name)");
      expect(sql).toContain("AS ai_providers");
      expect(sql).toContain("incidents.ai_providers_id");
    });

    it("compiles the aliased embedded syntax as well", () => {
      const sql = compileColumns("id, vendor:ai_providers(name, slug)", "incidents");
      expect(sql).toContain(
        "json_build_object('name', ai_providers.name, 'slug', ai_providers.slug)",
      );
      expect(sql).toContain("AS vendor");
    });

    it("aggressively sanitizes a function expression instead of injecting it", () => {
      // The sanitizer is intentionally strict: an unknown expression is
      // flattened to a bare identifier rather than being passed through.
      const sql = compileColumns("id, coalesce(a, b) as c", "incidents");
      expect(sql).not.toContain(";");
      expect(sql).not.toContain("DROP");
      expect(sql).toMatch(/^id, [a-zA-Z0-9_]+$/);
    });
  });

  describe("3. WHERE compilation is parameterised", () => {
    it("binds equality values as parameters", () => {
      const params: unknown[] = [];
      const where = compileWhereClause(
        [{ column: "status", operator: "eq", value: "published" }],
        params,
      );
      expect(where).toBe(" WHERE status = $1");
      expect(params).toEqual(["published"]);
    });

    it("never interpolates a value into the SQL string", () => {
      const params: unknown[] = [];
      const malicious = "'; DROP TABLE incidents; --";
      const where = compileWhereClause(
        [{ column: "title", operator: "eq", value: malicious }],
        params,
      );
      expect(where).not.toContain("DROP TABLE");
      expect(params).toEqual([malicious]);
    });

    it("sanitizes the column even when the operator is unknown", () => {
      const params: unknown[] = [];
      const where = compileWhereClause([{ column: "id; --", operator: "weird", value: 1 }], params);
      // The sanitizer strips everything that is not a letter, digit, dot or
      // underscore, so the injected fragment disappears entirely.
      expect(where).toBe(" WHERE id = $1");
      expect(params).toEqual([1]);
    });

    it("renders IS NULL without a parameter", () => {
      const params: unknown[] = [];
      const where = compileWhereClause(
        [{ column: "ai_provider_id", operator: "is", value: null }],
        params,
      );
      expect(where).toBe(" WHERE ai_provider_id IS NULL");
      expect(params).toHaveLength(0);
    });

    it("expands IN into one placeholder per value", () => {
      const params: unknown[] = [];
      const where = compileWhereClause(
        [{ column: "category", operator: "in", value: ["bias", "privacy"] }],
        params,
      );
      expect(where).toBe(" WHERE category IN ($1, $2)");
      expect(params).toEqual(["bias", "privacy"]);
    });

    it("renders an empty IN list as FALSE", () => {
      const params: unknown[] = [];
      const where = compileWhereClause([{ column: "category", operator: "in", value: [] }], params);
      expect(where).toBe(" WHERE FALSE");
    });

    it("supports not.ilike", () => {
      const params: unknown[] = [];
      const where = compileWhereClause(
        [{ column: "title_masked", operator: "not.ilike", value: "[TEST]%" }],
        params,
      );
      expect(where).toBe(" WHERE title_masked NOT ILIKE $1");
      expect(params).toEqual(["[TEST]%"]);
    });

    it("joins multiple filters with AND", () => {
      const params: unknown[] = [];
      const where = compileWhereClause(
        [
          { column: "status", operator: "eq", value: "published" },
          { column: "severity", operator: "eq", value: "high" },
        ],
        params,
      );
      expect(where).toBe(" WHERE status = $1 AND severity = $2");
    });
  });

  describe("4. Statement builders", () => {
    it("builds a SELECT with order, limit and offset", () => {
      const { dataSql, countSql, params } = buildSelectSql({
        table: "incidents",
        columns: "id, title",
        filters: [{ column: "status", operator: "eq", value: "published" }],
        orderBy: { column: "created_at", ascending: false },
        limit: 20,
        offset: 40,
      });
      expect(dataSql).toBe(
        "SELECT id, title FROM incidents WHERE status = $1 ORDER BY created_at DESC LIMIT 20 OFFSET 40",
      );
      expect(countSql).toBe("SELECT COUNT(*)::int AS count FROM incidents WHERE status = $1");
      expect(params).toEqual(["published"]);
    });

    it("builds a multi-row INSERT with RETURNING *", () => {
      const { sql, params } = buildInsertSql({
        table: "incidents",
        records: [
          { id: "a", title: "one" },
          { id: "b", title: "two" },
        ],
      });
      expect(sql).toBe("INSERT INTO incidents (id, title) VALUES ($1, $2), ($3, $4) RETURNING *");
      expect(params).toEqual(["a", "one", "b", "two"]);
    });

    it("builds an UPDATE with RETURNING *", () => {
      const { sql, params } = buildUpdateSql({
        table: "incidents",
        values: { status: "pending_review" },
        filters: [{ column: "id", operator: "eq", value: "inc-1" }],
      });
      expect(sql).toBe("UPDATE incidents SET status = $1 WHERE id = $2 RETURNING *");
      expect(params).toEqual(["pending_review", "inc-1"]);
    });

    it("builds a DELETE with RETURNING *", () => {
      const { sql, params } = buildDeleteSql({
        table: "incidents",
        filters: [{ column: "id", operator: "eq", value: "inc-1" }],
      });
      expect(sql).toBe("DELETE FROM incidents WHERE id = $1 RETURNING *");
      expect(params).toEqual(["inc-1"]);
    });

    it("builds an UPSERT with an ON CONFLICT DO UPDATE clause", () => {
      const { sql, params } = buildUpsertSql({
        table: "incidents",
        records: [{ id: "inc-1", title: "x" }],
        onConflict: "id",
      });
      expect(sql).toBe(
        "INSERT INTO incidents (id, title) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title RETURNING *",
      );
      expect(params).toEqual(["inc-1", "x"]);
    });

    it("builds an UPSERT with a composite conflict target", () => {
      const { sql } = buildUpsertSql({
        table: "incident_providers",
        records: [{ incident_id: "i", ai_provider_id: "p" }],
        onConflict: "incident_id,ai_provider_id",
      });
      expect(sql).toContain("ON CONFLICT (incident_id, ai_provider_id) DO UPDATE");
    });
  });
});
