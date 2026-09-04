import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/profile";
  
  const rawClientId = process.env.GOOGLE_CLIENT_ID;
  const clientId =
    rawClientId && !rawClientId.includes("SENSITIVE") && rawClientId.includes(".apps.googleusercontent.com")
      ? rawClientId
      : "341717447635-hsdu69hk692lkveikkpc8398v8rhu40b.apps.googleusercontent.com";

  const origin = "https://www.alparai.com";
  const redirectUri = `${origin}/auth/callback`;
  const state = Buffer.from(JSON.stringify({ next })).toString("base64url");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
