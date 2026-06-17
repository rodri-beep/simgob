/**
 * Shareable "España vs país" comparison card (square 1080). Pure client-side
 * canvas, retro SimGob skin — mirrors lib/shareCard. Compares Spain's real AAPP
 * budget with "Spain run like country X" on the three cross-country measures
 * (presión fiscal, gasto público, saldo — all % of GDP). All figures illustrative.
 */
import type { ModelResult } from "./intl";
import { flagDataUri } from "./flags";

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
  oliveDark: "#3d4a2c",
  bevelLight: "#fbf6e2",
  bevelDark: "#8a7f5d",
};

const W = 1080;
const H = 1080;
const SCALE = 2;
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export interface CompareCardData {
  countryId: string;
  countryLabel: string;
  spain: ModelResult;
  country: ModelResult;
  gdp: number;
  baseYear: number;
  host: string;
}

const loadImg = (src: string | null): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    if (!src || typeof Image === "undefined") return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const pct = (v: number) =>
  `${new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v * 100)} %`;
const signedPct = (v: number) =>
  `${v > 0 ? "+" : v < 0 ? "−" : ""}${new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(v * 100))} %`;
const signedPts = (v: number) =>
  `${v > 0 ? "+" : "−"}${new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(v * 100))} pts`;

export async function renderCompareCard(d: CompareCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D no disponible");
  ctx.scale(SCALE, SCALE);

  try {
    if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready;
  } catch {
    /* ignore */
  }
  const [esFlag, coFlag] = await Promise.all([loadImg(flagDataUri("es")), loadImg(flagDataUri(d.countryId))]);

  const root = getComputedStyle(document.documentElement);
  const pixel = root.getPropertyValue("--font-pixel").trim() || "monospace";
  const chrome = root.getPropertyValue("--font-chrome").trim() || "monospace";

  const font = (size: number, family: string, weight = "") => `${weight} ${size}px ${family}`.trim();
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };
  const bevel = (x: number, y: number, w: number, h: number, base: string, t = 3) => {
    rect(x, y, w, h, base);
    rect(x, y, w, t, C.bevelLight);
    rect(x, y, t, h, C.bevelLight);
    rect(x, y + h - t, w, t, C.bevelDark);
    rect(x + w - t, y, t, h, C.bevelDark);
  };
  const text = (
    s: string, x: number, y: number, fnt: string, color: string,
    align: CanvasTextAlign = "left", baseline: CanvasTextBaseline = "alphabetic",
  ) => {
    ctx.font = fnt;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(s, x, y);
  };
  const fit = (s: string, family: string, weight: string, start: number, min: number, maxW: number) => {
    let size = start;
    do {
      ctx.font = font(size, family, weight);
      if (ctx.measureText(s).width <= maxW) break;
      size -= 1;
    } while (size > min);
    return size;
  };
  const drawFlag = (img: HTMLImageElement | null, cx: number, cy: number, fh: number) => {
    if (!img) return;
    const fw = fh * 1.5;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, cx - fw / 2, cy - fh / 2, fw, fh);
  };

  // ---- frame + header ----
  rect(0, 0, W, H, C.tealDark);
  bevel(10, 10, W - 20, H - 20, C.parchment);
  rect(13, 13, W - 26, 86, C.tealDark);
  const tileS = 56;
  bevel(36, 28, tileS, tileS, C.amber);
  text("SG", 36 + tileS / 2, 28 + tileS / 2 + 1, font(20, pixel), C.tealDark, "center", "middle");
  const wordX = 36 + tileS + 24;
  text("SIM", wordX, 58, font(30, pixel), C.parchment);
  ctx.font = font(30, pixel);
  text("GOB", wordX + ctx.measureText("SIM").width, 58, font(30, pixel), C.amber);
  text("GOBIERNA · DECIDE · CUADRA LAS CUENTAS", wordX, 82, font(12, chrome), C.amber);
  text(`NO OFICIAL · ${d.baseYear}`, W - 36, 56, font(14, chrome), C.parchment, "right", "middle");

  const cx = W / 2;
  text("COMPARATIVA · ADMINISTRACIONES PÚBLICAS", cx, 152, font(15, chrome), C.inkSoft, "center");

  // ---- column headers (flag + name) ----
  const lx = W * 0.28;
  const rx = W * 0.72;
  drawFlag(esFlag, lx, 232, 64);
  drawFlag(coFlag, rx, 232, 64);
  const colMaxW = W * 0.42;
  const esSize = fit("ESPAÑA", chrome, "700", 30, 18, colMaxW);
  text("ESPAÑA", lx, 300, font(esSize, chrome, "700"), C.ink, "center");
  const label = d.countryLabel.toUpperCase();
  const coSize = fit(label, chrome, "700", 30, 16, colMaxW);
  text(label, rx, 300, font(coSize, chrome, "700"), C.ink, "center");
  text("REAL", lx, 326, font(12, chrome), C.inkSoft, "center");
  text("SI GOBERNARA ASÍ", rx, 326, font(12, chrome), C.inkSoft, "center");

  // ---- divider ----
  rect(cx - 1, 210, 2, 560, C.bevelDark);

  // ---- stat rows ----
  // Note: a country model keeps Spain's TOTAL spending (only the structure and the
  // revenue level change), so total gasto público is identical by construction —
  // we compare social spending (which the structure reallocates) instead.
  const SOCIAL_IDS = new Set(["social", "salud", "educacion"]);
  const socialPct = (r: ModelResult) =>
    r.spending.filter((s) => SOCIAL_IDS.has(s.id)).reduce((a, s) => a + s.value, 0) / d.gdp;
  type Row = { label: string; es: string; co: string; esColor?: string; coColor?: string };
  const saldoColor = (v: number) => (v < 0 ? C.brick : C.moss);
  const rows: Row[] = [
    { label: "PRESIÓN FISCAL", es: pct(d.spain.revenue / d.gdp), co: pct(d.country.revenue / d.gdp) },
    { label: "GASTO SOCIAL", es: pct(socialPct(d.spain)), co: pct(socialPct(d.country)) },
    {
      label: "SALDO",
      es: signedPct(d.spain.balancePctGdp),
      co: signedPct(d.country.balancePctGdp),
      esColor: saldoColor(d.spain.balancePctGdp),
      coColor: saldoColor(d.country.balancePctGdp),
    },
  ];
  let y = 408;
  for (const r of rows) {
    text(`${r.label} · % PIB`, cx, y, font(15, chrome), C.inkSoft, "center");
    text(r.es, lx, y + 52, font(46, SANS, "800"), r.esColor ?? C.ink, "center");
    text(r.co, rx, y + 52, font(46, SANS, "800"), r.coColor ?? C.ink, "center");
    y += 118;
  }

  // ---- verdict ----
  const dPres = d.country.revenue / d.gdp - d.spain.revenue / d.gdp;
  const dSocial = socialPct(d.country) - socialPct(d.spain);
  const verdict = `${label}: ${signedPts(dPres)} DE PRESIÓN FISCAL · ${signedPts(dSocial)} DE GASTO SOCIAL`;
  rect(40, y + 6, W - 80, 2, C.bevelDark);
  const vSize = fit(verdict, chrome, "", 18, 12, W - 96);
  text(verdict, cx, y + 56, font(vSize, chrome), C.tealDark, "center");

  // ---- footer CTA ----
  const footH = 64;
  const footTop = H - 13 - footH;
  rect(13, footTop, W - 26, footH, C.oliveDark);
  const footMid = footTop + footH / 2;
  const ctaF = font(17, chrome);
  text("¿Y TÚ?", 40, footMid, ctaF, C.amberLight, "left", "middle");
  ctx.font = ctaF;
  text(`   →   CRÉALO EN ${d.host.toUpperCase()}`, 40 + ctx.measureText("¿Y TÚ?").width, footMid, ctaF, C.parchment, "left", "middle");
  text("ESTIMACIÓN ILUSTRATIVA · NO OFICIAL", W - 40, footMid, font(13, chrome), C.amberLight, "right", "middle");

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob falló"))), "image/png");
  });
}
