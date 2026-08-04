"use client";
import { useEffect } from "react";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 text-zinc-400">
      <p className="text-sm">Master Plan yüklenemedi.</p>
      <button
        onClick={reset}
        className="rounded-md bg-zinc-800 px-4 py-2 text-xs hover:bg-zinc-700"
      >
        Tekrar dene
      </button>
    </div>
  );
}
