import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#174d31",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 28, width: 92, height: 33, background: "#f5fbf7", transform: "skewX(-20deg)", borderRadius: 7 }} />
        <div style={{ position: "absolute", top: 51, width: 68, height: 8, background: "#f5fbf7", borderRadius: 5 }} />
        <div style={{ position: "absolute", top: 63, fontSize: 62, fontWeight: 900, letterSpacing: -8, color: "#9bedb7", fontFamily: "Arial, sans-serif" }}>DV</div>
        <div style={{ position: "absolute", bottom: 24, width: 61, height: 4, background: "#9bedb7", borderRadius: 99 }} />
      </div>
    ),
    size,
  );
}
