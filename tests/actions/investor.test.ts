import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient, createTestUser } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireAdmin: vi.fn(),
  }));
  vi.doMock("@/lib/email/resend", () => ({
    getResendClient: vi.fn().mockReturnValue(null),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
    RATE_LIMIT_KEYS: { investor_application: "investor_rl" },
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { getResendClient } from "@/lib/email/resend";
import { submitInvestor, approveInvestor, rejectInvestor } from "@/actions/investor";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;
let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;
const mockAdminUser = createTestUser({ role: "admin", id: "admin-123" });

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  mockAdminClient = createMockSupabaseClient();
  vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as never);
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(requireAdmin).mockResolvedValue(mockAdminUser as never);
});

describe("submitInvestor", () => {
  const validData = makeFormData({
    fullName: "John Doe",
    title: "Partner",
    company: "VC Fund",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    email: "john@vc.com",
    checkSize: "$1M-$5M",
    whyInterested: "AI safety",
  });

  it("returns field errors on invalid data", async () => {
    const badData = makeFormData({
      fullName: "",
      title: "",
      company: "",
      linkedinUrl: "not-a-url",
      email: "invalid",
      checkSize: "",
    });
    const result = await submitInvestor({ ok: false }, badData);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("submits successfully with valid data", async () => {
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "investor_applications") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        } as never;
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            gte: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
        upsert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "ap-1" }, error: null }),
          }),
        }),
      } as never;
    });

    const result = await submitInvestor({ ok: false }, validData);
    expect(result.ok).toBe(true);
  });

  it("returns rate limit error when rate limited", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ ok: false, retryAfter: 60 } as never);

    const result = await submitInvestor({ ok: false }, validData);
    expect(result.ok).toBe(false);
    expect(result.formError).toContain("Too many submissions");
  });

  it("handles unhandled exception", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rate-limit");
    vi.mocked(checkRateLimit).mockRejectedValueOnce(new Error("Unexpected"));

    const result = await submitInvestor({ ok: false }, validData);
    expect(result.ok).toBe(false);
    expect(result.formError).toBeDefined();
  });
});

describe("approveInvestor", () => {
  it("approves an investor successfully (no resend)", async () => {
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "investor_applications") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { full_name: "Jane", email: "jane@test.com" },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as never;
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            gte: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
        upsert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "ap-1" }, error: null }),
          }),
        }),
      } as never;
    });

    const result = await approveInvestor("inv-1");
    expect(result.ok).toBe(true);
  });

  it("returns unauthorized when requireAdmin fails", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"));
    const result = await approveInvestor("inv-1");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error when application not found", async () => {
    mockAdminClient.from.mockImplementation(
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

    const result = await approveInvestor("inv-1");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Application not found");
  });

  it("returns error on update failure", async () => {
    mockAdminClient.from.mockImplementation(
      () =>
        ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { full_name: "Jane", email: "jane@test.com" },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: { message: "Update failed" } }),
          }),
        }) as never,
    );

    const result = await approveInvestor("inv-1");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Update failed");
  });

  it("returns ok with warning when email fails", async () => {
    vi.mocked(getResendClient).mockReturnValueOnce({
      emails: { send: vi.fn().mockRejectedValue(new Error("SMTP error")) },
    } as never);

    mockAdminClient.from.mockImplementation(
      () =>
        ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { full_name: "Jane", email: "jane@test.com" },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }) as never,
    );

    const result = await approveInvestor("inv-1");
    expect(result.ok).toBe(true);
    expect(result.error).toContain("email");
  });
});

describe("rejectInvestor", () => {
  it("rejects an investor successfully", async () => {
    mockAdminClient.from.mockImplementation(
      () =>
        ({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }) as never,
    );

    const result = await rejectInvestor("inv-1");
    expect(result.ok).toBe(true);
  });

  it("returns unauthorized when requireAdmin fails", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("Unauthorized"));
    const result = await rejectInvestor("inv-1");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error on db failure", async () => {
    mockAdminClient.from.mockImplementation(
      () =>
        ({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
          }),
        }) as never,
    );

    const result = await rejectInvestor("inv-1");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Delete failed");
  });
});
