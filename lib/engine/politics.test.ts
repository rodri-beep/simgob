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
  it("untouched base → centrista", () => {
    expect(id({})).toBe("centrista");
  });

  it("raise top rates a lot + big social → comunista", () => {
    expect(id({ taxDelta: 30000, topRateDelta: 0.15, socialDelta: 30000, totalSpendDelta: 30000 })).toBe("comunista");
  });

  it("moderate tax raise + some social → socialista", () => {
    expect(id({ taxDelta: 10000, socialDelta: 5000, totalSpendDelta: 5000 })).toBe("socialista");
  });

  it("cut taxes + shrink the state → liberal", () => {
    expect(id({ taxDelta: -15000, totalSpendDelta: -30000 })).toBe("liberal");
  });

  it("cut social + boost defense/security → turbofacha", () => {
    expect(id({ socialDelta: -10000, securityDelta: 10000, totalSpendDelta: 0 })).toBe("turbofacha");
  });

  it("cut taxes hard while the deficit balloons → populista", () => {
    expect(id({ taxDelta: -25000, balance: -80000, baseBalance: -50000 })).toBe("populista");
  });

  it("mild tax cut, no shrinking → conservador", () => {
    expect(id({ taxDelta: -8000, totalSpendDelta: -2000 })).toBe("conservador");
  });

  it("always returns reasons", () => {
    const r = classifyPolitics({ ...base, taxDelta: 12000, socialDelta: 8000 });
    expect(Array.isArray(r.reasons)).toBe(true);
    expect(r.reasons.length).toBeGreaterThan(0);
  });
});
