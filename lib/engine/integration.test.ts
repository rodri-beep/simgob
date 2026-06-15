import { describe, it, expect } from "vitest";
import { irpfData, isData, revenueLines, spendingPolicies } from "@/lib/data";
import { simulateIrpf, cloneScale } from "./irpf";
import { simulateIs } from "./is";
import { computeTotals } from "./budget";

/**
 * Integration tests over the REAL committed dataset. These encode the spec's
 * acceptance criteria: untouched base must reproduce the official figures.
 */
describe("base scenario reproduces official figures (real data)", () => {
  const irpf = simulateIrpf(irpfData, cloneScale(irpfData.scale));
  const is = simulateIs(isData, isData.nominalRate, isData.minimumRate);
  const totals = computeTotals(revenueLines, spendingPolicies, irpf, is, {
    irpf: irpfData.stateDeltaShare,
    is: isData.stateDeltaShare,
  });

  it("IRPF base equals the official anchor (120.280 M€)", () => {
    expect(irpf.baseRevenue).toBeCloseTo(120280, 0);
    expect(irpf.delta).toBeCloseTo(0, 3);
  });

  it("IRPF calibration factor is close to 1 (model ≈ official)", () => {
    // With the mínimo personal modeled, the bracket model lands near reality.
    expect(irpf.calibrationFactor).toBeGreaterThan(0.9);
    expect(irpf.calibrationFactor).toBeLessThan(1.1);
  });

  it("IS base equals the official anchor and effective rate ≈ 21,9 %", () => {
    expect(is.scenarioRevenue).toBeCloseTo(35060, 0);
    expect(is.effectiveRate).toBeGreaterThan(0.2);
    expect(is.effectiveRate).toBeLessThan(0.23);
  });

  // Per-line values are the official figures to 1 decimal, so aggregate sums
  // carry sub-0.5 M€ rounding (immaterial on a €400 bn base).
  it("budget totals reproduce the perimeter (400.009 / 450.721 / −50.712)", () => {
    expect(totals.revenue).toBeCloseTo(400009.3, 0);
    expect(totals.spending).toBeCloseTo(450721.5, 0);
    expect(totals.balance).toBeCloseTo(-50712, 0);
    expect(totals.balanceDelta).toBeCloseTo(0, 6);
  });

  it("revenue lines sum to the official total", () => {
    const sum = revenueLines.reduce((a, l) => a + l.amount, 0);
    expect(sum).toBeCloseTo(400009.3, 0);
  });

  it("spending policies sum to the official total", () => {
    const sum = spendingPolicies.reduce((a, p) => a + p.amount, 0);
    expect(sum).toBeCloseTo(450721.5, 0);
  });

  it("raising the top IRPF brackets increases revenue and flags top brackets as losers", () => {
    const scenario = cloneScale(irpfData.scale);
    scenario.general[4].rate = 0.5; // 45 % -> 50 %
    scenario.general[5].rate = 0.55; // 47 % -> 55 %
    const r = simulateIrpf(irpfData, scenario);
    expect(r.delta).toBeGreaterThan(0);
    const top = r.brackets.find((b) => b.id === "t9")!;
    expect(top.verdict).toBe("loser");
    // The state only captures part of the national delta.
    const before = computeTotals(revenueLines, spendingPolicies, irpf, is, {
      irpf: irpfData.stateDeltaShare,
      is: isData.stateDeltaShare,
    });
    const after = computeTotals(revenueLines, spendingPolicies, r, is, {
      irpf: irpfData.stateDeltaShare,
      is: isData.stateDeltaShare,
    });
    expect(after.revenue - before.revenue).toBeCloseTo(
      irpfData.stateDeltaShare * r.delta,
      3,
    );
  });
});
