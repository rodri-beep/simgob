"use client";

import { useSimResults } from "@/lib/useSimResults";
import { irpfData } from "@/lib/data";
import { Panel } from "@/components/ui/Panel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { WinnersLosersChart } from "./WinnersLosersChart";
import { formatM, formatMDecimal, formatCount } from "@/lib/engine/format";

export function IrpfDetail() {
  const { irpf } = useSimResults();
  const stateEffect = irpfData.stateDeltaShare * irpf.delta;

  return (
    <Panel
      title="IRPF · recaudación y reparto"
      right={<EstimateBadge />}
      bodyClassName="space-y-3"
    >
      <div className="grid grid-cols-3 gap-2">
        <div className="panel-inset px-2 py-1.5">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">
            Recaudación nacional
          </div>
          <AnimatedNumber
            value={irpf.scenarioRevenue}
            format={(n) => formatM(n)}
            className="tnum font-data font-bold text-[15px] text-ink"
          />
          <div className="text-[9px] text-ink-soft">base {formatM(irpf.officialRevenue)}</div>
        </div>
        <div className="panel-inset px-2 py-1.5">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">
            Δ recaudación
          </div>
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
          <div className="font-chrome uppercase text-[8px] text-ink-soft">
            Efecto saldo Estado
          </div>
          <AnimatedNumber
            value={stateEffect}
            format={(n) => formatMDecimal(n, { sign: true })}
            className={`tnum font-data font-bold text-[15px] ${
              stateEffect > 0 ? "text-moss" : stateEffect < 0 ? "text-brick" : "text-ink"
            }`}
          />
          <div className="text-[9px] text-ink-soft">≈ 50 % del cambio</div>
        </div>
      </div>

      <WinnersLosersChart brackets={irpf.brackets} />

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] tnum border-collapse">
          <thead>
            <tr className="font-chrome uppercase text-[8px] text-ink-soft text-right">
              <th className="text-left font-normal py-1">Tramo de renta</th>
              <th className="font-normal">Declarantes</th>
              <th className="font-normal">Cuota base</th>
              <th className="font-normal">Cuota nueva</th>
              <th className="font-normal">Δ</th>
            </tr>
          </thead>
          <tbody>
            {irpf.brackets.map((b) => (
              <tr key={b.id} className="text-right border-t border-bevel-dark/20">
                <td className="text-left py-0.5 font-data">{b.label}</td>
                <td className="text-ink-soft">{formatCount(b.declarantes)}</td>
                <td>{formatM(b.baseCuota)}</td>
                <td>{formatM(b.scenarioCuota)}</td>
                <td
                  className={
                    b.verdict === "loser"
                      ? "text-brick"
                      : b.verdict === "winner"
                        ? "text-moss"
                        : "text-ink-soft"
                  }
                >
                  {Math.abs(b.delta) < 0.05
                    ? "—"
                    : formatMDecimal(b.delta, { sign: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
