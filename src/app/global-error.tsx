"use client";

import { useEffect } from "react";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        msg: "Global unhandled error",
        err: { name: error.name, message: error.message, digest: error.digest },
      })
    );
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen flex-col items-center justify-center p-6 font-sans antialiased">
        <div className="relative max-w-lg w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            System Temporarily Unavailable
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            An unexpected application error occurred. Our automated monitoring infrastructure has recorded this incident.
          </p>

          {error.digest && (
            <div className="mb-6 rounded-lg bg-slate-950/60 border border-slate-800 p-3 font-mono text-xs text-slate-400">
              Error Digest: <span className="text-emerald-400">{error.digest}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
            >
              Try Again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/en"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-800/50 px-6 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 cursor-pointer"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
