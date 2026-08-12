import { vi } from "vitest";
import type { SessionUser } from "@/types";

export function createMockSupabaseClient() {
  const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

  const mockLimit = vi.fn().mockImplementation(() => ({
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  }));

  const mockGte = vi.fn().mockImplementation(() => ({
    limit: mockLimit,
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  }));

  const mockGt = vi.fn().mockImplementation(() => ({
    limit: mockLimit,
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
    gte: mockGte,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockQueryChain: any = {
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    limit: mockLimit,
    gt: mockGt,
    gte: mockGte,
    then: vi.fn().mockImplementation((onfulfilled) => {
      return mockMaybeSingle().then(onfulfilled);
    }),
  };

  const mockNot = vi.fn().mockImplementation(() => mockQueryChain);
  const mockIs = vi.fn().mockImplementation(() => mockQueryChain);
  mockQueryChain.not = mockNot;
  mockQueryChain.is = mockIs;
  mockQueryChain.eq = vi.fn().mockImplementation(() => mockQueryChain);

  const innerEq = vi.fn().mockReturnValue(mockQueryChain);

  const outerEq = vi.fn().mockReturnValue({
    ...mockQueryChain,
    eq: innerEq,
  });

  const mockSelect = vi.fn().mockReturnValue({
    ...mockQueryChain,
    eq: outerEq,
  });

  const mockInsertSelectSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockInsertSelect = vi.fn().mockReturnValue({
    single: mockInsertSelectSingle,
  });
  const mockInsert = vi.fn().mockReturnValue({
    select: mockInsertSelect,
    then: vi.fn((onfulfilled) => {
      if (typeof onfulfilled === "function") {
        onfulfilled({ data: null, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockUpdateChain = {} as any;
  const mockUpdateEq = vi.fn().mockImplementation(() => mockUpdateChain);
  const mockUpdate = vi.fn().mockImplementation(() => mockUpdateChain);

  mockUpdateChain.eq = mockUpdateEq;
  mockUpdateChain.in = vi.fn().mockImplementation(() => mockUpdateChain);
  mockUpdateChain.or = vi.fn().mockImplementation(() => mockUpdateChain);
  mockUpdateChain.select = vi.fn().mockImplementation(() => mockUpdateChain);
  mockUpdateChain.then = vi.fn().mockImplementation((onfulfilled) => {
    if (typeof onfulfilled === "function") {
      onfulfilled({ data: [{ id: "mock-id" }], error: null });
    }
    return Promise.resolve({ data: [{ id: "mock-id" }], error: null });
  });

  const mockDeleteInnerEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockDeleteEq = vi.fn().mockReturnValue({
    eq: mockDeleteInnerEq,
  });
  const mockDelete = vi.fn().mockReturnValue({
    eq: mockDeleteEq,
  });

  const mockUpsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  });

  return {
    from: vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      upsert: mockUpsert,
    }),
    rpc: vi.fn().mockImplementation((fnName: string) => {
      const defaultData = fnName === "submit_incident_atomic" ? { id: "inc-123" } : null;
      const res = { data: defaultData, error: null };
      return Object.assign(Promise.resolve(res), {
        maybeSingle: vi.fn().mockResolvedValue(res),
        single: vi.fn().mockResolvedValue(res),
      });
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { url: "https://auth.example.com" },
        error: null,
      }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    _mocks: {
      mockSingle,
      mockMaybeSingle,
      mockSelect,
      mockInsert,
      mockInsertSelect,
      mockInsertSelectSingle,
      mockUpdate,
      mockUpdateEq,
      mockDelete,
      mockDeleteEq,
      mockDeleteInnerEq,
      mockUpsert,
      innerEq,
      outerEq,
    },
  };
}

export function createTestUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "test-user-id",
    email: "test@example.com",
    fullName: "Test User",
    avatarUrl: null,
    role: "user",
    isVerified: true,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function createTestModerator(overrides: Partial<SessionUser> = {}): SessionUser {
  return createTestUser({
    role: "moderator",
    fullName: "Test Moderator",
    ...overrides,
  });
}

export function createTestAdmin(overrides: Partial<SessionUser> = {}): SessionUser {
  return createTestUser({
    role: "admin",
    fullName: "Test Admin",
    ...overrides,
  });
}
