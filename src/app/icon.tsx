import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0e0e1a 0%, #5b21b6 100%)",
        borderRadius: 8,
        color: "#e9d5ff",
        fontSize: 18,
        fontWeight: 900,
        fontFamily: "system-ui, sans-serif",
        letterSpacing: -0.5,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#a78bfa",
            marginRight: 22,
          }}
        />
      </div>
      A
    </div>,
    { ...size },
  );
}
