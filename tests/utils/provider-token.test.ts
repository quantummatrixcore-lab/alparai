import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.mock("server-only", () => ({}));

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateAndSaveProviderToken,
  verifyProviderTokenDb,
  consumeProviderTokenDb,
} from "@/lib/utils/provider-token";

let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminClient = createMockSupabaseClient();
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
});

describe("Provider Response Token Utility", () => {
  const incidentId = "550e8400-e29b-41d4-a716-446655440000";
  const email = "trust@openai.com";

  describe("generateAndSaveProviderToken", () => {
    it("generates a 64-char token and saves its hash in the database", async () => {
      mockAdminClient.from.mockImplementation((table: string) => {
        expect(table).toBe("provider_response_tokens");
        return {
          insert: (row: Record<string, unknown>) => {
            expect(row.incident_id).toBe(incidentId);
            expect(row.email).toBe(email);
            expect(row.token_hash).toHaveLength(64); // SHA-256 is 64 hex chars
            expect(row.expires_at).toBeDefined();
            return Promise.resolve({ error: null });
          },
        };
      });

      const token = await generateAndSaveProviderToken(incidentId, email);
      expect(token).toHaveLength(64);
    });
  });

  describe("verifyProviderTokenDb", () => {
    it("returns true if a matching valid token exists in the database", async () => {
      const token = "a".repeat(64);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        is: () => builder,
        gt: () => builder,
        maybeSingle: () => Promise.resolve({ data: { id: "token-123" }, error: null }),
      };

      mockAdminClient.from.mockImplementation((table: string) => {
        expect(table).toBe("provider_response_tokens");
        return builder;
      });

      const isValid = await verifyProviderTokenDb(incidentId, email, token);
      expect(isValid).toBe(true);
    });

    it("returns false if token does not match or is expired/used", async () => {
      const token = "a".repeat(64);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        is: () => builder,
        gt: () => builder,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      };

      mockAdminClient.from.mockImplementation(() => builder);

      const isValid = await verifyProviderTokenDb(incidentId, email, token);
      expect(isValid).toBe(false);
    });
  });

  describe("consumeProviderTokenDb", () => {
    it("updates used_at field and returns true on success", async () => {
      const token = "a".repeat(64);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const builder: any = {
        update: () => builder,
        eq: () => builder,
        is: () => builder,
        gt: () => builder,
        select: () => builder,
        maybeSingle: () => Promise.resolve({ data: { id: "token-123" }, error: null }),
      };

      mockAdminClient.from.mockImplementation((table: string) => {
        expect(table).toBe("provider_response_tokens");
        return builder;
      });

      const success = await consumeProviderTokenDb(incidentId, email, token);
      expect(success).toBe(true);
    });
  });
});
