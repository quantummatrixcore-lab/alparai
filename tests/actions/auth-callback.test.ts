import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { NextRequest } from "next/server";

const mockExchangeCode = vi.fn().mockResolvedValue({ error: null });
const mockVerifyOtp = vi.fn().mockResolvedValue({ error: null });

vi.hoisted(() => {
  vi.doMock("@supabase/ssr", () => ({
    createServerClient: vi.fn().mockImplementation(() => ({
      auth: {
        exchangeCodeForSession: mockExchangeCode,
        verifyOtp: mockVerifyOtp,
      },
    })),
  }));
  vi.doMock("@/lib/utils/logger", () => ({
    logger: {
      warn: vi.fn(),
      error: vi.fn(),
    },
  }));
});

import { GET } from "@/app/[locale]/auth/callback/route";

describe("Auth Callback Route Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExchangeCode.mockResolvedValue({ error: null });
    mockVerifyOtp.mockResolvedValue({ error: null });
  });

  it("exchanges code for session and redirects to profile by default", async () => {
    const req = new NextRequest("http://localhost:3000/auth/callback?code=test-code");
    const response = await GET(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/en/profile");
    expect(mockExchangeCode).toHaveBeenCalledWith("test-code");
  });

  it("handles custom safe next parameter", async () => {
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-code&next=%2Fadmin%2Fusers",
    );
    const response = await GET(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/en/admin/users");
  });

  it("rejects protocol-relative redirect payload and falls back to default profile", async () => {
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-code&next=%2F%2Fgoogle.com",
    );
    const response = await GET(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/en/profile");
  });

  it("rejects absolute URL redirect payload and falls back to default profile", async () => {
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-code&next=https%3A%2F%2Fgoogle.com%2Fpath",
    );
    const response = await GET(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/en/profile");
  });

  it("rejects invalid path format and falls back to default profile", async () => {
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-code&next=%2Fpath%5Cwith%5Cbackslash",
    );
    const response = await GET(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/en/profile");
  });
});
