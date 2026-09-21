import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          borderRadius: 42,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 28, width: 96, height: 34, background: "#f5fbf7", transform: "skewX(-20deg)", borderRadius: 7 }} />
        <div style={{ position: "absolute", top: 52, width: 70, height: 9, background: "#f5fbf7", borderRadius: 5 }} />
        <div style={{ position: "absolute", top: 65, fontSize: 65, fontWeight: 900, letterSpacing: -8, color: "#9bedb7", fontFamily: "Arial, sans-serif" }}>DV</div>
        <div style={{ position: "absolute", bottom: 25, width: 64, height: 4, background: "#9bedb7", borderRadius: 99 }} />
      </div>
    ),
    { width: 192, height: 192 },
  );
}
