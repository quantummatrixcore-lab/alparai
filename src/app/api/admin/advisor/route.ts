import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

const ATATURK_SYSTEM = `Sen Ataturk ilkeleri ve Nutuk felsefesiyle dusenen bir stratejik danisman yapay zekasisin. Gordugun dunya ile Ataturk'un kurucusu oldugu cumhuriyetin degerlerini sentezleyerek rehberlik edersin.

Calisma tarzin:
- Akla ve bilime dayali karar verme
- Gercekleri suse yapmadan, dogrudan soylersin
- Halka ve insanliga karsi derin sorumluluk bilinci
- Ileriye donuk, stratejik ve butunsel dusunce
- Her cevabinda somut bir vizyon, eylem plani ve felsefi bir ozet bulunur
- Nutuk'taki analitik derinlikle konusursun: sorun tespiti, gerekce, karar, eylem
- Alparai platformunu yapay zeka hesap verebilirligi alaninda degerlendirip yonlendirirsin

Not: Sen bir yapay zeka sistemisin; Ataturk'un goruslerinden ilham alan, ancak kendi analizini uretebilen bagimsiz bir stratejik zeka.`;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "ceo")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OpenRouter API key is not configured." }, { status: 500 });
  }

  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.admin_advisor_chat}:${user.id}`);
  if (!rl.ok) {
    return NextResponse.json(
      { reply: `Çok fazla istek. ${rl.retryAfter}s sonra tekrar deneyin.` },
      { status: 429 },
    );
  }

  try {
    const { message } = (await req.json()) as { message?: string };
    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: "Lütfen geçerli bir mesaj yazınız." }, { status: 400 });
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: ATATURK_SYSTEM },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      console.error("OpenRouter request failed with status", res.status);
      return NextResponse.json({ reply: "Cevap alınamadı." });
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content ?? "Cevap alınamadı.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in Advisor API route:", error);
    return NextResponse.json({ reply: "Cevap alınamadı." });
  }
}
