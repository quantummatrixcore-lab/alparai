import { describe, it, expect, vi, beforeEach } from "vitest";
import { isEmailAllowed } from "@/lib/email/cap";
import { checkRateLimit } from "@/lib/utils/rate-limit";

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  RATE_LIMIT_KEYS: {
    email_notification: "ratelimit:email_notification",
  },
}));

describe("isEmailAllowed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true and log the send if count is less than 3", async () => {
    // Mock rate limit returning success
    vi.mocked(checkRateLimit).mockResolvedValue({
      ok: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 10000,
    });

    const result = await isEmailAllowed("test@example.com", "test_type");
    expect(result).toBe(true);
    expect(checkRateLimit).toHaveBeenCalled();
  });

  it("should return false and skip logging if count is 3 or more", async () => {
    // Mock rate limit failing
    vi.mocked(checkRateLimit).mockResolvedValue({
      ok: false,
      limit: 3,
      remaining: 0,
      reset: Date.now() + 10000,
    });

    const result = await isEmailAllowed("test@example.com", "test_type");
    expect(result).toBe(false);
    expect(checkRateLimit).toHaveBeenCalled();
  });

  it("should return false (fail-closed) if database query fails", async () => {
    // Mock rate limit throwing an error
    vi.mocked(checkRateLimit).mockRejectedValue(new Error("Redis Error"));

    const result = await isEmailAllowed("test@example.com", "test_type");
    expect(result).toBe(false);
  });
});
