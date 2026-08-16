import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// @ts-expect-error - Local JS modules without types
import GoogleEcosystemBridge from '../../../../google_ecosystem_bridge.js';

export async function GET() {
  try {
    const googleBridge = require('../../../../google_ecosystem_bridge.js');

    // Paralel API çağrıları
    const geminiQuota = googleBridge.getAIStudioMetrics();
    const storageQuota = { status: googleBridge.driveStatus };

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

    // AlparAI Admin Data
    let alparAdminProfile = null;
    try {
      const adminProfilePath = path.join(process.cwd(), 'alpar_admin_sync.json');
      if (fs.existsSync(adminProfilePath)) {
        alparAdminProfile = JSON.parse(fs.readFileSync(adminProfilePath, 'utf8'));
      }
    } catch (e) {
      console.error('Admin profile read error:', e);
    }

    // Altyapı durumu (Simüle edilmiş veya gerçek)
    const infraStatus = {
      wafMode: process.env.CLOUDFLARE_API_TOKEN ? 'Under Attack Mode (Active)' : 'Standby',
      vercelDeployments: process.env.VERCEL_TOKEN ? 'Ready' : 'Standby'
    };

    // Stripe & Finans (ReadOnly Yetkili)
    const stripeFinance = {
      dailyCost: "$1.03", // DeepSeek/Groq API maliyet projeksiyonu
      bountyPool: "$500",
      status: "Active (Read Only)"
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
        alparai: {
          admin: alparAdminProfile
        },
        infrastructure: infraStatus,
        finance: stripeFinance
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });
  }
}
