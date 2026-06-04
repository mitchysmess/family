import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#244f45",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          height: "100%",
          justifyContent: "center",
          padding: 18,
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#fff2b8",
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 0.9,
          }}
        >
          FK
        </div>
        <div
          style={{
            background: "#e66d35",
            borderRadius: 999,
            color: "white",
            fontSize: 24,
            fontWeight: 900,
            padding: "4px 14px",
          }}
        >
          thuis
        </div>
      </div>
    ),
    size,
  );
}
