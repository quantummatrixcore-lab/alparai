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

let store: { getIncidents: (limit: number) => unknown[]; addIncident: (incident: unknown) => unknown } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  store = require('../../../lib/db/incidents_store.js');
} catch (_err) {
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
