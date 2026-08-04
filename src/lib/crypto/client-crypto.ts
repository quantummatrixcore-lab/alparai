/**
 * Client-side AES-GCM encryption helper for zero-knowledge submissions
 * (whistleblower / sensitive content).
 *
 * Design:
 * - A random 256-bit AES-GCM key is generated in the browser via `crypto.subtle`.
 * - The key NEVER leaves the browser in any form (exported only in raw bytes
 *   for the user to copy/persist — wrap in a `key:` URL fragment which the
 *   server never receives).
 * - The ciphertext + IV are base64-encoded and sent to the server along with
 *   the submission. The server stores opaque ciphertext only.
 * - Decryption requires the user to supply the key later (moderation workflow).
 */

const SUBTLE = globalThis.crypto?.subtle ?? null;

const ENC_PREFIX = "WGCM$";
const KEY_VERSION = "v1";
const GCM_IV_LENGTH = 12;
const GCM_TAG_LENGTH = 128;

export interface EncryptedPayload {
  /** Tolerable to send to the server — opaque base64 payload. */
  ciphertext: string;
  /** Returned to the user in a `key:v1:base64` URI fragment — never to server. */
  keyFragment: string;
}

if (!SUBTLE) {
  throw new Error(
    "Web Crypto SubtleCrypto is not available in this environment. " +
      "HTTPS + secure context is required for client-side encryption.",
  );
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Convert a generic `Uint8Array<ArrayBufferLike>` into a guaranteed
 * `Uint8Array<ArrayBuffer>` view that the strict TS lib.dom bindings
 * for SubtleCrypto accept. `slice()` returns a fresh view backed by a
 * new ArrayBuffer (never SharedArrayBuffer), which satisfies
 * `BufferSource` / `ArrayBufferView<ArrayBuffer>`.
 */
function toBufferSource(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return bytes.slice() as Uint8Array<ArrayBuffer>;
}

async function generateAesGcmKey(): Promise<CryptoKey> {
  return SUBTLE!.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

async function exportRawKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = await SUBTLE!.exportKey("raw", key);
  return new Uint8Array(raw);
}

async function importRawKey(raw: Uint8Array): Promise<CryptoKey> {
  return SUBTLE!.importKey("raw", toBufferSource(raw), { name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Encrypt a UTF-8 plaintext with a freshly generated AES-GCM key.
 * Returns the opaque payload plus the user-facing key fragment.
 */
export async function encryptZeroKnowledge(plaintext: string): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const key = await generateAesGcmKey();
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH));
  const ciphertextBuf = await SUBTLE!.encrypt(
    { name: "AES-GCM", iv: toBufferSource(iv), tagLength: GCM_TAG_LENGTH },
    key,
    encoder.encode(plaintext),
  );
  const ciphertext = new Uint8Array(ciphertextBuf);
  // Pack IV + ciphertext into a single opaque blob
  const packed = new Uint8Array(iv.length + ciphertext.length);
  packed.set(iv, 0);
  packed.set(ciphertext, iv.length);
  const rawKey = await exportRawKey(key);
  return {
    ciphertext: ENC_PREFIX + toBase64(packed),
    keyFragment: `${KEY_VERSION}:${toBase64(rawKey)}`,
  };
}

/**
 * Decrypt a payload previously produced by `encryptZeroKnowledge`,
 * using the user-supplied key fragment (`v1:base64`).
 */
export async function decryptZeroKnowledge(
  ciphertextStr: string,
  keyFragment: string,
): Promise<string> {
  if (!ciphertextStr.startsWith(ENC_PREFIX)) {
    throw new Error("Invalid payload format. Expected WGCM$ prefix.");
  }
  const packed = fromBase64(ciphertextStr.slice(ENC_PREFIX.length));
  if (packed.length < GCM_IV_LENGTH + 1) {
    throw new Error("Truncated encrypted payload.");
  }
  const iv = packed.slice(0, GCM_IV_LENGTH);
  const ciphertext = packed.slice(GCM_IV_LENGTH);

  const [version, keyB64] = keyFragment.split(":");
  if (version !== KEY_VERSION || !keyB64) {
    throw new Error("Invalid key fragment. Expected format `v1:base64`.");
  }
  const rawKey = fromBase64(keyB64);
  const key = await importRawKey(rawKey);

  const buf = await SUBTLE!.decrypt(
    { name: "AES-GCM", iv: toBufferSource(iv), tagLength: GCM_TAG_LENGTH },
    key,
    toBufferSource(ciphertext),
  );
  return new TextDecoder().decode(buf);
}

export const ENCRYPTION_PREFIX = ENC_PREFIX;
