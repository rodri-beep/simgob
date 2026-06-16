import { describe, it, expect } from "vitest";
import { applyCountry, spainResult, COFOG, type AappBaseline, type CountryModel, type CofogId } from "./intl";

function shares(p: Partial<Record<CofogId, number>>): Record<CofogId, number> {
  const out = {} as Record<CofogId, number>;
  for (const c of COFOG) out[c.id] = p[c.id] ?? 0;
  return out;
}

const aapp: AappBaseline = {
  year: 2023,
  gdp: 1_000_000,
  totalExpenditure: 450_000,
  totalRevenue: 400_000,
  cofog: shares({ social: 200_000, salud: 50_000, educacion: 50_000, general: 50_000, economicos: 100_000 }),
};

const country: CountryModel = {
  id: "x",
  label: "X",
  year: 2023,
  revenuePctGdp: 0.45,
  expenditurePctGdp: 0.45,
  taxToGdp: 0.43,
  cofogShares: shares({ social: 0.5, salud: 0.2, educacion: 0.1, general: 0.1, economicos: 0.1 }),
};

describe("intl comparison", () => {
  it("spainResult reflects the real baseline", () => {
    const r = spainResult(aapp);
    expect(r.totalSpending).toBe(450_000);
    expect(r.revenue).toBe(400_000);
    expect(r.balance).toBe(-50_000);
  });

  it("applyCountry preserves total spending and redistributes by shares", () => {
    const r = applyCountry(aapp, country);
    expect(r.totalSpending).toBeCloseTo(450_000, 3);
    expect(r.spending.find((s) => s.id === "social")!.value).toBeCloseTo(225_000, 3);
    expect(r.spending.find((s) => s.id === "salud")!.value).toBeCloseTo(90_000, 3);
  });

  it("revenue scales with the country's revenue-to-GDP ratio", () => {
    const r = applyCountry(aapp, country);
    expect(r.revenue).toBeCloseTo(450_000, 3); // 1,000,000 × 0.45
    expect(r.balance).toBeCloseTo(0, 3);
  });

  it("a higher-tax country improves the balance vs Spain", () => {
    const r = applyCountry(aapp, country);
    expect(r.balance).toBeGreaterThan(spainResult(aapp).balance);
  });
});
