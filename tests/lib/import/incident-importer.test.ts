import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ImportIncidentRow } from "@/lib/import/csv-parser";

// ---------------------------------------------------------------------------
// Mock server-only and supabase/admin so tests run in Node without credentials
// ---------------------------------------------------------------------------
vi.mock("server-only", () => ({}));

const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn((table) => {
  if (table === "ai_providers") {
    return {
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
  }
  return {
    upsert: mockUpsert,
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

// Import AFTER mocks are set up
import { importIncidents } from "@/lib/import/incident-importer";

const makeRow = (overrides?: Partial<ImportIncidentRow>): ImportIncidentRow => ({
  externalId: "aiaaic-1",
  title: "AI system caused harm to many people",
  description:
    "A detailed description of how the AI system caused widespread harm to a significant number of people in the affected region.",
  category: "bias",
  severity: "high",
  incidentDate: "2024-01-15",
  locationCountry: "US",
  sourceUrl: "https://example.com",
  importAttribution: "AIAAIC Registry (CC BY 4.0)",
  language: "en",
  euActRiskCategory: null,
  euActSeriousIncidentClass: null,
  euActHighRiskSystemCategory: null,
  euActReportingDeadlineDays: null,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("importIncidents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockResolvedValue({ data: [{ id: "uuid-1" }], error: null });
  });

  it("returns inserted count on success", async () => {
    const rows = [makeRow(), makeRow({ externalId: "aiaaic-2" })];
    const result = await importIncidents(rows, "aiaaic_import");
    expect(result.inserted).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  it("applies PII masking to title and description", async () => {
    const rowWithPii = makeRow({
      title: "User john.doe@example.com reported AI incident",
      description:
        "The user john.doe@example.com was affected by the AI system when it incorrectly identified them.",
    });
    await importIncidents([rowWithPii], "aiaaic_import");

    const upsertCall = mockUpsert.mock.calls[0]?.[0] as Record<string, unknown>[];
    expect(upsertCall?.[0]?.contains_pii).toBe(true);
    expect(upsertCall?.[0]?.title_masked).toContain("[REDACTED-EMAIL]");
  });

  it("sets status to published by default (Proposal 014 Zero-Intervention)", async () => {
    await importIncidents([makeRow()], "aiaaic_import");
    const upsertCall = mockUpsert.mock.calls[0]?.[0] as Record<string, unknown>[];
    expect(upsertCall?.[0]?.status).toBe("published");
    expect(upsertCall?.[0]?.processing_stage).toBe("completed");
    expect(upsertCall?.[0]?.ai_moderation_score).toBe(100);
  });

  it("sets status to pending_review when autoPublish: false option is passed", async () => {
    await importIncidents([makeRow()], "aiaaic_import", { autoPublish: false });
    const upsertCall = mockUpsert.mock.calls[0]?.[0] as Record<string, unknown>[];
    expect(upsertCall?.[0]?.status).toBe("pending_review");
  });

  it("sets incident_source from parameter", async () => {
    await importIncidents([makeRow()], "aiid_import");
    const upsertCall = mockUpsert.mock.calls[0]?.[0] as Record<string, unknown>[];
    expect(upsertCall?.[0]?.incident_source).toBe("aiid_import");
  });

  it("batches in groups of 50", async () => {
    const rows = Array.from({ length: 110 }, (_, i) => makeRow({ externalId: `aiaaic-${i}` }));
    await importIncidents(rows, "aiaaic_import");
    expect(mockUpsert).toHaveBeenCalledTimes(3);
  });

  it("records errors on DB failure and skips the batch", async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: { message: "DB error" } });
    const result = await importIncidents([makeRow()], "aiaaic_import");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("DB error");
    expect(result.skipped).toBe(1);
  });

  it("returns empty result for empty rows array", async () => {
    const result = await importIncidents([], "aiaaic_import");
    expect(result.inserted).toBe(0);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("does not call rate limit check (admin bypass)", async () => {
    await importIncidents([makeRow()], "aiaaic_import");
    expect(mockFrom).toHaveBeenCalledWith("incidents");
  });
});
