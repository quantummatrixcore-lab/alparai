"use client";
export const runtime = 'edge';

import { useEffect } from "react";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log global application errors safely
    console.error("Critical Global Error Bound:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl border border-red-100 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            System Failure
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            A critical application error has occurred. We have securely logged the incident.
          </p>
          <div className="pt-4">
            <button
              onClick={() => reset()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:ring-4 focus:ring-red-500/30 outline-none"
            >
              Attempt Recovery
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

