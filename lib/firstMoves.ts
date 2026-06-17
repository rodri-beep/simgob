/**
 * First-run "primera jugada" moves + the shared country-scenario loader.
 *
 * The onboarding pushes a brand-new visitor to create their first scenario in
 * one tap (the biggest activation lever in the launch data), instead of reading
 * a passive tour. Each move mutates the store directly and lands the user on the
 * relevant view, where the pinned saldo animates the result.
 */
import { useSim } from "./store";
import { aappBaseline, countryModels, spendingPolicies, irpfData } from "./data";
import { countrySpendingOverrides, countryTaxLevers } from "./intl";
import { track } from "./analytics";

const SPAIN_REV_PCT = aappBaseline.totalRevenue / aappBaseline.gdp;
const TOTAL_BASE = irpfData.brackets.reduce((a, b) => a + b.baseGeneral + b.baseSavings, 0);
const BASE_AVG_IRPF = irpfData.officialRevenue / TOTAL_BASE;

/** Set every spending + tax lever to a country's model. Returns false if unknown. */
export function loadCountryScenario(id: string): boolean {
  const country = countryModels.find((c) => c.id === id);
  if (!country) return false;
  const s = useSim.getState();
  s.setAllSpending(countrySpendingOverrides(country, spendingPolicies));
  const { irpfDelta, isNominal } = countryTaxLevers(country, SPAIN_REV_PCT, BASE_AVG_IRPF);
  s.setIrpfUniformRate(irpfDelta);
  s.setIsNominalRate(isNominal);
  s.setCountryTemplate(id);
  return true;
}

export type FirstMoveTab = "resumen" | "gastos" | "ingresos" | "modelos";

export interface FirstMove {
  id: string;
  emoji: string;
  label: string;
  sub: string;
  /** Where the phone should land after applying the move. */
  tab: FirstMoveTab;
  /** On desktop, open the taxes modal on this tab so the change is visible. */
  desktopRevenue?: "irpf" | "is";
  run: () => void;
}

export const FIRST_MOVES: FirstMove[] = [
  {
    id: "irpf_ricos",
    emoji: "🔺",
    label: "Sube el IRPF a las rentas altas",
    sub: "+5 puntos en los dos tramos más altos",
    tab: "ingresos",
    desktopRevenue: "irpf",
    run: () => {
      const { irpfScale, setIrpfGeneralRate } = useSim.getState();
      const g = irpfScale.general;
      setIrpfGeneralRate(g.length - 2, g[g.length - 2].rate + 0.05);
      setIrpfGeneralRate(g.length - 1, g[g.length - 1].rate + 0.05);
    },
  },
  {
    id: "bajar_impuestos",
    emoji: "💸",
    label: "Baja los impuestos a todos",
    sub: "−4 pts de IRPF y Sociedades al 20 %",
    tab: "ingresos",
    desktopRevenue: "irpf",
    run: () => {
      const s = useSim.getState();
      s.setIrpfUniformRate(-0.04);
      s.setIsNominalRate(0.2);
    },
  },
  {
    id: "suecia",
    emoji: "🌍",
    label: "Gobierna como Suecia",
    sub: "Su estructura de gasto y sus impuestos",
    tab: "resumen",
    run: () => {
      loadCountryScenario("suecia");
    },
  },
];

/** Apply a first move and emit the analytics so we can measure first-move activation. */
export function runFirstMove(m: FirstMove, surface: "mobile" | "desktop"): void {
  m.run();
  track("first_move_chosen", { move: m.id, surface });
  if (m.id === "suecia") {
    track("country_template_loaded", { country: "suecia", source: "first_move" });
  }
}
