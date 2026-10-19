import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

/**
 * REGRESSION GUARD — the null-object incident.
 *
 * Until commit e6576379 the server client resolved every query to
 * `{ data: null, error: null }`. That made the registry look healthy while
 * serving zero real data and hid the production regression behind
 * `/api/health/unified` reporting `db: healthy`.
 *
 * These tests assert the opposite contract: a transport failure must be
 * reported as an ERROR, never as a successful empty result.
 */
describe("DeHost transport — fail loud contract", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.DEHOST_HOST;
    delete process.env.DEHOST_PASSWORD;
    delete process.env.DEHOST_SERVICE_ROLE_KEY;
    delete process.env.DEHOST_SQL_ENDPOINT;
    delete process.env.ERCUOS_API_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns a structured error when no transport is configured", async () => {
    const { createDeHostAdapterClient } = await import("@/lib/dehost/dehost-adapter");
    const client = createDeHostAdapterClient();

    const result = await client.from("incidents").select("id").limit(1);

    // Either the driver is present but the server is unreachable
    // (DEHOST_PG_ERROR) or the driver is absent (DEHOST_NO_TRANSPORT).
    // Both are LOUD failures. What must never happen is a successful empty
    // result — that is exactly what hid the production regression.
    expect(result.error).not.toBeNull();
    expect(["DEHOST_NO_TRANSPORT", "DEHOST_PG_ERROR"]).toContain(result.error?.code);
    expect(result.data).toBeNull();
  });

  it("never reports a successful empty result for a failed transport", async () => {
    const { createDeHostAdapterClient } = await import("@/lib/dehost/dehost-adapter");
    const client = createDeHostAdapterClient();

    const result = await client.from("incidents").select("id", { count: "exact" });

    if (result.error) {
      expect(result.data).toBeNull();
      expect(result.count).toBe(0);
    } else {
      // A working transport must return real rows, not an empty success.
      expect(Array.isArray(result.data) ? result.data.length : 1).toBeGreaterThan(0);
    }
  });

  it("the health probe reports the failure instead of a false healthy", async () => {
    const { probeDatabase } = await import("@/lib/dehost/health-probe");
    const probe = await probeDatabase();

    if (!probe.ok) {
      expect(probe.error).toBeTruthy();
      expect(["none", "pg", "http"]).toContain(probe.transport);
    } else {
      // A healthy probe must have actually measured something.
      expect(probe.latencyMs).toBeGreaterThanOrEqual(0);
      expect(["pg", "http"]).toContain(probe.transport);
    }
  });

  it("the server client is not a null-object anymore", async () => {
    const { createDeHostServerClient } = await import("@/lib/dehost/server-adapter");
    const client = createDeHostServerClient();

    // The client must expose a real fluent query builder.
    expect(typeof client.from).toBe("function");
    const builder = client.from("incidents");
    expect(typeof builder.select).toBe("function");
    expect(typeof builder.insert).toBe("function");
    expect(typeof builder.update).toBe("function");
    expect(typeof builder.delete).toBe("function");
    expect(typeof builder.upsert).toBe("function");
    expect(typeof builder.eq).toBe("function");
    expect(typeof builder.order).toBe("function");
    expect(typeof builder.limit).toBe("function");
  });

  it("the dead default SQL endpoint is no longer hard-coded", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const adapterPath = path.join(process.cwd(), "src", "lib", "dehost", "dehost-adapter.ts");
    const source = fs
      .readFileSync(adapterPath, "utf8")
      .split("\n")
      .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
      .join("\n");
    // "https://dehost.alparai.com/v1/sql" does not resolve (NXDOMAIN) and its
    // failure was silently swallowed into an empty result.
    expect(source).not.toContain("dehost.alparai.com/v1/sql");
  });
});
