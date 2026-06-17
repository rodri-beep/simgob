/**
 * Country flag shapes as SVG strings — the single source of truth shared by the
 * <Flag> component (DOM) and the canvas cards (rasterised via a data URI). Flag
 * emoji don't render on Windows, so we always draw these.
 */
const cross = (bg: string, fg: string) =>
  `<rect width="30" height="20" fill="${bg}"/><rect x="9" width="4" height="20" fill="${fg}"/><rect y="8" width="30" height="4" fill="${fg}"/>`;
const vstripes = (a: string, b: string, c: string) =>
  `<rect width="10" height="20" fill="${a}"/><rect x="10" width="10" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`;

function euStars(): string {
  let s = `<rect width="30" height="20" fill="#003399"/>`;
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    s += `<circle cx="${(15 + 6 * Math.sin(a)).toFixed(2)}" cy="${(10 - 6 * Math.cos(a)).toFixed(2)}" r="0.9" fill="#ffcc00"/>`;
  }
  return s;
}

function usFlag(): string {
  let s = `<rect width="30" height="20" fill="#b22234"/>`;
  for (let i = 0; i < 6; i++) {
    s += `<rect y="${((2 * i + 1) * (20 / 13)).toFixed(2)}" width="30" height="${(20 / 13).toFixed(2)}" fill="#ffffff"/>`;
  }
  s += `<rect width="12" height="${(7 * (20 / 13)).toFixed(2)}" fill="#3c3b6e"/>`;
  for (const [x, y] of [[2.5, 2], [5.5, 2], [8.5, 2], [4, 4], [7, 4], [2.5, 6], [5.5, 6], [8.5, 6]]) {
    s += `<circle cx="${x}" cy="${y}" r="0.55" fill="#ffffff"/>`;
  }
  return s;
}

/** Inner SVG content for each flag, drawn in a `0 0 30 20` viewBox. */
export const FLAG_INNER: Record<string, string> = {
  es: `<rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/>`,
  suecia: cross("#006aa7", "#fecc00"),
  dinamarca: cross("#c8102e", "#ffffff"),
  alemania: `<rect width="30" height="6.67" fill="#000000"/><rect y="6.67" width="30" height="6.67" fill="#dd0000"/><rect y="13.33" width="30" height="6.67" fill="#ffce00"/>`,
  francia: vstripes("#0055a4", "#ffffff", "#ef4135"),
  italia: vstripes("#009246", "#ffffff", "#ce2b37"),
  ue27: euStars(),
  eeuu: usFlag(),
};

const BORDER = `<rect width="30" height="20" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>`;

/** Full standalone SVG markup for a flag (with border), or null if unknown.
 *  Sized 240×160 so canvas rasterisation stays crisp when scaled down. */
export function flagSvg(country: string): string | null {
  const inner = FLAG_INNER[country];
  if (!inner) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 30 20">${inner}${BORDER}</svg>`;
}

/** A data URI for the flag, for `new Image()` / canvas drawImage. */
export function flagDataUri(country: string): string | null {
  const svg = flagSvg(country);
  if (!svg) return null;
  const b64 = typeof btoa === "function" ? btoa(svg) : Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
