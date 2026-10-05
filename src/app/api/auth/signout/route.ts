import { NextResponse, type NextRequest } from "next/server";
import { performSignOut } from "@/actions/auth/auth";

export async function POST(request: NextRequest) {
  try {
    await performSignOut();
  } catch (error) {
    console.error("[Signout Route Error]:", error);
  }

  const isJson =
    request.headers.get("accept")?.includes("application/json") ||
    request.headers.get("content-type")?.includes("application/json");

  const locale = request.cookies.get("NEXT_LOCALE")?.value || "tr";
  const redirectUrl = new URL(`/${locale}?logout=${Date.now()}`, request.url);

  const response = isJson
    ? NextResponse.json({ ok: true, signedOut: true })
    : NextResponse.redirect(redirectUrl, { status: 303 });

  // Explicitly invalidate sovereign session cookie
  response.cookies.set("alparai_session", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Also purge any legacy dehost or session cookies
  const allCookies = request.cookies.getAll();
  for (const c of allCookies) {
    if (
      c.name.startsWith("sb-") ||
      c.name.includes("dehost") ||
      c.name.includes("session") ||
      c.name.includes("auth")
    ) {
      response.cookies.set(c.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }

  return response;
}

export async function GET(request: NextRequest) {
  return POST(request);
}
export const runtime = 'edge';
