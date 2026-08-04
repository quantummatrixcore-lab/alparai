import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ id: "mock-email-id" }),
}));

vi.mock("@/lib/email/resend", () => ({
  getResendClient: vi.fn().mockReturnValue({
    emails: {
      send: mockSend,
    },
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { checkRateLimit } from "@/lib/utils/rate-limit";
vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
  RATE_LIMIT_KEYS: {
    contact_submission: "ratelimit:contact_submission",
    email_notification: "ratelimit:email_notification",
  },
}));
vi.mock("@/lib/utils/provider-token", () => ({
  consumeProviderTokenDb: vi.fn().mockImplementation(async (_incidentId, _email, token) => {
    return token === "correct-token-placeholder-that-has-exactly-64-chars-long12345678";
  }),
}));

import { createAdminClient } from "@/lib/supabase/admin";
import { submitProviderResponse } from "@/actions/provider-response";

let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminClient = createMockSupabaseClient();
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
});

function buildResponseForm(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("incidentId", "550e8400-e29b-41d4-a716-446655440000");
  fd.set("token", "correct-token-placeholder-that-has-exactly-64-chars-long12345678");
  fd.set(
    "responseText",
    "This is our official provider response statement regarding the incident.",
  );
  fd.set("responderName", "Jane Doe");
  fd.set("responderRole", "Director of Communications");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitProviderResponse", () => {
  const incidentId = "550e8400-e29b-41d4-a716-446655440000";
  const contactEmail = "trust@openai.com";

  it("submits response successfully with valid token", async () => {
    // Generate valid token
    const token = "correct-token-placeholder-that-has-exactly-64-chars-long12345678";
    const fd = buildResponseForm({ token });

    // Mock incident retrieval
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: incidentId, ai_provider_id: "provider-123", status: "published" },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_providers") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: "provider-123", contact_email: contactEmail },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_provider_responses") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: (row: Record<string, unknown>) => {
            expect(row.is_official).toBe(true);
            expect(row.is_published).toBe(true);
            expect(row.responder_email).toBe(contactEmail);
            return Promise.resolve({ error: null });
          },
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            gte: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
      };
    });

    const result = await submitProviderResponse(null, fd);
    expect(result.ok).toBe(true);
  });
  it("returns error on invalid token", async () => {
    const fd = buildResponseForm({
      token: "incorrect-token-value-that-is-exactly-64-chars-long-123456789012",
    });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: incidentId, ai_provider_id: "provider-123", status: "published" },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_providers") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: "provider-123", contact_email: contactEmail },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            gte: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
      };
    });

    const result = await submitProviderResponse(null, fd);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid_token");
  });

  it("sends email when reporter has notifications enabled and rate limit is ok", async () => {
    const fd = buildResponseForm();
    mockSend.mockClear();
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: incidentId,
                    user_id: "user-abc",
                    ai_provider_id: "provider-123",
                    status: "published",
                    title: "Test Title",
                  },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_providers") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: "provider-123", name: "OpenAI", contact_email: contactEmail },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_provider_responses") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: () => Promise.resolve({ error: null }),
        };
      }
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { email: "reporter@example.com", locale: "en" },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "email_preferences") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { reporter_notifications: true },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            gte: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
        insert: () => Promise.resolve({ error: null }),
      };
    });

    const result = await submitProviderResponse(null, fd);
    expect(result.ok).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "reporter@example.com",
        subject: expect.stringContaining("Official Response Received"),
      }),
    );
  });

  it("does not send email when reporter has notifications disabled", async () => {
    const fd = buildResponseForm();
    mockSend.mockClear();
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: incidentId,
                    user_id: "user-abc",
                    ai_provider_id: "provider-123",
                    status: "published",
                    title: "Test Title",
                  },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_providers") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: "provider-123", name: "OpenAI", contact_email: contactEmail },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_provider_responses") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: () => Promise.resolve({ error: null }),
        };
      }
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { email: "reporter@example.com", locale: "en" },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "email_preferences") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { reporter_notifications: false },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            gte: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
      };
    });

    const result = await submitProviderResponse(null, fd);
    expect(result.ok).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not send email when notification rate limit is exceeded", async () => {
    const fd = buildResponseForm();
    mockSend.mockClear();
    vi.mocked(checkRateLimit).mockImplementation(async (key) => {
      if (key.includes("email_notification")) {
        return { ok: false };
      }
      return { ok: true };
    });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: incidentId,
                    user_id: "user-abc",
                    ai_provider_id: "provider-123",
                    status: "published",
                    title: "Test Title",
                  },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_providers") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: "provider-123", name: "OpenAI", contact_email: contactEmail },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "ai_provider_responses") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: () => Promise.resolve({ error: null }),
        };
      }
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { email: "reporter@example.com", locale: "en" },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "email_preferences") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { reporter_notifications: true },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            gte: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
        insert: () => Promise.resolve({ error: null }),
      };
    });

    const result = await submitProviderResponse(null, fd);
    expect(result.ok).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
