import { NextResponse } from 'next/server';
// @ts-ignore - Local JS modules without types
import GoogleEcosystemBridge from '../../../../google_ecosystem_bridge.js';
// @ts-ignore
import InfrastructureEngine from '../../../../altyapi_motoru.js';

export async function GET() {
  try {
    const googleBridge = new GoogleEcosystemBridge();
    const infraEngine = new InfrastructureEngine();

    // Paralel API çağrıları
    const [geminiQuota, storageQuota] = await Promise.all([
      googleBridge.checkGeminiQuota(),
      googleBridge.getStorageQuotaInfo()
    ]);

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
          drive: storageQuota
        },
        infrastructure: infraStatus
      }
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
