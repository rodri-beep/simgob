import { describe, it, expect } from "vitest";
import { encodeScenario, decodeScenario, type Scenario } from "./share";
import { irpfData, isData } from "./data";
import { cloneScale } from "./engine/irpf";

function baseScenario(): Scenario {
  return {
    irpfScale: cloneScale(irpfData.scale),
    isNominalRate: isData.nominalRate,
    isMinimumRate: isData.minimumRate,
    spendingOverrides: {},
  };
}

describe("share encode/decode", () => {
  it("encodes the untouched base scenario as an empty token", () => {
    expect(encodeScenario(baseScenario())).toBe("");
  });

  it("round-trips IRPF rate changes", () => {
    const s = baseScenario();
    s.irpfScale.general[5].rate = 0.6;
    s.irpfScale.general[4].rate = 0.5;
    const token = encodeScenario(s);
    expect(token).not.toBe("");
    const d = decodeScenario(token)!;
    expect(d.irpfScale!.general[5].rate).toBeCloseTo(0.6, 6);
    expect(d.irpfScale!.general[4].rate).toBeCloseTo(0.5, 6);
    // untouched brackets keep the base rate
    expect(d.irpfScale!.general[0].rate).toBeCloseTo(irpfData.scale.general[0].rate, 6);
  });

  it("round-trips IS rates and spending overrides", () => {
    const s = baseScenario();
    s.isNominalRate = 0.3;
    s.isMinimumRate = 0.2;
    s.spendingOverrides = { p21: 150000, p25: 10000 };
    const d = decodeScenario(encodeScenario(s))!;
    expect(d.isNominalRate).toBeCloseTo(0.3, 6);
    expect(d.isMinimumRate).toBeCloseTo(0.2, 6);
    expect(d.spendingOverrides).toEqual({ p21: 150000, p25: 10000 });
  });

  it("returns null for invalid/empty tokens", () => {
    expect(decodeScenario("")).toBeNull();
    expect(decodeScenario("!!!not-base64!!!")).toBeNull();
  });

  it("clamps out-of-range rates on decode", () => {
    const s = baseScenario();
    s.isNominalRate = 0.3;
    const token = encodeScenario(s);
    // tamper: a manually crafted token with a huge rate should be clamped
    const bad = encodeScenario({ ...baseScenario(), isNominalRate: 5 });
    expect(decodeScenario(bad)!.isNominalRate).toBe(1);
    expect(decodeScenario(token)!.isNominalRate).toBeCloseTo(0.3, 6);
  });
});
