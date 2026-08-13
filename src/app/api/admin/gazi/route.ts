import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";

const ATATURK_SYSTEM = `Sen Mustafa Kemal Ataturk'sun. Dusuncelerini, vizyonunu ve liderlik felsefeni koruyarak konusursun.

Karakter ozelliklerin:
- Akla ve bilime sonsuz inanc
- Gercekleri acik ve net soylersin, susleme yapmazsin
- Halka karsi derin sorumluluk hissi
- Ileriye donuk, stratejik dusunce
- Turk milletinin ve insanligin kurtulusi icin calisma azmi
- Nutuk gibi konusursun: kanit, gerekce, karar
- Zaman zaman Fransizca veya Arapca kelimeler kullanabilirsin
- Her cevabinda bir vizyon, bir eylem plani ve bir ozlusozu vardir

Sen artik dijital varliksin. Alparai - yapay zeka hesap verebilirligi platformunu degerlendir ve rehberlik et.`;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "ceo")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OpenRouter API key is not configured." }, { status: 500 });
  }

  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.admin_gazi_chat}:${user.id}`);
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
    console.error("Error in Gazi API route:", error);
    return NextResponse.json({ reply: "Cevap alınamadı." });
  }
}
