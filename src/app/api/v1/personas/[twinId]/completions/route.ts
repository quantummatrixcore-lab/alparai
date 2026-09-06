import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";
import { fetchWithSsrfGuard } from "@/lib/security/ssrf";
import { DIGITAL_TWINS, type DigitalTwinPersona } from "@/lib/agent-os/personas";
import { calculateAlignmentScore, selfHealResponse } from "@/lib/agent-os/alignment-engine";

interface CompletionRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function POST(req: Request, props: { params: Promise<{ twinId: string }> }) {
  try {
    const { twinId } = await props.params;

    // 1. Validate Twin ID
    const persona: DigitalTwinPersona | undefined = DIGITAL_TWINS[twinId];
    if (!persona) {
      return NextResponse.json(
        {
          error: {
            message: "Persona not found",
            type: "invalid_request_error",
            param: "twinId",
            code: "persona_not_found",
          },
        },
        { status: 404 },
      );
    }

    // 2. Extract Authorization Key
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: {
            message: "Missing or invalid authorization header",
            type: "authentication_error",
            param: null,
            code: "invalid_api_key",
          },
        },
        { status: 401 },
      );
    }
    const apiKey = authHeader.replace("Bearer ", "").trim();

    // 3. Validate API Key (Supabase with Mock fallback)
    const adminClient = createAdminClient();
    let isAuthorized = false;
    try {
      type ApiKeyQuery = {
        from(t: string): {
          select(s: string): {
            eq(
              c: string,
              v: string,
            ): {
              single(): Promise<{
                data: { id: string; status: string } | null;
                error: { code?: string } | null;
              }>;
            };
          };
        };
      };
      const { data: keyData, error: keyError } = await (adminClient as unknown as ApiKeyQuery)
        .from("api_keys")
        .select("id, status")
        .eq("key", apiKey)
        .single();

      if (keyError) {
        if (
          process.env.NODE_ENV === "test" &&
          (keyError.code === "42P01" || keyError.code === "PGRST116")
        ) {
          if (apiKey.startsWith("sk-") || apiKey === "alpar-test-key") {
            isAuthorized = true;
          }
        }
      } else if (keyData && keyData.status === "active") {
        isAuthorized = true;
      }
    } catch {
      if (
        process.env.NODE_ENV === "test" &&
        (apiKey.startsWith("sk-") || apiKey === "alpar-test-key")
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized API Key",
            type: "authentication_error",
            param: null,
            code: "invalid_api_key",
          },
        },
        { status: 401 },
      );
    }

    // 4. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rlKey = `${RATE_LIMIT_KEYS.api_developer}:${ip}`;
    const rlResult = await checkRateLimit(rlKey);
    if (!rlResult.ok) {
      return NextResponse.json(
        {
          error: {
            message: "Rate limit exceeded",
            type: "rate_limit_error",
            param: null,
            code: "rate_limit_exceeded",
          },
        },
        { status: 429, headers: { "Retry-After": rlResult.retryAfter?.toString() || "60" } },
      );
    }

    // 5. Parse Request Body
    const body: CompletionRequest = await req.json().catch(() => ({ messages: [] }));
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid request body: messages array is required",
            type: "invalid_request_error",
            param: "messages",
            code: "invalid_format",
          },
        },
        { status: 400 },
      );
    }

    // Extract the latest user query for alignment calculation
    const latestUserPrompt =
      body.messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .pop() || "";

    // 6. Prepend System Prompt
    const systemMessage = { role: "system", content: persona.systemPrompt };
    const messages = [systemMessage, ...body.messages];

    // 7. Make request to OpenRouter or fallback mock
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const fallbackModel = "google/gemini-2.5-flash";
    const targetModel = body.model || fallbackModel;

    let completionText = "";
    let promptTokens = 0;
    let completionTokens = 0;

    if (openRouterKey) {
      try {
        const orRes = await fetchWithSsrfGuard("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://alparai.com",
            "X-Title": "ALPAR AI",
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature: body.temperature ?? 0.7,
            max_tokens: body.max_tokens ?? 2000,
          }),
        });

        if (orRes.ok) {
          const orData = await orRes.json();
          completionText = orData.choices?.[0]?.message?.content || "";
          promptTokens = orData.usage?.prompt_tokens || messages.length * 10;
          completionTokens = orData.usage?.completion_tokens || completionText.length / 4;
        } else {
          const errText = await orRes.text();
          throw new Error(`OpenRouter returned ${orRes.status}: ${errText}`);
        }
      } catch (err) {
        logger.error("OpenRouter fetch failed", { twinId }, err instanceof Error ? err : undefined);
        completionText = "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
        promptTokens = messages.length * 10;
        completionTokens = 15;
      }
    } else {
      completionText = `${persona.name} olarak yanıtlıyorum: Göreviniz alınmış ve değerlendirilmiştir. [Mock Response]`;
      promptTokens = messages.length * 10;
      completionTokens = 20;
    }

    // 8. Digital Twin Alignment Engine Evaluation & Self-Healing
    let alignmentScore = calculateAlignmentScore(persona, latestUserPrompt, completionText);

    if (alignmentScore < 85) {
      logger.info("Persona Alignment score below threshold, triggering self-healing", {
        twinId,
        score: alignmentScore,
      });

      const healedText = await selfHealResponse(
        persona,
        latestUserPrompt,
        completionText,
        alignmentScore,
      );

      if (healedText && healedText.trim().length > 0) {
        completionText = healedText;
        alignmentScore = calculateAlignmentScore(persona, latestUserPrompt, completionText);
      }
    }

    // Update tokens after potential self-healing
    completionTokens = Math.max(completionTokens, completionText.length / 4);
    const totalTokens = Math.ceil(promptTokens + completionTokens);

    // 9. Log Usage (Vekilharçlık Kaydı)
    try {
      type RpcMethod = (fn: string, args: unknown) => Promise<{ error: unknown }>;
      const { error: rpcError } = await (adminClient.rpc as unknown as RpcMethod)(
        "increment_persona_usage",
        {
          p_twin_id: twinId,
          p_tokens: totalTokens,
        },
      );

      if (rpcError) {
        type InsertMethod = {
          from(t: string): { insert(d: unknown): Promise<{ error: unknown }> };
        };
        await (adminClient as unknown as InsertMethod).from("persona_usage_stats").insert({
          twin_id: twinId,
          tokens_used: totalTokens,
          request_count: 1,
          last_used_at: new Date().toISOString(),
        });
      }
    } catch (logErr) {
      logger.error(
        "Usage logging failed",
        { twinId, totalTokens },
        logErr instanceof Error ? logErr : undefined,
      );
    }

    // 10. Format and return OpenAI compatible response with alignment_score
    const responseId = `chatcmpl-${crypto.randomUUID()}`;
    const timestamp = Math.floor(Date.now() / 1000);

    return NextResponse.json({
      id: responseId,
      object: "chat.completion",
      created: timestamp,
      model: targetModel,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: completionText,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: Math.ceil(promptTokens),
        completion_tokens: Math.ceil(completionTokens),
        total_tokens: totalTokens,
      },
      alignment_score: alignmentScore,
    });
  } catch (error) {
    logger.error("Persona API Error", { error }, error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: {
          message: "Internal server error",
          type: "api_error",
          param: null,
          code: "internal_error",
        },
      },
      { status: 500 },
    );
  }
}
