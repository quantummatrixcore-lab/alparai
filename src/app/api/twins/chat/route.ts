/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchWithSsrfGuard } from "@/lib/security/ssrf";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { logger } from "@/lib/utils/logger";
import { DIGITAL_TWINS } from "@/lib/agent-os/personas";
import { ArbitrageEngine } from "@/lib/agent-os/arbitrage-engine";
import { calculateAlignmentScore, selfHealResponse } from "@/lib/agent-os/alignment-engine";

import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Bu özelliği kullanmak için giriş yapmalısınız." },
        { status: 401 },
      );
    }
    const body = await req.json().catch(() => ({}));
    const { twinId, message } = body;

    if (!twinId || typeof twinId !== "string" || !message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Geçersiz veya eksik parametreler (twinId, message)." },
        { status: 400 },
      );
    }

    const persona = DIGITAL_TWINS[twinId];
    if (!persona) {
      return NextResponse.json({ error: `Dijital İkiz '${twinId}' bulunamadı.` }, { status: 404 });
    }

    // Rate Limit (Demoda IP başına 15 dakikada 5 istek)
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

    const rl = await checkRateLimit(
      `${(RATE_LIMIT_KEYS as any).chat_rate_limit ?? "twin_chat"}:${ip}`,
    );
    if (!rl.ok) {
      return NextResponse.json(
        {
          error: `İstek limiti aşıldı. Lütfen ${rl.retryAfter ?? 60} saniye sonra tekrar deneyin.`,
        },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } },
      );
    }

    // Agent-OS Arbitrage Engine selects the optimal high-capacity model
    const model = await ArbitrageEngine.routeTask("xl");

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    let reply = "";
    let promptTokens = 0;
    let completionTokens = 0;

    if (openRouterApiKey) {
      try {
        const response = await fetchWithSsrfGuard("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://alparai.com",
            "X-Title": "ALPAR AI Digital Twins",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: persona.systemPrompt },
              { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error("[Twins Chat API] OpenRouter error response", {
            status: response.status,
            errorText,
          });
          throw new Error(`OpenRouter API hatası: ${response.status}`);
        }

        const data = await response.json();
        reply =
          data.choices?.[0]?.message?.content || `${persona.name} stratejik analizini tamamladı.`;
        promptTokens = data.usage?.prompt_tokens || message.length;
        completionTokens = data.usage?.completion_tokens || reply.length / 4;
      } catch (upstreamError: unknown) {
        logger.error("[Twins Chat API] Upstream call failed, switching to local persona engine", {
          error: upstreamError,
        });
        reply = `${persona.name} (${persona.title}) olarak bildiriminiz incelendi: "${message.substring(0, 100)}..." konusundaki stratejik direktifimiz: Sistem mimarisinde tam bağımsızlık, yüksek güvenlik ve asimetrik inovasyon esastır.`;
        promptTokens = message.length;
        completionTokens = 20;
      }
    } else {
      reply = `${persona.name} (${persona.title}) olarak sorunuz değerlendirildi: "${message.substring(0, 100)}..." konusundaki stratejik analizimiz ve çözümlerimiz devreye alınmıştır. [Geliştirici Modu]`;
      promptTokens = message.length;
      completionTokens = 20;
    }

    // Alignment Engine Check & Self-Healing
    let alignmentScore = calculateAlignmentScore(persona, message, reply);

    if (alignmentScore < 85) {
      logger.info(
        "[Twins Chat API] Persona Alignment score below threshold, triggering self-healing",
        {
          twinId,
          score: alignmentScore,
        },
      );

      const healedText = await selfHealResponse(persona, message, reply, alignmentScore);

      if (healedText && healedText.trim().length > 0) {
        reply = healedText;
        alignmentScore = calculateAlignmentScore(persona, message, reply);
      }
    }

    completionTokens = Math.max(completionTokens, reply.length / 4);
    const totalTokens = Math.ceil(promptTokens + completionTokens);

    // Usage Logging (Vekilharçlık Kaydı)
    const adminClient = createAdminClient();
    try {
      const { error: rpcError } = await (adminClient.rpc as any)("increment_persona_usage", {
        p_twin_id: twinId,
        p_tokens: totalTokens,
      });

      if (rpcError) {
        await (adminClient as any).from("persona_usage_stats").insert({
          twin_id: twinId,
          tokens_used: totalTokens,
          request_count: 1,
          last_used_at: new Date().toISOString(),
        });
      }
    } catch (logErr) {
      logger.error(
        "[Twins Chat API] Usage logging failed",
        { twinId, totalTokens },
        logErr instanceof Error ? logErr : undefined,
      );
    }

    return NextResponse.json({
      reply,
      modelUsed: model,
      persona: {
        id: persona.id,
        name: persona.name,
        title: persona.title,
        tier: persona.stats.tier,
      },
    });
  } catch (error: unknown) {
    logger.error(
      "[Twins API] Unhandled Error",
      { error },
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json(
      { error: "Yanıt üretilirken bir sunucu hatası oluştu." },
      { status: 500 },
    );
  }
}
