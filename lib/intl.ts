/**
 * International comparison at the GENERAL GOVERNMENT (Administraciones Públicas)
 * level, by COFOG function. A "country model" reshapes Spain's AAPP budget:
 * spending is Spain's total redistributed by the country's COFOG shares (Spanish
 * amounts, foreign structure), and revenue is Spain's GDP × the country's
 * revenue-to-GDP ratio. Pure & testable; all figures illustrative.
 */

export type CofogId =
  | "social"
  | "salud"
  | "educacion"
  | "general"
  | "economicos"
  | "orden"
  | "defensa"
  | "cultura"
  | "medioambiente"
  | "vivienda";

export interface CofogMeta {
  id: CofogId;
  label: string;
  short: string;
  color: string;
}

export const COFOG: CofogMeta[] = [
  { id: "social", label: "Protección social", short: "P. social", color: "#cf9a52" },
  { id: "salud", label: "Sanidad", short: "Sanidad", color: "#c75b4e" },
  { id: "educacion", label: "Educación", short: "Educación", color: "#d68a3a" },
  { id: "general", label: "Servicios públicos generales", short: "Generales", color: "#cdbf90" },
  { id: "economicos", label: "Asuntos económicos", short: "Económicos", color: "#9a9078" },
  { id: "orden", label: "Orden público y seguridad", short: "Orden", color: "#8a9656" },
  { id: "defensa", label: "Defensa", short: "Defensa", color: "#5e6a45" },
  { id: "cultura", label: "Ocio, cultura y religión", short: "Cultura", color: "#d4b24a" },
  { id: "medioambiente", label: "Medio ambiente", short: "M. amb.", color: "#4f9a6a" },
  { id: "vivienda", label: "Vivienda y comunidad", short: "Vivienda", color: "#7fb0c4" },
];

/** Spain's general-government baseline (amounts in M€). */
export interface AappBaseline {
  year: number;
  gdp: number;
  totalExpenditure: number;
  totalRevenue: number;
  /** Actual Spanish spending by COFOG function, in M€. */
  cofog: Record<CofogId, number>;
}

/** A foreign (or EU) fiscal model expressed as ratios/shares. */
export interface CountryModel {
  id: string;
  label: string;
  flag?: string;
  year: number;
  /** Total general-government revenue as a fraction of GDP. */
  revenuePctGdp: number;
  /** Total general-government expenditure as a fraction of GDP (context). */
  expenditurePctGdp: number;
  /** Tax-to-GDP (OECD), fraction (context). */
  taxToGdp: number;
  /** COFOG shares as fractions of total expenditure (sum ≈ 1). */
  cofogShares: Record<CofogId, number>;
}

export interface ModelResult {
  /** Spending by function, in M€. */
  spending: { id: CofogId; value: number }[];
  totalSpending: number;
  revenue: number;
  /** revenue − spending, in M€. */
  balance: number;
  balancePctGdp: number;
}

/** Spain's own budget as a ModelResult (the baseline, real structure). */
export function spainResult(aapp: AappBaseline): ModelResult {
  const spending = COFOG.map((c) => ({ id: c.id, value: aapp.cofog[c.id] ?? 0 }));
  const balance = aapp.totalRevenue - aapp.totalExpenditure;
  return {
    spending,
    totalSpending: aapp.totalExpenditure,
    revenue: aapp.totalRevenue,
    balance,
    balancePctGdp: balance / aapp.gdp,
  };
}

/**
 * "Spain with the structure of X": keep Spain's total spending, redistribute it
 * by the country's COFOG shares, and set revenue = Spain GDP × country revenue%GDP.
 */
export function applyCountry(aapp: AappBaseline, country: CountryModel): ModelResult {
  const spending = COFOG.map((c) => ({
    id: c.id,
    value: (country.cofogShares[c.id] ?? 0) * aapp.totalExpenditure,
  }));
  const totalSpending = spending.reduce((a, s) => a + s.value, 0);
  const revenue = aapp.gdp * country.revenuePctGdp;
  const balance = revenue - totalSpending;
  return {
    spending,
    totalSpending,
    revenue,
    balance,
    balancePctGdp: balance / aapp.gdp,
  };
}
