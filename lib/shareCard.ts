/**
 * Render a shareable PNG card (political profile + P/L) on a canvas — pure
 * client-side, no dependencies, no backend. Mirrors the retro SimGob skin.
 *
 * Identity-first: the political profile (emoji + name + quip) is the hero, with
 * the budget as a compact strip below. Two formats:
 *   - "square"    1080×1080 — the primary share (feeds / Stories / WhatsApp).
 *   - "landscape" 1200×630  — the classic OG ratio, for link unfurls.
 * Drawn at 2× for crisp downloads. Chrome uses the app's pixel/chrome webfonts
 * (read from CSS variables); numbers/name use a clean sans.
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

const SCALE = 2;

export type ShareFormat = "square" | "landscape";

const DIMS: Record<ShareFormat, { W: number; H: number }> = {
  square: { W: 1080, H: 1080 },
  landscape: { W: 1200, H: 630 },
};

export interface ShareCardData {
  profile: PoliticsResult;
  totals: BudgetTotals;
  gdp: number;
  baseYear: number;
  /** Host shown in the call-to-action, e.g. "simgob.com". */
  host: string;
}

const SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

type Chip = { lbl: string; w: number };

/** Draw the card and return the canvas (caller turns it into a Blob/URL). */
export async function renderShareCard(
  d: ShareCardData,
  format: ShareFormat = "square",
): Promise<HTMLCanvasElement> {
  const { W, H } = DIMS[format];
  const square = format === "square";

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
  const data = root.getPropertyValue("--font-data").trim() || SANS;

  // Optional pixel-art sprite for the profile (public/profiles/<id>.png). Falls
  // back to the emoji glyph when the asset is absent, so it upgrades automatically.
  const iconImg = await new Promise<HTMLImageElement | null>((resolve) => {
    if (typeof Image === "undefined") return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `/profiles/${d.profile.id}.png`;
  });

  const cx = W / 2;

  // ---- primitives ----
  const font = (size: number, family: string, weight = "") =>
    `${weight} ${size}px ${family}`.trim();
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };
  const bevel = (
    x: number, y: number, w: number, h: number, base: string,
    light = C.bevelLight, dark = C.bevelDark, t = 3,
  ) => {
    rect(x, y, w, h, base);
    rect(x, y, w, t, light);
    rect(x, y, t, h, light);
    rect(x, y + h - t, w, t, dark);
    rect(x + w - t, y, t, h, dark);
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
  const ctext = (
    s: string, y: number, fnt: string, color: string,
    baseline: CanvasTextBaseline = "alphabetic",
  ) => text(s, cx, y, fnt, color, "center", baseline);
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
  const taglineFont = (size: number) => font(size, data, "600");
  const wrapLines = (s: string, maxW: number, size: number) => {
    ctx.font = taglineFont(size);
    const words = s.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  };
  /** Largest size in [min,max] whose wrap fits in `maxLines`. */
  const fitTagline = (s: string, maxW: number, max: number, min: number, maxLines: number) => {
    for (let sz = max; sz > min; sz--) if (wrapLines(s, maxW, sz).length <= maxLines) return sz;
    return min;
  };

  // ---- layout (per format) ----
  const mx = square ? 84 : 40;
  const footH = square ? 64 : 56;
  const footerTop = H - 13 - footH;

  // ---- frame + header ----
  rect(0, 0, W, H, C.tealDark);
  bevel(10, 10, W - 20, H - 20, C.parchment, C.bevelLight, C.bevelDark, 3);

  rect(13, 13, W - 26, 86, C.tealDark);
  const tileX = 36, tileY = 28, tileS = 56;
  bevel(tileX, tileY, tileS, tileS, C.amber, C.amberLight, C.amberDark, 4);
  text("SG", tileX + tileS / 2, tileY + tileS / 2 + 1, font(20, pixel), C.tealDark, "center", "middle");
  const wordX = tileX + tileS + 24;
  text("SIM", wordX, 58, font(30, pixel), C.parchment);
  ctx.font = font(30, pixel);
  const simW = ctx.measureText("SIM").width;
  text("GOB", wordX + simW, 58, font(30, pixel), C.amber);
  text("GOBIERNA · DECIDE · CUADRA LAS CUENTAS", wordX, 82, font(12, chrome), C.amber);
  text(`NO OFICIAL · ${d.baseYear}`, W - 36, 56, font(14, chrome), C.parchment, "right", "middle");

  // ---- hero: political identity (top block) ----
  const eyebrowY = square ? 178 : 124;
  ctext("TU PERFIL POLÍTICO", eyebrowY, font(square ? 16 : 14, chrome), C.inkSoft);

  // The site renders the profile label in the chrome (Silkscreen) face, uppercase —
  // match that here instead of a generic sans, sized to fit.
  const name = d.profile.label.toUpperCase();
  const iconSize = square ? 168 : 88;
  const emojiSize = square ? 150 : 76;

  /** Draw the pixel sprite (crisp, nearest-neighbour) centred at (px,py); returns its width. */
  const drawSprite = (img: HTMLImageElement, px: number, py: number, h: number) => {
    const ar = img.width && img.height ? img.width / img.height : 1;
    const w = h * ar;
    const prev = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, px - w / 2, py - h / 2, w, h);
    ctx.imageSmoothingEnabled = prev;
    return w;
  };
  /** Width the hero glyph (sprite or emoji) will occupy, for row centring. */
  const heroGlyphWidth = () => {
    if (iconImg) return iconSize * (iconImg.width && iconImg.height ? iconImg.width / iconImg.height : 1);
    ctx.font = font(emojiSize, data);
    return ctx.measureText(d.profile.emoji).width;
  };

  if (square) {
    // sprite/emoji over name, both centered
    if (iconImg) drawSprite(iconImg, cx, 312, iconSize);
    else ctext(d.profile.emoji, 318, font(emojiSize, data), C.ink, "middle");
    const nameSize = fitSize(name, chrome, "700", 56, 28, W - 2 * mx);
    ctext(name, 452, font(nameSize, chrome, "700"), C.ink, "middle");
  } else {
    // sprite/emoji + name on one centered row, aligned on a shared middle line
    const heroCenterY = 188;
    const gap = 22;
    const ew = heroGlyphWidth();
    const nameSize = fitSize(name, chrome, "700", 38, 22, W - 2 * mx - ew - gap);
    const nameF = font(nameSize, chrome, "700");
    ctx.font = nameF;
    const nw = ctx.measureText(name).width;
    const startX = cx - (ew + gap + nw) / 2;
    if (iconImg) drawSprite(iconImg, startX + ew / 2, heroCenterY, iconSize);
    else text(d.profile.emoji, startX, heroCenterY, font(emojiSize, data), C.ink, "left", "middle");
    text(name, startX + ew + gap, heroCenterY, nameF, C.ink, "left", "middle");
  }

  // tagline (quip) — auto-sized so it never overruns the budget strip below
  const tagTopY = square ? 512 : 248;
  const tagLineH = square ? 40 : 30;
  const tagMaxW = W - 2 * (square ? 96 : 60);
  const tagSize = fitTagline(d.profile.blurb, tagMaxW, square ? 28 : 22, square ? 20 : 15, square ? 2 : 1);
  const tagLinesArr = wrapLines(d.profile.blurb, tagMaxW, tagSize);
  tagLinesArr.forEach((ln, i) => ctext(ln, tagTopY + i * tagLineH, taglineFont(tagSize), C.inkSoft));
  const lastTagY = tagTopY + (tagLinesArr.length - 1) * tagLineH;

  // reason chips — centered, wrap to a second row if needed
  const chipSize = square ? 14 : 13;
  const chipH = square ? 28 : 26;
  const drawChips = (reasons: string[], centerY: number, maxRowW: number) => {
    const f = font(chipSize, chrome);
    ctx.font = f;
    const all: Chip[] = reasons.slice(0, 3).map((r) => {
      const lbl = r.toUpperCase();
      return { lbl, w: ctx.measureText(lbl).width + 22 };
    });
    const rows: { items: Chip[]; w: number }[] = [];
    let cur: Chip[] = [];
    let curW = 0;
    for (const it of all) {
      const add = (cur.length ? 10 : 0) + it.w;
      if (curW + add > maxRowW && cur.length) {
        rows.push({ items: cur, w: curW });
        cur = [];
        curW = 0;
      }
      curW += (cur.length ? 10 : 0) + it.w;
      cur.push(it);
    }
    if (cur.length) rows.push({ items: cur, w: curW });
    let y = centerY;
    let bottom = centerY + chipH / 2;
    for (const row of rows) {
      let x = cx - row.w / 2;
      for (const it of row.items) {
        bevel(x, y - chipH / 2, it.w, chipH, C.parchmentDark, C.bevelLight, C.bevelDark, 2);
        text(it.lbl, x + 11, y, f, C.inkSoft, "left", "middle");
        x += it.w + 10;
      }
      bottom = y + chipH / 2;
      y += chipH + 12;
    }
    return bottom;
  };
  const chipsBottom =
    d.profile.reasons.length > 0
      ? drawChips(d.profile.reasons, lastTagY + (square ? 38 : 16) + chipH / 2, W - 2 * mx)
      : lastTagY + chipH / 2;

  // ---- budget strip + saldo (cascades right below the chips) ----
  const deficit = d.totals.balance < 0;
  const saldoColor = deficit ? C.brick : C.moss;
  const hasDelta = Math.abs(d.totals.balanceDelta) >= 0.5;

  const dividerY = chipsBottom + (square ? 34 : 22);
  const plEyebrowY = dividerY + (square ? 40 : 30);
  const plLineY = plEyebrowY + (square ? 42 : 32);
  const saldoLabelY = plLineY + (square ? 54 : 38);
  const saldoY = saldoLabelY + (square ? 60 : 40);
  const pibY = saldoY + (square ? 40 : 26);
  const vsRealY = pibY + (square ? 32 : 18);

  // Budget figures use the chrome (Silkscreen) face too, for one cohesive retro
  // card. Silkscreen is wide, so fit the long lines to width.
  rect(mx, dividerY, W - 2 * mx, 2, C.bevelDark);
  ctext(`TU PRESUPUESTO · AAPP ${d.baseYear}`, plEyebrowY, font(square ? 14 : 12, chrome), C.inkSoft);

  const plLine = `INGRESOS ${formatM(d.totals.revenue)}   ·   GASTOS ${formatM(d.totals.spending)}`;
  ctext(plLine, plLineY, font(fitSize(plLine, chrome, "400", square ? 20 : 16, square ? 12 : 10, W - 2 * mx), chrome), C.ink);

  ctext(deficit ? "SALDO · DÉFICIT" : "SALDO · SUPERÁVIT", saldoLabelY, font(square ? 17 : 14, chrome), saldoColor);
  const saldoStr = formatM(d.totals.balance, { sign: true });
  ctext(saldoStr, saldoY, font(fitSize(saldoStr, chrome, "700", square ? 50 : 32, square ? 28 : 18, W - 2 * mx), chrome, "700"), saldoColor);
  ctext(formatGdpPct(d.totals.balance, d.gdp).toUpperCase(), pibY, font(square ? 18 : 14, chrome), C.inkSoft);
  if (hasDelta) {
    const good = d.totals.balanceDelta > 0;
    const vsReal = `${good ? "MEJORA" : "EMPEORA"} ${formatM(d.totals.balanceDelta, { sign: true })} VS. REAL`;
    ctext(vsReal, vsRealY, font(fitSize(vsReal, chrome, "400", square ? 15 : 12, square ? 11 : 9, W - 2 * mx), chrome), good ? C.moss : C.brick);
  }

  // ---- footer: the "¿y tú?" challenge CTA ----
  rect(13, footerTop, W - 26, footH, C.oliveDark);
  const footMid = footerTop + footH / 2;
  const ctaF = font(square ? 17 : 15, chrome);
  const cta = "¿Y TÚ?";
  text(cta, mx, footMid, ctaF, C.amberLight, "left", "middle");
  ctx.font = ctaF;
  const ctaW = ctx.measureText(cta).width;
  text(`   →   CRÉALO EN ${d.host.toUpperCase()}`, mx + ctaW, footMid, ctaF, C.parchment, "left", "middle");
  text("ESTIMACIÓN ILUSTRATIVA · NO OFICIAL", W - mx, footMid, font(13, chrome), C.amberLight, "right", "middle");

  return canvas;
}

/** Turn a canvas into a PNG Blob (promisified toBlob). */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob falló"))), "image/png");
  });
}
