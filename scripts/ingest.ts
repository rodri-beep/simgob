/**
 * Ingestion script — Presupuestópolis.
 *
 * Regenerates the Civio-sourced datasets (revenue + spending) from the public
 * "¿Dónde van mis impuestos?" CSVs, and validates the AEAT-sourced datasets
 * (IRPF, IS, meta), which are curated by hand from official statistics.
 *
 * Usage:
 *   npm run ingest            # fetch sources, validate, print a report
 *   npm run ingest -- --write # also rewrite data/revenue.json & data/spending.json
 *
 * The base year is parameterized so future updates are trivial:
 *   BASE_YEAR=2024 npm run ingest -- --write
 *
 * Raw downloads are saved to /data/raw for traceability.
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE_YEAR = process.env.BASE_YEAR ?? "2023";
const WRITE = process.argv.includes("--write");
const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "data");
const RAW = join(DATA, "raw");

const INGRESOS_URL = "https://dondevanmisimpuestos.es/pais_espana_ingresos.csv";
const GASTOS_URL = "https://dondevanmisimpuestos.es/pais_espana_gastosf.csv";

// ---- helpers ----
function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const out: string[] = [];
      let cur = "";
      let q = false;
      for (const ch of line) {
        if (ch === '"') q = !q;
        else if (ch === "," && !q) {
          out.push(cur);
          cur = "";
        } else cur += ch;
      }
      out.push(cur.replace(/\r$/, ""));
      return out;
    });
}

async function fetchText(url: string, rawName: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const text = await res.text();
  mkdirSync(RAW, { recursive: true });
  writeFileSync(join(RAW, rawName), text);
  return text;
}

const round1 = (n: number) => Math.round(n / 1e5) / 10; // euros -> M€, 1 decimal

// ---- revenue grouping (article id -> display line) ----
interface RevSpec {
  id: string;
  label: string;
  category: "tributos" | "cotizaciones" | "otros";
  editable: boolean;
  note?: string;
  arts: string[];
  sub?: { art: string; concept: string };
  subAdd?: { art: string; concept: string };
}
const REVENUE: RevSpec[] = [
  { id: "cotizaciones", label: "Cotizaciones sociales", category: "cotizaciones", editable: false, note: "Cuotas a la Seguridad Social. Solo lectura en v1.", arts: ["12"] },
  { id: "irpf", label: "IRPF (parte estatal)", category: "tributos", editable: true, note: "Parte estatal del IRPF. La recaudación nacional bruta (120.280 M€) se simula en el panel de IRPF; ~50 % se cede a las CCAA.", arts: [], sub: { art: "10", concept: "100" } },
  { id: "iva", label: "IVA (parte estatal)", category: "tributos", editable: false, note: "Parte estatal del IVA. Solo lectura en v1.", arts: ["21"] },
  { id: "is", label: "Impuesto sobre Sociedades", category: "tributos", editable: true, note: "Editable: tipo general y tipo mínimo. La simulación se ancla a la recaudación de caja (35.060 M€).", arts: [], sub: { art: "10", concept: "101" } },
  { id: "otros_impuestos", label: "Otros impuestos (IRNR, tráfico exterior, energía…)", category: "tributos", editable: false, arts: ["23", "28", "13", "11"], subAdd: { art: "10", concept: "102" } },
  { id: "iiee", label: "Impuestos especiales (parte estatal)", category: "tributos", editable: false, note: "Hidrocarburos, tabaco, electricidad, alcohol. Solo lectura en v1.", arts: ["22"] },
  { id: "transferencias", label: "Transferencias recibidas (UE y otras AAPP)", category: "otros", editable: false, arts: ["44", "45", "46", "47", "48", "49", "74", "75", "76", "77", "78", "79", "38", "39", "68"] },
  { id: "operaciones_financieras", label: "Operaciones financieras (préstamos, remanente)", category: "otros", editable: false, arts: ["80", "82", "83", "84", "85", "87", "88", "91", "94"] },
  { id: "patrimoniales", label: "Ingresos patrimoniales (dividendos, concesiones…)", category: "otros", editable: false, arts: ["50", "51", "52", "53", "54", "55", "59", "60", "61"] },
  { id: "tasas", label: "Tasas y precios públicos", category: "otros", editable: false, arts: ["30", "31", "32", "33"] },
];

// ---- spending policy -> board building ----
const BUILDING: Record<string, string> = {
  "21": "pensiones", "94": "hacienda", "95": "deuda", "22": "desempleo", "25": "desempleo",
  "12": "defensa", "45": "infraestructuras", "13": "defensa", "46": "otros", "92": "moncloa",
  "42": "transicion", "41": "otros", "24": "desempleo", "23": "desempleo", "31": "sanidad",
  "32": "educacion", "44": "infraestructuras", "11": "defensa", "29": "hacienda", "14": "defensa",
  "26": "otros", "33": "educacion", "93": "hacienda", "43": "otros", "49": "otros",
  "91": "moncloa", "28": "desempleo",
};
const DESC: Record<string, string> = {
  "21": "Pensiones contributivas y no contributivas de la Seguridad Social y Clases Pasivas.",
  "94": "Sistema de financiación de CCAA y entidades locales.",
  "95": "Intereses de la deuda del Estado.",
  "22": "Incapacidad temporal, nacimiento y otras prestaciones.",
  "25": "Prestaciones por desempleo.",
  "12": "Fuerzas Armadas y gasto en defensa.",
  "45": "Carreteras, ferrocarril y obra pública.",
  "13": "Policía Nacional, Guardia Civil e instituciones penitenciarias.",
  "46": "I+D+i civil y militar.",
  "92": "Servicios generales de la Administración del Estado.",
  "42": "Industria, energía y transición energética.",
  "41": "Incluye la PAC gestionada por el Estado.",
  "24": "Políticas activas de empleo.",
  "23": "Incluye el Ingreso Mínimo Vital y dependencia (parte estatal).",
  "31": "Parte estatal. El grueso del gasto sanitario lo ejecutan las CCAA (fuera del perímetro).",
  "32": "Parte estatal. El grueso del gasto educativo lo ejecutan las CCAA (fuera del perímetro).",
  "44": "Subvenciones al transporte terrestre, aéreo y marítimo.",
  "11": "Administración de Justicia (parte estatal).",
  "29": "Funcionamiento del sistema de Seguridad Social.",
  "14": "Acción exterior y cooperación al desarrollo.",
  "26": "Política estatal de vivienda.",
  "33": "Patrimonio, museos, bibliotecas y promoción cultural.",
  "93": "AEAT, Tesoro y administración financiera.",
  "43": "Apoyo al comercio, turismo y pequeñas empresas.",
  "49": "Resto de actuaciones económicas.",
  "91": "Casa del Rey, Cortes, Gobierno y alta dirección del Estado.",
  "28": "Funcionamiento de los servicios de empleo.",
};

async function main() {
  console.log(`\n[ingest] BASE_YEAR=${BASE_YEAR}  write=${WRITE}\n`);

  // ---------- INGRESOS ----------
  const ingRows = parseCsv(await fetchText(INGRESOS_URL, "ingresos.csv")).filter(
    (r) => r[0] === BASE_YEAR,
  );
  const artTotal = (art: string) =>
    parseFloat(ingRows.find((r) => r[1] === art && !r[3])?.[5] ?? "0") || 0;
  const conceptVal = (art: string, con: string) =>
    parseFloat(ingRows.find((r) => r[1] === art && r[3] === con)?.[5] ?? "0") || 0;

  const revenueLines = REVENUE.map((spec) => {
    let euros = spec.arts.reduce((s, a) => s + artTotal(a), 0);
    if (spec.sub) euros += conceptVal(spec.sub.art, spec.sub.concept);
    if (spec.subAdd) euros += conceptVal(spec.subAdd.art, spec.subAdd.concept);
    const { arts, sub, subAdd, ...rest } = spec;
    return { ...rest, amount: round1(euros) };
  });
  const revTotal = revenueLines.reduce((s, l) => s + l.amount, 0);

  // ---------- GASTOS ----------
  const gasRows = parseCsv(await fetchText(GASTOS_URL, "gastosf.csv")).filter(
    (r) => r[0] === BASE_YEAR && !r[3],
  );
  const policies = gasRows
    .map((r) => ({
      id: `p${r[1]}`,
      label: r[2],
      amount: round1(parseFloat(r[5]) || 0),
      building: BUILDING[r[1]] ?? "otros",
      description: DESC[r[1]],
    }))
    .sort((a, b) => b.amount - a.amount);
  const spendTotal = policies.reduce((s, p) => s + p.amount, 0);

  console.log(`  ingresos: ${revenueLines.length} líneas → ${revTotal.toFixed(1)} M€`);
  console.log(`  gastos:   ${policies.length} políticas → ${spendTotal.toFixed(1)} M€`);
  console.log(`  saldo:    ${(revTotal - spendTotal).toFixed(1)} M€`);

  // ---------- VALIDATE AEAT-curated datasets ----------
  const irpf = JSON.parse(readFileSync(join(DATA, "irpf.json"), "utf8"));
  const is = JSON.parse(readFileSync(join(DATA, "is.json"), "utf8"));
  const declTotal = irpf.brackets.reduce((s: number, b: any) => s + b.declarantes, 0);
  console.log(`\n  [AEAT] IRPF declarantes: ${declTotal.toLocaleString("es-ES")}`);
  console.log(`  [AEAT] IRPF ancla: ${irpf.officialRevenue} M€  |  IS ancla: ${is.officialRevenue} M€`);
  console.log(`  [AEAT] IS tipo efectivo: ${((is.cuotaLiquida / is.baseImponible) * 100).toFixed(1)} %`);

  // ---------- WRITE ----------
  if (WRITE) {
    writeFileSync(
      join(DATA, "revenue.json"),
      JSON.stringify(
        { baseYear: Number(BASE_YEAR), source: "Civio — ¿Dónde van mis impuestos? (PGE, perímetro estatal).", lines: revenueLines },
        null,
        2,
      ) + "\n",
    );
    writeFileSync(
      join(DATA, "spending.json"),
      JSON.stringify(
        { baseYear: Number(BASE_YEAR), source: "Civio — ¿Dónde van mis impuestos? (PGE, perímetro estatal, presupuesto inicial).", policies },
        null,
        2,
      ) + "\n",
    );
    console.log("\n  ✓ data/revenue.json y data/spending.json reescritos.");
  } else {
    console.log("\n  (validación) usa --write para regenerar revenue.json y spending.json.");
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
