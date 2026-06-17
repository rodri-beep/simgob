"use client";

import { useSim } from "@/lib/store";
import { countryModels } from "@/lib/data";
import { loadCountryScenario } from "@/lib/firstMoves";
import { Panel } from "@/components/ui/Panel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { Flag } from "@/components/ui/Flag";
import { track } from "@/lib/analytics";

export function CountryTemplatePanel() {
  const active = useSim((s) => s.countryTemplate);
  const reset = useSim((s) => s.reset);
  const setCompareCountry = useSim((s) => s.setCompareCountry);
  const activeCountry = countryModels.find((c) => c.id === active);

  const loadSpain = () => {
    track("country_template_reset");
    reset();
  };

  const loadCountry = (id: string) => {
    if (!loadCountryScenario(id)) return;
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
          className="btn-retro text-[10px] py-1 inline-flex items-center gap-1.5"
        >
          <Flag country="es" size={11} /> España
        </button>
        {countryModels.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => loadCountry(c.id)}
            data-active={active === c.id}
            className="btn-retro text-[10px] py-1 inline-flex items-center gap-1.5"
            title={`Repartir el gasto e impuestos como ${c.label}`}
          >
            <Flag country={c.id} size={11} /> {c.label}
          </button>
        ))}
      </div>
      {activeCountry && (
        <button
          type="button"
          onClick={() => {
            track("compare_opened", { country: activeCountry.id, surface: "desktop" });
            setCompareCountry(activeCountry.id);
          }}
          className="btn-retro text-[10px] py-1 mt-2 w-full justify-center flex bg-amber/30"
          title={`Imagen comparativa España vs ${activeCountry.label}`}
        >
          ↗ Comparar España vs {activeCountry.label}
        </button>
      )}
      <p className="text-[8px] text-ink-soft/80 leading-snug mt-2">
        Estimación ilustrativa. Estructura de gasto por función (COFOG, Eurostat) e ingresos por su
        presión fiscal (OCDE), en el mismo perímetro que usa el simulador: Administraciones Públicas.
      </p>
    </Panel>
  );
}
