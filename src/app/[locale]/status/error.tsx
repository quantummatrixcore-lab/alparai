'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-fg-primary mb-4">Something went wrong</h2>
        <p className="text-fg-muted mb-8">{error.message || 'An unexpected error occurred'}</p>
        <button onClick={reset} className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}
