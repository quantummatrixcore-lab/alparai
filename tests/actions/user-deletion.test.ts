import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockDeHostClient, createTestUser } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/dehost/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { requestUserDeletionAction, cancelUserDeletionAction } from "@/actions/user-deletion";

let mockAdminClient: ReturnType<typeof createMockDeHostClient>;
const mockUser = createTestUser({ id: "user-gdpr-123" });

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminClient = createMockDeHostClient();
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);
});

describe("GDPR Account Deletion Actions", () => {
  it("requests account deletion successfully", async () => {
    mockAdminClient._mocks.mockUpdateEq.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await requestUserDeletionAction({ ok: false }, new FormData());
    expect(result.ok).toBe(true);
    expect(mockAdminClient.from).toHaveBeenCalledWith("users");
    expect(mockAdminClient._mocks.mockUpdate).toHaveBeenCalled();
  });

  it("cancels account deletion successfully", async () => {
    mockAdminClient._mocks.mockUpdateEq.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await cancelUserDeletionAction({ ok: false }, new FormData());
    expect(result.ok).toBe(true);
    expect(mockAdminClient.from).toHaveBeenCalledWith("users");
    expect(mockAdminClient._mocks.mockUpdate).toHaveBeenCalled();
  });
});
