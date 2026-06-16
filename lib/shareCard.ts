/**
 * Render a shareable PNG card (political profile + P/L) on a canvas — pure
 * client-side, no dependencies, no backend. Mirrors the retro SimGob skin.
 *
 * The card is 1200×630 (the standard social/OG ratio), drawn at 2× for crisp
 * downloads. Text uses the app's pixel/chrome webfonts (read from the CSS
 * variables) for the chrome, and a clean sans for the numbers.
 */
import type { PoliticsResult } from "./engine/politics";
import type { BudgetTotals } from "./engine/budget";
import { formatM, formatGdpPct } from "./engine/format";

const C = {
  parchment: "#e7dec3",
  parchmentDark: "#d4c9a4",
  ink: "#211f18",
  inkSoft: "#4a4636",
  teal: "#236a6a",
  tealDark: "#194c4c",
  amber: "#e09a2d",
  amberLight: "#f0cd7a",
  amberDark: "#b3791d",
  brick: "#a83c2e",
  moss: "#4e7d3a",
  olive: "#5b6a3f",
  oliveDark: "#3d4a2c",
  bevelLight: "#fbf6e2",
  bevelDark: "#8a7f5d",
};

const W = 1200;
const H = 630;
const SCALE = 2;

export interface ShareCardData {
  profile: PoliticsResult;
  totals: BudgetTotals;
  gdp: number;
  baseYear: number;
  /** Host shown in the call-to-action, e.g. "simgob.app". */
  host: string;
}

const SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

/** Draw the card and return the canvas (caller turns it into a Blob/URL). */
export async function renderShareCard(d: ShareCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D no disponible");
  ctx.scale(SCALE, SCALE);

  // Make sure the pixel/chrome webfonts are ready before measuring/drawing.
  try {
    if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready;
  } catch {
    /* ignore */
  }
  const root = getComputedStyle(document.documentElement);
  const pixel = root.getPropertyValue("--font-pixel").trim() || "monospace";
  const chrome = root.getPropertyValue("--font-chrome").trim() || "monospace";

  const font = (size: number, family: string, weight = "") =>
    `${weight} ${size}px ${family}`.trim();
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };
  const bevel = (
    x: number,
    y: number,
    w: number,
    h: number,
    base: string,
    light = C.bevelLight,
    dark = C.bevelDark,
    t = 3,
  ) => {
    rect(x, y, w, h, base);
    rect(x, y, w, t, light);
    rect(x, y, t, h, light);
    rect(x, y + h - t, w, t, dark);
    rect(x + w - t, y, t, h, dark);
  };
  const text = (s: string, x: number, y: number, fnt: string, color: string, align: CanvasTextAlign = "left") => {
    ctx.font = fnt;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  };
  /** Shrink a font until `s` fits in `maxW`; returns the chosen size. */
  const fitSize = (s: string, family: string, weight: string, start: number, min: number, maxW: number) => {
    let size = start;
    do {
      ctx.font = font(size, family, weight);
      if (ctx.measureText(s).width <= maxW) break;
      size -= 1;
    } while (size > min);
    return size;
  };
  ctx.textBaseline = "alphabetic";

  // ---- frame ----
  rect(0, 0, W, H, C.tealDark);
  bevel(10, 10, W - 20, H - 20, C.parchment, C.bevelLight, C.bevelDark, 3);

  // ---- title strip ----
  rect(13, 13, W - 26, 86, C.tealDark);
  const tileX = 36;
  const tileY = 28;
  const tileS = 56;
  bevel(tileX, tileY, tileS, tileS, C.amber, C.amberLight, C.amberDark, 4);
  ctx.textBaseline = "middle";
  text("SG", tileX + tileS / 2, tileY + tileS / 2 + 2, font(20, pixel), C.tealDark, "center");
  ctx.textBaseline = "alphabetic";
  const wordX = tileX + tileS + 24;
  text("SIM", wordX, 58, font(30, pixel), C.parchment);
  ctx.font = font(30, pixel);
  const simW = ctx.measureText("SIM").width;
  text("GOB", wordX + simW, 58, font(30, pixel), C.amber);
  text("GOBIERNA · DECIDE · CUADRA LAS CUENTAS", wordX, 82, font(12, chrome), C.amber);
  text(`NO OFICIAL · ${d.baseYear}`, W - 36, 56, font(14, chrome), C.parchment, "right");

  const bodyTop = 150;
  const dividerX = 612;

  // ---- left: political profile ----
  text("TU PERFIL POLÍTICO", 40, bodyTop, font(15, chrome), C.inkSoft);
  // big emoji (rendered as a system glyph by the sans stack)
  text(d.profile.emoji, 40, bodyTop + 96, font(80, SANS), C.ink);
  ctx.font = font(80, SANS);
  const emojiW = ctx.measureText(d.profile.emoji).width;
  const textX = 40 + emojiW + 22;
  const labelMaxW = dividerX - 24 - textX;
  const labelSize = fitSize(d.profile.label, SANS, "800", 34, 20, labelMaxW);
  text(d.profile.label, textX, bodyTop + 64, font(labelSize, SANS, "800"), C.ink);

  // reasons chips (sit just under the label; the subtitle/blurb is omitted by design)
  let chipY = bodyTop + 120;
  let chipX = 40;
  for (const r of d.profile.reasons.slice(0, 3)) {
    const label = r.toUpperCase();
    ctx.font = font(13, chrome);
    const cw = ctx.measureText(label).width + 22;
    if (chipX + cw > dividerX - 24) {
      chipX = 40;
      chipY += 34;
    }
    bevel(chipX, chipY - 20, cw, 27, C.parchmentDark, C.bevelLight, C.bevelDark, 2);
    text(label, chipX + 11, chipY - 1, font(13, chrome), C.inkSoft);
    chipX += cw + 10;
  }

  // ---- divider ----
  rect(dividerX, bodyTop - 6, 2, 388, C.bevelDark);

  // ---- right: P/L ----
  const rx = 640;
  const rRight = W - 40;
  text("TU PRESUPUESTO · ADMIN. PÚBLICAS", rx, bodyTop, font(15, chrome), C.inkSoft);

  const plRow = (label: string, value: number, delta: number, mode: "revenue" | "spending", y: number) => {
    text(label, rx, y, font(22, SANS, "700"), C.ink);
    text(formatM(value), rRight, y, font(26, SANS, "800"), C.ink, "right");
    if (Math.abs(delta) >= 0.5) {
      const good = mode === "spending" ? delta < 0 : delta > 0;
      text(formatM(delta, { sign: true }), rRight, y + 23, font(16, SANS, "700"), good ? C.moss : C.brick, "right");
    }
  };

  plRow("Ingresos", d.totals.revenue, d.totals.revenue - d.totals.baseRevenue, "revenue", bodyTop + 58);
  plRow("Gastos", d.totals.spending, d.totals.spending - d.totals.baseSpending, "spending", bodyTop + 130);

  // Saldo (big)
  const deficit = d.totals.balance < 0;
  const saldoColor = deficit ? C.brick : C.moss;
  rect(rx, bodyTop + 168, rRight - rx, 2, C.bevelDark);
  text(deficit ? "SALDO (DÉFICIT)" : "SALDO (SUPERÁVIT)", rx, bodyTop + 200, font(16, chrome), saldoColor);
  text(formatM(d.totals.balance, { sign: true }), rRight, bodyTop + 232, font(40, SANS, "800"), saldoColor, "right");
  text(formatGdpPct(d.totals.balance, d.gdp), rRight, bodyTop + 260, font(20, SANS, "700"), C.inkSoft, "right");
  if (Math.abs(d.totals.balanceDelta) >= 0.5) {
    const good = d.totals.balanceDelta > 0;
    text(
      `${good ? "mejora" : "empeora"} ${formatM(d.totals.balanceDelta, { sign: true })} vs. real`,
      rx,
      bodyTop + 260,
      font(15, SANS, "700"),
      good ? C.moss : C.brick,
    );
  }

  // ---- footer ----
  rect(13, H - 13 - 56, W - 26, 56, C.oliveDark);
  const footY = H - 13 - 20;
  text(`CRÉALO TÚ → ${d.host}`, 40, footY, font(15, chrome), C.parchment);
  text("ESTIMACIÓN ILUSTRATIVA · NO OFICIAL", W - 36, footY, font(13, chrome), C.amberLight, "right");

  return canvas;
}

/** Turn a canvas into a PNG Blob (promisified toBlob). */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob falló"))), "image/png");
  });
}
