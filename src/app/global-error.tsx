"use client";

import { useEffect } from "react";

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
      }),
    );
  }, [error]);

  return (
    <html>
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#0a0a0f",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Something went wrong / Bir şeyler ters gitti
          </h1>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Error ID / Hata Kodu: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          style={{
            backgroundColor: "#7c3aed",
            color: "white",
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          Try again / Tekrar dene
        </button>
      </body>
    </html>
  );
}
