import { vault } from "@/lib/security/vault";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


export async function GET(_req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    if (!fileId) {
      return new NextResponse("Missing file ID", { status: 400 });
    }

    const apiKey = (vault.read('GOOGLE_API_KEY') ?? process.env.GOOGLE_API_KEY) || (vault.read('GEMINI_API_KEY') ?? process.env.GEMINI_API_KEY);
    if (!apiKey) {
      return new NextResponse("Google Drive service unconfigured", { status: 503 });
    }

    // Fetch file metadata
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=mimeType,name,parents&key=${apiKey}`,
      { headers: { Accept: "application/json" } }
    );

    if (!metaRes.ok) {
      return new NextResponse("Asset metadata not found", { status: metaRes.status });
    }

    const metadata = (await metaRes.json()) as { mimeType?: string; name?: string; parents?: string[] };
    const mimeType = metadata.mimeType || "";

    // Block sensitive files (e.g. JSON DB backups, SQL dumps, CSVs)
    if (mimeType === "application/json" || mimeType.includes("sql") || mimeType.includes("csv")) {
      return new NextResponse("Access to this file type is forbidden", { status: 403 });
    }

    // Verify folder boundary if configured
    const allowedFolderId = (vault.read('GDRIVE_ASSETS_FOLDER_ID') ?? process.env.GDRIVE_ASSETS_FOLDER_ID);
    if (allowedFolderId && metadata.parents && !metadata.parents.includes(allowedFolderId)) {
      return new NextResponse("Unauthorized Asset Location", { status: 403 });
    }

    // Proxy media stream via Edge fetch
    const mediaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&key=${apiKey}`
    );

    if (!mediaRes.ok) {
      return new NextResponse("Asset media stream failed", { status: mediaRes.status });
    }

    const headers = new Headers();
    headers.set("Content-Type", metadata.mimeType ?? "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${metadata.name ?? "file"}"`);
    headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400"
    );

    return new NextResponse(mediaRes.body, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error serving asset from GDrive:", message);
    return new NextResponse("Asset not found or access denied", { status: 404 });
  }
}
export const runtime = "nodejs";
