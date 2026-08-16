import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// @ts-expect-error - Local JS modules without types
import GoogleEcosystemBridge from '../../../../google_ecosystem_bridge.js';

export async function GET() {
  try {
    const googleBridge = new GoogleEcosystemBridge();

    // Paralel API çağrıları
    const [geminiQuota, storageQuota] = await Promise.all([
      googleBridge.checkGeminiQuota(),
      googleBridge.getStorageQuotaInfo()
    ]);

    // Developer Profile Sync Data
    let developerProfile = null;
    try {
      const devProfilePath = path.join(process.cwd(), 'developer_profile_sync.json');
      if (fs.existsSync(devProfilePath)) {
        developerProfile = JSON.parse(fs.readFileSync(devProfilePath, 'utf8'));
      }
    } catch (e) {
      console.error('Developer profile read error:', e);
    }

    // Altyapı durumu (Simüle edilmiş veya gerçek)
    const infraStatus = {
      wafMode: process.env.CLOUDFLARE_API_TOKEN ? 'Active' : 'Standby',
      vercelDeployments: process.env.VERCEL_TOKEN ? 'Ready' : 'Standby'
    };

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      ecosystem: {
        google: {
          gemini: geminiQuota,
          drive: storageQuota,
          developer: developerProfile
        },
        infrastructure: infraStatus
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });
  }
}
