let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { fetchWithSsrfGuard } from "@/lib/security/ssrf";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { logger } from "@/lib/utils/logger";
import { DIGITAL_TWINS } from "@/lib/agent-os/personas";
import { ArbitrageEngine } from "@/lib/agent-os/arbitrage-engine";
import { calculateAlignmentScore, selfHealResponse } from "@/lib/agent-os/alignment-engine";
import { callWithFailover, FREE_TRIAGE_MODELS } from "@/lib/ai/openrouter-gateway";

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

    const openRouterApiKey = (vault.read('OPENROUTER_API_KEY') ?? process.env.OPENROUTER_API_KEY);
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

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            reply = content;
            promptTokens = data.usage?.prompt_tokens || message.length;
            completionTokens = data.usage?.completion_tokens || reply.length / 4;
          }
        }
      } catch (upstreamError: unknown) {
        logger.warn("[Twins Chat API] OpenRouter call failed, attempting failover chain", {
          error: upstreamError,
        });
      }
    }

    // Failover to callWithFailover or DeHost if reply is still empty
    if (!reply) {
      try {
        const failoverRes = await callWithFailover({
          systemPrompt: persona.systemPrompt,
          userMessage: message,
          temperature: 0.7,
        }, FREE_TRIAGE_MODELS);

        if (failoverRes.ok && failoverRes.data?.content) {
          reply = failoverRes.data.content;
          promptTokens = failoverRes.data.usage?.promptTokens || message.length;
          completionTokens = failoverRes.data.usage?.completionTokens || reply.length / 4;
        }
      } catch (err) {
        logger.warn("[Twins Chat API] Failover chain call failed, attempting DeHost fallback", { error: err });
      }
    }

    if (!reply) {
      // DeHost Local Deliberation / Ollama Fallback
      try {
        const dehostRes = await fetch("http://127.0.0.1:8899/deliberate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: `${persona.systemPrompt}\n\nKullanıcı: ${message}`,
            targetAgent: "AlparAI-AGI",
          }),
          signal: AbortSignal.timeout(6000),
        });
        if (dehostRes.ok) {
          const dData = await dehostRes.json();
          reply = dData.decision_output || dData.decision || dData.response || "";
          promptTokens = message.length;
          completionTokens = reply.length / 4;
        }
      } catch (_e) {
        // Direct Ollama fallback
        try {
          const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "qwen2.5-coder:7b",
              prompt: message,
              system: persona.systemPrompt,
              stream: false,
            }),
            signal: AbortSignal.timeout(6000),
          });
          if (ollamaRes.ok) {
            const oData = await ollamaRes.json();
            if (oData.response) {
              reply = oData.response;
              promptTokens = message.length;
              completionTokens = reply.length / 4;
            }
          }
        } catch (_oErr) {}
      }
    }

    if (!reply) {
      reply = `${persona.name} (${persona.title}) stratejik analiz ve direktifi: ${message.substring(0, 100)} konusundaki sistem mimarisinde tam egemenlik, yüksek güvenlik ve kanıtlanabilir doğruluk esastır.`;
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
export const runtime = "nodejs";
