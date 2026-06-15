import { describe, it, expect } from "vitest";
import {
  grossToNet,
  bracketPersonas,
  medianBracket,
  modalBracket,
  perHabitante,
  perHogar,
  perDay,
  beneficiaryMonthlyScaled,
  type NetSalaryModel,
} from "./stories";
import type { IrpfScale, IrpfIncomeBracket } from "./types";

const scale: IrpfScale = {
  general: [
    { threshold: 0, rate: 0.19 },
    { threshold: 12450, rate: 0.24 },
    { threshold: 20200, rate: 0.3 },
    { threshold: 35200, rate: 0.37 },
    { threshold: 60000, rate: 0.45 },
    { threshold: 300000, rate: 0.47 },
  ],
  savings: [{ threshold: 0, rate: 0.19 }],
};

// Confirmed 2023 constants.
const model: NetSalaryModel = {
  ssWorkerRate: 0.0645,
  ssMaxBaseAnnual: 53946,
  otherDeductible: 2000,
  personalMinimum: 5550,
  workReduction: { max: 6498, fullUpTo: 14047.5, zeroFrom: 19747.5, slope: 1.14 },
};

describe("grossToNet", () => {
  it("matches a hand-computed mid salary (30.000 €)", () => {
    const r = grossToNet(30000, scale, model);
    expect(r.ssAnnual).toBeCloseTo(1935, 2);
    expect(r.irpfAnnual).toBeCloseTo(4930.5, 1);
    expect(r.netAnnual).toBeCloseTo(23134.5, 1);
    expect(r.netMonthly).toBeCloseTo(1927.875, 2);
    expect(r.effectiveOnGross).toBeCloseTo((1935 + 4930.5) / 30000, 5);
  });

  it("low earners pay ~0 IRPF thanks to reduction + minimum (12.000 €)", () => {
    const r = grossToNet(12000, scale, model);
    expect(r.irpfAnnual).toBeCloseTo(0, 6);
  });

  it("net rises monotonically with gross", () => {
    const a = grossToNet(20000, scale, model).netAnnual;
    const b = grossToNet(40000, scale, model).netAnnual;
    const c = grossToNet(80000, scale, model).netAnnual;
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  it("raising rates lowers the net (reacts to the scenario scale)", () => {
    const higher: IrpfScale = {
      ...scale,
      general: scale.general.map((g, i) => (i >= 2 ? { ...g, rate: g.rate + 0.1 } : g)),
    };
    const base = grossToNet(50000, scale, model).netMonthly;
    const scen = grossToNet(50000, higher, model).netMonthly;
    expect(scen).toBeLessThan(base);
  });

  it("contribution is capped at the max base", () => {
    const r = grossToNet(120000, scale, model);
    expect(r.ssAnnual).toBeCloseTo(53946 * 0.0645, 2);
  });
});

const brackets: IrpfIncomeBracket[] = [
  { id: "a", label: "0–12k", lower: 0, upper: 12000, declarantes: 2_000_000, baseGeneral: 0, baseSavings: 0, cuotaLiquida: 0 },
  { id: "b", label: "12–30k", lower: 12000, upper: 30000, declarantes: 5_000_000, baseGeneral: 0, baseSavings: 0, cuotaLiquida: 0 },
  { id: "c", label: "30–60k", lower: 30000, upper: 60000, declarantes: 2_500_000, baseGeneral: 0, baseSavings: 0, cuotaLiquida: 0 },
  { id: "d", label: ">60k", lower: 60000, upper: null, declarantes: 500_000, baseGeneral: 0, baseSavings: 0, cuotaLiquida: 0 },
];

describe("bracket personas & distribution", () => {
  it("shares sum to 1 and percentiles are cumulative", () => {
    const p = bracketPersonas(brackets, scale, model);
    expect(p.reduce((a, x) => a + x.share, 0)).toBeCloseTo(1, 6);
    expect(p[0].pctStart).toBeCloseTo(0, 6);
    expect(p[p.length - 1].pctEnd).toBeCloseTo(100, 6);
    expect(p[1].pctStart).toBeLessThan(p[1].pctEnd);
  });

  it("median lands where the 50th percentile falls (12–30k)", () => {
    // cum: 2M, 7M (>4.75M = half of 9.5M) -> bracket b
    expect(medianBracket(brackets)?.id).toBe("b");
  });

  it("modal bracket is the most populous by raw count", () => {
    // counts: a 2M, b 5M, c 2.5M, d 0.5M -> b
    expect(modalBracket(brackets)?.id).toBe("b");
  });
});

describe("universal anchors", () => {
  it("per habitante / hogar / día", () => {
    expect(perHabitante(48000, 48_000_000)).toBeCloseTo(1000, 6); // 48.000 M€ / 48M hab
    expect(perHogar(19000, 19_000_000)).toBeCloseTo(1000, 6);
    expect(perDay(36500)).toBeCloseTo(100, 6); // 36.500 M€ / 365
  });

  it("beneficiary mean scales linearly with the policy edit", () => {
    expect(beneficiaryMonthlyScaled(1260, 190000, 95000)).toBeCloseTo(630, 6);
    expect(beneficiaryMonthlyScaled(1260, 190000, 190000)).toBeCloseTo(1260, 6);
  });
});
