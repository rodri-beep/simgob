"use client";

import { useMemo } from "react";
import { useSim } from "@/lib/store";
import { useSimResults } from "@/lib/useSimResults";
import { irpfData, human } from "@/lib/data";
import { bracketPersonas } from "@/lib/engine/stories";
import { formatEur, formatPctValue } from "@/lib/engine/format";

/**
 * Per-bracket IRPF table: share of declarantes, representative net income and
 * the average change per declarante (winner/loser). Reads the live scenario so
 * the desktop detail panel and the mobile tax sheet stay in sync.
 */
export function IrpfBracketTable() {
  const { irpf } = useSimResults();
  const scale = useSim((s) => s.irpfScale);

  const personas = useMemo(
    () => bracketPersonas(irpfData.brackets, scale, human.netSalaryModel),
    [scale],
  );
  const personaById = useMemo(
    () => Object.fromEntries(personas.map((p) => [p.id, p])),
    [personas],
  );

  return (
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
                <td className="text-ink">{p ? `${formatEur(p.netMonthly)}/mes` : "—"}</td>
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
        Renta neta: cálculo aproximado para la renta media del tramo (soltero, solo trabajo, 12
        pagas). Los tramos son de renta, no solo de salario.
      </p>
    </div>
  );
}
