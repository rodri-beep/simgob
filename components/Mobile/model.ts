"use client";

import { useMemo } from "react";
import { useSim } from "@/lib/store";
import { spendingPolicies, buildings, buildingById } from "@/lib/data";
import { BUILDING_COLORS } from "@/lib/buildingColors";
import type { BuildingId } from "@/lib/engine/types";

/** Which sheet (bottom drawer) is open over the mobile app. */
export type SheetState =
  | { t: "spend"; id: BuildingId }
  | { t: "irpf" | "is" | "info"; id: string }
  | null;

/** Which mobile tab is showing. */
export type MobileTab = "resumen" | "gastos" | "ingresos" | "modelos";

// ---- color helpers (mirror the design's tiny utilities) ----

export function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/** Multiply a hex color toward black (f<1) for a beveled edge. */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = c(((n >> 16) & 255) * f);
  const g = c(((n >> 8) & 255) * f);
  const b = c((n & 255) * f);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** Readable ink/parchment text color over a fill. */
export function txtColor(hex: string): string {
  return isLight(hex) ? "#211f18" : "#f4efe1";
}

/** Compact signed integer without unit, e.g. "+5.000" / "−12.000". */
export function signNum(n: number): string {
  const r = Math.round(n);
  const s = new Intl.NumberFormat("es-ES").format(Math.abs(r));
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${s}`;
}

// ---- area aggregation (by COFOG building) ----

export interface AreaVM {
  id: BuildingId;
  short: string;
  label: string;
  color: string;
  edge: string;
  amount: number;
  base: number;
  delta: number;
  modified: boolean;
}

const baseByBuilding: Record<string, number> = {};
for (const p of spendingPolicies) {
  baseByBuilding[p.building] = (baseByBuilding[p.building] ?? 0) + p.amount;
}

/** Building ids ordered by base spend, descending (stable city/legend order). */
export const ORDERED_BUILDINGS = [...buildings]
  .map((b) => b.id)
  .sort((a, b) => (baseByBuilding[b] ?? 0) - (baseByBuilding[a] ?? 0));

/** Base spend of the biggest function — the city's height reference. */
export const MAX_BASE = baseByBuilding[ORDERED_BUILDINGS[0]];

export function baseShareOf(id: string, baseSpending: number): number {
  return baseSpending > 0 ? (baseByBuilding[id] ?? 0) / baseSpending : 0;
}

/** Per-building aggregation under the current scenario, ordered by base spend. */
export function useAreas(): { areas: AreaVM[]; totalSpending: number } {
  const overrides = useSim((s) => s.spendingOverrides);
  return useMemo(() => {
    const areas: AreaVM[] = ORDERED_BUILDINGS.map((id) => {
      const pols = spendingPolicies.filter((p) => p.building === id);
      const base = pols.reduce((a, p) => a + p.amount, 0);
      const amount = pols.reduce((a, p) => a + (overrides[p.id] ?? p.amount), 0);
      const delta = amount - base;
      const meta = buildingById(id);
      const color = BUILDING_COLORS[id];
      return {
        id,
        short: meta?.short ?? id,
        label: meta?.label ?? id,
        color,
        edge: shade(color, 0.6),
        amount,
        base,
        delta,
        modified: Math.abs(delta) > 0.5,
      };
    });
    const totalSpending = areas.reduce((a, x) => a + x.amount, 0);
    return { areas, totalSpending };
  }, [overrides]);
}
