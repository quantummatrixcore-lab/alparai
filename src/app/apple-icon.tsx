import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0e0e1a 0%, #5b21b6 100%)",
        borderRadius: 36,
        color: "#e9d5ff",
        fontSize: 96,
        fontWeight: 900,
        fontFamily: "system-ui, sans-serif",
        letterSpacing: -2,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          right: 30,
          bottom: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#a78bfa",
            position: "absolute",
            top: 40,
            left: 40,
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#a78bfa",
            position: "absolute",
            top: 40,
            right: 40,
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#a78bfa",
            position: "absolute",
            bottom: 40,
            left: 40,
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#a78bfa",
            position: "absolute",
            bottom: 40,
            right: 40,
          }}
        />
      </div>
      <div style={{ display: "flex", position: "relative", zIndex: 1 }}>A</div>
    </div>,
    { ...size },
  );
}
