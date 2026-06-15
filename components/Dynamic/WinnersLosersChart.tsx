"use client";

import type { IrpfBracketResult } from "@/lib/engine/irpf";
import { formatEur } from "@/lib/engine/format";

interface Props {
  brackets: IrpfBracketResult[];
}

/**
 * Diverging bar chart of the average per-declarante change by income bracket.
 * Losers (pay more) extend right in brick; winners (pay less) extend left in moss.
 */
export function WinnersLosersChart({ brackets }: Props) {
  const maxAbs = Math.max(1, ...brackets.map((b) => Math.abs(b.deltaPerDeclaranteEur)));
  const anyChange = brackets.some((b) => b.verdict !== "neutral");

  if (!anyChange) {
    return (
      <div className="panel-inset px-3 py-6 text-center text-[11px] text-ink-soft">
        Mueve un tipo del IRPF para ver quién gana y quién pierde por tramo de renta.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between font-chrome uppercase text-[8px] text-ink-soft px-1">
        <span className="text-moss">◀ Pagan menos</span>
        <span>Cambio medio por declarante (€/año)</span>
        <span className="text-brick">Pagan más ▶</span>
      </div>
      {brackets.map((b) => {
        const pct = (Math.abs(b.deltaPerDeclaranteEur) / maxAbs) * 100;
        const loser = b.deltaPerDeclaranteEur > 0;
        const winner = b.deltaPerDeclaranteEur < 0;
        return (
          <div
            key={b.id}
            className="grid grid-cols-[112px_1fr_84px] items-center gap-1"
          >
            <span className="font-chrome uppercase text-[8px] text-ink-soft truncate">
              {b.label}
            </span>
            <div className="relative h-4 flex items-stretch panel-inset">
              {/* center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-bevel-dark/60" />
              <div className="w-1/2 flex justify-end">
                {winner && (
                  <div
                    className="bg-moss h-full"
                    style={{ width: `${pct}%` }}
                    title={formatEur(b.deltaPerDeclaranteEur, { sign: true })}
                  />
                )}
              </div>
              <div className="w-1/2 flex justify-start">
                {loser && (
                  <div
                    className="bg-brick h-full"
                    style={{ width: `${pct}%` }}
                    title={formatEur(b.deltaPerDeclaranteEur, { sign: true })}
                  />
                )}
              </div>
            </div>
            <span
              className={`tnum font-data text-[10px] text-right ${
                loser ? "text-brick" : winner ? "text-moss" : "text-ink-soft"
              }`}
            >
              {b.verdict === "neutral"
                ? "—"
                : formatEur(b.deltaPerDeclaranteEur, { sign: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
