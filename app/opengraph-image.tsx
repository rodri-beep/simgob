import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const alt =
  "SimGob — simulador divulgativo del presupuesto y los impuestos de España";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const host = SITE_URL.replace(/^https?:\/\//, "");

export default async function OpengraphImage() {
  // Read the bundled pixel fonts from disk. Literal paths let Next trace the
  // assets and prerender this image to a static PNG at build time.
  const fontsDir = join(process.cwd(), "public", "fonts");
  const [pixelFont, chromeFont] = await Promise.all([
    readFile(join(fontsDir, "PressStart2P-Regular.ttf")),
    readFile(join(fontsDir, "Silkscreen-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#e7dec3",
          color: "#211f18",
          fontFamily: "Silkscreen",
        }}
      >
        {/* App bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            background: "#194c4c",
            padding: "40px 56px",
            borderBottom: "6px solid #236a6a",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              background: "#e09a2d",
              color: "#194c4c",
              fontFamily: "PressStart2P",
              fontSize: 34,
              boxShadow: "inset 4px 4px 0 0 #fbf6e2, inset -4px -4px 0 0 #8a7f5d",
            }}
          >
            SG
          </div>
          <div style={{ display: "flex", fontFamily: "PressStart2P", fontSize: 58 }}>
            <span style={{ color: "#f4efe1" }}>SIM</span>
            <span style={{ color: "#e09a2d" }}>GOB</span>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 56px",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              fontFamily: "PressStart2P",
              fontSize: 44,
              lineHeight: 1.4,
              color: "#211f18",
            }}
          >
            <span>GOBIERNA. DECIDE.</span>
            <span>CUADRA LAS CUENTAS.</span>
          </div>
          <div style={{ display: "flex", fontSize: 27, color: "#4a4636", maxWidth: 1040, lineHeight: 1.5 }}>
            Simulador del presupuesto y los impuestos de las Administraciones Públicas en España.
          </div>
        </div>

        {/* Footer strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#3d4a2c",
            color: "#f4efe1",
            fontSize: 21,
            padding: "22px 56px",
          }}
        >
          <span>No oficial · estimación ilustrativa · datos AAPP 2023</span>
          <span style={{ color: "#e09a2d" }}>{host}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "PressStart2P", data: pixelFont, style: "normal", weight: 400 },
        { name: "Silkscreen", data: chromeFont, style: "normal", weight: 400 },
      ],
    },
  );
}
