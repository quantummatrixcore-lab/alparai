import { ImageResponse } from "next/og";
import { createServerClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const supabase = await createServerClient();

  // Fetch incident title and details
  const { data: incident } = await supabase
    .from("incidents")
    .select("title_masked, title_tr, severity, category, ai_providers(name)")
    .eq("id", id)
    .single();

  const title =
    locale === "tr" && incident?.title_tr
      ? incident.title_tr
      : (incident?.title_masked ?? "AI Incident");
  const provider = (incident?.ai_providers as { name: string } | null)?.name ?? "AI Provider";
  const category = incident?.category ?? "Safety";
  const severity = incident?.severity ?? "medium";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #0A1622 0%, #0F2438 100%)",
        color: "white",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width={50} height={50} viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3FBFE3" />
                <stop offset="100%" stopColor="#1B95C0" />
              </linearGradient>
            </defs>
            <path d="M32 4 L56 14 V32 C56 44 46 54 32 60 C18 54 8 44 8 32 V14 Z" fill="url(#g)" />
            <line x1="32" y1="14" x2="32" y2="48" stroke="white" strokeWidth="3" />
          </svg>
          <span style={{ fontSize: 36, fontWeight: 800, color: "#3FBFE3" }}>ALPAR AI</span>
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 2,
            color:
              severity === "critical" || severity === "high"
                ? "#EF4444"
                : severity === "medium"
                  ? "#F59E0B"
                  : "#10B981",
            border: `2px solid ${severity === "critical" || severity === "high" ? "#EF4444" : severity === "medium" ? "#F59E0B" : "#10B981"}`,
            padding: "6px 16px",
            borderRadius: 8,
          }}
        >
          {severity}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 40,
          marginBottom: 40,
        }}
      >
        <span
          style={{ fontSize: 24, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}
        >
          {provider} — {category}
        </span>
        <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.25, color: "white" }}>
          {title}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          borderTop: "1px solid #1E293B",
          paddingTop: 24,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 22, color: "#94A3B8" }}>
          Read the full report & provider response
        </span>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#3FBFE3" }}>alparai.com</span>
      </div>
    </div>,
    { ...size },
  );
}
