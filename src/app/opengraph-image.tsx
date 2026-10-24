import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { palette, toneHex } from "@/lib/brand";

// The link preview: the hero line beside the jar and its refill, drawn flat
// in the brand's own fonts and tones.

export const alt = "Popsule: one jar for life, refills by the month. A frosted glass jar with a clay lid beside its metal refill.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) => readFile(join(process.cwd(), "src/assets/fonts", file));

export default async function Image() {
  const [spartan, serif, urbanist] = await Promise.all([
    font("LeagueSpartan-SemiBold.ttf"),
    font("DMSerifDisplay-Italic.ttf"),
    font("Urbanist-Medium.ttf"),
  ]);
  const clay = toneHex("clay");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: palette.mist, color: palette.graphite, fontFamily: "Urbanist" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 64px 72px", width: 640 }}>
          <div style={{ fontFamily: "Spartan", fontSize: 40, letterSpacing: -1.4 }}>Popsule</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Spartan", fontSize: 84, lineHeight: 0.95, letterSpacing: -3 }}>One jar for life,</div>
            <div style={{ fontFamily: "Serif", fontSize: 84, lineHeight: 1.05 }}>refills by the month.</div>
            <div style={{ fontSize: 28, color: palette.muted, marginTop: 28, lineHeight: 1.35 }}>Your formula, printed on a frosted glass jar you keep.</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 36, flex: 1, paddingBottom: 110 }}>
          {/* Jar: clay lid on frosted glass with the printed label. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 236, height: 64, borderRadius: 14, background: `linear-gradient(180deg, ${clay} 0%, #9C7258 100%)` }} />
            <div
              style={{
                width: 222,
                height: 300,
                marginTop: -4,
                borderRadius: "10px 10px 46px 46px",
                background: "linear-gradient(90deg, #DCDBD7 0%, #F1F0ED 45%, #D6D5D0 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 13, letterSpacing: 5, color: palette.graphite }}>POPSULE</div>
              <div style={{ fontFamily: "Spartan", fontSize: 38, letterSpacing: -1 }}>Head Space</div>
            </div>
          </div>
          {/* Refill: the same clay in metal, graphite lid, steel line. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 200, height: 70, borderRadius: 16, background: "linear-gradient(180deg, #3A3D42 0%, #1D1F22 100%)" }} />
            <div
              style={{
                width: 192,
                height: 258,
                marginTop: -6,
                borderRadius: "6px 6px 22px 22px",
                background: `linear-gradient(90deg, #9A735B 0%, ${clay} 45%, #8E6A53 100%)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#EDE6DF" }}>POPSULE</div>
              <div style={{ fontFamily: "Spartan", fontSize: 32, color: "#EDE6DF", letterSpacing: -0.8 }}>Head Space</div>
              <div style={{ width: 192, height: 3, background: "#C9CCD1", marginTop: 70 }} />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Spartan", data: spartan, weight: 600, style: "normal" },
        { name: "Serif", data: serif, weight: 400, style: "italic" },
        { name: "Urbanist", data: urbanist, weight: 500, style: "normal" },
      ],
    },
  );
}
