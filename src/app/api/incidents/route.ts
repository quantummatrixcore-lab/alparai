import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/dehost/admin';

// Persistent incidents store
// eslint-disable-next-line @typescript-eslint/no-require-imports
const store = require('@/lib/db/incidents_store.js');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const query = searchParams.get('q');

    // 1. Try DB layer first
    try {
      const admin = createAdminClient();
      let dbQuery = admin.from('incidents').select('*').order('created_at', { ascending: false }).limit(limit);
      if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`);
      }
      const { data, error } = await dbQuery;
      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch (_dbErr) {
      // Fallback to persistent store
    }

    // 2. Persistent incidents_store
    if (query) {
      const searched = store.searchIncidents(query);
      return NextResponse.json(searched);
    }
    const incidents = store.getIncidents(limit);
    return NextResponse.json(incidents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read incidents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newIncident = {
      id: body.id || Date.now().toString(),
      title: body.title || 'Untitled Incident',
      description: body.description || '',
      severity: body.severity || 'medium',
      status: body.status || 'published',
      ...body,
      createdAt: new Date().toISOString()
    };
    
    // 1. Try DB layer
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.from('incidents').insert(newIncident).select().single();
      if (!error && data) {
        try { store.addIncident(data); } catch {}
        return NextResponse.json(data, { status: 201 });
      }
    } catch (_dbErr) {
      // Fallback to store
    }

    // 2. Persistent incidents_store
    store.addIncident(newIncident);
    return NextResponse.json(newIncident, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}
export const runtime = 'edge';
