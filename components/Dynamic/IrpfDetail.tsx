"use client";

import { useMemo } from "react";
import { useSimResults } from "@/lib/useSimResults";
import { useSim } from "@/lib/store";
import { irpfData, human } from "@/lib/data";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { WinnersLosersChart } from "./WinnersLosersChart";
import { bracketPersonas, medianBracket, modalBracket } from "@/lib/engine/stories";
import { formatM, formatMDecimal, formatEur, formatPctValue } from "@/lib/engine/format";

export function IrpfDetail() {
  const { irpf } = useSimResults();
  const scale = useSim((s) => s.irpfScale);
  const stateEffect = irpfData.stateDeltaShare * irpf.delta;

  const personas = useMemo(
    () => bracketPersonas(irpfData.brackets, scale, human.netSalaryModel),
    [scale],
  );
  const personaById = useMemo(
    () => Object.fromEntries(personas.map((p) => [p.id, p])),
    [personas],
  );
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

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] tnum border-collapse">
          <thead>
            <tr className="font-chrome uppercase text-[8px] text-ink-soft text-right">
              <th className="text-left font-normal py-1">Tramo de renta</th>
              <th className="font-normal">% decl.</th>
              <th className="font-normal">Renta neta</th>
              <th className="font-normal">Δ / declarante</th>
            </tr>
          </thead>
          <tbody>
            {irpf.brackets.map((b) => {
              const p = personaById[b.id];
              const perMonth = b.deltaPerDeclaranteEur / 12;
              return (
                <tr key={b.id} className="text-right border-t border-bevel-dark/20">
                  <td className="text-left py-0.5 font-data">{b.label}</td>
                  <td className="text-ink-soft">{p ? formatPctValue(p.share * 100, 1) : "—"}</td>
                  <td className="text-ink">
                    {p ? `${formatEur(p.netMonthly)}/mes` : "—"}
                  </td>
                  <td
                    className={
                      b.verdict === "loser"
                        ? "text-brick"
                        : b.verdict === "winner"
                          ? "text-moss"
                          : "text-ink-soft"
                    }
                  >
                    {b.verdict === "neutral"
                      ? "—"
                      : `${formatEur(b.deltaPerDeclaranteEur, { sign: true })}/año (${formatEur(perMonth, { sign: true })}/mes)`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[8px] text-ink-soft/80 mt-1">
          Renta neta: cálculo aproximado para la renta media del tramo (soltero, solo trabajo, 12 pagas).
          Los tramos son de renta, no solo de salario.
        </p>
      </div>
      </div>
    </CollapsiblePanel>
  );
}
