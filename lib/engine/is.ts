import type { IsData } from "./types";

export interface IsResult {
  officialRevenue: number;
  /** Effective rate today = officialRevenue / baseImponible. */
  effectiveRate: number;
  nominalRate: number;
  scenarioNominalRate: number;
  scenarioMinimumRate: number;
  /** Revenue under the scenario, in M€. */
  scenarioRevenue: number;
  /** scenarioRevenue − officialRevenue, in M€. */
  delta: number;
  /** Component of the delta attributable to the nominal-rate change, in M€. */
  deltaNominal: number;
  /** Component of the delta attributable to the minimum-rate floor, in M€. */
  deltaMinimum: number;
}

/**
 * Simulate IS (corporate income tax).
 *
 * Credibility approach (per spec): anchor to the real collection in the AEAT
 * annual report and model only the delta; the nominal statistic over-states the
 * "real" quota because groups consolidate (modelo 220) and apply deductions, so
 * we never use the nominal rate to derive the absolute figure.
 *
 * Nominal-rate lever (precise-ish): collection scales proportionally with the
 * general nominal rate, because the effective rate is a (roughly) fixed fraction
 * of the nominal one:
 *     scenarioRevenue ≈ official × (rScenario / rBase).
 *
 * Minimum-rate lever (COARSE — clearly labeled in the UI): the minimum rate
 * sets an effective-rate floor for large groups. With only aggregate data we
 * approximate the extra collection as the floor applied to the documented share
 * of the base that belongs to those groups, above the current effective rate:
 *     deltaMinimum ≈ baseImponible × minimumRateBaseShare × max(0, rMin − rEff).
 */
export function simulateIs(
  data: IsData,
  scenarioNominalRate: number,
  scenarioMinimumRate: number,
): IsResult {
  // Effective rate over the taxable base, from the IS annual accounts.
  const cuota = data.cuotaLiquida ?? data.officialRevenue;
  const effectiveRate = data.baseImponible > 0 ? cuota / data.baseImponible : 0;

  // Nominal-rate effect: proportional to the rate change, anchored to official.
  const revenueNominal =
    data.nominalRate > 0
      ? data.officialRevenue * (scenarioNominalRate / data.nominalRate)
      : data.officialRevenue;
  const deltaNominal = revenueNominal - data.officialRevenue;

  // Effective rate implied AFTER the nominal change (scales with the rate).
  const effAfterNominal =
    data.nominalRate > 0
      ? effectiveRate * (scenarioNominalRate / data.nominalRate)
      : effectiveRate;

  // Minimum-rate floor effect (coarse).
  const deltaMinimum =
    data.baseImponible *
    data.minimumRateBaseShare *
    Math.max(0, scenarioMinimumRate - effAfterNominal);

  const scenarioRevenue = revenueNominal + deltaMinimum;

  return {
    officialRevenue: data.officialRevenue,
    effectiveRate,
    nominalRate: data.nominalRate,
    scenarioNominalRate,
    scenarioMinimumRate,
    scenarioRevenue,
    delta: scenarioRevenue - data.officialRevenue,
    deltaNominal,
    deltaMinimum,
  };
}
