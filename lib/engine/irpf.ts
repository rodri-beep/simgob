import type { IrpfData, IrpfScale, ScaleBracket, IrpfIncomeBracket } from "./types";

/**
 * Apply a marginal-rate scale to a taxable amount (in euros).
 *
 * The scale is a list of {threshold, rate} sorted by ascending threshold; each
 * rate applies to the slice of `amount` between its threshold and the next one.
 */
export function applyScale(amount: number, scale: ScaleBracket[]): number {
  if (amount <= 0 || scale.length === 0) return 0;
  let tax = 0;
  for (let i = 0; i < scale.length; i++) {
    const lower = scale[i].threshold;
    if (amount <= lower) break;
    const upper = i + 1 < scale.length ? scale[i + 1].threshold : Infinity;
    const slice = Math.min(amount, upper) - lower;
    tax += slice * scale[i].rate;
  }
  return tax;
}

/**
 * Modeled cuota (M€) for one income bracket under a given scale.
 *
 * Because the source statistic is bracket-aggregated (not individual), we apply
 * the scale to the AVERAGE base per declarante in the bracket and multiply by
 * the number of declarantes. This is the standard static approximation; it
 * under-estimates progressivity slightly inside each bracket (Jensen), which is
 * absorbed by the calibration factor below and is largest in the open top
 * bracket (long tail). General and savings bases are treated separately.
 *
 * The mínimo personal y familiar is modeled as in the law: it is taxed at the
 * same scale and subtracted, so the first `personalMinimum` euros of general
 * base are effectively exempt. This makes the lowest brackets pay ~0 (matching
 * reality) and lets the scenario react correctly when low-bracket rates change.
 */
export function modeledBracketCuota(
  bracket: IrpfIncomeBracket,
  scale: IrpfScale,
  personalMinimum = 0,
): number {
  if (bracket.declarantes <= 0) return 0;
  const avgGeneralEur = (bracket.baseGeneral * 1e6) / bracket.declarantes;
  const avgSavingsEur = (bracket.baseSavings * 1e6) / bracket.declarantes;

  const grossGeneral = applyScale(avgGeneralEur, scale.general);
  const minimumRelief = applyScale(
    Math.min(Math.max(avgGeneralEur, 0), personalMinimum),
    scale.general,
  );
  const cuotaGeneral = Math.max(0, grossGeneral - minimumRelief);
  const cuotaSavings = applyScale(avgSavingsEur, scale.savings);

  return ((cuotaGeneral + cuotaSavings) * bracket.declarantes) / 1e6;
}

export interface IrpfBracketResult {
  id: string;
  label: string;
  declarantes: number;
  /** Calibrated cuota under the base (official) scale, in M€. */
  baseCuota: number;
  /** Calibrated cuota under the scenario scale, in M€. */
  scenarioCuota: number;
  /** scenarioCuota − baseCuota, in M€. Positive = pays more (loser). */
  delta: number;
  /** Average per-declarante change, in euros. Positive = pays more. */
  deltaPerDeclaranteEur: number;
  /** "loser" pays more, "winner" pays less, "neutral" ~ unchanged. */
  verdict: "winner" | "loser" | "neutral";
}

export interface IrpfResult {
  officialRevenue: number;
  /** Calibrated base revenue — equals officialRevenue by construction. */
  baseRevenue: number;
  /** Calibrated total revenue under the scenario scale, in M€. */
  scenarioRevenue: number;
  /** scenarioRevenue − officialRevenue, in M€. */
  delta: number;
  /** R / modeled-base; bridges the model to official collection. */
  calibrationFactor: number;
  brackets: IrpfBracketResult[];
}

const NEUTRAL_EUR = 1; // |Δ per declarante| below this is shown as neutral

/**
 * Simulate IRPF under a modified scale.
 *
 * Principle (credibility): we never compute the absolute figure from scratch.
 * We model the base and scenario cuotas, calibrate the model so the base
 * exactly reproduces official collection (k = official / modeledBase), and
 * apply the SAME k to the scenario. The reported number is therefore
 * official ± a calibrated delta.
 */
export function simulateIrpf(
  data: IrpfData,
  scenarioScale: IrpfScale,
): IrpfResult {
  const pm = data.personalMinimum ?? 0;
  const modeledBase = data.brackets.map((b) =>
    modeledBracketCuota(b, data.scale, pm),
  );
  const modeledScenario = data.brackets.map((b) =>
    modeledBracketCuota(b, scenarioScale, pm),
  );

  const totalModeledBase = modeledBase.reduce((a, b) => a + b, 0);
  const k = totalModeledBase > 0 ? data.officialRevenue / totalModeledBase : 1;

  const brackets: IrpfBracketResult[] = data.brackets.map((b, i) => {
    const baseCuota = k * modeledBase[i];
    const scenarioCuota = k * modeledScenario[i];
    const delta = scenarioCuota - baseCuota;
    const deltaPerDeclaranteEur =
      b.declarantes > 0 ? (delta * 1e6) / b.declarantes : 0;
    const verdict: IrpfBracketResult["verdict"] =
      deltaPerDeclaranteEur > NEUTRAL_EUR
        ? "loser"
        : deltaPerDeclaranteEur < -NEUTRAL_EUR
          ? "winner"
          : "neutral";
    return {
      id: b.id,
      label: b.label,
      declarantes: b.declarantes,
      baseCuota,
      scenarioCuota,
      delta,
      deltaPerDeclaranteEur,
      verdict,
    };
  });

  const scenarioRevenue = brackets.reduce((a, b) => a + b.scenarioCuota, 0);

  return {
    officialRevenue: data.officialRevenue,
    baseRevenue: k * totalModeledBase,
    scenarioRevenue,
    delta: scenarioRevenue - data.officialRevenue,
    calibrationFactor: k,
    brackets,
  };
}

/** Convenience: deep clone a scale so UI edits don't mutate the dataset. */
export function cloneScale(scale: IrpfScale): IrpfScale {
  return {
    general: scale.general.map((b) => ({ ...b })),
    savings: scale.savings.map((b) => ({ ...b })),
  };
}
