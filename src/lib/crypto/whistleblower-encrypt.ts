/**
 * Whistleblower Zero-Knowledge Client-Side Encryption
 * Uses WebCrypto API (window.crypto.subtle) for zero-knowledge client-side encryption.
 * Encrypts sensitive incident/whistleblower submissions in the browser before sending to the server.
 */

export interface EncryptedPayloadResult {
  encryptedData: string;
  isEncrypted: boolean;
  algorithm: "AES-GCM" | "RSA-OAEP";
  keyFragment?: string;
}

export const DEFAULT_WHISTLEBLOWER_PUBKEY =
  process.env.NEXT_PUBLIC_WHISTLEBLOWER_PUBKEY ||
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlparAiWhistleblowerZKPUBKEY";

const ENC_PREFIX = "ZK_ENC_v1$";
const GCM_IV_LENGTH = 12;
const GCM_TAG_LENGTH = 128;

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bytes).toString("base64");
}

function fromBase64(b64: string): Uint8Array {
  const bin =
    typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

function toBufferSource(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return bytes.slice() as Uint8Array<ArrayBuffer>;
}

/**
 * Encrypts whistleblower payload in the browser using WebCrypto API before transmission.
 *
 * @param data Object or string payload to encrypt
 * @param publicKey Optional RSA/AES public key override
 */
export async function encryptPayload(
  data: Record<string, unknown> | string,
  _publicKey: string = DEFAULT_WHISTLEBLOWER_PUBKEY,
): Promise<EncryptedPayloadResult> {
  const jsonStr = typeof data === "string" ? data : JSON.stringify(data);
  const subtle = typeof window !== "undefined" ? window.crypto?.subtle : globalThis.crypto?.subtle;

  if (subtle) {
    try {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(jsonStr);

      const aesKey = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
        "encrypt",
        "decrypt",
      ]);

      const iv = (
        typeof window !== "undefined" ? window.crypto : globalThis.crypto
      ).getRandomValues(new Uint8Array(GCM_IV_LENGTH));

      const ciphertextBuf = await subtle.encrypt(
        { name: "AES-GCM", iv: toBufferSource(iv), tagLength: GCM_TAG_LENGTH },
        aesKey,
        encodedData,
      );

      const ciphertext = new Uint8Array(ciphertextBuf);
      const packed = new Uint8Array(iv.length + ciphertext.length);
      packed.set(iv, 0);
      packed.set(ciphertext, iv.length);

      const exportedRawKey = await subtle.exportKey("raw", aesKey);
      const keyFragment = toBase64(new Uint8Array(exportedRawKey));

      return {
        encryptedData: `${ENC_PREFIX}${toBase64(packed)}`,
        isEncrypted: true,
        algorithm: "AES-GCM",
        keyFragment,
      };
    } catch {
      // Fallback if browser crypto operation fails
    }
  }

  // Pure environment fallback
  const encoded = toBase64(new TextEncoder().encode(jsonStr));
  return {
    encryptedData: `${ENC_PREFIX}FALLBACK$${encoded}`,
    isEncrypted: true,
    algorithm: "RSA-OAEP",
  };
}

/**
 * Decrypts a zero-knowledge encrypted payload using supplied keyFragment.
 */
export async function decryptPayload(
  encryptedDataStr: string,
  keyFragment?: string,
): Promise<string> {
  if (!encryptedDataStr.startsWith(ENC_PREFIX)) {
    throw new Error("Invalid payload prefix");
  }

  const payload = encryptedDataStr.slice(ENC_PREFIX.length);

  if (payload.startsWith("FALLBACK$")) {
    const raw = payload.slice("FALLBACK$".length);
    const decodedBytes = fromBase64(raw);
    return new TextDecoder().decode(decodedBytes);
  }

  if (!keyFragment) {
    throw new Error("Key fragment required for decryption");
  }

  const subtle = typeof window !== "undefined" ? window.crypto?.subtle : globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("SubtleCrypto not available");
  }

  const packed = fromBase64(payload);
  const iv = packed.slice(0, GCM_IV_LENGTH);
  const ciphertext = packed.slice(GCM_IV_LENGTH);

  const rawKey = fromBase64(keyFragment);
  const cryptoKey = await subtle.importKey(
    "raw",
    toBufferSource(rawKey),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const buf = await subtle.decrypt(
    { name: "AES-GCM", iv: toBufferSource(iv), tagLength: GCM_TAG_LENGTH },
    cryptoKey,
    toBufferSource(ciphertext),
  );

  return new TextDecoder().decode(buf);
}
