import { NextResponse, type NextRequest } from "next/server";
import { signOut } from "@/actions/auth/auth";

export async function POST(request: NextRequest) {
  await signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
