"use client";

import { create } from "zustand";
import type { BuildingId, IrpfScale } from "./engine/types";
import { cloneScale } from "./engine/irpf";
import { irpfData, isData } from "./data";
import type { Scenario } from "./share";

interface SimState {
  // ---- Editable scenario ----
  irpfScale: IrpfScale;
  isNominalRate: number;
  isMinimumRate: number;
  /** Per-policy spending overrides (M€), keyed by policy id. Absent = official base. */
  spendingOverrides: Record<string, number>;

  // ---- UI state (not part of the simulation) ----
  selectedBuilding: BuildingId | null;
  activeRevenue: "irpf" | "is";
  crt: boolean;
  /** "¿y a ti?" personal gross annual salary (€), or null if not entered. */
  grossSalary: number | null;
  /** Whether the "¿cómo funciona?" walkthrough is open. */
  introOpen: boolean;
  /** Whether the taxes ("Impuestos") modal is open. */
  impuestosOpen: boolean;
  /** Whether the "Compartir" (share card) modal is open. */
  shareOpen: boolean;
  /** Last loaded country template id (for highlighting), or null. */
  countryTemplate: string | null;

  // ---- Actions ----
  setIrpfGeneralRate: (index: number, rate: number) => void;
  setIrpfSavingsRate: (index: number, rate: number) => void;
  /** Simple mode: shift ALL general brackets uniformly by `delta` (from base). */
  setIrpfUniformRate: (delta: number) => void;
  setIsNominalRate: (rate: number) => void;
  setIsMinimumRate: (rate: number) => void;
  setSpending: (id: string, amount: number) => void;
  /** Replace all spending overrides at once (e.g. a country template). */
  setAllSpending: (overrides: Record<string, number>) => void;
  resetSpendingLine: (id: string) => void;
  setCountryTemplate: (id: string | null) => void;
  /** Apply a (partial) scenario, e.g. decoded from a shared URL. */
  applyScenario: (sc: Partial<Scenario>) => void;
  reset: () => void;
  selectBuilding: (id: BuildingId | null) => void;
  setActiveRevenue: (which: "irpf" | "is") => void;
  toggleCrt: () => void;
  setGrossSalary: (gross: number | null) => void;
  setIntro: (open: boolean) => void;
  setImpuestosOpen: (open: boolean) => void;
  setShareOpen: (open: boolean) => void;
}

const baseIrpfScale = irpfData.scale;
const baseIsNominal = isData.nominalRate;
const baseIsMinimum = isData.minimumRate;

export const useSim = create<SimState>((set) => ({
  irpfScale: cloneScale(baseIrpfScale),
  isNominalRate: baseIsNominal,
  isMinimumRate: baseIsMinimum,
  spendingOverrides: {},

  selectedBuilding: null,
  activeRevenue: "irpf",
  crt: false,
  grossSalary: null,
  introOpen: false,
  impuestosOpen: false,
  shareOpen: false,
  countryTemplate: null,

  setIrpfGeneralRate: (index, rate) =>
    set((s) => {
      const general = s.irpfScale.general.map((b, i) =>
        i === index ? { ...b, rate } : b,
      );
      return { irpfScale: { ...s.irpfScale, general } };
    }),

  setIrpfSavingsRate: (index, rate) =>
    set((s) => {
      const savings = s.irpfScale.savings.map((b, i) =>
        i === index ? { ...b, rate } : b,
      );
      return { irpfScale: { ...s.irpfScale, savings } };
    }),

  setIrpfUniformRate: (delta) =>
    set((s) => {
      const general = baseIrpfScale.general.map((b) => ({
        ...b,
        rate: Math.min(0.9, Math.max(0, b.rate + delta)),
      }));
      return { irpfScale: { ...s.irpfScale, general } };
    }),

  setIsNominalRate: (rate) => set({ isNominalRate: rate }),
  setIsMinimumRate: (rate) => set({ isMinimumRate: rate }),

  setSpending: (id, amount) =>
    set((s) => ({
      spendingOverrides: { ...s.spendingOverrides, [id]: Math.max(0, amount) },
    })),

  setAllSpending: (overrides) => set({ spendingOverrides: { ...overrides } }),

  resetSpendingLine: (id) =>
    set((s) => {
      if (!(id in s.spendingOverrides)) return s;
      const next = { ...s.spendingOverrides };
      delete next[id];
      return { spendingOverrides: next };
    }),

  setCountryTemplate: (id) => set({ countryTemplate: id }),

  applyScenario: (sc) =>
    set((s) => ({
      irpfScale: sc.irpfScale ? cloneScale(sc.irpfScale) : s.irpfScale,
      isNominalRate: sc.isNominalRate ?? s.isNominalRate,
      isMinimumRate: sc.isMinimumRate ?? s.isMinimumRate,
      spendingOverrides: sc.spendingOverrides ?? s.spendingOverrides,
    })),

  reset: () =>
    set({
      irpfScale: cloneScale(baseIrpfScale),
      isNominalRate: baseIsNominal,
      isMinimumRate: baseIsMinimum,
      spendingOverrides: {},
      countryTemplate: null,
    }),

  selectBuilding: (id) => set({ selectedBuilding: id }),
  setActiveRevenue: (which) => set({ activeRevenue: which }),
  toggleCrt: () => set((s) => ({ crt: !s.crt })),
  setGrossSalary: (gross) =>
    set({ grossSalary: gross == null ? null : Math.max(0, gross) }),
  setIntro: (open) => set({ introOpen: open }),
  setImpuestosOpen: (open) => set({ impuestosOpen: open }),
  setShareOpen: (open) => set({ shareOpen: open }),
}));

/** Average uniform shift (pp, as a fraction) of the general scale vs base. */
export function irpfUniformDelta(state: SimState): number {
  const g = state.irpfScale.general;
  const b = baseIrpfScale.general;
  let sum = 0;
  for (let i = 0; i < g.length; i++) sum += g[i].rate - b[i].rate;
  return sum / g.length;
}

/** True when every general bracket is shifted by the same amount vs base. */
export function irpfIsUniform(state: SimState): boolean {
  const g = state.irpfScale.general;
  const b = baseIrpfScale.general;
  const d0 = g[0].rate - b[0].rate;
  return g.every((x, i) => Math.abs(x.rate - b[i].rate - d0) < 1e-6);
}

/** True when the scenario differs from the official base scenario. */
export function isDirty(state: SimState): boolean {
  if (state.isNominalRate !== baseIsNominal) return true;
  if (state.isMinimumRate !== baseIsMinimum) return true;
  if (Object.keys(state.spendingOverrides).length > 0) return true;
  for (let i = 0; i < state.irpfScale.general.length; i++) {
    if (state.irpfScale.general[i].rate !== baseIrpfScale.general[i].rate)
      return true;
  }
  for (let i = 0; i < state.irpfScale.savings.length; i++) {
    if (state.irpfScale.savings[i].rate !== baseIrpfScale.savings[i].rate)
      return true;
  }
  return false;
}
