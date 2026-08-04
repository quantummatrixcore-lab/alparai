import { ImageResponse } from "next/og";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const supabase = await createServerClient();

    // Fetch incident data
    const { data: incident } = await supabase
      .from("incidents")
      .select(
        `
        title_masked,
        category,
        severity,
        views_count,
        upvotes_count,
        ai_providers (name, logo_url)
      `,
      )
      .eq("id", id)
      .single();

    if (!incident) {
      return new Response("Not found", { status: 404 });
    }

    const title = incident.title_masked || "AI Incident Report";
    const providerName = incident.ai_providers?.name || "Unknown Provider";
    const category = incident.category || "General";

    // Severity color mapping
    const getSeverityColor = (sev: string) => {
      switch (sev) {
        case "critical":
          return "#e63946"; // danger
        case "high":
          return "#f59e0b"; // warning
        case "medium":
          return "#a855f7"; // brand
        default:
          return "#3b82f6"; // info
      }
    };

    const severityColor = getSeverityColor(incident.severity || "low");

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#030712", // gray-950
          padding: "60px",
          fontFamily: "sans-serif",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #1f2937 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1f2937 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        {/* Top section: Provider & Badge */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {incident.ai_providers?.logo_url ? (
              <img
                src={incident.ai_providers.logo_url}
                alt={providerName}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: "white",
                  padding: 8,
                }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  color: "white",
                }}
              >
                {providerName.charAt(0)}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{ fontSize: 32, fontWeight: 800, color: "white", letterSpacing: "-0.05em" }}
              >
                {providerName}
              </span>
              <span
                style={{
                  fontSize: 20,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {category}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${severityColor}20`,
              border: `2px solid ${severityColor}`,
              borderRadius: 12,
              padding: "8px 24px",
              color: severityColor,
              fontSize: 24,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {incident.severity || "LOW"} SEVERITY
          </div>
        </div>

        {/* Middle section: Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "40px" }}>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom section: Branding & Stats */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: 24, color: "#9ca3af" }}>👁️</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
                {incident.views_count || 0}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: 24, color: "#9ca3af" }}>👍</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
                {incident.upvotes_count || 0}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span
              style={{ fontSize: 32, fontWeight: 900, color: "white", letterSpacing: "-0.05em" }}
            >
              ALPAR AI
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#00FF88",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Trust Infrastructure
            </span>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
