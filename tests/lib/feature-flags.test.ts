import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { enabled: true }, error: null });
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    }),
  }),
}));

import { isFeatureEnabled } from "@/lib/flags/feature-flags";

describe("isFeatureEnabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates feature flag with DB fallback on cache miss", async () => {
    const enabled = await isFeatureEnabled("new_submission_v2", false);
    expect(enabled).toBe(true);
  });
});
