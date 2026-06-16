"use client";

import { useSim, irpfUniformDelta, irpfIsUniform } from "@/lib/store";
import { irpfData } from "@/lib/data";
import { useSimResults } from "@/lib/useSimResults";
import { TuPanel } from "@/components/Stories/TuPanel";
import { formatM, formatMDecimal, formatPct } from "@/lib/engine/format";
import { trackDebounced } from "@/lib/analytics";

const TOTAL_BASE = irpfData.brackets.reduce(
  (a, b) => a + b.baseGeneral + b.baseSavings,
  0,
);

export function IrpfSimple() {
  const delta = useSim(irpfUniformDelta);
  const uniform = useSim(irpfIsUniform);
  const setUniform = useSim((s) => s.setIrpfUniformRate);
  const { irpf } = useSimResults();

  const tipoMedio = irpf.scenarioRevenue / TOTAL_BASE;
  const baseTipoMedio = irpf.officialRevenue / TOTAL_BASE;
  const stateEffect = irpfData.stateDeltaShare * irpf.delta;

  return (
    <div>
      <div className="panel-inset px-2 py-2 text-center">
        <div className="font-chrome uppercase text-[9px] text-ink-soft">Tipo medio del IRPF</div>
        <div className="tnum font-data font-bold text-[22px] text-ink leading-tight">
          {formatPct(tipoMedio, 1)}
        </div>
        <div className="text-[9px] text-ink-soft">base {formatPct(baseTipoMedio, 1)}</div>
      </div>

      <div className="px-1 mt-2">
        <div className="flex items-baseline justify-between">
          <span className="font-chrome uppercase text-[9px] text-ink-soft">
            Ajuste general (todos los tramos)
          </span>
          <span className="tnum font-data font-bold text-[12px] text-ink">
            {delta > 0 ? "+" : ""}
            {(delta * 100).toFixed(1)} pp
          </span>
        </div>
        <input
          type="range"
          className="slider-retro w-full mt-1"
          min={-0.08}
          max={0.12}
          step={0.005}
          value={delta}
          onChange={(e) => {
            setUniform(parseFloat(e.target.value));
            trackDebounced("tax:irpf", "tax_adjusted", { tax: "irpf", mode: "uniform" });
          }}
          aria-label="Ajuste general del IRPF en puntos porcentuales"
        />
        {!uniform && (
          <div className="text-[9px] text-orange mt-0.5">
            Escala personalizada por tramo · mover esto la iguala.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5 mt-2">
        <div className="panel-inset px-2 py-1">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">Δ recaudación</div>
          <div
            className={`tnum font-data font-bold text-[12px] ${
              irpf.delta > 0 ? "text-moss" : irpf.delta < 0 ? "text-brick" : "text-ink"
            }`}
          >
            {formatMDecimal(irpf.delta, { sign: true })}
          </div>
          <div className="text-[8px] text-ink-soft">nacional</div>
        </div>
        <div className="panel-inset px-2 py-1">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">Efecto saldo</div>
          <div
            className={`tnum font-data font-bold text-[12px] ${
              stateEffect > 0 ? "text-moss" : stateEffect < 0 ? "text-brick" : "text-ink"
            }`}
          >
            {formatMDecimal(stateEffect, { sign: true })}
          </div>
          <div className="text-[8px] text-ink-soft">≈ 50 % al Estado</div>
        </div>
      </div>

      <TuPanel />
    </div>
  );
}
