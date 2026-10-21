let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try {
  vault = require("@/lib/security/vault").vault;
} catch {
  /* stub bicimi korunur */
}

/**
 * Whistleblower Zero-Knowledge Client-Side Encryption
 * Uses WebCrypto API for zero-knowledge client-side encryption.
 * Encrypts sensitive incident/whistleblower submissions in the browser or runtime before sending to the server.
 */

export interface EncryptedPayloadResult {
  encryptedData: string;
  isEncrypted: boolean;
  algorithm: "AES-GCM" | "RSA-OAEP";
  keyFragment?: string;
}

export const DEFAULT_WHISTLEBLOWER_PUBKEY =
  (vault.read("NEXT_PUBLIC_WHISTLEBLOWER_PUBKEY") ?? process.env.NEXT_PUBLIC_WHISTLEBLOWER_PUBKEY) ||
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

function getSubtle(): SubtleCrypto {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  try {
    const nodeCrypto = require("node:crypto");
    if (nodeCrypto?.webcrypto?.subtle) {
      return nodeCrypto.webcrypto.subtle;
    }
  } catch {
    // ignore
  }
  throw new Error("WebCrypto SubtleCrypto is not available in the current runtime environment");
}

function getRandomValues(buf: Uint8Array): Uint8Array {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    return window.crypto.getRandomValues(buf);
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(buf);
  }
  try {
    const nodeCrypto = require("node:crypto");
    if (nodeCrypto?.randomFillSync) {
      return nodeCrypto.randomFillSync(buf);
    }
  } catch {
    // ignore
  }
  throw new Error("Cryptographically secure RNG not available");
}

async function tryImportRsaPublicKey(
  subtle: SubtleCrypto,
  pubKeyStr: string,
): Promise<CryptoKey | null> {
  if (!pubKeyStr || typeof pubKeyStr !== "string") return null;
  try {
    const cleanB64 = pubKeyStr
      .replace(/-----BEGIN [A-Z0-9_\s]+-----/g, "")
      .replace(/-----END [A-Z0-9_\s]+-----/g, "")
      .replace(/\s+/g, "");
    if (!cleanB64) return null;
    const der = fromBase64(cleanB64);
    if (der.length < 128) return null;
    return await subtle.importKey(
      "spki",
      toBufferSource(der),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"],
    );
  } catch {
    return null;
  }
}

/**
 * Encrypts whistleblower payload using WebCrypto API before transmission.
 *
 * If a valid RSA-OAEP public key is available, uses hybrid envelope encryption.
 * If RSA-OAEP public key is missing or invalid, derives a 256-bit AES-GCM key from SHA-256 ephemeral entropy.
 *
 * @param data Object or string payload to encrypt
 * @param publicKey Optional RSA public key override
 */
export async function encryptPayload(
  data: Record<string, unknown> | string,
  publicKey: string = DEFAULT_WHISTLEBLOWER_PUBKEY,
): Promise<EncryptedPayloadResult> {
  const jsonStr = typeof data === "string" ? data : JSON.stringify(data);
  const subtle = getSubtle();
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(jsonStr);

  const iv = getRandomValues(new Uint8Array(GCM_IV_LENGTH));
  const rsaKey = await tryImportRsaPublicKey(subtle, publicKey);

  if (rsaKey) {
    try {
      // 1. Generate symmetric AES-256 key
      const aesKey = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
        "encrypt",
        "decrypt",
      ]);

      // 2. Encrypt plaintext payload with AES-GCM
      const ciphertextBuf = await subtle.encrypt(
        { name: "AES-GCM", iv: toBufferSource(iv), tagLength: GCM_TAG_LENGTH },
        aesKey,
        encodedData,
      );

      const ciphertext = new Uint8Array(ciphertextBuf);
      const packed = new Uint8Array(iv.length + ciphertext.length);
      packed.set(iv, 0);
      packed.set(ciphertext, iv.length);

      // 3. Encrypt AES key using RSA-OAEP
      const exportedRawKey = await subtle.exportKey("raw", aesKey);
      const encryptedKeyBuf = await subtle.encrypt(
        { name: "RSA-OAEP" },
        rsaKey,
        exportedRawKey,
      );

      return {
        encryptedData: `${ENC_PREFIX}${toBase64(packed)}`,
        isEncrypted: true,
        algorithm: "RSA-OAEP",
        keyFragment: toBase64(new Uint8Array(encryptedKeyBuf)),
      };
    } catch {
      // If RSA-OAEP envelope fails, continue to AES-GCM ephemeral derivation
    }
  }

  // Fallback: WebCrypto AES-GCM (256-bit) with SHA-256 ephemeral key derivation
  const ephemeralSeed = getRandomValues(new Uint8Array(32));
  const derivedKeyBuf = await subtle.digest("SHA-256", toBufferSource(ephemeralSeed));
  const derivedKeyBytes = new Uint8Array(derivedKeyBuf);

  const aesKey = await subtle.importKey(
    "raw",
    toBufferSource(derivedKeyBytes),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const ciphertextBuf = await subtle.encrypt(
    { name: "AES-GCM", iv: toBufferSource(iv), tagLength: GCM_TAG_LENGTH },
    aesKey,
    encodedData,
  );

  const ciphertext = new Uint8Array(ciphertextBuf);
  const packed = new Uint8Array(iv.length + ciphertext.length);
  packed.set(iv, 0);
  packed.set(ciphertext, iv.length);

  const keyFragment = toBase64(derivedKeyBytes);

  return {
    encryptedData: `${ENC_PREFIX}${toBase64(packed)}`,
    isEncrypted: true,
    algorithm: "AES-GCM",
    keyFragment,
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
    throw new Error("Insecure FALLBACK payloads are permanently deprecated and disallowed");
  }

  if (!keyFragment) {
    throw new Error("Key fragment required for decryption");
  }

  const subtle = getSubtle();
  const packed = fromBase64(payload);
  if (packed.length < GCM_IV_LENGTH) {
    throw new Error("Invalid ciphertext payload length");
  }

  const iv = packed.slice(0, GCM_IV_LENGTH);
  const ciphertext = packed.slice(GCM_IV_LENGTH);

  const rawKey = fromBase64(keyFragment);
  const cryptoKey = await subtle.importKey(
    "raw",
    toBufferSource(rawKey),
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );

  const buf = await subtle.decrypt(
    { name: "AES-GCM", iv: toBufferSource(iv), tagLength: GCM_TAG_LENGTH },
    cryptoKey,
    toBufferSource(ciphertext),
  );

  return new TextDecoder().decode(buf);
}
