"use client";

import { useSim } from "@/lib/store";
import { isData } from "@/lib/data";
import { useSimResults } from "@/lib/useSimResults";
import { RateSlider } from "./RateSlider";
import { formatMDecimal, formatPct } from "@/lib/engine/format";

export function IsSimple() {
  const nominal = useSim((s) => s.isNominalRate);
  const setNominal = useSim((s) => s.setIsNominalRate);
  const { is } = useSimResults();

  return (
    <div>
      <RateSlider
        label="Tipo general (Sociedades)"
        value={nominal}
        base={isData.nominalRate}
        min={0}
        max={0.4}
        onChange={setNominal}
      />

      <div className="grid grid-cols-2 gap-1.5 mt-1 px-2">
        <div className="panel-inset px-2 py-1">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">Tipo efectivo</div>
          <div className="tnum font-data font-bold text-[12px] text-ink">
            {formatPct(is.effectiveRate, 1)}
          </div>
        </div>
        <div className="panel-inset px-2 py-1">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">Δ recaudación</div>
          <div
            className={`tnum font-data font-bold text-[12px] ${
              is.delta > 0 ? "text-moss" : is.delta < 0 ? "text-brick" : "text-ink"
            }`}
          >
            {formatMDecimal(is.delta, { sign: true })}
          </div>
        </div>
      </div>

      <p className="px-2 mt-2 text-[10px] text-ink-soft leading-snug">
        El tipo <b>efectivo</b> ({formatPct(is.effectiveRate, 1)}) es menor que el nominal
        ({formatPct(isData.nominalRate, 0)}) por deducciones y la consolidación de grupos.
      </p>
    </div>
  );
}
