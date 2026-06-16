"use client";

import { useSim } from "@/lib/store";
import { aappBaseline, countryModels, spendingPolicies, irpfData } from "@/lib/data";
import { countrySpendingOverrides, countryTaxLevers } from "@/lib/intl";
import { Panel } from "@/components/ui/Panel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { track } from "@/lib/analytics";

const SPAIN_REV_PCT = aappBaseline.totalRevenue / aappBaseline.gdp;
const TOTAL_BASE = irpfData.brackets.reduce((a, b) => a + b.baseGeneral + b.baseSavings, 0);
const BASE_AVG_IRPF = irpfData.officialRevenue / TOTAL_BASE;

export function CountryTemplatePanel() {
  const active = useSim((s) => s.countryTemplate);
  const setAllSpending = useSim((s) => s.setAllSpending);
  const setIrpfUniformRate = useSim((s) => s.setIrpfUniformRate);
  const setIsNominalRate = useSim((s) => s.setIsNominalRate);
  const setCountryTemplate = useSim((s) => s.setCountryTemplate);
  const reset = useSim((s) => s.reset);

  const loadSpain = () => {
    track("country_template_reset");
    reset();
  };

  const loadCountry = (id: string) => {
    const country = countryModels.find((c) => c.id === id);
    if (!country) return;
    setAllSpending(countrySpendingOverrides(country, spendingPolicies));
    const { irpfDelta, isNominal } = countryTaxLevers(country, SPAIN_REV_PCT, BASE_AVG_IRPF);
    setIrpfUniformRate(irpfDelta);
    setIsNominalRate(isNominal);
    setCountryTemplate(id);
    track("country_template_loaded", { country: id });
  };

  return (
    <Panel tone="teal" title="Modelo de país" right={<EstimateBadge />}>
      <p className="text-[10px] text-ink-soft leading-snug mb-2">
        Pon todas las palancas como ese país: reparte el gasto con su estructura (mismo total) y
        ajusta los impuestos a su nivel. Luego puedes seguir tocando.
      </p>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={loadSpain}
          data-active={active === null}
          className="btn-retro text-[10px] py-1"
        >
          🇪🇸 España
        </button>
        {countryModels.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => loadCountry(c.id)}
            data-active={active === c.id}
            className="btn-retro text-[10px] py-1"
            title={`Repartir el gasto e impuestos como ${c.label}`}
          >
            {c.flag ? `${c.flag} ` : ""}
            {c.label}
          </button>
        ))}
      </div>
      <p className="text-[8px] text-ink-soft/80 leading-snug mt-2">
        Estimación ilustrativa. Estructura de gasto por función (COFOG, Eurostat) e ingresos por su
        presión fiscal (OCDE), nivel Administraciones Públicas. Es un perímetro distinto al PGE.
      </p>
    </Panel>
  );
}
