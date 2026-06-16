import type { RevenueLine, SpendingPolicy } from "./types";
import type { IrpfResult } from "./irpf";
import type { IsResult } from "./is";

export interface BudgetTotals {
  /** Total revenue under the current scenario, in M€ (AAPP perimeter). */
  revenue: number;
  /** Total revenue in the base (official) scenario, in M€. */
  baseRevenue: number;
  /** Total spending under the current scenario, in M€. */
  spending: number;
  /** Total spending in the base (official) scenario, in M€. */
  baseSpending: number;
  /** revenue − spending, in M€ (negative = deficit). */
  balance: number;
  baseBalance: number;
  /** Change in balance vs the base scenario, in M€. */
  balanceDelta: number;
}

/** Fraction of each tax's national change that accrues to the perimeter. */
export interface StateShares {
  irpf: number;
  is: number;
}

/**
 * Combine the read-only revenue lines with the simulated IRPF and IS figures and
 * the spending to produce the status-bar totals.
 *
 * The budget is on the AAPP (general government) perimeter: the IRPF and IS
 * revenue LINES hold the full national collection, and the whole national delta
 * of each tax flows into the balance (`stateDeltaShare` = 1.0 for both, since
 * the perimeter already includes the State and the CCAA).
 */
export function computeTotals(
  revenueLines: RevenueLine[],
  spending: SpendingPolicy[],
  irpf: IrpfResult,
  is: IsResult,
  shares: StateShares,
  spendingOverrides: Record<string, number> = {},
): BudgetTotals {
  let revenue = 0;
  let baseRevenue = 0;
  for (const line of revenueLines) {
    baseRevenue += line.amount;
    if (line.id === "irpf") revenue += line.amount + shares.irpf * irpf.delta;
    else if (line.id === "is") revenue += line.amount + shares.is * is.delta;
    else revenue += line.amount;
  }

  // Spending edits (P1) flow straight to the balance, with no second-order
  // effects (cutting a policy does not change tax revenue).
  let baseSpending = 0;
  let scenarioSpending = 0;
  for (const p of spending) {
    baseSpending += p.amount;
    const override = spendingOverrides[p.id];
    scenarioSpending += override ?? p.amount;
  }

  const balance = revenue - scenarioSpending;
  const baseBalance = baseRevenue - baseSpending;

  return {
    revenue,
    baseRevenue,
    spending: scenarioSpending,
    baseSpending,
    balance,
    baseBalance,
    balanceDelta: balance - baseBalance,
  };
}
