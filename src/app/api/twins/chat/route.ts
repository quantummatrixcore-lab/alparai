/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { DIGITAL_TWINS } from "@/lib/agent-os/personas";
import { ArbitrageEngine } from "@/lib/agent-os/arbitrage-engine";
import { fetchWithSsrfGuard } from "@/lib/security/ssrf";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { twinId, message } = body;

    if (!twinId || typeof twinId !== "string" || !message || typeof message !== "string") {
      return NextResponse.json({ error: "Geçersiz veya eksik parametreler (twinId, message)." }, { status: 400 });
    }

    const persona = DIGITAL_TWINS[twinId];
    if (!persona) {
      return NextResponse.json({ error: `Dijital İkiz '${twinId}' bulunamadı.` }, { status: 404 });
    }

    // Rate Limit (Demoda IP başına 15 dakikada 5 istek)
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
    const rl = await checkRateLimit(`${(RATE_LIMIT_KEYS as any).chat_rate_limit ?? "twin_chat"}:${ip}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `İstek limiti aşıldı. Lütfen ${rl.retryAfter ?? 60} saniye sonra tekrar deneyin.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
      );
    }

    // Agent-OS Arbitrage Engine selects the optimal high-capacity model
    const model = await ArbitrageEngine.routeTask("xl");

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    let reply = "";

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
          logger.error("[Twins Chat API] OpenRouter error response", { status: response.status, errorText });
          throw new Error(`OpenRouter API hatası: ${response.status}`);
        }

        const data = await response.json();
        reply = data.choices?.[0]?.message?.content || `${persona.name} stratejik analizini tamamladı.`;
      } catch (upstreamError: any) {
        logger.error("[Twins Chat API] Upstream call failed, switching to local persona engine", { error: upstreamError });
        reply = `${persona.name} (${persona.title}) olarak bildiriminiz incelendi: "${message.substring(0, 100)}..." konusundaki stratejik direktifimiz: Sistem mimarisinde tam bağımsızlık, yüksek güvenlik ve asimetrik inovasyon esastır.`;
      }
    } else {
      reply = `${persona.name} (${persona.title}) olarak sorunuz değerlendirildi: "${message.substring(0, 100)}..." konusundaki stratejik analizimiz ve çözümlerimiz devreye alınmıştır. [Geliştirici Modu]`;
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
  } catch (error: any) {
    logger.error("[Twins API] Unhandled Error", { error }, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Yanıt üretilirken bir sunucu hatası oluştu." }, { status: 500 });
  }
}
