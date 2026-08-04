import { describe, it, expect } from "vitest";

// Node's Web Crypto API helper functions matching the SubtleCrypto design
async function encryptEvidence(plainText: string) {
  const crypto = globalThis.crypto;
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoded);

  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const keyHex = Array.from(new Uint8Array(exportedKey))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Convert combined buffer to base64
  const combinedBase64 = Buffer.from(combined).toString("base64");

  return {
    ciphertext: combinedBase64,
    keyHex: keyHex,
  };
}

async function decryptEvidence(combinedBase64: string, keyHex: string) {
  const crypto = globalThis.crypto;
  const combined = new Uint8Array(Buffer.from(combinedBase64, "base64"));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const keyBuffer = new Uint8Array(keyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const key = await crypto.subtle.importKey("raw", keyBuffer, "AES-GCM", true, ["decrypt"]);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);

  return new TextDecoder().decode(decrypted);
}

describe("Zero-Knowledge AES-256-GCM Round-Trip", () => {
  it("should encrypt and decrypt correctly", async () => {
    const originalText = "This is highly sensitive evidence showing AI system failure.";

    // Encrypt
    const { ciphertext, keyHex } = await encryptEvidence(originalText);
    expect(ciphertext).toBeDefined();
    expect(keyHex).toHaveLength(64); // 256 bits = 32 bytes = 64 hex characters

    // Decrypt
    const decryptedText = await decryptEvidence(ciphertext, keyHex);
    expect(decryptedText).toBe(originalText);
  });

  it("should fail to decrypt with an incorrect key", async () => {
    const originalText = "Sensitive data.";
    const { ciphertext, keyHex } = await encryptEvidence(originalText);

    // Corrupt the key (change the last character)
    const badKey = keyHex.substring(0, 63) + (keyHex[63] === "a" ? "b" : "a");

    await expect(decryptEvidence(ciphertext, badKey)).rejects.toThrow();
  });
});
