import { NextResponse } from 'next/server';

let mockIncidents = [
  {
    id: '1',
    title: 'Sample Incident',
    description: 'This is a sample incident for testing purposes.',
    severity: 'medium',
    status: 'published',
    createdAt: new Date().toISOString(),
  }
];

export async function GET() {
  try {
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
    
    mockIncidents.push(newIncident);
    
    return NextResponse.json(newIncident, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}
