import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import {
  createMockSupabaseClient,
  createTestModerator,
  createTestAdmin,
} from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireModerator: vi.fn(),
    requireAdmin: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator, requireAdmin } from "@/lib/auth/session";
import {
  moderateIncident,
  reviewTakedown,
  setUserRole,
  bulkApproveIncidents,
  bulkRejectIncidents,
} from "@/actions/admin";

let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;
let mockModerator: ReturnType<typeof createTestModerator>;
let mockAdmin: ReturnType<typeof createTestAdmin>;

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminClient = createMockSupabaseClient();
  mockModerator = createTestModerator();
  mockAdmin = createTestAdmin();
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(requireModerator).mockResolvedValue(mockModerator as never);
  vi.mocked(requireAdmin).mockResolvedValue(mockAdmin as never);
});

describe("moderateIncident", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireModerator).mockResolvedValue(mockModerator);

    const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockAdminClient.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
      select: vi.fn().mockReturnValue({
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
        }),
      }),
    } as ReturnType<typeof mockAdminClient.from>);
  });

  it("approves an incident successfully", async () => {
    const result = await moderateIncident({
      incidentId: "inc-1",
      decision: "approve",
    });
    expect(result.ok).toBe(true);
    expect(mockAdminClient.from).toHaveBeenCalledWith("incidents");
  });

  it("rejects an incident successfully", async () => {
    const result = await moderateIncident({
      incidentId: "inc-1",
      decision: "reject",
      moderationNote: "Does not meet guidelines",
    });
    expect(result.ok).toBe(true);
  });

  it("returns error when not a moderator", async () => {
    vi.mocked(requireModerator).mockResolvedValueOnce(null as never);
    const result = await moderateIncident({
      incidentId: "inc-1",
      decision: "approve",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("returns error for invalid input", async () => {
    const result = await moderateIncident({
      incidentId: "",
      decision: "approve",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid input");
  });
});

describe("reviewTakedown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireModerator).mockResolvedValue(mockModerator);

    const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
    mockAdminClient.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
        }),
      }),
    } as ReturnType<typeof mockAdminClient.from>);
  });

  it("approves a takedown request", async () => {
    const result = await reviewTakedown({
      id: "td-1",
      decision: "approve",
    });
    expect(result.ok).toBe(true);
    expect(mockAdminClient.from).toHaveBeenCalledWith("takedown_requests");
  });

  it("rejects a takedown request", async () => {
    const result = await reviewTakedown({
      id: "td-1",
      decision: "reject",
    });
    expect(result.ok).toBe(true);
  });
});

describe("setUserRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireModerator).mockResolvedValue(mockModerator);
    vi.mocked(requireAdmin).mockResolvedValue(mockAdmin as never);

    const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    const mockBeforeMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: "user-1", role: "user", email: "user-1@test.com" },
      error: null,
    });
    const mockBeforeEq = vi.fn().mockReturnValue({
      maybeSingle: mockBeforeMaybeSingle,
      single: mockBeforeMaybeSingle,
    });
    const mockBeforeSelect = vi.fn().mockReturnValue({
      eq: mockBeforeEq,
      maybeSingle: mockBeforeMaybeSingle,
      single: mockBeforeMaybeSingle,
    });

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          update: mockUpdate,
          select: mockBeforeSelect,
        } as ReturnType<typeof mockAdminClient.from>;
      }
      if (table === "audit_log") {
        return { insert: mockInsert } as ReturnType<typeof mockAdminClient.from>;
      }
      return mockAdminClient.from.mockReturnValue({}) as never;
    });
  });

  it("sets user role successfully", async () => {
    const result = await setUserRole({
      userId: "user-1",
      role: "moderator",
    });
    expect(result.ok).toBe(true);
    expect(mockAdminClient.from).toHaveBeenCalledWith("users");
  });

  it("returns error for invalid role input", async () => {
    const result = await setUserRole({
      userId: "",
      role: "moderator",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid input");
  });
});

describe("bulkApproveIncidents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue(mockAdmin as never);

    const mockUpdateIn = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ in: mockUpdateIn });
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "incidents") {
        return { update: mockUpdate } as never;
      }
      if (table === "audit_log") {
        return { insert: mockInsert } as never;
      }
      return {} as never;
    });
  });

  it("approves multiple incidents in bulk", async () => {
    const result = await bulkApproveIncidents(["inc-1", "inc-2"]);
    expect(result.ok).toBe(true);
    expect(mockAdminClient.from).toHaveBeenCalledWith("incidents");
  });

  it("returns error when unauthorized", async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce(null as never);
    const result = await bulkApproveIncidents(["inc-1", "inc-2"]);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });
});

describe("bulkRejectIncidents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue(mockAdmin as never);

    const mockUpdateIn = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ in: mockUpdateIn });
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "incidents") {
        return { update: mockUpdate } as never;
      }
      if (table === "audit_log") {
        return { insert: mockInsert } as never;
      }
      return {} as never;
    });
  });

  it("rejects multiple incidents in bulk", async () => {
    const result = await bulkRejectIncidents(["inc-1", "inc-2"]);
    expect(result.ok).toBe(true);
    expect(mockAdminClient.from).toHaveBeenCalledWith("incidents");
  });

  it("returns error when unauthorized", async () => {
    vi.mocked(requireAdmin).mockResolvedValueOnce(null as never);
    const result = await bulkRejectIncidents(["inc-1", "inc-2"]);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });
});
