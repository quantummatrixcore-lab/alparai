import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient, createTestUser } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireAdmin: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  getExternalQueue,
  updateExternalQueueStatus,
  acceptExternalIncident,
  triggerManualFetch,
  getConnectorStatuses,
  getInnovations,
  createInnovation,
  updateInnovationStatus,
} from "@/actions/innovations";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;
const mockAdmin = createTestUser({ role: "admin", id: "admin-123" });

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as never);
  vi.mocked(requireAdmin).mockResolvedValue(mockAdmin as never);
});

describe("getExternalQueue", () => {
  it("returns queue items", async () => {
    mockSupabaseClient._mocks.mockSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [{ id: "q1" }], error: null }),
    } as never);
    const result = await getExternalQueue();
    expect(result).toEqual([{ id: "q1" }]);
  });

  it("throws on db error", async () => {
    mockSupabaseClient._mocks.mockSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB Error" } }),
    } as never);
    await expect(getExternalQueue()).rejects.toThrow("DB Error");
  });

  it("returns empty array when no data", async () => {
    mockSupabaseClient._mocks.mockSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as never);
    const result = await getExternalQueue();
    expect(result).toEqual([]);
  });
});

describe("updateExternalQueueStatus", () => {
  it("updates status successfully", async () => {
    mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });
    const result = await updateExternalQueueStatus("q1", "accepted");
    expect(result.success).toBe(true);
  });

  it("throws on db error", async () => {
    mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({
      error: { message: "Update failed" },
    });
    await expect(updateExternalQueueStatus("q1", "rejected")).rejects.toThrow("Update failed");
  });
});

describe("acceptExternalIncident", () => {
  it("accepts a queue item and creates an incident", async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ id: "q1", source: "hn" }],
      error: null,
    });
    mockSupabaseClient._mocks.mockSelect.mockReturnValue({ order: mockOrder } as never);

    const mockEq = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: { id: "q1", title: "Test", body: "Desc", external_url: "http://example.com" },
        error: null,
      }),
    });
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "external_incidents_queue") {
        return {
          select: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as never;
      }
      if (table === "incidents") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: "inc-1" }, error: null }),
            }),
          }),
        } as never;
      }
      return {} as never;
    });

    const result = await acceptExternalIncident("q1", "cybersecurity", "high");
    expect(result.success).toBe(true);
    expect(result.incidentId).toBe("inc-1");
  });

  it("throws when queue item not found", async () => {
    mockSupabaseClient.from.mockImplementation(
      () =>
        ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }) as never,
    );

    await expect(acceptExternalIncident("missing", "legal", "low")).rejects.toThrow("Not found");
  });

  it("throws when incident insert fails", async () => {
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "external_incidents_queue") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "q1", title: "T", body: "B", external_url: "http://x.com" },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as never;
      }
      if (table === "incidents") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: null, error: { message: "Insert failed" } }),
            }),
          }),
        } as never;
      }
      return {} as never;
    });

    await expect(acceptExternalIncident("q1", "legal", "low")).rejects.toThrow("Insert failed");
  });
});

describe("triggerManualFetch", () => {
  it("fetches successfully", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total_fetched: 10, inserted_or_updated: 5 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await triggerManualFetch();
    expect(result.success).toBe(true);
    expect(result.message).toContain("Fetched: 10");
    vi.unstubAllGlobals();
  });

  it("returns failure on fetch error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await triggerManualFetch();
    expect(result.success).toBe(false);
    expect(result.message).toContain("Fetch failed");
    vi.unstubAllGlobals();
  });

  it("returns failure on network exception", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const result = await triggerManualFetch();
    expect(result.success).toBe(false);
    expect(result.message).toBe("Network error");
    vi.unstubAllGlobals();
  });
});

describe("getConnectorStatuses", () => {
  it("returns connector statuses", async () => {
    mockSupabaseClient._mocks.mockSelect.mockResolvedValue({
      data: [
        { source: "reddit", status: "pending" },
        { source: "reddit", status: "accepted" },
        { source: "hn", status: "pending" },
      ],
      error: null,
    });

    const result = await getConnectorStatuses();
    expect(result).toHaveLength(5);
    expect(result[0]!.name).toContain("Reddit");
    expect(result[0]!.pending_count).toBe(1);
    expect(result[1]!.name).toContain("Hacker News");
    expect(result[1]!.pending_count).toBe(1);
  });
});

describe("getInnovations", () => {
  it("returns innovations", async () => {
    mockSupabaseClient._mocks.mockSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: [{ id: "inn-1", title: "Test Innovation" }],
        error: null,
      }),
    } as never);
    const result = await getInnovations();
    expect(result).toHaveLength(1);
  });

  it("throws on db error", async () => {
    mockSupabaseClient._mocks.mockSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB Error" } }),
    } as never);
    await expect(getInnovations()).rejects.toThrow("DB Error");
  });
});

describe("createInnovation", () => {
  it("creates an innovation successfully", async () => {
    mockSupabaseClient._mocks.mockInsertSelectSingle.mockResolvedValue({
      data: { id: "inn-new" },
      error: null,
    });
    const result = await createInnovation("New Idea", "Desc", "high");
    expect(result.success).toBe(true);
    expect(result.id).toBe("inn-new");
  });

  it("throws on db error", async () => {
    mockSupabaseClient._mocks.mockInsertSelectSingle.mockResolvedValue({
      data: null,
      error: { message: "Insert Error" },
    });
    await expect(createInnovation("Fail", "Desc", "low")).rejects.toThrow("Insert Error");
  });
});

describe("updateInnovationStatus", () => {
  it("updates status successfully", async () => {
    mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });
    const result = await updateInnovationStatus("inn-1", "done");
    expect(result.success).toBe(true);
  });

  it("throws on db error", async () => {
    mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({
      error: { message: "Update Error" },
    });
    await expect(updateInnovationStatus("inn-1", "in_progress")).rejects.toThrow("Update Error");
  });
});
