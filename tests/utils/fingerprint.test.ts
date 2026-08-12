import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { getFingerprint } from "@/lib/utils/fingerprint";

vi.mock("@fingerprintjs/fingerprintjs", () => ({
  default: {
    load: vi.fn().mockRejectedValue(new Error("Network Error")),
  },
}));

describe("getFingerprint fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a fallback anonymous UUID on failure", async () => {
    const res = await getFingerprint();
    expect(res.startsWith("anonymous-")).toBe(true);

    // Check if the part after "anonymous-" is a valid UUID
    const uuidPart = res.replace("anonymous-", "");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(uuidPart)).toBe(true);
  });
});
