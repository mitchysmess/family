import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f6f7f1",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "white",
            border: "1px solid #d7e3ce",
            borderRadius: 28,
            boxShadow: "0 22px 70px rgba(36, 79, 69, 0.14)",
            display: "flex",
            gap: 48,
            height: "100%",
            padding: 64,
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#244f45",
              borderRadius: 999,
              color: "#fff2b8",
              display: "flex",
              flexShrink: 0,
              fontSize: 92,
              fontWeight: 900,
              height: 260,
              justifyContent: "center",
              letterSpacing: 0,
              width: 260,
            }}
          >
            FK
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#347468",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Familie Kompas
            </div>
            <div
              style={{
                color: "#111111",
                fontSize: 74,
                fontWeight: 850,
                lineHeight: 1.02,
                marginTop: 18,
              }}
            >
              Huislijst
            </div>
            <div
              style={{
                color: "#555555",
                fontSize: 32,
                lineHeight: 1.35,
                marginTop: 24,
                maxWidth: 640,
              }}
            >
              Gezinstaken, afspraken en voortgang op een rustige plek.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
