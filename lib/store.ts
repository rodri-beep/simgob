"use client";

import { create } from "zustand";
import type { BuildingId, IrpfScale } from "./engine/types";
import { cloneScale } from "./engine/irpf";
import { irpfData, isData } from "./data";

interface SimState {
  // ---- Editable scenario (the only things that recalculate in v1) ----
  irpfScale: IrpfScale;
  isNominalRate: number;
  isMinimumRate: number;

  // ---- UI state (not part of the simulation) ----
  selectedBuilding: BuildingId | null;
  activeRevenue: "irpf" | "is";
  crt: boolean;

  // ---- Actions ----
  setIrpfGeneralRate: (index: number, rate: number) => void;
  setIrpfSavingsRate: (index: number, rate: number) => void;
  setIsNominalRate: (rate: number) => void;
  setIsMinimumRate: (rate: number) => void;
  reset: () => void;
  selectBuilding: (id: BuildingId | null) => void;
  setActiveRevenue: (which: "irpf" | "is") => void;
  toggleCrt: () => void;
}

const baseIrpfScale = irpfData.scale;
const baseIsNominal = isData.nominalRate;
const baseIsMinimum = isData.minimumRate;

export const useSim = create<SimState>((set) => ({
  irpfScale: cloneScale(baseIrpfScale),
  isNominalRate: baseIsNominal,
  isMinimumRate: baseIsMinimum,

  selectedBuilding: null,
  activeRevenue: "irpf",
  crt: false,

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

  setIsNominalRate: (rate) => set({ isNominalRate: rate }),
  setIsMinimumRate: (rate) => set({ isMinimumRate: rate }),

  reset: () =>
    set({
      irpfScale: cloneScale(baseIrpfScale),
      isNominalRate: baseIsNominal,
      isMinimumRate: baseIsMinimum,
    }),

  selectBuilding: (id) => set({ selectedBuilding: id }),
  setActiveRevenue: (which) => set({ activeRevenue: which }),
  toggleCrt: () => set((s) => ({ crt: !s.crt })),
}));

/** True when the scenario differs from the official base scenario. */
export function isDirty(state: SimState): boolean {
  if (state.isNominalRate !== baseIsNominal) return true;
  if (state.isMinimumRate !== baseIsMinimum) return true;
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
