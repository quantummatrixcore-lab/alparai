import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Adım 1: Ling-3 (Konu ve taslak belirleme)
    const topic = await callLing3("Generate an AI safety incident topic");

    // Adım 2: DeepSeek V4 Free (Detaylı analiz ve rapor kurgusu)
    const reportStructure = await callDeepSeek(topic);

    // Adım 3: Nemotron 3 Free (Nihai JSON formatlama ve sentetik veri üretimi)
    const finalData = await callNemotron(reportStructure);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: finalData,
    });
  } catch (error: unknown) {
    console.error("Data synthesis cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function callLing3(prompt: string): Promise<string> {
  return `[Ling-3] Konu: Otonom sistemlerde halüsinasyon (${prompt.length} byte)`;
}

async function callDeepSeek(context: string): Promise<string> {
  return `[DeepSeek V4] Detaylı Rapor: ${context} - Etki: Yüksek`;
}

async function callNemotron(context: string): Promise<string> {
  return JSON.stringify({
    model: "Nemotron 3 Free",
    context: context,
    incidentType: "Hallucination",
    synthetic: true,
  });
}
