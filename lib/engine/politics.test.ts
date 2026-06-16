import { describe, it, expect } from "vitest";
import { classifyPolitics, type PoliticsInput } from "./politics";

const base: PoliticsInput = {
  taxDelta: 0,
  topRateDelta: 0,
  socialDelta: 0,
  securityDelta: 0,
  totalSpendDelta: 0,
  balance: -50000,
  baseBalance: -50000,
};

const id = (i: Partial<PoliticsInput>) => classifyPolitics({ ...base, ...i }).id;

describe("classifyPolitics", () => {
  it("untouched base → socialista (Spain is already centre-left)", () => {
    expect(id({})).toBe("socialista");
  });

  it("maxing taxes + top rates + social → comunista (extreme only)", () => {
    expect(id({ taxDelta: 40000, topRateDelta: 0.2, socialDelta: 30000, totalSpendDelta: 40000 })).toBe("comunista");
  });

  it("taxing/spending merely more (France/Germany level) stays socialista", () => {
    expect(id({ taxDelta: 20000, topRateDelta: 0.04, socialDelta: 5000, totalSpendDelta: 15000 })).toBe("socialista");
  });

  it("cut taxes + shrink the state hard → liberal", () => {
    expect(id({ taxDelta: -25000, socialDelta: -12000, totalSpendDelta: -50000 })).toBe("liberal");
  });

  it("a moderate trim toward balance → centrista", () => {
    expect(id({ taxDelta: -10000, socialDelta: -6000, totalSpendDelta: -12000 })).toBe("centrista");
  });

  it("cut social + boost defense/security → turbofacha", () => {
    expect(id({ socialDelta: -10000, securityDelta: 10000, totalSpendDelta: 0 })).toBe("turbofacha");
  });

  it("cut taxes hard while the deficit balloons → populista", () => {
    expect(id({ taxDelta: -25000, balance: -80000, baseBalance: -50000 })).toBe("populista");
  });

  it("a big tax cut without shrinking the state → conservador", () => {
    expect(id({ taxDelta: -24000, totalSpendDelta: -4000 })).toBe("conservador");
  });

  it("always returns reasons", () => {
    const r = classifyPolitics({ ...base, taxDelta: 12000, socialDelta: 8000 });
    expect(Array.isArray(r.reasons)).toBe(true);
    expect(r.reasons.length).toBeGreaterThan(0);
  });
});
