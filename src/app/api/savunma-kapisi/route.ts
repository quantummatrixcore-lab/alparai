import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Savunma Kapısı (Defense Gate)
    if (!body || !body.auth_token) {
      return NextResponse.json(
        { error: "Savunma Kapisi: Ihlal Tespit Edildi (Yetkisiz Erisim)" },
        { status: 401 }
      );
    }

    // 2. Olay Mahkemesi (Event Court)
    const incident = body.incident;
    if (incident && incident.severity > 5) {
      return NextResponse.json(
        {
          status: "BLOCKED",
          verdict: "GUILTY",
          message: "Olay Mahkemesi: Yuksek riskli islem engellendi.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      status: "ACCEPTED",
      message: "Savunma Kapisi ve Olay Mahkemesi: Gecis Onaylandi.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sunucu Hatasi" },
      { status: 500 }
    );
  }
}
