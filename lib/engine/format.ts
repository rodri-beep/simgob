/** Spanish-locale formatting helpers. Amounts are in millions of euros (M€). */

const es = "es-ES";

/** Whole millions of euros, e.g. 120280 -> "120.280 M€". */
export function formatM(value: number, opts?: { sign?: boolean }): string {
  const n = Math.round(value);
  const s = new Intl.NumberFormat(es, { maximumFractionDigits: 0 }).format(
    Math.abs(n),
  );
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const prefix = opts?.sign ? sign : n < 0 ? "−" : "";
  return `${prefix}${s} M€`;
}

/** Millions of euros with one decimal for small deltas, e.g. "+1.234,5 M€". */
export function formatMDecimal(value: number, opts?: { sign?: boolean }): string {
  const s = new Intl.NumberFormat(es, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const prefix = opts?.sign ? sign : value < 0 ? "−" : "";
  return `${prefix}${s} M€`;
}

/** Euros (no scaling), e.g. 1234.5 -> "1.235 €". */
export function formatEur(value: number, opts?: { sign?: boolean }): string {
  const n = Math.round(value);
  const s = new Intl.NumberFormat(es, { maximumFractionDigits: 0 }).format(
    Math.abs(n),
  );
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const prefix = opts?.sign ? sign : n < 0 ? "−" : "";
  return `${prefix}${s} €`;
}

/** Plain integer count, e.g. number of declarantes. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat(es, { maximumFractionDigits: 0 }).format(value);
}

/** Percentage from a fraction, e.g. 0.19 -> "19,0 %". */
export function formatPct(fraction: number, decimals = 1): string {
  return `${new Intl.NumberFormat(es, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fraction * 100)} %`;
}

/** Percentage from an already-scaled value (0–100). */
export function formatPctValue(value: number, decimals = 1): string {
  return `${new Intl.NumberFormat(es, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)} %`;
}

/** Signed percentage of GDP, e.g. -0.18 -> "−0,18 % del PIB". */
export function formatGdpPct(saldo: number, gdp: number): string {
  const pct = gdp !== 0 ? (saldo / gdp) * 100 : 0;
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  const s = new Intl.NumberFormat(es, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(pct));
  return `${sign}${s} % del PIB`;
}
