/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { processOutreachQueue } from "@/lib/audit/outreach-agent";

// Set environment variables for tests
process.env.IP_SALT = "test-ip-salt-at-least-16-characters-long";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
}));

const mockResend = {
  emails: {
    send: vi.fn().mockResolvedValue({ data: { id: "email-id" }, error: null }),
  },
};

describe("J2a Outreach Queue Agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should skip running if daily outreach limit is already reached", async () => {
    // Mock the daily sent count query to return 50 items (limit)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        data: Array(50).fill({ id: "dummy-id" }),
        error: null,
      }),
    }));

    const result = await processOutreachQueue({ from: mockFrom } as any, mockResend as any);
    expect(result.skipped).toBe(true);
    expect(result.sent).toBe(0);
    expect(mockResend.emails.send).not.toHaveBeenCalled();
  });

  it("should process and send approved emails within daily limit quota", async () => {
    // 1. Sent count call (returns 0 sent today)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }));

    // 2. Fetch pending approved emails (returns 2 items)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: "out-1",
            recipient_email: "test@example.com",
            recipient_name: "John Doe",
            template_type: "media",
            subject: "Embargoed Press Pitch",
            body_template: "This is a pitch",
            status: "approved",
            created_at: new Date().toISOString(),
          },
          {
            id: "out-2",
            recipient_email: "expert@example.com",
            recipient_name: "Dr. Smith",
            template_type: "expert",
            subject: "Expert Invite",
            body_template: "This is an invite",
            status: "approved",
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      }),
    }));

    // 3. Mock updates for status changes
    mockFrom.mockImplementation(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    }));

    const result = await processOutreachQueue({ from: mockFrom } as any, mockResend as any);
    expect(result.skipped).toBe(false);
    expect(result.sent).toBe(2);
    expect(result.failed).toBe(0);

    expect(mockResend.emails.send).toHaveBeenCalledTimes(2);
    // Unsubscribe link with HMAC token must be in the email body
    const calledArgs = mockResend.emails.send.mock.calls[0]?.[0] as any;
    expect(calledArgs).toBeDefined();
    expect(calledArgs.to).toBe("test@example.com");
    expect(calledArgs.text).toContain("api/v1/unsubscribe?email=test%40example.com&token=");
  });
});
