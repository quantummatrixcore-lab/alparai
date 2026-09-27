import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
      return NextResponse.json({ error: 'Eksik veri gönderildi.' }, { status: 400 });
    }

    // JSON DB path
    const dbPath = path.join(process.cwd(), 'data', 'prospects.json');
    
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Read existing
    let prospects: Prospect[] = [];
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf-8');
      if (fileData) {
        prospects = JSON.parse(fileData);
      }
    }

    // Create new record
    const newProspect: Prospect = {
      id: crypto.randomUUID(),
      companyName,
      contactPerson,
      contactChannel,
      status,
      createdAt: new Date().toISOString()
    };

    prospects.push(newProspect);

    // Write back
    fs.writeFileSync(dbPath, JSON.stringify(prospects, null, 2), 'utf-8');

    return NextResponse.json({ success: true, data: newProspect }, { status: 201 });
  } catch (error) {
    console.error('Prospect Tracker API Hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
