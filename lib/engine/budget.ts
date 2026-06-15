import type { RevenueLine, SpendingPolicy } from "./types";
import type { IrpfResult } from "./irpf";
import type { IsResult } from "./is";

export interface BudgetTotals {
  /** Total revenue under the current scenario, in M€ (PGE perimeter). */
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
