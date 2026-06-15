"use client";

import { useMemo } from "react";
import { useSim } from "@/lib/store";
import { buildingById, buildingTotal, spendingPolicies } from "@/lib/data";
import type { BuildingId } from "@/lib/engine/types";
import { isoBox, project, poly, shade, bounds, type Pt } from "@/lib/iso";
import { formatM } from "@/lib/engine/format";
import { BUILDING_COLORS } from "@/lib/buildingColors";

interface Plot {
  id: BuildingId;
  x: number;
  y: number;
  w: number;
  d: number;
  color: string;
}

// Hand-placed city blocks (footprint in tile units). Layout, not simulation.
const POSITIONS: Omit<Plot, "color">[] = [
  { id: "moncloa", x: 0.3, y: 0.3, w: 1.5, d: 1.5 },
  { id: "hacienda", x: 2.5, y: 0.3, w: 1.5, d: 1.5 },
  { id: "pensiones", x: 4.7, y: 0.3, w: 1.5, d: 1.5 },
  { id: "sanidad", x: 0.3, y: 2.5, w: 1.5, d: 1.5 },
  { id: "educacion", x: 2.5, y: 2.5, w: 1.5, d: 1.5 },
  { id: "infraestructuras", x: 4.7, y: 2.5, w: 1.5, d: 1.5 },
  { id: "transicion", x: 0.3, y: 4.7, w: 1.5, d: 1.5 },
  { id: "desempleo", x: 2.5, y: 4.7, w: 1.5, d: 1.5 },
  { id: "defensa", x: 4.7, y: 4.7, w: 1.5, d: 1.5 },
  { id: "deuda", x: 1.4, y: 6.9, w: 1.5, d: 1.5 },
  { id: "otros", x: 3.6, y: 6.9, w: 1.5, d: 1.5 },
];

const PLOTS: Plot[] = POSITIONS.map((p) => ({ ...p, color: BUILDING_COLORS[p.id] }));

// Map a € amount to a building height. Roughly ordered by magnitude (a gentle
// hint only — sizes are not to scale; the real figure is printed on each block).
function heightFor(amount: number, min: number, max: number): number {
  const s = Math.sqrt(Math.max(amount, 1));
  const sMin = Math.sqrt(Math.max(min, 1));
  const sMax = Math.sqrt(Math.max(max, 1));
  const t = sMax > sMin ? (s - sMin) / (sMax - sMin) : 0.5;
  return 28 + t * 70;
}

interface Window {
  pts: string;
  lit: boolean;
}

// Deterministic pseudo-random for window lighting.
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function windowsFor(plot: Plot, h: number, seed: number): Window[] {
  const out: Window[] = [];
  const rand = rng(seed);
  const cols = 3;
  const rows = Math.max(1, Math.floor(h / 22));
  const sw = 0.18;
  const sh = 6;
  // Front-left face (plane y = y1).
  const y1 = plot.y + plot.d;
  for (let c = 0; c < cols; c++) {
    const xw = plot.x + ((c + 1) / (cols + 1)) * plot.w;
    for (let rIdx = 0; rIdx < rows; rIdx++) {
      const zw = 12 + rIdx * 20;
      if (zw + sh > h - 4) continue;
      out.push({
        pts: poly([
          project(xw - sw, y1, zw - sh),
          project(xw + sw, y1, zw - sh),
          project(xw + sw, y1, zw + sh),
          project(xw - sw, y1, zw + sh),
        ]),
        lit: rand() > 0.5,
      });
    }
  }
  // Front-right face (plane x = x1).
  const x1 = plot.x + plot.w;
  for (let c = 0; c < cols; c++) {
    const yw = plot.y + ((c + 1) / (cols + 1)) * plot.d;
    for (let rIdx = 0; rIdx < rows; rIdx++) {
      const zw = 12 + rIdx * 20;
      if (zw + sh > h - 4) continue;
      out.push({
        pts: poly([
          project(x1, yw - sw, zw - sh),
          project(x1, yw + sw, zw - sh),
          project(x1, yw + sw, zw + sh),
          project(x1, yw - sw, zw + sh),
        ]),
        lit: rand() > 0.55,
      });
    }
  }
  return out;
}

export function IsometricBoard() {
  const selected = useSim((s) => s.selectedBuilding);
  const select = useSim((s) => s.selectBuilding);
  const overrides = useSim((s) => s.spendingOverrides);

  // Scenario spending per building (geometry stays fixed; only the € label and
  // a "modificado" marker react to edits).
  const scenarioTotals = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of spendingPolicies) {
      m[p.building] = (m[p.building] ?? 0) + (overrides[p.id] ?? p.amount);
    }
    return m;
  }, [overrides]);

  const { svg, viewBox } = useMemo(() => {
    const totals = PLOTS.map((p) => buildingTotal(p.id));
    const min = Math.min(...totals);
    const max = Math.max(...totals);

    const allPts: Pt[] = [];

    // ---- Ground (grass diamond) ----
    const gx0 = -0.6;
    const gy0 = -0.6;
    const gx1 = 6.4;
    const gy1 = 8.6;
    const ground = [
      project(gx0, gy0),
      project(gx1, gy0),
      project(gx1, gy1),
      project(gx0, gy1),
    ];
    allPts.push(...ground);

    // ---- Roads (flat strips) ----
    const roadFills: string[] = [];
    const vRoadXs = [2.15, 4.35];
    const hRoadYs = [2.15, 4.35, 6.55];
    const rw = 0.18;
    for (const cx of vRoadXs) {
      roadFills.push(
        poly([
          project(cx - rw, gy0),
          project(cx + rw, gy0),
          project(cx + rw, gy1),
          project(cx - rw, gy1),
        ]),
      );
    }
    for (const cy of hRoadYs) {
      roadFills.push(
        poly([
          project(gx0, cy - rw),
          project(gx1, cy - rw),
          project(gx1, cy + rw),
          project(gx0, cy + rw),
        ]),
      );
    }

    // ---- Grid lines on grass ----
    const gridLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let gx = Math.ceil(gx0); gx <= Math.floor(gx1); gx++) {
      const a = project(gx, gy0);
      const b = project(gx, gy1);
      gridLines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    for (let gy = Math.ceil(gy0); gy <= Math.floor(gy1); gy++) {
      const a = project(gx0, gy);
      const b = project(gx1, gy);
      gridLines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }

    // ---- Buildings (back-to-front) ----
    const buildings = [...PLOTS]
      .map((p, i) => {
        const total = totals[i];
        const h = heightFor(total, min, max);
        const box = isoBox(p.x, p.y, p.x + p.w, p.y + p.d, h);
        allPts.push(...box.top, ...box.left, ...box.right);
        return {
          plot: p,
          total,
          h,
          box,
          windows: windowsFor(p, h, i + 7),
          depth: p.x + p.y,
        };
      })
      .sort((a, b) => a.depth - b.depth);

    const bb = bounds(allPts);
    const pad = 28;
    const viewBox = `${bb.minX - pad} ${bb.minY - pad} ${
      bb.maxX - bb.minX + pad * 2
    } ${bb.maxY - bb.minY + pad * 2}`;

    return {
      viewBox,
      svg: { ground, roadFills, gridLines, buildings },
    };
  }, []);

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full block"
      role="group"
      aria-label="Mapa isométrico del presupuesto. Pulsa un edificio para ver sus partidas."
      preserveAspectRatio="xMidYMid meet"
    >
      {/* sky-ish backdrop */}
      <rect x="-9999" y="-9999" width="19998" height="19998" fill="#bcd2dc" />

      {/* grass */}
      <polygon points={poly(svg.ground)} fill="#6f8a4e" stroke="#566b3c" strokeWidth={2} />
      {/* grid lines */}
      {svg.gridLines.map((l, i) => (
        <line
          key={`g${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#5d7642"
          strokeWidth={0.6}
          opacity={0.5}
        />
      ))}
      {/* roads */}
      {svg.roadFills.map((p, i) => (
        <polygon key={`r${i}`} points={p} fill="#6a6a60" opacity={0.92} />
      ))}

      {/* buildings */}
      {svg.buildings.map(({ plot, total, box, windows }) => {
        const isSel = selected === plot.id;
        const meta = buildingById(plot.id);
        const top = isSel ? shade(plot.color, 1.12) : plot.color;
        // Scenario € label (geometry stays fixed; only the number reacts).
        const scen = scenarioTotals[plot.id] ?? total;
        const modified = Math.abs(scen - total) > 0.05;
        const modColor = scen < total ? "#3f7a32" : "#a83c2e";
        return (
          <g
            key={plot.id}
            className="iso-bld"
            role="button"
            tabIndex={0}
            aria-label={`${meta?.label ?? plot.id}: ${formatM(scen)}${
              modified ? " (modificado)" : ""
            }`}
            onClick={() => select(isSel ? null : plot.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                select(isSel ? null : plot.id);
              }
            }}
          >
            {/* faces */}
            <polygon
              className="iso-top"
              points={poly(box.top)}
              fill={top}
              stroke={shade(plot.color, 0.6)}
              strokeWidth={0.8}
            />
            <polygon
              points={poly(box.left)}
              fill={shade(plot.color, 0.78)}
              stroke={shade(plot.color, 0.55)}
              strokeWidth={0.6}
            />
            <polygon
              points={poly(box.right)}
              fill={shade(plot.color, 0.62)}
              stroke={shade(plot.color, 0.45)}
              strokeWidth={0.6}
            />
            {/* windows */}
            {windows.map((w, i) => (
              <polygon
                key={i}
                points={w.pts}
                fill={w.lit ? "#f1c75a" : "#33352f"}
                opacity={0.85}
              />
            ))}
            {/* selection ring */}
            {isSel && (
              <polygon
                points={poly(box.top)}
                fill="none"
                stroke="#e09a2d"
                strokeWidth={3}
              />
            )}
            {/* "modificado" marker (dot turns green when cut, red when raised) */}
            {modified && (
              <circle
                cx={box.apex.x}
                cy={box.apex.y - 21}
                r={2.8}
                fill={modColor}
                stroke="#f3ecd4"
                strokeWidth={1}
              />
            )}
            {/* label */}
            <text
              x={box.apex.x}
              y={box.apex.y - 11}
              textAnchor="middle"
              className="iso-label"
              fontSize={6.5}
            >
              {(meta?.short ?? meta?.label ?? plot.id).toUpperCase()}
            </text>
            <text
              x={box.apex.x}
              y={box.apex.y - 2.5}
              textAnchor="middle"
              className="iso-amount"
              fontSize={7.5}
              fontWeight={700}
              style={modified ? { fill: modColor } : undefined}
            >
              {formatM(scen)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
