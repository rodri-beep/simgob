import { describe, it, expect } from "vitest";
import { computeTotals } from "./budget";
import { revenueLines, spendingPolicies, irpfData, isData } from "@/lib/data";
import { simulateIrpf, cloneScale } from "./irpf";
import { simulateIs } from "./is";

const irpf = simulateIrpf(irpfData, cloneScale(irpfData.scale));
const is = simulateIs(isData, isData.nominalRate, isData.minimumRate);
const shares = { irpf: irpfData.stateDeltaShare, is: isData.stateDeltaShare };

describe("computeTotals with spending overrides", () => {
  it("with no overrides, scenario spending equals base spending", () => {
    const t = computeTotals(revenueLines, spendingPolicies, irpf, is, shares);
    expect(t.spending).toBeCloseTo(t.baseSpending, 6);
    expect(t.balanceDelta).toBeCloseTo(0, 6);
  });

  it("cutting a policy reduces spending and improves the balance 1:1", () => {
    const top = spendingPolicies[0]; // pensiones (largest)
    const cut = top.amount - 10000; // recorta 10.000 M€
    const t = computeTotals(revenueLines, spendingPolicies, irpf, is, shares, {
      [top.id]: cut,
    });
    expect(t.spending).toBeCloseTo(t.baseSpending - 10000, 3);
    // Cutting spending improves (raises) the balance by the same amount.
    expect(t.balanceDelta).toBeCloseTo(10000, 3);
    expect(t.balance).toBeCloseTo(t.baseBalance + 10000, 3);
  });

  it("increasing a policy worsens the balance; revenue is untouched (no 2nd-order)", () => {
    const p = spendingPolicies[0];
    const t = computeTotals(revenueLines, spendingPolicies, irpf, is, shares, {
      [p.id]: p.amount + 5000,
    });
    expect(t.balanceDelta).toBeCloseTo(-5000, 3);
    expect(t.revenue).toBeCloseTo(t.baseRevenue, 6); // no effect on revenue
  });

  it("setting a policy to zero removes exactly its amount from spending", () => {
    const p = spendingPolicies[0];
    const t = computeTotals(revenueLines, spendingPolicies, irpf, is, shares, {
      [p.id]: 0,
    });
    expect(t.spending).toBeCloseTo(t.baseSpending - p.amount, 3);
  });
});
