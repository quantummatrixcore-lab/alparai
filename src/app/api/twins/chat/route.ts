import { NextRequest, NextResponse } from "next/server";
import { DIGITAL_TWINS } from "@/lib/agent-os/personas";
import { ArbitrageEngine } from "@/lib/agent-os/arbitrage-engine";
import { fetchWithSsrfGuard } from "@/lib/security/ssrf";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { twinId, message } = body;

    if (!twinId || !message) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const persona = DIGITAL_TWINS[twinId];
    if (!persona) {
      return NextResponse.json({ error: "Twin not found" }, { status: 404 });
    }

    // Rate Limit (3 requests per 15 minutes for demo)
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.chat_rate_limit ?? "twin_chat"}:${ip}`, 3);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again in ${rl.retryAfter ?? 60}s.` },
        { status: 429 }
      );
    }

    // Agent-OS Arbitrage Engine selects the cheapest/smartest model for XL context
    const model = await ArbitrageEngine.routeTask("xl");

    // We will use OpenRouter API to fetch the response
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const response = await fetchWithSsrfGuard("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://alparai.com",
        "X-Title": "ALPAR AI Digital Twins"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: persona.systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response generated.";

    return NextResponse.json({ reply, modelUsed: model });
  } catch (error: any) {
    console.error("[Twins API] Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
