import { ImageResponse } from "next/og";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "ALPAR AI — Brand Profile Audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BrandOG({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const db = await createServerClient();

  const { data: provider } = await db
    .from("ai_providers")
    .select("id, name, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!provider) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0f1e" }} />,
      { ...size },
    );
  }

  // Count incidents for this provider
  const { count: incidentsCount } = await db
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("ai_provider_id", provider.id)
    .eq("status", "published");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0A0F1E 0%, #151A2E 100%)",
        color: "white",
        padding: 80,
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#a855f7", letterSpacing: 1 }}>
            ALPAR AI
          </span>
          <span style={{ fontSize: 20, color: "#475569" }}>|</span>
          <span style={{ fontSize: 20, color: "#94a3b8", fontWeight: 500 }}>BRAND PROFILE</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 18,
            color: "#e2e8f0",
            background: "rgba(168, 85, 247, 0.1)",
            padding: "6px 16px",
            borderRadius: 20,
            border: "1px solid rgba(168, 85, 247, 0.2)",
          }}
        >
          {incidentsCount !== null ? `${incidentsCount} Audited Incidents` : "Audited AI Profile"}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 40,
          marginBottom: 40,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, color: "#ffffff" }}>{provider.name}</div>
        <div style={{ fontSize: 28, color: "#94a3b8", lineHeight: 1.4, maxWidth: 900 }}>
          {provider.description ||
            `Accountability audits, community reports, and trust metrics for ${provider.name}.`}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          borderTop: "1px solid #1e293b",
          paddingTop: 32,
        }}
      >
        <span style={{ fontSize: 18, color: "#64748b" }}>
          Trust Infrastructure for AI Accountability
        </span>
        <span style={{ fontSize: 20, fontWeight: 600, color: "#06b6d4" }}>alparai.com</span>
      </div>
    </div>,
    { ...size },
  );
}
