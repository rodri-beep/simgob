/** Pure helpers for the isometric (2:1) board geometry. No React here. */

export const TILE_W = 64;
export const TILE_H = 32; // 2:1 projection

export interface Pt {
  x: number;
  y: number;
}

/** Project a world point (tile coords x,y and pixel height z) to screen space. */
export function project(x: number, y: number, z = 0): Pt {
  return {
    x: (x - y) * (TILE_W / 2),
    y: (x + y) * (TILE_H / 2) - z,
  };
}

const r = (n: number) => Math.round(n * 100) / 100;

/** Serialize points for an SVG `points` attribute. */
export function poly(pts: Pt[]): string {
  return pts.map((p) => `${r(p.x)},${r(p.y)}`).join(" ");
}

/** Darken (f<1) or lighten (f>1) a #rrggbb color by a factor. */
export function shade(hex: string, f: number): string {
  const m = hex.replace("#", "");
  const num = parseInt(
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m,
    16,
  );
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const rr = clamp(((num >> 16) & 0xff) * f);
  const gg = clamp(((num >> 8) & 0xff) * f);
  const bb = clamp((num & 0xff) * f);
  return `#${((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1)}`;
}

export interface IsoBox {
  top: Pt[];
  left: Pt[];
  right: Pt[];
  /** Apex of the top face (for label anchoring), screen coords. */
  apex: Pt;
  /** Bottom-front corner (largest screen y), for depth sorting. */
  front: Pt;
}

/**
 * Build the three visible faces of an isometric box whose footprint spans
 * (x0,y0)–(x1,y1) in tile units with pixel height h.
 */
export function isoBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  h: number,
): IsoBox {
  const top = [
    project(x0, y0, h),
    project(x1, y0, h),
    project(x1, y1, h),
    project(x0, y1, h),
  ];
  // Front-left face: plane y = y1, x from x0..x1.
  const left = [
    project(x0, y1, 0),
    project(x1, y1, 0),
    project(x1, y1, h),
    project(x0, y1, h),
  ];
  // Front-right face: plane x = x1, y from y0..y1.
  const right = [
    project(x1, y0, 0),
    project(x1, y1, 0),
    project(x1, y1, h),
    project(x1, y0, h),
  ];
  const apex = project((x0 + x1) / 2, (y0 + y1) / 2, h);
  const front = project(x1, y1, 0);
  return { top, left, right, apex, front };
}

/** Bounding box (screen space) of a set of points. */
export function bounds(pts: Pt[]) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}
