"use client";

import { revenueLines, irpfData, isData } from "@/lib/data";
import { useSimResults } from "@/lib/useSimResults";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { formatM, formatMDecimal } from "@/lib/engine/format";

const categoryLabel: Record<string, string> = {
  cotizaciones: "Cotizaciones",
  tributos: "Impuestos",
  otros: "Otros ingresos",
};

export function RevenuePanel() {
  const { irpf, is, totals } = useSimResults();

  // Scenario value per line (only IRPF & IS move, by their State share).
  const scenarioAmount = (id: string, base: number) => {
    if (id === "irpf") return base + irpfData.stateDeltaShare * irpf.delta;
    if (id === "is") return base + isData.stateDeltaShare * is.delta;
    return base;
  };

  return (
    <CollapsiblePanel
      title={`Ingresos · Administraciones Públicas ${irpfData.baseYear}`}
      subtitle="Detalle de los ingresos públicos por tipo (impuestos, cotizaciones y otros), todas las administraciones."
    >
      <table className="w-full text-[11px] tnum">
        <tbody>
          {revenueLines.map((line) => {
            const value = scenarioAmount(line.id, line.amount);
            const delta = value - line.amount;
            const changed = Math.abs(delta) > 0.05;
            return (
              <tr key={line.id} className="border-t border-bevel-dark/20 align-top">
                <td className="py-1.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-data text-ink">{line.label}</span>
                    {line.editable && (
                      <span className="font-chrome uppercase text-[7px] bg-amber/30 border border-amber/60 px-1 leading-tight text-ink-soft">
                        editable
                      </span>
                    )}
                  </div>
                  <span className="font-chrome uppercase text-[7px] text-ink-soft">
                    {categoryLabel[line.category]}
                  </span>
                </td>
                <td className="py-1.5 px-2 text-right font-data font-bold text-ink whitespace-nowrap">
                  {formatM(value)}
                  {changed && (
                    <div
                      className={`font-normal text-[9px] ${
                        delta > 0 ? "text-moss" : "text-brick"
                      }`}
                    >
                      {formatMDecimal(delta, { sign: true })}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          <tr className="border-t-2 border-bevel-dark/50 bg-parchment-dark/40">
            <td className="py-2 px-2 font-chrome uppercase text-[10px] text-ink">
              Total ingresos
            </td>
            <td className="py-2 px-2 text-right font-data font-bold text-[14px] text-moss">
              {formatM(totals.revenue)}
            </td>
          </tr>
        </tbody>
      </table>
    </CollapsiblePanel>
  );
}
