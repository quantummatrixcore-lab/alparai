import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'incidents.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    try {
      await fs.access(dataFile);
    } catch {
      await fs.writeFile(dataFile, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
  }
}

export async function GET() {
  await ensureDataFile();
  try {
    const data = await fs.readFile(dataFile, 'utf-8');
    const incidents = JSON.parse(data);
    return NextResponse.json({ incidents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read incidents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDataFile();
  try {
    const body = await request.json();
    const data = await fs.readFile(dataFile, 'utf-8');
    const incidents = JSON.parse(data);
    
    const newIncident = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...body
    };
    
    incidents.push(newIncident);
    await fs.writeFile(dataFile, JSON.stringify(incidents, null, 2));
    
    return NextResponse.json(newIncident, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}
