import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn().mockImplementation(() => ({
  eq: vi.fn().mockImplementation(() => ({
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "newsletter_subscribers") {
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      }
      return {
        upsert: () => ({
          select: () => ({ single: () => Promise.resolve({ data: { id: "mock" }, error: null }) }),
        }),
      };
    }),
  }),
}));

vi.mock("@/lib/validation/schemas", async () => {
  const { z } = await import("zod");
  return {
    newsletterSubscriptionSchema: z.object({
      email: z.string().email("Invalid email address"),
      locale: z.string().min(2).max(5).default("en"),
    }),
  };
});

import { subscribeNewsletter } from "@/actions/newsletter";

function buildNewsletterForm(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("email", "newsletter@example.com");
  fd.set("locale", "tr");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("subscribeNewsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits successfully with valid email", async () => {
    const result = await subscribeNewsletter({ ok: false }, buildNewsletterForm());
    expect(result.ok).toBe(true);
  });

  it("returns field errors for invalid email", async () => {
    const fd = buildNewsletterForm({ email: "invalid-email" });
    const result = await subscribeNewsletter({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
  });
});
