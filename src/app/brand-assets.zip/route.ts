import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "brand-assets.zip");
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Brand assets not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="alparai-brand-assets.zip"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
