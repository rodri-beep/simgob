/**
 * Data validation script — SimGob.
 *
 * The committed datasets are curated by hand from official statistics
 * (Eurostat for the general-government accounts and COFOG functions; AEAT for
 * the IRPF/IS anchors and the distribution by income bracket; INE / Seguridad
 * Social / SEPE for the human magnitudes). This script does NOT fetch or rewrite
 * them: it loads what is committed and checks that the totals are internally
 * consistent and reproduce the official perimeter, printing a report.
 *
 * Usage:
 *   npm run ingest
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "data");

const read = (name: string) =>
  JSON.parse(readFileSync(join(DATA, name), "utf8"));

const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n));
const ok = (cond: boolean) => (cond ? "✓" : "✗");

function main() {
  const meta = read("meta.json");
  const revenue = read("revenue.json");
  const spending = read("spending.json");
  const irpf = read("irpf.json");
  const is = read("is.json");

  const revTotal = revenue.lines.reduce((s: number, l: any) => s + l.amount, 0);
  const spendTotal = spending.policies.reduce((s: number, p: any) => s + p.amount, 0);
  const balance = revTotal - spendTotal;
  const deficitPct = (-balance / meta.gdp) * 100;

  console.log(`\n[validate] SimGob · perímetro Administraciones Públicas ${meta.baseYear}\n`);
  console.log(`  ingresos: ${revenue.lines.length} líneas → ${fmt(revTotal)} M€  ${ok(Math.abs(revTotal - meta.totalRevenueOfficial) < 1)}`);
  console.log(`  gastos:   ${spending.policies.length} funciones → ${fmt(spendTotal)} M€  ${ok(Math.abs(spendTotal - meta.totalSpendingOfficial) < 1)}`);
  console.log(`  saldo:    ${fmt(balance)} M€ (${deficitPct.toFixed(1)} % del PIB)  ${ok(Math.abs(deficitPct - meta.officialDeficitAappPct) < 0.1)}`);

  const declTotal = irpf.brackets.reduce((s: number, b: any) => s + b.declarantes, 0);
  console.log(`\n  [AEAT] IRPF declarantes: ${declTotal.toLocaleString("es-ES")}`);
  console.log(`  [AEAT] IRPF ancla: ${fmt(irpf.officialRevenue)} M€  |  IS ancla: ${fmt(is.officialRevenue)} M€`);
  console.log(`  [AEAT] IS tipo efectivo: ${((is.cuotaLiquida / is.baseImponible) * 100).toFixed(1)} %`);
  console.log(`  [perímetro] IRPF stateDeltaShare=${irpf.stateDeltaShare} · IS stateDeltaShare=${is.stateDeltaShare} (1.0 = íntegro en AAPP)`);
  console.log("");
}

main();
