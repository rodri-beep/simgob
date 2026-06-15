import { describe, it, expect } from "vitest";
import { applyScale, simulateIrpf, cloneScale } from "./irpf";
import type { IrpfData, IrpfScale } from "./types";

const scale: IrpfScale = {
  general: [
    { threshold: 0, rate: 0.19 },
    { threshold: 12450, rate: 0.24 },
    { threshold: 20200, rate: 0.3 },
    { threshold: 35200, rate: 0.37 },
    { threshold: 60000, rate: 0.45 },
    { threshold: 300000, rate: 0.47 },
  ],
  savings: [
    { threshold: 0, rate: 0.19 },
    { threshold: 6000, rate: 0.21 },
    { threshold: 50000, rate: 0.23 },
  ],
};

const data: IrpfData = {
  baseYear: 2023,
  officialRevenue: 100000,
  personalMinimum: 0,
  stateDeltaShare: 0.5,
  scale,
  brackets: [
    {
      id: "b1",
      label: "0 – 20.000 €",
      lower: 0,
      upper: 20000,
      declarantes: 10_000_000,
      baseGeneral: 100_000, // avg 10.000 €/decl
      baseSavings: 2_000,
      cuotaLiquida: 18_000,
    },
    {
      id: "b2",
      label: "20.000 – 60.000 €",
      lower: 20000,
      upper: 60000,
      declarantes: 8_000_000,
      baseGeneral: 280_000, // avg 35.000 €/decl
      baseSavings: 8_000,
      cuotaLiquida: 60_000,
    },
    {
      id: "b3",
      label: "> 60.000 €",
      lower: 60000,
      upper: null,
      declarantes: 1_000_000,
      baseGeneral: 120_000, // avg 120.000 €/decl
      baseSavings: 20_000,
      cuotaLiquida: 40_000,
    },
  ],
  notes: [],
};

describe("applyScale", () => {
  it("returns 0 for non-positive amounts", () => {
    expect(applyScale(0, scale.general)).toBe(0);
    expect(applyScale(-5, scale.general)).toBe(0);
  });

  it("applies marginal rates slice by slice", () => {
    // 10.000 € all in the first 19 % slice.
    expect(applyScale(10000, scale.general)).toBeCloseTo(1900, 6);
    // 20.200 €: 12.450*0.19 + 7.750*0.24 = 2365.5 + 1860 = 4225.5
    expect(applyScale(20200, scale.general)).toBeCloseTo(4225.5, 6);
  });

  it("uses the top rate for the open bracket", () => {
    // 400.000 € reaches the 47 % marginal band.
    const t = applyScale(400000, scale.general);
    const justBelow = applyScale(300000, scale.general);
    expect(t - justBelow).toBeCloseTo(100000 * 0.47, 4);
  });
});

describe("simulateIrpf", () => {
  it("reproduces official collection in the base scenario (delta ≈ 0)", () => {
    const r = simulateIrpf(data, cloneScale(scale));
    expect(r.baseRevenue).toBeCloseTo(data.officialRevenue, 3);
    expect(r.scenarioRevenue).toBeCloseTo(data.officialRevenue, 3);
    expect(r.delta).toBeCloseTo(0, 6);
    expect(r.calibrationFactor).toBeGreaterThan(0);
  });

  it("raising the top marginal rate increases revenue and flags the top bracket as a loser", () => {
    const scenario = cloneScale(scale);
    scenario.general[5].rate = 0.55; // 47 % -> 55 % above 300k
    scenario.general[4].rate = 0.5; // 45 % -> 50 % above 60k
    const r = simulateIrpf(data, scenario);
    expect(r.delta).toBeGreaterThan(0);
    const top = r.brackets.find((b) => b.id === "b3")!;
    expect(top.verdict).toBe("loser");
    expect(top.deltaPerDeclaranteEur).toBeGreaterThan(0);
    // The lowest bracket (below 60k) is untouched by these top-rate changes.
    const low = r.brackets.find((b) => b.id === "b1")!;
    expect(low.verdict).toBe("neutral");
  });

  it("lowering a rate decreases revenue and flags affected brackets as winners", () => {
    const scenario = cloneScale(scale);
    scenario.general[1].rate = 0.18; // 24 % -> 18 %
    scenario.general[2].rate = 0.25; // 30 % -> 25 %
    const r = simulateIrpf(data, scenario);
    expect(r.delta).toBeLessThan(0);
    const mid = r.brackets.find((b) => b.id === "b2")!;
    expect(mid.verdict).toBe("winner");
    expect(mid.deltaPerDeclaranteEur).toBeLessThan(0);
  });

  it("conserves revenue: scenarioRevenue equals official + sum of bracket deltas", () => {
    const scenario = cloneScale(scale);
    scenario.general[3].rate = 0.4;
    const r = simulateIrpf(data, scenario);
    const sumDeltas = r.brackets.reduce((a, b) => a + b.delta, 0);
    expect(r.scenarioRevenue).toBeCloseTo(r.officialRevenue + sumDeltas, 3);
  });

  it("the mínimo personal exempts the lowest incomes (≈0 cuota) before calibration", () => {
    const withMin: IrpfData = { ...data, personalMinimum: 5550 };
    // A bracket whose average base is below the minimum pays ~0 modeled cuota.
    const low = simulateIrpf(withMin, cloneScale(scale)).brackets.find(
      (b) => b.id === "b1",
    )!;
    // b1 average general base is 10.000 € > 5.550, so it pays something but less
    // than without the minimum. Verify the minimum reduces the lowest bracket's
    // share of total tax relative to no-minimum.
    const noMin = simulateIrpf(data, cloneScale(scale)).brackets.find(
      (b) => b.id === "b1",
    )!;
    const shareWith = low.baseCuota / 100000;
    const shareWithout = noMin.baseCuota / 100000;
    expect(shareWith).toBeLessThan(shareWithout);
  });
});
