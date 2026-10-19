let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import { NextResponse } from 'next/server';


export interface Prospect {
  id: string;
  companyName: string;
  contactPerson: string;
  contactChannel: string;
  status: 'CONTACTED' | 'DEMO' | 'CLOSED';
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, contactPerson, contactChannel, status } = body;

    if (!companyName || !contactPerson || !contactChannel || !status) {
      return NextResponse.json({ error: 'Eksik veri gonderildi.' }, { status: 400 });
    }

    const newProspect: Prospect = {
      id: crypto.randomUUID(),
      companyName,
      contactPerson,
      contactChannel,
      status,
      createdAt: new Date().toISOString()
    };

    // Edge uyumlu Upstash Redis cagrisi (Simulasyon/REST tabanli)
    const upstashUrl = (vault.read('UPSTASH_REDIS_REST_URL') ?? process.env.UPSTASH_REDIS_REST_URL);
    const upstashToken = (vault.read('UPSTASH_REDIS_REST_TOKEN') ?? process.env.UPSTASH_REDIS_REST_TOKEN);
    
    if (upstashUrl && upstashToken) {
        await fetch(`${upstashUrl}/set/prospect:${newProspect.id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${upstashToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProspect)
        });
    }

    return NextResponse.json({ success: true, data: newProspect }, { status: 201 });
  } catch (error) {
    console.error('Prospect Tracker API Hatasi:', error);
    return NextResponse.json({ error: 'Sunucu hatasi.' }, { status: 500 });
  }
}
export const runtime = "nodejs";
