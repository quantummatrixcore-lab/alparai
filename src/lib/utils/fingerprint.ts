import fpPromise from "@fingerprintjs/fingerprintjs";

export async function getFingerprint(): Promise<string> {
  try {
    const fp = await fpPromise.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error("Failed to load FingerprintJS", error);
    // Return a fallback anonymous ID or throw depending on strictness
    return "anonymous-" + crypto.randomUUID();
  }
}
