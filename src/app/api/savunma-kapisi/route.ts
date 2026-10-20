import { NextResponse } from "next/server";

let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try {
  vault = require("@/lib/security/vault").vault;
} catch {
  /* vault yoksa env fallback */
}

function isAuthorizedToken(token: unknown): boolean {
  if (typeof token !== "string" || token.length < 16) return false;
  const allowed = [
    vault.read("INTERNAL_API_KEY") ?? process.env.INTERNAL_API_KEY,
    vault.read("CRON_SECRET") ?? process.env.CRON_SECRET,
    vault.read("SESSION_SECRET") ?? process.env.SESSION_SECRET,
  ].filter((v): v is string => typeof v === "string" && v.length >= 16);
  if (allowed.length === 0) return false;
  return allowed.includes(token);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Savunma Kapısı (Defense Gate) — fail-closed: bilinmeyen her token reddedilir.
    if (!body || !isAuthorizedToken((body as { auth_token?: unknown }).auth_token)) {
      return NextResponse.json(
        { error: "Savunma Kapisi: Ihlal Tespit Edildi (Yetkisiz Erisim)" },
        { status: 401 },
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
        { status: 403 },
      );
    }

    return NextResponse.json({
      status: "ACCEPTED",
      message: "Savunma Kapisi ve Olay Mahkemesi: Gecis Onaylandi.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu Hatasi" }, { status: 500 });
  }
}
export const runtime = "edge";
