"use client";

import { useMemo } from "react";
import { useSim, isDirty } from "./store";
import { irpfData, isData, revenueLines, spendingPolicies } from "./data";
import { simulateIrpf } from "./engine/irpf";
import { simulateIs } from "./engine/is";
import { computeTotals } from "./engine/budget";

/**
 * Single source of truth for derived figures. Recomputes only when an editable
 * lever (IRPF scale, IS rates) changes — buildings and other UI state don't
 * trigger recalculation, matching the spec (the number leads, art is static).
 */
export function useSimResults() {
  const irpfScale = useSim((s) => s.irpfScale);
  const isNominalRate = useSim((s) => s.isNominalRate);
  const isMinimumRate = useSim((s) => s.isMinimumRate);
  const dirty = useSim(isDirty);

  const irpf = useMemo(() => simulateIrpf(irpfData, irpfScale), [irpfScale]);
  const is = useMemo(
    () => simulateIs(isData, isNominalRate, isMinimumRate),
    [isNominalRate, isMinimumRate],
  );
  const totals = useMemo(
    () =>
      computeTotals(revenueLines, spendingPolicies, irpf, is, {
        irpf: irpfData.stateDeltaShare,
        is: isData.stateDeltaShare,
      }),
    [irpf, is],
  );

  return { irpf, is, totals, dirty };
}
