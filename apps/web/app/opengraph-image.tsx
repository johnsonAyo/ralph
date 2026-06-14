import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Ask Ralph preview showing budget fit, maximum sensible price and a cautious verdict.";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fbfaf6",
          color: "#111",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 58,
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 86,
            right: 190,
            width: 72,
            height: 72,
            borderRadius: 72,
            background: "#ffd84d"
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 278,
            left: 62,
            width: 58,
            height: 58,
            borderRadius: 58,
            background: "#2f62e9"
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>
            Ask Ralph
          </div>
          <div
            style={{
              background: "#2f62e9",
              color: "#fff",
              borderRadius: 26,
              padding: "18px 30px",
              fontSize: 26,
              fontWeight: 800
            }}
          >
            Ask Ralph
          </div>
        </div>
        <div style={{ display: "flex", gap: 42, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                background: "#fff",
                color: "#2f62e9",
                borderRadius: 14,
                boxShadow: "0 12px 28px rgba(47,40,30,.14)",
                padding: "14px 20px",
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 34
              }}
            >
              Ralph guides your decision before you buy
            </div>
            <div style={{ fontSize: 92, lineHeight: 0.92, letterSpacing: -6, fontWeight: 500 }}>
              Found a car online?
            </div>
            <div style={{ marginTop: 26, fontSize: 34, lineHeight: 1.18 }}>
              Ralph checks price, damage, mileage and budget fit before buying.
            </div>
          </div>
          <div
            style={{
              width: 420,
              borderRadius: 34,
              background: "#fff",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              boxShadow: "0 30px 70px rgba(64,45,24,.18)"
            }}
          >
            <div style={{ color: "#5f5a50", fontSize: 22 }}>Car check report</div>
            <div
              style={{
                background: "#ffe4dc",
                color: "#b83a16",
                borderRadius: 999,
                padding: "12px 18px",
                fontSize: 28,
                fontWeight: 800,
                alignSelf: "flex-start"
              }}
            >
              Budget fit: stretched
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
              <span>Max sensible price</span>
              <strong>£1,900</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
              <span>Current price</span>
              <strong>£2,150</strong>
            </div>
            <div style={{ background: "#eef3ff", borderRadius: 22, padding: 22 }}>
              <div style={{ color: "#5f5a50", fontSize: 22 }}>Estimated total</div>
              <div style={{ color: "#2f62e9", fontSize: 54, fontWeight: 900 }}>£4,620</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
