/**
 * "Stories" engine — turns abstract € figures into human anchors.
 *
 * Pure and parameterized: all official magnitudes (population, contribution
 * rates, deductions…) are passed in, so they live in data/human.json and the
 * year-update workflow stays trivial. Amounts in M€ unless a name says euros.
 */
import { applyScale } from "./irpf";
import type { IrpfScale, IrpfIncomeBracket, NetSalaryModel } from "./types";

export type { NetSalaryModel };

export interface SalaryBreakdown {
  grossAnnual: number;
  ssAnnual: number;
  irpfAnnual: number;
  netAnnual: number;
  netMonthly: number;
  /** Effective average rate on gross (IRPF + worker SS) / gross. */
  effectiveOnGross: number;
}

/**
 * Convert an annual gross salary to a net one under a given IRPF scale.
 *
 * Simplified, clearly-labeled model (single filer, employment income only,
 * 12-month proration): contribution → "rendimiento neto" → reducciones →
 * base → cuota (combined scale minus the personal minimum). Reacts to the
 * scenario scale, which is the whole point.
 */
export function grossToNet(
  grossAnnual: number,
  scale: IrpfScale,
  m: NetSalaryModel,
): SalaryBreakdown {
  const gross = Math.max(0, grossAnnual);
  const ss = Math.min(gross, m.ssMaxBaseAnnual) * m.ssWorkerRate;
  const rnPrev = Math.max(0, gross - ss - m.otherDeductible);

  const { max, fullUpTo, zeroFrom, slope } = m.workReduction;
  const reduction =
    rnPrev <= fullUpTo
      ? max
      : rnPrev < zeroFrom
        ? Math.max(0, max - slope * (rnPrev - fullUpTo))
        : 0;

  const base = Math.max(0, rnPrev - reduction);
  const irpf = Math.max(
    0,
    applyScale(base, scale.general) -
      applyScale(Math.min(base, m.personalMinimum), scale.general),
  );

  const netAnnual = gross - ss - irpf;
  return {
    grossAnnual: gross,
    ssAnnual: ss,
    irpfAnnual: irpf,
    netAnnual,
    netMonthly: netAnnual / 12,
    effectiveOnGross: gross > 0 ? (ss + irpf) / gross : 0,
  };
}

/** Representative gross income of an income bracket (midpoint; open top = lower×1.3). */
export function representativeGross(b: IrpfIncomeBracket): number {
  if (b.upper == null) return Math.round(b.lower * 1.3);
  return Math.round((b.lower + b.upper) / 2);
}

export interface BracketPersona {
  id: string;
  label: string;
  declarantes: number;
  /** Share of all declarantes (0–1). */
  share: number;
  /** Cumulative percentile range this bracket spans (0–100). */
  pctStart: number;
  pctEnd: number;
  representativeGross: number;
  /** Net monthly income for the representative gross, under the given scale. */
  netMonthly: number;
}

/** Build the per-bracket persona (the "who is this tramo" story). */
export function bracketPersonas(
  brackets: IrpfIncomeBracket[],
  scale: IrpfScale,
  m: NetSalaryModel,
): BracketPersona[] {
  const total = brackets.reduce((a, b) => a + b.declarantes, 0) || 1;
  let cum = 0;
  return brackets.map((b) => {
    const pctStart = (cum / total) * 100;
    cum += b.declarantes;
    const pctEnd = (cum / total) * 100;
    const gross = representativeGross(b);
    return {
      id: b.id,
      label: b.label,
      declarantes: b.declarantes,
      share: b.declarantes / total,
      pctStart,
      pctEnd,
      representativeGross: gross,
      netMonthly: grossToNet(gross, scale, m).netMonthly,
    };
  });
}

/** The bracket containing the median declarante (50th percentile). */
export function medianBracket(
  brackets: IrpfIncomeBracket[],
): IrpfIncomeBracket | undefined {
  const total = brackets.reduce((a, b) => a + b.declarantes, 0);
  let cum = 0;
  for (const b of brackets) {
    cum += b.declarantes;
    if (cum >= total / 2) return b;
  }
  return brackets[brackets.length - 1];
}

/**
 * The "tramo más numeroso" — the band with the most declarantes (raw count).
 * This matches the plain-language meaning; a density-based statistical mode is
 * avoided because it picks tiny low bands and confuses readers.
 */
export function modalBracket(
  brackets: IrpfIncomeBracket[],
): IrpfIncomeBracket | undefined {
  let best: IrpfIncomeBracket | undefined;
  let bestCount = -1;
  for (const b of brackets) {
    if (b.declarantes > bestCount) {
      bestCount = b.declarantes;
      best = b;
    }
  }
  return best;
}

// ---- Universal anchors (work for any policy) ----

/** € per inhabitant per year for an amount in M€. */
export function perHabitante(amountM: number, population: number): number {
  return population > 0 ? (amountM * 1e6) / population : 0;
}

/** € per household per year for an amount in M€. */
export function perHogar(amountM: number, households: number): number {
  return households > 0 ? (amountM * 1e6) / households : 0;
}

/** M€ per day for an annual amount in M€. */
export function perDay(amountM: number): number {
  return amountM / 365;
}

/**
 * Scale a beneficiary's average monthly amount linearly with a policy edit
 * (e.g. pensión media when total pensions are cut). Returns the scenario mean.
 */
export function beneficiaryMonthlyScaled(
  baseMonthly: number,
  baseAmountM: number,
  scenarioAmountM: number,
): number {
  if (baseAmountM <= 0) return baseMonthly;
  return baseMonthly * (scenarioAmountM / baseAmountM);
}
