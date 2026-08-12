import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ALPAR AI — Trust infrastructure for AI accountability";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0A1622 0%, #0F2438 100%)",
        color: "white",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <svg width={120} height={120} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3FBFE3" />
              <stop offset="100%" stopColor="#1B95C0" />
            </linearGradient>
          </defs>
          <path d="M32 4 L56 14 V32 C56 44 46 54 32 60 C18 54 8 44 8 32 V14 Z" fill="url(#g)" />
          <line x1="32" y1="14" x2="32" y2="48" stroke="white" strokeWidth="3" />
        </svg>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -2,
            background: "linear-gradient(90deg, #3FBFE3, #1B95C0)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          ALPAR AI
        </div>
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 600,
          textAlign: "center",
          maxWidth: 1000,
          lineHeight: 1.2,
        }}
      >
        Trust infrastructure for AI accountability
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#94A3B8",
          textAlign: "center",
          maxWidth: 900,
          marginTop: 24,
        }}
      >
        Community-driven incident reporting. Like Trustpilot, but for AI.
      </div>
    </div>,
    { ...size },
  );
}
