import { ImageResponse } from "next/og";
import { createServerClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createServerClient();

  // Fetch providers
  const { data: providers } = await supabase
    .from("ai_providers")
    .select("id, name, logo_url")
    .neq("slug", "alpar-autopilot");

  // Fetch incident count and response count to calculate rate
  const stats = await Promise.all(
    (providers ?? []).map(async (p) => {
      const [{ count: incidentCount }, { count: responseCount }] = await Promise.all([
        supabase
          .from("incidents")
          .select("*", { count: "exact", head: true })
          .eq("ai_provider_id", p.id)
          .eq("status", "published"),
        supabase
          .from("ai_provider_responses")
          .select("*", { count: "exact", head: true })
          .eq("ai_provider_id", p.id)
          .eq("is_published", true),
      ]);

      const total = incidentCount ?? 0;
      const responded = responseCount ?? 0;
      const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

      return {
        name: p.name,
        incident_count: total,
        response_rate: responseRate,
      };
    }),
  );

  // Sort by response rate desc (similar to the leaderboard logic)
  const sorted = stats
    .sort((a, b) => {
      if (a.incident_count === 0 && b.incident_count === 0) return 0;
      if (a.incident_count === 0) return 1;
      if (b.incident_count === 0) return -1;
      return b.response_rate - a.response_rate;
    })
    .slice(0, 4); // top 4

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
      {/* Header */}
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
            fontSize: 22,
            fontWeight: 700,
            color: "#E2E8F0",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {locale === "tr" ? "Yapay Zeka Skor Tablosu" : "AI Accountability Leaderboard"}
        </div>
      </div>

      {/* Content Table / List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: 16,
          marginTop: 30,
          marginBottom: 30,
        }}
      >
        {sorted.map((item, index) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              width: "100%",
              background: "#0F2438",
              border: "1px solid #1E293B",
              borderRadius: 12,
              padding: "16px 24px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color:
                    index === 0
                      ? "#F59E0B"
                      : index === 1
                        ? "#94A3B8"
                        : index === 2
                          ? "#B45309"
                          : "#64748B",
                  width: 30,
                }}
              >
                #{index + 1}
              </span>
              <span style={{ fontSize: 28, fontWeight: 700, color: "white" }}>{item.name}</span>
            </div>
            <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase" }}>
                  {locale === "tr" ? "Olaylar" : "Incidents"}
                </span>
                <span style={{ fontSize: 22, fontWeight: 600, color: "#94A3B8" }}>
                  {item.incident_count}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase" }}>
                  {locale === "tr" ? "Yanıt Oranı" : "Response Rate"}
                </span>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color:
                      item.response_rate >= 80
                        ? "#10B981"
                        : item.response_rate >= 50
                          ? "#F59E0B"
                          : "#EF4444",
                  }}
                >
                  {item.response_rate}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          width: "100%",
          borderTop: "1px solid #1E293B",
          paddingTop: 24,
          justifySelf: "flex-end",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 20, color: "#94A3B8" }}>
          {locale === "tr"
            ? "AI davranışlarını ve şeffaflık puanlarını canlı takip edin."
            : "Track real-time AI behavior and transparency scores."}
        </span>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#3FBFE3" }}>
          alparai.com/leaderboard
        </span>
      </div>
    </div>,
    { ...size },
  );
}
