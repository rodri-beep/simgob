"use client";

import { useSim } from "@/lib/store";
import { isData } from "@/lib/data";
import { useSimResults } from "@/lib/useSimResults";
import { RateSlider } from "./RateSlider";
import { formatPct } from "@/lib/engine/format";

export function IsControls() {
  const nominal = useSim((s) => s.isNominalRate);
  const minimum = useSim((s) => s.isMinimumRate);
  const setNominal = useSim((s) => s.setIsNominalRate);
  const setMinimum = useSim((s) => s.setIsMinimumRate);
  const { is } = useSimResults();

  return (
    <div>
      <RateSlider
        label="Tipo general (nominal)"
        value={nominal}
        base={isData.nominalRate}
        min={0}
        max={0.4}
        onChange={setNominal}
      />
      <RateSlider
        label="Tipo mínimo (grandes grupos)"
        value={minimum}
        base={isData.minimumRate}
        min={0}
        max={0.3}
        onChange={setMinimum}
      />

      <div className="mx-2 mt-2 panel-inset px-2 py-1.5 text-[10px] text-ink-soft leading-snug">
        <div className="flex items-center justify-between">
          <span className="font-chrome uppercase text-[9px]">Tipo efectivo</span>
          <span className="tnum font-data font-bold text-ink text-[12px]">
            {formatPct(is.effectiveRate, 1)}
          </span>
        </div>
        <p className="mt-1">
          El tipo <b>efectivo</b> sobre la base imponible ({formatPct(is.effectiveRate, 1)})
          es menor que el <b>nominal</b> ({formatPct(isData.nominalRate, 0)}): deducciones,
          bonificaciones y consolidación de grupos (modelo 220). La simulación se ancla a
          la recaudación real, no a la cuota nominal.
        </p>
      </div>
    </div>
  );
}
