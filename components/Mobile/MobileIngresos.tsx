"use client";

import { useSimResults } from "@/lib/useSimResults";
import { revenueLines, irpfData, isData } from "@/lib/data";
import { formatM, formatMDecimal } from "@/lib/engine/format";
import { txtColor, shade, type SheetState } from "./model";

const REV_COLORS: Record<string, string> = {
  cotizaciones: "#236a6a",
  otros_impuestos: "#c75b4e",
  irpf: "#4e7d3a",
  otros_ingresos: "#9a9078",
  is: "#e09a2d",
};

// Short labels for the crowded column.
const REV_SHORT: Record<string, string> = {
  cotizaciones: "Cotizaciones",
  otros_impuestos: "Otros impuestos",
  irpf: "IRPF",
  otros_ingresos: "Otros ingresos",
  is: "Sociedades",
};

/** Ingresos por fuente — stacked column; IRPF & IS open the tax sheet. */
export function MobileIngresos({ onAdjust }: { onAdjust: (s: NonNullable<SheetState>) => void }) {
  const { irpf, is, totals } = useSimResults();

  const items = revenueLines.map((l) => {
    const delta =
      l.id === "irpf"
        ? irpfData.stateDeltaShare * irpf.delta
        : l.id === "is"
          ? isData.stateDeltaShare * is.delta
          : 0;
    const adjustable = l.id === "irpf" || l.id === "is";
    const sheet: NonNullable<SheetState> = adjustable
      ? { t: l.id as "irpf" | "is", id: l.id }
      : { t: "info", id: l.id };
    return {
      id: l.id,
      short: REV_SHORT[l.id] ?? l.label,
      amount: l.amount + delta,
      delta,
      adjustable,
      color: REV_COLORS[l.id] ?? "#9a9078",
      sheet,
    };
  });

  const blocks = [...items].sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-3.5">
      <div className="flex items-baseline justify-between mb-2.5">
        <span className="font-chrome uppercase text-[10px] tracking-wide text-teal-dark">
          Ingresos por fuente · toca para ajustar
        </span>
        <span className="font-chrome uppercase text-[8.5px] text-ink-soft">
          total {formatM(totals.revenue)}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 h-[56vh] min-h-[380px]">
        {blocks.map((b) => {
          const pct = (b.amount / totals.revenue) * 100;
          const text = txtColor(b.color);
          const modified = Math.abs(b.delta) > 0.5;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onAdjust(b.sheet)}
              className="min-h-[36px] border-0 cursor-pointer flex items-center justify-between px-3 overflow-hidden text-left"
              style={{
                height: `${pct.toFixed(2)}%`,
                background: b.color,
                borderLeft: `4px solid ${shade(b.color, 0.62)}`,
              }}
            >
              <span className="flex flex-col gap-px">
                <span
                  className="text-[13px] font-bold flex items-center gap-1.5"
                  style={{ color: text }}
                >
                  {b.short}
                  {b.adjustable && (
                    <span
                      className="font-chrome uppercase text-[7px] tracking-wide px-1 py-0.5"
                      style={{ background: "rgba(255,255,255,.28)", color: text }}
                    >
                      ajustable
                    </span>
                  )}
                </span>
                <span className="tnum text-[10px] opacity-80" style={{ color: text }}>
                  {Math.round(pct)} % de ingresos
                </span>
              </span>
              <span className="flex items-baseline gap-1.5">
                {modified && (
                  <span className="tnum text-[10px] font-bold opacity-90" style={{ color: text }}>
                    {formatMDecimal(b.delta, { sign: true })}
                  </span>
                )}
                <span className="tnum text-[13.5px] font-extrabold" style={{ color: text }}>
                  {formatM(b.amount)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[11.5px] text-ink-soft leading-relaxed mt-2.5 mx-0.5">
        IRPF y Sociedades abren un modal con sliders (y “¿y a ti?” en el IRPF). El resto explica de
        dónde sale el dinero.
      </p>
    </div>
  );
}
