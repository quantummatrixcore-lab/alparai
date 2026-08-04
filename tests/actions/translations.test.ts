import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
const mockSelect = vi.fn().mockImplementation(() => ({
  eq: vi.fn().mockImplementation(() => ({
    single: vi.fn().mockResolvedValue({
      data: {
        id: "inc-1",
        title: "AI Leak Test",
        description: "AI system leaked credentials",
        title_tr: null,
        language: "en",
      },
      error: null,
    }),
    is: vi.fn().mockImplementation(() => ({
      limit: vi.fn().mockResolvedValue({
        data: [{ id: "inc-1" }],
        error: null,
      }),
    })),
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: vi.fn().mockImplementation(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
  }),
}));

vi.hoisted(() => {
  vi.doMock(
    "@/lib/ai/openrouter-gateway",
    async (importOriginal: () => Promise<Record<string, unknown>>) => {
      const actual = await importOriginal();
      return {
        ...actual,
        callWithFailover: vi.fn().mockResolvedValue({
          ok: true,
          data: {
            content: JSON.stringify({
              title_tr: "Yapay Zeka Sızıntı Testi",
              description_tr: "Yapay zeka sistemi kimlik bilgilerini sızdırdı",
            }),
          },
        }),
      };
    },
  );
});

import { translateIncidentToTR, backfillIncidentsTR } from "@/actions/translations";

describe("translateIncidentToTR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("translates English incident to Turkish and sets machine_translated", async () => {
    const res = await translateIncidentToTR("inc-1");
    expect(res).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title_tr: "Yapay Zeka Sızıntı Testi",
        description_tr: "Yapay zeka sistemi kimlik bilgilerini sızdırdı",
        machine_translated: true,
      }),
    );
  });

  it("backfills incident batch", async () => {
    const res = await backfillIncidentsTR(1);
    expect(res.processed).toBe(1);
    expect(res.success).toBe(1);
  });
});
