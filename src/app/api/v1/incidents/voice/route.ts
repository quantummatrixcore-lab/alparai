import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { timingSafeEqual } from "crypto";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { maskPII } from "@/lib/pii/guardian";
import { transcribeAudioBlob } from "@/actions/voice-incidents";
import { submitIncident, type SubmitIncidentState } from "@/actions/incidents";
import { z } from "zod";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

// Maximum audio file size limit: 25MB
const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;

// Allowed Audio MIME types across mobile & desktop devices
const ALLOWED_MIME_TYPES = new Set([
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
  "audio/flac",
  "application/octet-stream",
]);

const jsonVoicePayloadSchema = z.object({
  audio_base64: z.string().min(1, "audio_base64 is required"),
  mime_type: z.string().optional().default("audio/webm"),
  locale: z.string().optional().default("tr"),
  category: z.string().optional().default("other"),
  severity: z.string().optional().default("medium"),
  provider_id: z.string().optional(),
  model_id: z.string().optional(),
  is_anonymous: z.boolean().optional().default(true),
  auto_submit: z.boolean().optional().default(true),
});

/**
 * POST /api/v1/incidents/voice
 * Voice Incident Reporting API Endpoint (113 languages ASR ready).
 * Accepts multipart/form-data with 'audio' or 'file', or application/json with 'audio_base64'.
 */
export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.incident_submission}:${ip}`);
    if (!rl.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: rl.retryAfter,
        },
        { status: 429 },
      );
    }

    // 2. Optional API Key Authentication
    const apiKey = request.headers.get("x-api-key");
    const validKey = process.env.PUBLIC_API_KEY;
    if (apiKey && validKey && !safeCompare(apiKey, validKey)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid API key" },
        { status: 401 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let audioBuffer: Buffer;
    let mimeType = "audio/webm";
    let locale = "tr";
    let category = "other";
    let severity = "medium";
    let providerId: string | undefined;
    let modelId: string | undefined;
    let isAnonymous = true;
    let autoSubmit = true;

    // 3. Process Payload: multipart/form-data vs application/json
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const audioFile = (formData.get("audio") || formData.get("file")) as File | null;

      if (!audioFile || !(audioFile instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing audio file. Expected 'audio' or 'file' in multipart/form-data.",
          },
          { status: 400 },
        );
      }

      if (audioFile.size === 0) {
        return NextResponse.json({ success: false, error: "Audio file is empty" }, { status: 400 });
      }

      if (audioFile.size > MAX_AUDIO_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: "Audio file exceeds maximum size limit of 25MB" },
          { status: 413 },
        );
      }

      if (audioFile.type && !ALLOWED_MIME_TYPES.has(audioFile.type.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: `Unsupported audio MIME type: ${audioFile.type}` },
          { status: 400 },
        );
      }

      mimeType = audioFile.type || "audio/webm";
      const arrayBuffer = await audioFile.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);

      locale = formData.get("locale")?.toString() || "tr";
      category = formData.get("category")?.toString() || "other";
      severity = formData.get("severity")?.toString() || "medium";
      providerId = formData.get("provider_id")?.toString();
      modelId = formData.get("model_id")?.toString();
      if (formData.has("is_anonymous")) {
        isAnonymous = formData.get("is_anonymous") !== "false";
      }
      if (formData.has("auto_submit")) {
        autoSubmit = formData.get("auto_submit") !== "false";
      }
    } else if (contentType.includes("application/json")) {
      const bodyJson = await request.json();
      const parsed = jsonVoicePayloadSchema.safeParse(bodyJson);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON payload", details: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const { audio_base64 } = parsed.data;
      audioBuffer = Buffer.from(audio_base64, "base64");
      if (audioBuffer.byteLength === 0) {
        return NextResponse.json(
          { success: false, error: "Audio base64 payload is empty" },
          { status: 400 },
        );
      }

      if (audioBuffer.byteLength > MAX_AUDIO_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: "Audio file exceeds maximum size limit of 25MB" },
          { status: 413 },
        );
      }

      mimeType = parsed.data.mime_type;
      locale = parsed.data.locale;
      category = parsed.data.category;
      severity = parsed.data.severity;
      providerId = parsed.data.provider_id;
      modelId = parsed.data.model_id;
      isAnonymous = parsed.data.is_anonymous;
      autoSubmit = parsed.data.auto_submit;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported Content-Type. Use multipart/form-data or application/json",
        },
        { status: 400 },
      );
    }

    // 4. Multi-Language ASR Speech-To-Text (113 languages ready)
    const { transcript, detectedLanguage, confidence, durationSeconds } = await transcribeAudioBlob(
      audioBuffer,
      mimeType,
      locale,
    );

    // 5. PII Guardian Masking
    const piiResult = maskPII(transcript);
    const sanitizedTranscript = piiResult.masked;

    let incidentId: string | undefined;

    // 6. Optional Incident Creation in Core Pipeline
    if (autoSubmit && sanitizedTranscript.length >= 8) {
      const incidentFormData = new FormData();
      const titleText =
        sanitizedTranscript.length > 50
          ? sanitizedTranscript.slice(0, 47) + "..."
          : sanitizedTranscript;

      incidentFormData.append("title", titleText);
      incidentFormData.append("description", sanitizedTranscript);
      incidentFormData.append("category", category);
      incidentFormData.append("severity", severity);
      incidentFormData.append("consent_truth", "on");
      incidentFormData.append("consent_anonymous", "on");
      incidentFormData.append("consent_age", "on");
      incidentFormData.append("consent_terms", "on");
      incidentFormData.append("consent_coppa", "on");
      incidentFormData.append("consent_uk_osa", "on");
      incidentFormData.append("is_anonymous", isAnonymous ? "true" : "false");

      if (providerId) incidentFormData.append("provider_id", providerId);
      if (modelId) incidentFormData.append("model_id", modelId);

      const dummyState: SubmitIncidentState = { ok: false };
      const subResult = await submitIncident(dummyState, incidentFormData);
      if (subResult.ok) {
        incidentId = subResult.incidentId;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          incident_id: incidentId || null,
          transcription: sanitizedTranscript,
          detected_language: detectedLanguage,
          languages_supported_count: 113,
          confidence,
          duration_seconds: durationSeconds,
          asr_engine: "qwen-omni-asr-113lang",
          pii_masked: true,
          pii_categories_redacted: piiResult.detections.map((d) => d.type),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal voice incident API error",
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/v1/incidents/voice
 * Preflight handler for cross-origin requests.
 */
export async function OPTIONS(_request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
    },
  });
}
