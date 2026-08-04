import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.VAULT_ENCRYPTION_KEY || process.env.CRON_SECRET;
  if (!secret) {
    throw new Error("VAULT_ENCRYPTION_KEY env var is required for vault encryption");
  }
  return scryptSync(secret, "alpar-salt-vault-v1", 32);
}

/**
 * Encrypts a sensitive string (e.g. AI Provider API key) using AES-256-GCM.
 */
export function encryptAtRest(plainText: string): string {
  if (!plainText) return plainText;
  if (plainText.startsWith("enc:v1:")) return plainText; // Already encrypted

  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `enc:v1:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 */
export function decryptAtRest(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith("enc:v1:")) return cipherText;

  try {
    const key = getKey();
    const parts = cipherText.split(":");
    if (parts.length !== 5) return cipherText;

    const iv = Buffer.from(parts[2]!, "hex");
    const authTag = Buffer.from(parts[3]!, "hex");
    const encryptedText = parts[4]!;

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    return "••••••••";
  }
}
