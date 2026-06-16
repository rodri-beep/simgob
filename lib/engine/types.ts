/**
 * Domain types for the Presupuestópolis simulation engine.
 *
 * All monetary amounts are in millions of euros (M€) unless a field name
 * explicitly says otherwise (e.g. `*Eur` = euros, `*PerDeclarante` = euros).
 * Rates are fractions: 0.19 === 19 %.
 */

/** A single step of a marginal-rate scale (escala por tramos). */
export interface ScaleBracket {
  /** Lower bound of the bracket, in euros. The first bracket starts at 0. */
  threshold: number;
  /** Marginal rate applied to the slice above `threshold`, as a fraction. */
  rate: number;
}

/** The two IRPF scales: general base and savings base. */
export interface IrpfScale {
  /** Escala general (combined state + a representative autonomic half). */
  general: ScaleBracket[];
  /** Escala del ahorro (base liquidable del ahorro). */
  savings: ScaleBracket[];
}

/** Aggregated IRPF figures for one income bracket (tramo de renta). */
export interface IrpfIncomeBracket {
  id: string;
  /** Human label for the UI, e.g. "30.000 – 60.000 €". */
  label: string;
  /** Lower bound of the income bracket, in euros. */
  lower: number;
  /** Upper bound in euros, or null for the open top bracket. */
  upper: number | null;
  /** Número de declarantes (count of tax returns) in this bracket. */
  declarantes: number;
  /** Base liquidable general aggregated over the bracket, in M€. */
  baseGeneral: number;
  /** Base liquidable del ahorro aggregated over the bracket, in M€. */
  baseSavings: number;
  /** Official cuota líquida aggregated over the bracket, in M€ (reference). */
  cuotaLiquida: number;
}

export interface IrpfData {
  baseYear: number;
  /** Real IRPF collection (anchor) from the AEAT annual report, in M€ (gross, national). */
  officialRevenue: number;
  /**
   * Mínimo personal y familiar (€): the first slice of the general base that is
   * effectively exempt (taxed at the scale and subtracted). 2023 general = 5.550 €.
   */
  personalMinimum: number;
  /**
   * Fraction of a change in national IRPF collection that accrues to the State
   * perimeter (the rest is the autonomic share). The combined scale splits
   * ~50/50 between the State and the CCAA. Used to feed the budget balance.
   */
  stateDeltaShare: number;
  /** Default (status-quo) scale for the base year. */
  scale: IrpfScale;
  /** Distribution by income bracket. */
  brackets: IrpfIncomeBracket[];
  notes: string[];
}

export interface IsData {
  baseYear: number;
  /** Real IS collection (cash anchor) from the AEAT annual report, in M€. */
  officialRevenue: number;
  /** Aggregate cuota líquida from the IS annual accounts, in M€ (for the effective rate). */
  cuotaLiquida: number;
  /** Aggregate base imponible positiva, in M€. */
  baseImponible: number;
  /** General nominal rate (tipo nominal general), e.g. 0.25. */
  nominalRate: number;
  /** Minimum rate (tipo mínimo) for large companies, e.g. 0.15. */
  minimumRate: number;
  /**
   * Documented assumption: share of the aggregate base imponible that
   * belongs to companies/groups subject to the minimum rate. Used only by the
   * (coarse, clearly-labeled) minimum-rate lever.
   */
  minimumRateBaseShare: number;
  /** Fraction of an IS change that accrues to the State (IS is a State tax → 1.0). */
  stateDeltaShare: number;
  notes: string[];
}

export type RevenueCategory = "tributos" | "cotizaciones" | "otros";

export interface RevenueLine {
  id: string;
  label: string;
  /** Amount in M€ (base scenario / official). */
  amount: number;
  category: RevenueCategory;
  /** Whether this line is editable in v1 (only IRPF & IS are). */
  editable: boolean;
  /** Optional explanatory note shown in the UI. */
  note?: string;
}

export interface SpendingPolicy {
  id: string;
  /** Política de gasto label. */
  label: string;
  /** Amount in M€ (base scenario / official). Read-only in v1. */
  amount: number;
  /** Board building/district this policy maps to. */
  building: BuildingId;
  description?: string;
}

export type BuildingId =
  | "moncloa"
  | "hacienda"
  | "pensiones"
  | "sanidad"
  | "educacion"
  | "defensa"
  | "infraestructuras"
  | "desempleo"
  | "transicion"
  | "deuda"
  | "otros";

export interface BoardBuilding {
  id: BuildingId;
  label: string;
  /** Short label used on the crowded board. */
  short: string;
  /** Short blurb shown when entering the district. */
  blurb: string;
}

export interface DatasetMeta {
  baseYear: number;
  /** Spain nominal GDP (PIB a precios corrientes) for the base year, in M€. */
  gdp: number;
  /** Official totals for the perimeter (for context / validation). */
  totalRevenueOfficial: number;
  totalSpendingOfficial: number;
  /** General-government (AAPP) deficit for the base year, in M€ (context). */
  officialDeficitAapp: number;
  /** General-government deficit as % of GDP (context). */
  officialDeficitAappPct: number;
  /** General-government gross public debt, in M€ (context). */
  publicDebt: number;
  /** Public debt as % of GDP (context). */
  publicDebtPct: number;
  perimeter: string;
  sources: SourceRef[];
  lastUpdated: string;
}

export interface SourceRef {
  id: string;
  label: string;
  url: string;
  note?: string;
}

// ---- "Stories" / human-anchor data ----

/** Tax-law constants to turn a gross salary into a net one (FY-specific). */
export interface NetSalaryModel {
  ssWorkerRate: number;
  ssMaxBaseAnnual: number;
  otherDeductible: number;
  personalMinimum: number;
  workReduction: {
    max: number;
    fullUpTo: number;
    zeroFrom: number;
    slope: number;
  };
}

export interface HumanConstants {
  population: number;
  households: number;
  declarantes: number;
  /** INE gross annual salary references (EAES). */
  salaryMean: number;
  salaryMedian: number;
  salaryModal: number;
}

/** Per-policy beneficiary anchor. */
export interface BeneficiaryAnchor {
  /** Number of beneficiaries (e.g. nº de pensiones). */
  count: number;
  /** Official mean monthly amount (€), scaled linearly when the policy is edited. */
  baseMonthly: number;
  /** Payments per year (14 for pensions, 12 otherwise) — shown as context. */
  payments: number;
  /** Noun for the count, e.g. "pensiones", "perceptores". */
  noun: string;
  /** Singular noun for the per-person diff, e.g. "pensión", "perceptor". */
  singular: string;
  /** Label for the mean, e.g. "pensión media". */
  meanLabel: string;
  note?: string;
}

export interface HumanData {
  baseYear: number;
  constants: HumanConstants;
  netSalaryModel: NetSalaryModel;
  /** Beneficiary anchors keyed by spending-policy id. */
  anchors: Record<string, BeneficiaryAnchor>;
  sources: SourceRef[];
}
