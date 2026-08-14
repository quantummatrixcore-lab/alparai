import { google } from "googleapis";
import type { drive_v3 } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

let authCache: drive_v3.Drive | null = null;

/**
 * Get authenticated Google Drive client using Service Account credentials.
 */
export async function getGDriveClient(): Promise<drive_v3.Drive> {
  if (authCache) {
    return authCache;
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY environment variables");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  authCache = google.drive({ version: "v3", auth });
  return authCache;
}

/**
 * Helper to upload a file to a specific Drive folder
 */
export async function uploadToDrive(
  fileName: string,
  mimeType: string,
  body: NodeJS.ReadableStream | Buffer,
  folderId?: string,
): Promise<string> {
  const drive = await getGDriveClient();
  const targetFolderId = folderId || process.env.GDRIVE_VAULT_FOLDER_ID;

  if (!targetFolderId) {
    throw new Error("GDRIVE_VAULT_FOLDER_ID is missing in environment variables");
  }

  const fileMetadata = {
    name: fileName,
    parents: [targetFolderId],
  };

  const media = {
    mimeType,
    body,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
  });

  if (!response.data.id) {
    throw new Error("Failed to retrieve file ID from Google Drive after upload");
  }

  return response.data.id;
}
