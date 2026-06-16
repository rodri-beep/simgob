"use client";

import { useSim } from "./store";
import { useSimResults } from "./useSimResults";
import { irpfData, spendingPolicies } from "./data";
import {
  classifyPolitics,
  SOCIAL_POLICY_IDS,
  SECURITY_POLICY_IDS,
  type PoliticsResult,
} from "./engine/politics";

const baseById: Record<string, number> = Object.fromEntries(
  spendingPolicies.map((p) => [p.id, p.amount]),
);

/**
 * Compute the satirical "perfil político" from the current scenario. Shared by
 * the on-screen panel and the share card so they always agree.
 */
export function usePolitics(): PoliticsResult {
  const { irpf, is, totals } = useSimResults();
  const scale = useSim((s) => s.irpfScale);
  const overrides = useSim((s) => s.spendingOverrides);

  const baseGeneral = irpfData.scale.general;
  const topRateDelta =
    (scale.general[4].rate - baseGeneral[4].rate + (scale.general[5].rate - baseGeneral[5].rate)) / 2;

  const deltaFor = (ids: string[]) =>
    ids.reduce((a, id) => a + ((overrides[id] ?? baseById[id] ?? 0) - (baseById[id] ?? 0)), 0);

  return classifyPolitics({
    taxDelta: irpf.delta + is.delta,
    topRateDelta,
    socialDelta: deltaFor(SOCIAL_POLICY_IDS),
    securityDelta: deltaFor(SECURITY_POLICY_IDS),
    totalSpendDelta: totals.spending - totals.baseSpending,
    balance: totals.balance,
    baseBalance: totals.baseBalance,
  });
}
