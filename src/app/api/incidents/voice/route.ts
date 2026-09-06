import { NextResponse } from "next/server";
import { z } from "zod";
import { maskPII } from "@/lib/pii/guardian";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

/**
 * Zod Schema for voice incident request metadata parameters
 */
export const voiceIncidentMetadataSchema = z.object({
  locale: z.string().optional().default("tr"),
  incidentContext: z.string().max(500).optional(),
});

/**
 * Zod Schema for Qwen Omni ASR transcription response payload
 */
export const voiceTranscriptionResultSchema = z.object({
  transcript: z.string(),
  durationSeconds: z.number().optional(),
  confidence: z.number().optional(),
  language: z.string().optional(),
  model: z.string(),
});

export type VoiceTranscriptionResult = z.infer<typeof voiceTranscriptionResultSchema>;

// Allowed audio MIME types (including m4a, webm, mp3, wav, ogg, etc.)
const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/webm",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
  "application/octet-stream",
]);

// Maximum file size: 25 MB
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

/**
 * Type-safe Qwen Omni ASR transcription adapter logic.
 * Routes audio file and metadata to Qwen Omni ASR backend service expecting QWEN_API_KEY.
 */
export async function transcribeAudio(
  file: File,
  options?: z.infer<typeof voiceIncidentMetadataSchema>,
): Promise<VoiceTranscriptionResult> {
  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    throw new Error("Empty audio file buffer provided");
  }

  const apiKey = process.env.QWEN_API_KEY;
  let rawTranscript = "";
  let confidence = 0.98;

  if (apiKey) {
    try {
      // Qwen Omni ASR / DashScope API invocation payload
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");
      const response = await fetch(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen-omni-turbo",
            input: {
              messages: [
                {
                  role: "user",
                  content: [
                    { audio: `data:${file.type || "audio/m4a"};base64,${base64Audio}` },
                    { text: "Transcribe this voice incident report accurately into Turkish." },
                  ],
                },
              ],
            },
          }),
        },
      );

      if (response.ok) {
        const json = (await response.json()) as {
          output?: { choices?: Array<{ message?: { content?: Array<{ text?: string }> } }> };
        };
        const textOutput = json.output?.choices?.[0]?.message?.content?.[0]?.text;
        if (textOutput) {
          rawTranscript = textOutput;
          confidence = 0.99;
        }
      }
    } catch (err) {
      console.error("[Qwen Omni ASR] Fetch Exception:", err);
    }
  }

  if (!rawTranscript) {
    throw new Error("Voice transcription failed or service is unavailable");
  }

  // Pass transcribed text through PII Guardian to ensure server-side data sanitization
  const piiSanitized = maskPII(rawTranscript);

  const result: VoiceTranscriptionResult = {
    transcript: piiSanitized.masked,
    durationSeconds: Math.max(1, Math.round(file.size / 16000)),
    confidence,
    language: options?.locale || "tr",
    model: "qwen-omni-asr-v1",
  };

  return voiceTranscriptionResultSchema.parse(result);
}

/**
 * POST /api/incidents/voice
 * Expects multipart/form-data with 'audio' or 'file' field (e.g., .m4a format).
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.voice_incident}:${ip}`);
    if (!rl.ok) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Content-Type. Expected multipart/form-data",
        },
        { status: 400 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (_err) {
      return NextResponse.json(
        { success: false, error: "Invalid multipart/form-data payload" },
        { status: 400 },
      );
    }

    const audioFile = (formData.get("audio") || formData.get("file")) as File | null;

    if (!audioFile || typeof audioFile === "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing audio file. Provide 'audio' or 'file' in multipart/form-data payload",
        },
        { status: 400 },
      );
    }

    if (audioFile.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Audio file is empty",
        },
        { status: 400 },
      );
    }

    if (audioFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Audio file exceeds maximum size limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
        },
        { status: 400 },
      );
    }

    if (audioFile.type && !ALLOWED_AUDIO_MIME_TYPES.has(audioFile.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported audio mime type: ${audioFile.type}. Supported: audio/m4a, audio/mp3, audio/webm, audio/wav, audio/ogg, audio/aac`,
        },
        { status: 400 },
      );
    }

    const rawMetadata = {
      locale: formData.get("locale")?.toString(),
      incidentContext: formData.get("incidentContext")?.toString(),
    };

    const metadataParse = voiceIncidentMetadataSchema.safeParse(rawMetadata);
    if (!metadataParse.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid metadata parameters",
          details: metadataParse.error.flatten(),
        },
        { status: 400 },
      );
    }

    const transcription = await transcribeAudio(audioFile, metadataParse.data);

    return NextResponse.json(
      {
        success: true,
        data: transcription,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Qwen Omni ASR Route Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error during audio transcription",
      },
      { status: 503 },
    );
  }
}
