export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export const revalidate = 0; // Always dynamic

export async function GET() {
  // A lightweight liveness probe that always returns 200 OK
  // as long as the Node.js process and Next.js router are running.
  // Suitable for deployment platform health checks (Vercel, AWS, GCP, etc.)
  return NextResponse.json(
    { status: "alive", timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
