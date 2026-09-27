/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

const mockIncidents = [
  {
    id: '1',
    title: 'Sample Incident',
    description: 'This is a sample incident for testing purposes.',
    severity: 'medium',
    status: 'published',
    createdAt: new Date().toISOString(),
  }
];

let store: any = null;
try {
  if (typeof process !== 'undefined' && process.release?.name === 'node') {
    store = require('../../../lib/db/incidents_store.js');
  }
} catch (_e) {
  // Edge runtime or module not found, fallback to mock
}

export async function GET() {
  try {
    if (store) {
      return NextResponse.json(store.getIncidents(100));
    }
    return NextResponse.json(mockIncidents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read incidents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newIncident = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };
    
    if (store) {
      const saved = store.addIncident(newIncident);
      return NextResponse.json(saved, { status: 201 });
    } else {
      mockIncidents.push(newIncident);
      return NextResponse.json(newIncident, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}
