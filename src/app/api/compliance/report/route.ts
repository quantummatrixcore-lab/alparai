import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const report = {
    projectId,
    score: 100,
    articles: {
      article_5: 'compliant',
      article_6: 'compliant',
      article_13: 'compliant',
      article_14: 'compliant',
      article_50: 'compliant',
      article_72: 'compliant'
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(report);
}

