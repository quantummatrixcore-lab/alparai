import { describe, it, expect, beforeAll } from "vitest";
import { encryptAtRest, decryptAtRest } from "@/lib/security/vault";

beforeAll(() => {
  process.env.CRON_SECRET = "test-vault-secret-key-for-unit-tests";
});

describe("Vault Security Encryption at Rest", () => {
  it("encrypts plaintext and decrypts back to original string", () => {
    const plainKey = "sk-or-v1-dummy";
    const cipherText = encryptAtRest(plainKey);

    expect(cipherText).not.toBe(plainKey);
    expect(cipherText).toMatch(/^enc:v1:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);

    const decrypted = decryptAtRest(cipherText);
    expect(decrypted).toBe(plainKey);
  });

  it("handles empty or already encrypted strings gracefully", () => {
    expect(encryptAtRest("")).toBe("");
    const plainKey = "sk-test-123456789";
    const cipherText = encryptAtRest(plainKey);
    expect(encryptAtRest(cipherText)).toBe(cipherText); // Idempotent
  });

  it("returns fallback string on corrupted cipherText", () => {
    const badCipher = "enc:v1:corrupted:iv:data";
    expect(decryptAtRest(badCipher)).toBe("••••••••");
  });
});
