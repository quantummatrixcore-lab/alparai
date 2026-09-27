import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  // Simulated compliance check
  const passedArticles = [];
  const failedArticles = [];
  const recommendations = [];

  // Art 6
  passedArticles.push('Article 6 (Prohibited AI practices)');
  
  // Art 50
  failedArticles.push('Article 50 (Transparency obligations)');
  recommendations.push('Implement clear user notifications when interacting with AI systems.');

  // Art 72
  passedArticles.push('Article 72 (Record keeping)');

  const score = Math.round((passedArticles.length / (passedArticles.length + failedArticles.length)) * 100);

  return NextResponse.json({
    projectId,
    score,
    passedArticles,
    failedArticles,
    recommendations,
  });
}
