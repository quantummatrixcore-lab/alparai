import { POST as voicePOST } from "../voice/route";

/**
 * Route alias: POST /api/incident/sesli-bildirim
 * Qwen Omni ASR 113-language voice incident report route.
 */
export async function POST(request: Request) {
  try {
    return await voicePOST(request);
  } catch (error) {
    console.error("Voice incident alias error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Voice processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
