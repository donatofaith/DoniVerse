import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 112,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 74,
            width: 255,
            height: 92,
            background: "#f5fbf7",
            transform: "rotate(0deg) skewX(-20deg)",
            borderRadius: 18,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 138,
            width: 188,
            height: 23,
            background: "#f5fbf7",
            borderRadius: 12,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 177,
            fontSize: 175,
            fontWeight: 900,
            letterSpacing: -20,
            color: "#9bedb7",
            fontFamily: "Arial, sans-serif",
          }}
        >
          DV
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 70,
            width: 170,
            height: 10,
            background: "#9bedb7",
            borderRadius: 99,
          }}
        />
      </div>
    ),
    size,
  );
}
