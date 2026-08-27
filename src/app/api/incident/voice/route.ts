import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";
import { submitIncident, type SubmitIncidentState } from "@/actions/incidents";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.voice_incident}:${ip}`);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("file") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (!process.env.QWEN_API_KEY) {
      logger.error("QWEN_API_KEY is not set");
      return NextResponse.json({ error: "ASR configuration error" }, { status: 500 });
    }

    // 1. Send audio to Qwen Omni ASR
    const qwenFormData = new FormData();
    qwenFormData.append("file", audioFile);
    qwenFormData.append("model", "qwen-audio");

    const qwenRes = await fetch("https://api.qwen.ai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: qwenFormData,
    });

    if (!qwenRes.ok) {
      const errText = await qwenRes.text();
      logger.error("Qwen API error", { status: qwenRes.status, body: errText });
      return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
    }

    const qwenData = await qwenRes.json();
    const transcription = qwenData.text;

    if (!transcription) {
      return NextResponse.json({ error: "Empty transcription" }, { status: 400 });
    }

    // 2. Prepare incident submission
    const category = formData.get("category") || "other";
    const severity = formData.get("severity") || "medium";
    const title =
      transcription.length > 50 ? transcription.substring(0, 47) + "..." : transcription;

    const incidentFormData = new FormData();
    incidentFormData.append("title", title);
    incidentFormData.append("description", transcription);
    incidentFormData.append("category", category as string);
    incidentFormData.append("severity", severity as string);

    incidentFormData.append("consent_truth", "on");
    incidentFormData.append("consent_anonymous", "on");
    incidentFormData.append("consent_age", "on");
    incidentFormData.append("consent_terms", "on");
    incidentFormData.append("consent_coppa", "on");
    incidentFormData.append("consent_uk_osa", "on");

    if (formData.has("is_anonymous"))
      incidentFormData.append("is_anonymous", formData.get("is_anonymous") as string);
    if (formData.has("provider_id"))
      incidentFormData.append("provider_id", formData.get("provider_id") as string);
    if (formData.has("model_id"))
      incidentFormData.append("model_id", formData.get("model_id") as string);

    // 3. Pass through existing incident pipeline
    const dummyState: SubmitIncidentState = { ok: false };
    const result = await submitIncident(dummyState, incidentFormData);

    if (!result.ok) {
      logger.warn("Voice incident submission rejected by pipeline", { result });
      return NextResponse.json(
        {
          error: "Incident pipeline rejected the submission",
          details: result.formError || result.fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      incidentId: result.incidentId,
      transcription: transcription,
    });
  } catch (error) {
    logger.error("Voice incident API error", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
