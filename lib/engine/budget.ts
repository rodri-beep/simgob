import type { RevenueLine, SpendingPolicy } from "./types";
import type { IrpfResult } from "./irpf";
import type { IsResult } from "./is";

export interface BudgetTotals {
  /** Total revenue under the current scenario, in M€ (PGE perimeter). */
  revenue: number;
  /** Total revenue in the base (official) scenario, in M€. */
  baseRevenue: number;
  /** Total spending, in M€ (read-only in v1). */
  spending: number;
  /** revenue − spending, in M€ (negative = deficit). */
  balance: number;
  baseBalance: number;
  /** Change in balance vs the base scenario, in M€. */
  balanceDelta: number;
}

/** Fraction of each tax's national change that accrues to the State perimeter. */
export interface StateShares {
  irpf: number;
  is: number;
}

/**
 * Combine the read-only revenue lines with the simulated IRPF and IS figures and
 * the (static, v1) spending to produce the status-bar totals.
 *
 * The budget is on the PGE perimeter (Civio): the IRPF and IS revenue LINES hold
 * the State's share. The simulation runs on the GROSS NATIONAL figures, so we
 * feed only the State's share of each national delta into the balance
 * (`stateDeltaShare`): the combined IRPF scale splits ~50/50 with the CCAA,
 * while IS is a State tax (share 1.0).
 */
export function computeTotals(
  revenueLines: RevenueLine[],
  spending: SpendingPolicy[],
  irpf: IrpfResult,
  is: IsResult,
  shares: StateShares,
): BudgetTotals {
  let revenue = 0;
  let baseRevenue = 0;
  for (const line of revenueLines) {
    baseRevenue += line.amount;
    if (line.id === "irpf") revenue += line.amount + shares.irpf * irpf.delta;
    else if (line.id === "is") revenue += line.amount + shares.is * is.delta;
    else revenue += line.amount;
  }

  const spendingTotal = spending.reduce((a, s) => a + s.amount, 0);
  const balance = revenue - spendingTotal;
  const baseBalance = baseRevenue - spendingTotal;

  return {
    revenue,
    baseRevenue,
    spending: spendingTotal,
    balance,
    baseBalance,
    balanceDelta: balance - baseBalance,
  };
}
