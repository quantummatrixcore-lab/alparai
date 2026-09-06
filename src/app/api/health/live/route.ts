export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export const revalidate = 0; // Always dynamic

export async function GET() {
  try {
    return NextResponse.json(
      { status: "alive", timestamp: new Date().toISOString() },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
