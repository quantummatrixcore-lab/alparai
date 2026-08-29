import { NextResponse, type NextRequest } from "next/server";
import { signOut } from "@/actions/auth/auth";

export async function POST(request: NextRequest) {
  try {
    await signOut();
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.redirect(new URL("/?error=signout_failed", request.url));
  }
}
