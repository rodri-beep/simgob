"use client";

import { useSim, isDirty } from "@/lib/store";
import { irpfData, human } from "@/lib/data";
import { grossToNet } from "@/lib/engine/stories";
import { formatEur } from "@/lib/engine/format";

function bracketFor(gross: number) {
  return irpfData.brackets.find(
    (b) => gross >= b.lower && (b.upper == null || gross < b.upper),
  );
}

export function TuPanel() {
  const gross = useSim((s) => s.grossSalary);
  const setGross = useSim((s) => s.setGrossSalary);
  const scenarioScale = useSim((s) => s.irpfScale);
  const dirty = useSim(isDirty);

  const model = human.netSalaryModel;
  const median = human.constants.salaryMedian;

  const base = gross != null ? grossToNet(gross, irpfData.scale, model) : null;
  const scen = gross != null ? grossToNet(gross, scenarioScale, model) : null;
  const tramo = gross != null ? bracketFor(gross) : undefined;
  const deltaYear = base && scen ? scen.netAnnual - base.netAnnual : 0;

  return (
    <div className="mt-2 border-t border-bevel-dark/30 pt-2">
      <div className="font-chrome uppercase text-[10px] text-ink mb-1">¿Y a ti?</div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-ink-soft">Salario bruto anual</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          value={gross ?? ""}
          placeholder={String(median)}
          onChange={(e) =>
            setGross(e.target.value === "" ? null : parseFloat(e.target.value))
          }
          className="panel-inset tnum font-data text-[12px] text-ink px-1.5 py-1 w-24 text-right"
          aria-label="Tu salario bruto anual en euros"
        />
        <span className="text-[10px] text-ink-soft">€</span>
        <button
          type="button"
          className="btn-retro text-[8px] py-0.5 ml-auto"
          onClick={() => setGross(median)}
          title={`Usar el salario mediano (${formatEur(median)})`}
        >
          mediano
        </button>
      </div>

      {gross != null && scen && base ? (
        <div className="mt-2 panel-inset px-2 py-1.5 text-[10px] text-ink-soft space-y-1">
          <div className="flex justify-between">
            <span>Tu tramo</span>
            <span className="font-data text-ink">{tramo?.label ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Renta neta aprox.</span>
            <span className="tnum font-data font-bold text-ink text-[12px]">
              {formatEur(scen.netMonthly)}/mes
            </span>
          </div>
          <div className="flex justify-between">
            <span>IRPF</span>
            <span className="tnum font-data text-ink">
              {formatEur(scen.irpfAnnual)}/año ({Math.round(scen.effectiveOnGross * 100)}% s/bruto)
            </span>
          </div>
          {dirty && Math.abs(deltaYear) >= 1 && (
            <div className="flex justify-between border-t border-bevel-dark/20 pt-1">
              <span>Con tu escenario</span>
              <span
                className={`tnum font-data font-bold ${
                  deltaYear < 0 ? "text-brick" : "text-moss"
                }`}
              >
                {formatEur(deltaYear, { sign: true })}/año ({formatEur(deltaYear / 12, { sign: true })}/mes)
              </span>
            </div>
          )}
          <p className="text-[8px] text-ink-soft/80 pt-1">
            Cálculo aproximado: soltero, solo rendimientos del trabajo, 12 pagas.
          </p>
        </div>
      ) : (
        <p className="text-[9px] text-ink-soft mt-1">
          Escribe tu sueldo y mira en qué tramo estás y cómo te afectan los cambios.
        </p>
      )}
    </div>
  );
}
