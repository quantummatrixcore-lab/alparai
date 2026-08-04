import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailPreferences, updateEmailPreferencesAction } from "@/actions/email-preferences";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Email Preferences", () => {
  describe("getEmailPreferences", () => {
    it("returns existing preferences", async () => {
      const mockData = { weekly_digest: true, watches: false, reporter_notifications: true };
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as never);

      const result = await getEmailPreferences("user-1");
      expect(result.weekly_digest).toBe(true);
    });

    it("inserts defaults when no preferences exist", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      const mockInsertData = { weekly_digest: true, watches: true, reporter_notifications: true };
      const mockInsertSingle = vi.fn().mockResolvedValue({ data: mockInsertData, error: null });
      const mockInsertSelect = vi.fn().mockReturnValue({ single: mockInsertSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockInsertSelect });

      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockImplementation((table) => {
          if (table === "email_preferences" && mockSelect.mock.calls.length === 0) {
            return { select: mockSelect };
          }
          return { insert: mockInsert };
        }),
      } as never);

      const result = await getEmailPreferences("user-1");
      expect(result.weekly_digest).toBe(true);
    });
  });

  describe("updateEmailPreferencesAction", () => {
    it("updates preferences successfully", async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ update: mockUpdate }),
      } as never);

      function makeForm(overrides: Record<string, string> = {}): FormData {
        const fd = new FormData();
        Object.entries({
          userId: "user-1",
          weeklyDigest: "on",
          watches: "on",
          reporterNotifications: "on",
          ...overrides,
        }).forEach(([k, v]) => fd.append(k, v));
        return fd;
      }

      const result = await updateEmailPreferencesAction({ ok: true }, makeForm());
      expect(result.ok).toBe(true);
    });

    it("rejects missing userId", async () => {
      const formData = new (class extends FormData {} as unknown as { new (): FormData })();
      const result = await updateEmailPreferencesAction({ ok: true }, formData);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("User ID");
    });
  });
});
