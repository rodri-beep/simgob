import { describe, it, expect } from "vitest";
import { simulateIs } from "./is";
import type { IsData } from "./types";

const data: IsData = {
  baseYear: 2023,
  officialRevenue: 35000, // M€
  cuotaLiquida: 35000, // for the test, effective rate = 35000/200000 = 17,5 %
  baseImponible: 200000, // M€
  nominalRate: 0.25,
  minimumRate: 0.15,
  minimumRateBaseShare: 0.5,
  stateDeltaShare: 1.0,
  notes: [],
};

describe("simulateIs", () => {
  it("computes the effective rate from official collection and base", () => {
    const r = simulateIs(data, 0.25, 0.15);
    expect(r.effectiveRate).toBeCloseTo(0.175, 6);
  });

  it("reproduces official collection when nothing changes (minimum below effective)", () => {
    const r = simulateIs(data, 0.25, 0.15);
    expect(r.scenarioRevenue).toBeCloseTo(data.officialRevenue, 6);
    expect(r.delta).toBeCloseTo(0, 6);
    expect(r.deltaMinimum).toBeCloseTo(0, 6);
  });

  it("scales revenue proportionally with the nominal rate", () => {
    const r = simulateIs(data, 0.3, 0.15); // 25 % -> 30 %
    expect(r.scenarioRevenue).toBeCloseTo(35000 * (0.3 / 0.25), 3);
    expect(r.delta).toBeGreaterThan(0);
    expect(r.deltaNominal).toBeCloseTo(35000 * (0.3 / 0.25) - 35000, 3);
  });

  it("applies the minimum-rate floor only above the post-nominal effective rate", () => {
    // Raise minimum to 20 %, keep nominal at 25 %.
    const r = simulateIs(data, 0.25, 0.2);
    // effAfterNominal = 17,5 %; floor adds base*share*(0.20-0.175).
    expect(r.deltaMinimum).toBeCloseTo(200000 * 0.5 * (0.2 - 0.175), 3);
    expect(r.delta).toBeGreaterThan(0);
  });
});
