import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isSafeUrl, fetchWithSsrfGuard } from "@/lib/security/ssrf";
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

describe("fetchWithSsrfGuard", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
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
      cb(null, [{ address: "93.184.216.34", family: 4 }]);
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should successfully fetch safe URL and stream response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("test content", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );

    const res = await fetchWithSsrfGuard("https://example.com/data.txt");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("test content");
  });

  it("should reject unsafe URL before making request", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    await expect(fetchWithSsrfGuard("http://127.0.0.1:8080")).rejects.toThrow(
      "Only HTTPS URLs are allowed.",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should reject response when Content-Length exceeds 2MB", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("dummy", {
        status: 200,
        headers: { "content-length": "3000000" },
      }),
    );

    await expect(fetchWithSsrfGuard("https://example.com/huge.bin")).rejects.toThrow(
      "Response size limit exceeded (2MB limit)",
    );
  });

  it("should abort controller and throw error when body stream exceeds 2MB limit", async () => {
    let capturedSignal: AbortSignal | undefined;
    const chunk1 = new Uint8Array(1.5 * 1024 * 1024); // 1.5MB
    const chunk2 = new Uint8Array(1.5 * 1024 * 1024); // 1.5MB (total 3MB)

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedSignal = (init as RequestInit)?.signal as AbortSignal;
      return Promise.resolve(new Response(stream, { status: 200 }));
    });

    const res = await fetchWithSsrfGuard("https://example.com/stream-chunked");
    expect(capturedSignal?.aborted).toBe(false);

    await expect(res.text()).rejects.toThrow("Response size limit exceeded (2MB limit)");
    expect(capturedSignal?.aborted).toBe(true);
  });
});
