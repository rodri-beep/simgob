"use client";

import { useSim } from "@/lib/store";
import type { SpendingPolicy } from "@/lib/engine/types";
import { formatM, formatMDecimal, formatPctValue } from "@/lib/engine/format";

export function SpendingLineEditor({ policy }: { policy: SpendingPolicy }) {
  const override = useSim((s) => s.spendingOverrides[policy.id]);
  const setSpending = useSim((s) => s.setSpending);
  const resetLine = useSim((s) => s.resetSpendingLine);

  const base = policy.amount;
  const amount = override ?? base;
  const delta = amount - base;
  const modified = override !== undefined && Math.abs(delta) > 0.05;
  const pct = base > 0 ? (amount / base) * 100 : 100;

  // Cutting spending improves the balance (moss); increasing worsens it (brick).
  const deltaColor = delta < 0 ? "text-moss" : delta > 0 ? "text-brick" : "text-ink-soft";

  return (
    <div className="panel-inset px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-data text-[11px] text-ink leading-tight">{policy.label}</span>
        <span className="tnum font-data font-bold text-[12px] text-ink whitespace-nowrap">
          {formatM(amount)}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <input
          type="range"
          className="slider-retro flex-1"
          min={0}
          max={Math.max(base * 2, 1)}
          step={Math.max(base / 200, 0.1)}
          value={amount}
          onChange={(e) => setSpending(policy.id, parseFloat(e.target.value))}
          aria-label={`Ajustar ${policy.label}: ${formatM(amount)}`}
        />
        <span className="tnum font-data text-[10px] text-ink-soft w-10 text-right">
          {formatPctValue(pct, 0)}
        </span>
        <button
          type="button"
          onClick={() => resetLine(policy.id)}
          disabled={!modified}
          title="Volver al valor oficial"
          className={`font-chrome text-[10px] w-5 h-5 grid place-items-center bevel-out bg-panel ${
            modified ? "text-ink cursor-pointer hover:bg-parchment-dark" : "text-ink-soft/30 cursor-default"
          }`}
        >
          ↺
        </button>
      </div>

      <div className="h-3">
        {modified && (
          <span className={`tnum font-data text-[10px] ${deltaColor}`}>
            {delta < 0 ? "Recorte " : "Aumento "}
            {formatMDecimal(delta, { sign: true })} · saldo {formatMDecimal(-delta, { sign: true })}
          </span>
        )}
      </div>
    </div>
  );
}
