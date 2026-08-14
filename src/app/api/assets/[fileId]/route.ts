import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getGDriveClient } from "@/lib/gdrive/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    if (!fileId) {
      return new NextResponse("Missing file ID", { status: 400 });
    }

    const drive = await getGDriveClient();

    const metadata = await drive.files.get({
      fileId,
      fields: "mimeType, name",
    });

    const response = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });

    const headers = new Headers();
    headers.set("Content-Type", metadata.data.mimeType ?? "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${metadata.data.name ?? "file"}"`);
    headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400",
    );

    return new NextResponse(response.data as unknown as ReadableStream, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error serving asset from GDrive:", message);
    return new NextResponse("Asset not found or access denied", { status: 404 });
  }
}
