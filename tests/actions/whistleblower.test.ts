import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockInsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    maybeSingle: vi.fn().mockResolvedValue({ data: { id: "mock-submission-id" }, error: null }),
  }),
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "whistleblower_submissions") {
        return {
          insert: mockInsert,
        };
      }
      return {
        upsert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "mock" }, error: null }),
          }),
        }),
      };
    }),
  }),
}));

import { submitWhistleblowerAction } from "@/actions/whistleblower";

describe("submitWhistleblowerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits successfully with valid data", async () => {
    const result = await submitWhistleblowerAction({
      encryptedContent: "ENC$testcontent",
      category: "safety",
      providerHint: "OpenAI",
    });
    expect(result.ok).toBe(true);
    expect(result.submissionId).toBe("mock-submission-id");
  });

  it("fails when missing required fields", async () => {
    const result = await submitWhistleblowerAction({
      encryptedContent: "",
      category: "safety",
      providerHint: null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Missing required fields");
  });
});
