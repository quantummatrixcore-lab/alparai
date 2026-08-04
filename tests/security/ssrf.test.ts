import { describe, it, expect, vi, beforeEach } from "vitest";
import { isSafeUrl } from "@/lib/security/ssrf";
import dns from "dns";

vi.mock("dns", () => {
  const mockDns = {
    lookup: vi.fn(),
  };
  return {
    lookup: mockDns.lookup,
    default: mockDns,
  };
});

describe("SSRF URL Safety Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow valid public HTTPS URL", async () => {
    const mockLookup = vi.mocked(dns.lookup) as unknown as {
      mockImplementation: (
        fn: (hostname: string, options: unknown, callback?: unknown) => void,
      ) => void;
    };
    mockLookup.mockImplementation((_hostname: string, options: unknown, callback?: unknown) => {
      const cb = (typeof options === "function" ? options : callback) as (
        err: Error | null,
        addresses: { address: string; family: number }[],
      ) => void;
      cb(null, [{ address: "8.8.8.8", family: 4 }]);
    });

    const result = await isSafeUrl("https://example.com");
    expect(result.safe).toBe(true);
  });

  it("should reject HTTP scheme", async () => {
    const result = await isSafeUrl("http://example.com");
    expect(result.safe).toBe(false);
    expect(result.error).toContain("Only HTTPS");
  });

  it("should reject localhost and loopback", async () => {
    const result1 = await isSafeUrl("https://localhost");
    expect(result1.safe).toBe(false);

    const result2 = await isSafeUrl("https://127.0.0.1");
    expect(result2.safe).toBe(false);

    const result3 = await isSafeUrl("https://[::1]");
    expect(result3.safe).toBe(false);
  });

  it("should reject private IPv4 hosts directly", async () => {
    const result = await isSafeUrl("https://192.168.1.100/status");
    expect(result.safe).toBe(false);
  });

  it("should reject CGNAT hosts directly", async () => {
    const result = await isSafeUrl("https://100.64.1.1/admin");
    expect(result.safe).toBe(false);
  });

  it("should reject IPv6 local/private hosts directly", async () => {
    const result1 = await isSafeUrl("https://[fd00::1]");
    expect(result1.safe).toBe(false);

    const result2 = await isSafeUrl("https://[fe80::1]");
    expect(result2.safe).toBe(false);
  });

  it("should reject link-local hosts", async () => {
    const result = await isSafeUrl("https://169.254.169.254/latest/meta-data/");
    expect(result.safe).toBe(false);
  });

  it("should reject hostnames that resolve to private IPs", async () => {
    const mockLookup = vi.mocked(dns.lookup) as unknown as {
      mockImplementation: (
        fn: (hostname: string, options: unknown, callback?: unknown) => void,
      ) => void;
    };
    mockLookup.mockImplementation((_hostname: string, options: unknown, callback?: unknown) => {
      const cb = (typeof options === "function" ? options : callback) as (
        err: Error | null,
        addresses: { address: string; family: number }[],
      ) => void;
      cb(null, [{ address: "192.168.1.50", family: 4 }]);
    });

    const result = await isSafeUrl("https://some-malicious-domain.com");
    expect(result.safe).toBe(false);
    expect(result.error).toContain("private or local network IP");
  });
});
