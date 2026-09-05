import { NextResponse } from "next/server";
import { getHybridMultimodalModel } from "@/lib/ai/openrouter-gateway";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (_err) {
      return NextResponse.json({ error: "Invalid multipart/form-data payload or missing audio" }, { status: 400 });
    }
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (openRouterApiKey) {
      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = audioFile.type || "audio/webm";

        const hybridModel = getHybridMultimodalModel();
        let targetModel = hybridModel.primary;

        const buildPayload = (model: string) =>
          JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Audio transcription request: Please transcribe the speech in this audio file accurately in Turkish or English depending on language spoken. Output ONLY the transcription text, nothing else.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64Audio}`,
                    },
                  },
                ],
              },
            ],
          });

        let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
          },
          body: buildPayload(targetModel),
        });

        // Fallback to secondary model if primary fails or hits rate limit
        if (!response.ok && hybridModel.fallback) {
          targetModel = hybridModel.fallback;
          response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openRouterApiKey}`,
              "Content-Type": "application/json",
            },
            body: buildPayload(targetModel),
          });
        }

        if (response.ok) {
          const data = await response.json();
          const transcript = data.choices?.[0]?.message?.content?.trim();
          if (transcript) {
            return NextResponse.json({ transcript });
          }
        }
      } catch (err) {
        console.error("OpenRouter transcribe error:", err);
      }
    }

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "Transcription service is not configured (missing API key)" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Voice transcription service failed to process audio" },
      { status: 503 },
    );
  } catch (error) {
    console.error("Transcribe API error:", error);
    return NextResponse.json(
      { error: "Voice transcription service failed to process audio" },
      { status: 503 },
    );
  }
}
