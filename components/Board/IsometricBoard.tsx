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

// Building height = whole floors, ~proportional to spending. Editing a policy
// changes the floor count (with quantization: small edits inside a floor's
// worth do nothing). One floor ≈ PER_FLOOR_M millones de euros.
const PER_FLOOR_M = 10000;
const FLOOR_PX = 11;

function floorsFor(amountM: number): number {
  return Math.max(1, Math.round(amountM / PER_FLOOR_M));
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

// One row of windows per floor, so the floor count is readable on the building.
function windowsFor(plot: Plot, floors: number, seed: number): Window[] {
  const out: Window[] = [];
  const rand = rng(seed);
  const cols = 3;
  const sw = 0.16;
  const sh = FLOOR_PX * 0.3;
  const y1 = plot.y + plot.d;
  const x1 = plot.x + plot.w;
  for (let f = 0; f < floors; f++) {
    const zc = (f + 0.5) * FLOOR_PX;
    // Front-left face (plane y = y1).
    for (let c = 0; c < cols; c++) {
      const xw = plot.x + ((c + 1) / (cols + 1)) * plot.w;
      out.push({
        pts: poly([
          project(xw - sw, y1, zc - sh),
          project(xw + sw, y1, zc - sh),
          project(xw + sw, y1, zc + sh),
          project(xw - sw, y1, zc + sh),
        ]),
        lit: rand() > 0.5,
      });
    }
    // Front-right face (plane x = x1).
    for (let c = 0; c < cols; c++) {
      const yw = plot.y + ((c + 1) / (cols + 1)) * plot.d;
      out.push({
        pts: poly([
          project(x1, yw - sw, zc - sh),
          project(x1, yw + sw, zc - sh),
          project(x1, yw + sw, zc + sh),
          project(x1, yw - sw, zc + sh),
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

    // ---- Buildings (back-to-front) — floors react to spending edits ----
    const buildings = [...PLOTS]
      .map((p, i) => {
        const baseTotal = buildingTotal(p.id);
        const scen = scenarioTotals[p.id] ?? baseTotal;
        const floors = floorsFor(scen);
        const h = floors * FLOOR_PX;
        const box = isoBox(p.x, p.y, p.x + p.w, p.y + p.d, h);
        allPts.push(...box.top, ...box.left, ...box.right);
        return {
          plot: p,
          baseTotal,
          scen,
          floors,
          box,
          windows: windowsFor(p, floors, i + 7),
          depth: p.x + p.y,
        };
      })
      .sort((a, b) => a.depth - b.depth);

    // ---- Labels on a top layer, with greedy vertical de-collision ----
    const labels = buildings.map((b) => ({
      id: b.plot.id,
      x: b.box.apex.x,
      y: b.box.apex.y - 13,
      name: (buildingById(b.plot.id)?.short ?? b.plot.id).toUpperCase(),
      amount: b.scen,
      modified: Math.abs(b.scen - b.baseTotal) > 0.05,
      modColor: b.scen < b.baseTotal ? "#3f7a32" : "#a83c2e",
    }));
    const MINX = 48;
    const MINY = 17;
    const byY = [...labels].sort((a, b) => a.y - b.y);
    const placed: typeof byY = [];
    for (const l of byY) {
      let guard = 0;
      let collides = true;
      while (collides && guard++ < 60) {
        collides = false;
        for (const q of placed) {
          if (Math.abs(l.x - q.x) < MINX && Math.abs(l.y - q.y) < MINY) {
            l.y = q.y - MINY;
            collides = true;
          }
        }
      }
      placed.push(l);
    }
    for (const l of labels) allPts.push({ x: l.x, y: l.y - 12 }, { x: l.x, y: l.y + 10 });

    const bb = bounds(allPts);
    const pad = 22;
    const viewBox = `${bb.minX - pad} ${bb.minY - pad} ${
      bb.maxX - bb.minX + pad * 2
    } ${bb.maxY - bb.minY + pad * 2}`;

    return {
      viewBox,
      svg: { ground, roadFills, gridLines, buildings, labels },
    };
  }, [scenarioTotals]);

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
      {svg.buildings.map(({ plot, baseTotal, scen, box, windows }) => {
        const isSel = selected === plot.id;
        const meta = buildingById(plot.id);
        const top = isSel ? shade(plot.color, 1.12) : plot.color;
        const modified = Math.abs(scen - baseTotal) > 0.05;
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
          </g>
        );
      })}

      {/* labels — top layer, de-collided, click-through to buildings */}
      <g style={{ pointerEvents: "none" }} aria-hidden>
        {svg.labels.map((l) => (
          <g key={l.id}>
            {l.modified && (
              <circle
                cx={l.x}
                cy={l.y - 10}
                r={2.8}
                fill={l.modColor}
                stroke="#f3ecd4"
                strokeWidth={1}
              />
            )}
            <text x={l.x} y={l.y} textAnchor="middle" className="iso-label" fontSize={6.5}>
              {l.name}
            </text>
            <text
              x={l.x}
              y={l.y + 9}
              textAnchor="middle"
              className="iso-amount"
              fontSize={7.5}
              fontWeight={700}
              style={l.modified ? { fill: l.modColor } : undefined}
            >
              {formatM(l.amount)}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
