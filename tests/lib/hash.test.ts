import { describe, it, expect, vi, afterEach } from "vitest";
import "../helpers/setup";
import {
  hashIp,
  requireIpSalt,
  generateProviderToken,
  verifyProviderToken,
} from "@/lib/utils/hash";

describe("hash utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses fallback if IP_SALT is missing in dev", () => {
    vi.stubEnv("IP_SALT", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(requireIpSalt()).toBe("fallback_default_salt_for_alparai_dev_123");
  });

  it("pads IP_SALT with 0 if it is shorter than 16 chars in dev", () => {
    vi.stubEnv("IP_SALT", "short");
    vi.stubEnv("NODE_ENV", "development");
    expect(requireIpSalt()).toBe("short00000000000");
  });

  it("throws error in production if IP_SALT is missing", () => {
    vi.stubEnv("IP_SALT", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(() => requireIpSalt()).toThrow(
      "CRITICAL SECURITY ERROR: IP_SALT environment variable is missing in production.",
    );
  });

  it("throws error in production if IP_SALT is shorter than 16 chars", () => {
    vi.stubEnv("IP_SALT", "short");
    vi.stubEnv("NODE_ENV", "production");
    expect(() => requireIpSalt()).toThrow(
      "CRITICAL SECURITY ERROR: IP_SALT environment variable must be at least 16 characters in production.",
    );
  });

  it("hashes IP successfully with salt", () => {
    process.env.IP_SALT = "long-salt-value-for-testing-12345";
    const hash1 = hashIp("192.168.1.1");
    const hash2 = hashIp("192.168.1.1");
    const hash3 = hashIp("192.168.1.2");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toHaveLength(64); // sha256 hex length
  });

  it("generates and verifies provider tokens statelessly", () => {
    process.env.IP_SALT = "long-salt-value-for-testing-12345";
    const incidentId = "550e8400-e29b-41d4-a716-446655440000";
    const email = "trust@openai.com";

    const token = generateProviderToken(incidentId, email);
    expect(token).toHaveLength(64);

    const isValid = verifyProviderToken(incidentId, email, token);
    expect(isValid).toBe(true);

    const isInvalidEmail = verifyProviderToken(incidentId, "other@openai.com", token);
    expect(isInvalidEmail).toBe(false);

    const isInvalidIncident = verifyProviderToken("other-incident-id", email, token);
    expect(isInvalidIncident).toBe(false);
  });
});
