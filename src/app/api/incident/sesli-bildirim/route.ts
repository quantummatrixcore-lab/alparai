import { POST as voicePOST } from "../voice/route";

/**
 * Route alias: POST /api/incident/sesli-bildirim
 * Qwen Omni ASR 113-language voice incident report route.
 */
export async function POST(request: Request) {
  return voicePOST(request);
}
