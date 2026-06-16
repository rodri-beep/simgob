"use client";

import { useSimResults } from "@/lib/useSimResults";
import { irpfData } from "@/lib/data";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { WinnersLosersChart } from "./WinnersLosersChart";
import { IrpfBracketTable } from "./IrpfBracketTable";
import { medianBracket, modalBracket } from "@/lib/engine/stories";
import { formatM, formatMDecimal } from "@/lib/engine/format";

export function IrpfDetail() {
  const { irpf } = useSimResults();
  const stateEffect = irpfData.stateDeltaShare * irpf.delta;

  const median = medianBracket(irpfData.brackets);
  const modal = modalBracket(irpfData.brackets);

  return (
    <CollapsiblePanel
      title="IRPF · recaudación y reparto"
      subtitle="Quién paga el IRPF: recaudación, ganadores/perdedores y renta neta por tramo."
      right={<EstimateBadge />}
    >
      <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="panel-inset px-2 py-1.5">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">Recaudación nacional</div>
          <AnimatedNumber
            value={irpf.scenarioRevenue}
            format={(n) => formatM(n)}
            className="tnum font-data font-bold text-[15px] text-ink"
          />
          <div className="text-[9px] text-ink-soft">base {formatM(irpf.officialRevenue)}</div>
        </div>
        <div className="panel-inset px-2 py-1.5">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">Δ recaudación</div>
          <AnimatedNumber
            value={irpf.delta}
            format={(n) => formatMDecimal(n, { sign: true })}
            className={`tnum font-data font-bold text-[15px] ${
              irpf.delta > 0 ? "text-moss" : irpf.delta < 0 ? "text-brick" : "text-ink"
            }`}
          />
          <div className="text-[9px] text-ink-soft">nacional (Estado + CCAA)</div>
        </div>
        <div className="panel-inset px-2 py-1.5">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">Efecto en el saldo</div>
          <AnimatedNumber
            value={stateEffect}
            format={(n) => formatMDecimal(n, { sign: true })}
            className={`tnum font-data font-bold text-[15px] ${
              stateEffect > 0 ? "text-moss" : stateEffect < 0 ? "text-brick" : "text-ink"
            }`}
          />
          <div className="text-[9px] text-ink-soft">íntegro en las AAPP</div>
        </div>
      </div>

      <p className="text-[10px] text-ink-soft leading-snug">
        El <b>declarante mediano</b> declara <b>{median?.label}</b>; el tramo más numeroso es{" "}
        <b>{modal?.label}</b>. Mueve los tipos para ver a quién afecta.
      </p>

      <WinnersLosersChart brackets={irpf.brackets} />

      <IrpfBracketTable />
      </div>
    </CollapsiblePanel>
  );
}
