import { NextResponse, type NextRequest } from "next/server";
import { performSignOut } from "@/actions/auth/auth";

export async function POST(request: NextRequest) {
  try {
    await performSignOut();
  } catch (error) {
    console.error("[Signout Route Error]:", error);
  }

  const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
  const redirectUrl = new URL(`/${locale}`, request.url);
  const response = NextResponse.redirect(redirectUrl, { status: 303 });

  // Explicitly invalidate sovereign session cookie
  response.cookies.set("alparai_session", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Also purge any legacy supabase cookies
  const allCookies = request.cookies.getAll();
  for (const c of allCookies) {
    if (c.name.startsWith("sb-") || c.name.includes("supabase")) {
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
