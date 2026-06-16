"use client";

import { formatM, formatMDecimal } from "@/lib/engine/format";
import { useAreas, txtColor, shade } from "./model";
import type { BuildingId } from "@/lib/engine/types";

/** Gasto por área — a stacked column where each block's height is its weight. */
export function MobileGastos({ onAdjust }: { onAdjust: (id: BuildingId) => void }) {
  const { areas, totalSpending } = useAreas();
  const blocks = [...areas].sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-3.5">
      <div className="flex items-baseline justify-between mb-2.5">
        <span className="font-chrome uppercase text-[10px] tracking-wide text-teal-dark">
          Gasto por área · toca para ajustar
        </span>
        <span className="font-chrome uppercase text-[8.5px] text-ink-soft">
          total {formatM(totalSpending)}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 h-[62vh] min-h-[440px]">
        {blocks.map((b) => {
          const pct = (b.amount / totalSpending) * 100;
          const showLabel = pct >= 4;
          const text = txtColor(b.color);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onAdjust(b.id)}
              className="min-h-[16px] border-0 cursor-pointer flex items-center justify-between px-3 overflow-hidden text-left"
              style={{
                height: `${pct.toFixed(2)}%`,
                background: b.color,
                borderLeft: `4px solid ${shade(b.color, 0.62)}`,
              }}
            >
              {showLabel && (
                <span
                  className="text-[12.5px] font-bold flex items-center gap-1.5"
                  style={{ color: text }}
                >
                  {b.modified && (
                    <span
                      className="w-[7px] h-[7px] rounded-full"
                      style={{
                        background: b.delta < 0 ? "#bfe0a8" : "#f3c0b6",
                        border: "1.5px solid rgba(255,255,255,.8)",
                      }}
                    />
                  )}
                  {b.short}
                </span>
              )}
              {showLabel && (
                <span className="flex items-baseline gap-1.5">
                  {b.modified && (
                    <span
                      className="tnum text-[10px] font-bold opacity-85"
                      style={{ color: text }}
                    >
                      {formatMDecimal(b.delta, { sign: true })}
                    </span>
                  )}
                  <span className="tnum text-[12.5px] font-extrabold" style={{ color: text }}>
                    {formatM(b.amount)}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11.5px] text-ink-soft leading-relaxed mt-2.5 mx-0.5">
        La altura de cada bloque es su peso en el gasto total. Toca para abrir sus partidas y mover
        los sliders.
      </p>
    </div>
  );
}
