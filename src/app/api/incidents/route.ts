import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'incidents.json');

export async function GET() {
  try {
    const data = fs.readFileSync(dataFile, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read incidents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = fs.readFileSync(dataFile, 'utf-8');
    const incidents = JSON.parse(data);
    
    const newIncident = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };
    
    incidents.push(newIncident);
    fs.writeFileSync(dataFile, JSON.stringify(incidents, null, 2), 'utf-8');
    
    return NextResponse.json(newIncident, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}
